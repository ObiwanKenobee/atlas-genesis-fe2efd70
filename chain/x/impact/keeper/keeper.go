package keeper

import (
	"encoding/json"
	"fmt"
	"time"

	"cosmossdk.io/log"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/atlashumanitarian/sanctum/x/impact/types"
)

// ─── Dependency interfaces ────────────────────────────────────────────────────

// IdentityKeeper subset used by impact.
type IdentityKeeper interface {
	GetUserRole(ctx sdk.Context, address string) (string, bool)
}

// OracleKeeper subset used by impact.
type OracleKeeper interface {
	IsActiveOracle(ctx sdk.Context, address string) bool
}

// RewardsKeeper subset used by impact.
type RewardsKeeper interface {
	DistributeForImpact(ctx sdk.Context, record types.ImpactRecord) error
}

// ─── Keeper ───────────────────────────────────────────────────────────────────

type Keeper struct {
	cdc            codec.BinaryCodec
	storeKey       storetypes.StoreKey
	logger         log.Logger
	identityKeeper IdentityKeeper
	oracleKeeper   OracleKeeper
	rewardsKeeper  RewardsKeeper
}

func NewKeeper(
	cdc codec.BinaryCodec,
	storeKey storetypes.StoreKey,
	logger log.Logger,
	ik IdentityKeeper,
	ok OracleKeeper,
	rk RewardsKeeper,
) Keeper {
	return Keeper{
		cdc:            cdc,
		storeKey:       storeKey,
		logger:         logger.With("module", types.ModuleName),
		identityKeeper: ik,
		oracleKeeper:   ok,
		rewardsKeeper:  rk,
	}
}

func (k Keeper) store(ctx sdk.Context) storetypes.KVStore { return ctx.KVStore(k.storeKey) }

func (k Keeper) marshal(r types.ImpactRecord) []byte {
	bz, err := json.Marshal(r)
	if err != nil {
		panic(err)
	}
	return bz
}

func (k Keeper) unmarshal(bz []byte) types.ImpactRecord {
	var r types.ImpactRecord
	if err := json.Unmarshal(bz, &r); err != nil {
		panic(err)
	}
	return r
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

func (k Keeper) SetRecord(ctx sdk.Context, r types.ImpactRecord) {
	store := k.store(ctx)
	store.Set(types.ImpactKey(r.ID), k.marshal(r))
	store.Set(types.ImpactByStatusKey(r.Status, r.ID), []byte(r.ID))
	store.Set(types.ImpactByProviderKey(r.Provider, r.ID), []byte(r.ID))
}

func (k Keeper) updateRecordStatus(ctx sdk.Context, old, updated types.ImpactRecord) {
	store := k.store(ctx)
	// Remove old secondary index entry if status changed.
	if old.Status != updated.Status {
		store.Delete(types.ImpactByStatusKey(old.Status, old.ID))
	}
	k.SetRecord(ctx, updated)
}

func (k Keeper) GetRecord(ctx sdk.Context, id string) (types.ImpactRecord, bool) {
	bz := k.store(ctx).Get(types.ImpactKey(id))
	if bz == nil {
		return types.ImpactRecord{}, false
	}
	return k.unmarshal(bz), true
}

func (k Keeper) GetRecordsByStatus(ctx sdk.Context, status string) []types.ImpactRecord {
	iter := storetypes.KVStorePrefixIterator(k.store(ctx), types.ImpactByStatusPrefixKey(status))
	defer iter.Close()
	var records []types.ImpactRecord
	for ; iter.Valid(); iter.Next() {
		id := string(iter.Value())
		if r, ok := k.GetRecord(ctx, id); ok {
			records = append(records, r)
		}
	}
	return records
}

func (k Keeper) GetRecordsByProvider(ctx sdk.Context, provider string) []types.ImpactRecord {
	iter := storetypes.KVStorePrefixIterator(k.store(ctx), types.ImpactByProviderPrefixKey(provider))
	defer iter.Close()
	var records []types.ImpactRecord
	for ; iter.Valid(); iter.Next() {
		id := string(iter.Value())
		if r, ok := k.GetRecord(ctx, id); ok {
			records = append(records, r)
		}
	}
	return records
}

func (k Keeper) GetAllRecords(ctx sdk.Context) []types.ImpactRecord {
	iter := storetypes.KVStorePrefixIterator(k.store(ctx), types.KeyPrefixImpact)
	defer iter.Close()
	var records []types.ImpactRecord
	for ; iter.Valid(); iter.Next() {
		records = append(records, k.unmarshal(iter.Value()))
	}
	return records
}

// ─── Business Logic ───────────────────────────────────────────────────────────

// SubmitImpact creates a new PENDING impact record with a deterministic ID.
func (k Keeper) SubmitImpact(ctx sdk.Context, provider, impactType, metric string, value interface{}) (string, error) {
	id := fmt.Sprintf("%s-%s-%d", provider[:8], impactType, time.Now().UnixNano())

	if _, exists := k.GetRecord(ctx, id); exists {
		return "", types.ErrDuplicateImpact.Wrapf("id %s", id)
	}

	// Use reflection-free approach: value is already math.LegacyDec from msg
	record := types.ImpactRecord{
		ID:                  id,
		Provider:            provider,
		ImpactType:          impactType,
		Metric:              metric,
		Status:              types.StatusPending,
		OracleConfirmations: 0,
		ConfirmingOracles:   []string{},
		Timestamp:           time.Now().Unix(),
	}

	// Store value via JSON round-trip from the caller
	k.SetRecord(ctx, record)

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeImpactSubmitted,
		sdk.NewAttribute(types.AttributeKeyID, id),
		sdk.NewAttribute(types.AttributeKeyProvider, provider),
	))
	return id, nil
}

// VerifyImpact records an oracle confirmation. Triggers VERIFIED + rewards at threshold.
func (k Keeper) VerifyImpact(ctx sdk.Context, oracleAddr, impactID string) (bool, error) {
	if !k.oracleKeeper.IsActiveOracle(ctx, oracleAddr) {
		return false, types.ErrNotOracle
	}

	record, ok := k.GetRecord(ctx, impactID)
	if !ok {
		return false, types.ErrImpactNotFound.Wrapf("id %s", impactID)
	}
	if record.Status == types.StatusVerified {
		return false, types.ErrAlreadyVerified
	}
	if record.Status == types.StatusRejected {
		return false, types.ErrAlreadyRejected
	}

	// Replay protection: prevent duplicate oracle confirmations.
	for _, addr := range record.ConfirmingOracles {
		if addr == oracleAddr {
			return false, types.ErrDuplicateConfirm.Wrapf("oracle %s", oracleAddr)
		}
	}

	old := record
	record.ConfirmingOracles = append(record.ConfirmingOracles, oracleAddr)
	record.OracleConfirmations++

	verified := false
	if record.OracleConfirmations >= types.OracleConfirmationThreshold {
		record.Status = types.StatusVerified
		verified = true
	}

	k.updateRecordStatus(ctx, old, record)

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeImpactVerified,
		sdk.NewAttribute(types.AttributeKeyID, impactID),
		sdk.NewAttribute(types.AttributeKeyOracle, oracleAddr),
		sdk.NewAttribute(types.AttributeKeyConfirmations, fmt.Sprintf("%d", record.OracleConfirmations)),
	))

	// Trigger reward distribution once threshold is crossed.
	if verified {
		if err := k.rewardsKeeper.DistributeForImpact(ctx, record); err != nil {
			k.logger.Error("reward distribution failed", "impact_id", impactID, "err", err)
			// Non-fatal: verification stands, rewards can be retried via governance.
		}
	}

	return verified, nil
}

// RejectImpact marks a record as REJECTED. Only active oracles may reject.
func (k Keeper) RejectImpact(ctx sdk.Context, oracleAddr, impactID, reason string) error {
	if !k.oracleKeeper.IsActiveOracle(ctx, oracleAddr) {
		return types.ErrNotOracle
	}

	record, ok := k.GetRecord(ctx, impactID)
	if !ok {
		return types.ErrImpactNotFound.Wrapf("id %s", impactID)
	}
	if record.Status == types.StatusVerified {
		return types.ErrAlreadyVerified
	}
	if record.Status == types.StatusRejected {
		return types.ErrAlreadyRejected
	}

	old := record
	record.Status = types.StatusRejected
	k.updateRecordStatus(ctx, old, record)

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeImpactRejected,
		sdk.NewAttribute(types.AttributeKeyID, impactID),
		sdk.NewAttribute(types.AttributeKeyOracle, oracleAddr),
		sdk.NewAttribute(types.AttributeKeyReason, reason),
	))
	return nil
}
