package keeper

import (
	"encoding/json"
	"time"

	"cosmossdk.io/log"
	"cosmossdk.io/math"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/atlashumanitarian/sanctum/x/oracle/types"
)

// Keeper manages oracle state.
type Keeper struct {
	cdc      codec.BinaryCodec
	storeKey storetypes.StoreKey
	logger   log.Logger

	// IdentityKeeper dependency — injected to verify ADMIN role on suspend/reactivate.
	identityKeeper IdentityKeeper
}

// IdentityKeeper is the subset of identity.Keeper used by oracle.
type IdentityKeeper interface {
	GetUserRole(ctx sdk.Context, address string) (string, bool)
}

func NewKeeper(cdc codec.BinaryCodec, storeKey storetypes.StoreKey, logger log.Logger, ik IdentityKeeper) Keeper {
	return Keeper{cdc: cdc, storeKey: storeKey, logger: logger.With("module", types.ModuleName), identityKeeper: ik}
}

func (k Keeper) store(ctx sdk.Context) storetypes.KVStore { return ctx.KVStore(k.storeKey) }

func (k Keeper) marshal(o types.Oracle) []byte {
	bz, err := json.Marshal(o)
	if err != nil {
		panic(err)
	}
	return bz
}

func (k Keeper) unmarshal(bz []byte) types.Oracle {
	var o types.Oracle
	if err := json.Unmarshal(bz, &o); err != nil {
		panic(err)
	}
	return o
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

func (k Keeper) SetOracle(ctx sdk.Context, o types.Oracle) {
	k.store(ctx).Set(types.OracleKey(o.Address), k.marshal(o))
}

func (k Keeper) GetOracle(ctx sdk.Context, address string) (types.Oracle, bool) {
	bz := k.store(ctx).Get(types.OracleKey(address))
	if bz == nil {
		return types.Oracle{}, false
	}
	return k.unmarshal(bz), true
}

func (k Keeper) HasOracle(ctx sdk.Context, address string) bool {
	return k.store(ctx).Has(types.OracleKey(address))
}

func (k Keeper) GetAllOracles(ctx sdk.Context) []types.Oracle {
	iter := storetypes.KVStorePrefixIterator(k.store(ctx), types.KeyPrefixOracle)
	defer iter.Close()
	var oracles []types.Oracle
	for ; iter.Valid(); iter.Next() {
		oracles = append(oracles, k.unmarshal(iter.Value()))
	}
	return oracles
}

func (k Keeper) GetActiveOracles(ctx sdk.Context) []types.Oracle {
	all := k.GetAllOracles(ctx)
	active := make([]types.Oracle, 0, len(all))
	for _, o := range all {
		if o.Active {
			active = append(active, o)
		}
	}
	return active
}

// ─── Business Logic ───────────────────────────────────────────────────────────

func (k Keeper) RegisterOracle(ctx sdk.Context, address, oracleType string) error {
	if k.HasOracle(ctx, address) {
		return types.ErrDuplicateOracle.Wrapf("address %s", address)
	}
	o := types.Oracle{
		Address:      address,
		OracleType:   oracleType,
		Reputation:   math.LegacyOneDec(),
		Active:       true,
		RegisteredAt: time.Now().Unix(),
	}
	k.SetOracle(ctx, o)
	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeOracleRegistered,
		sdk.NewAttribute(types.AttributeKeyAddress, address),
		sdk.NewAttribute(types.AttributeKeyType, oracleType),
	))
	return nil
}

func (k Keeper) SuspendOracle(ctx sdk.Context, adminAddr, address, reason string) error {
	if err := k.requireAdmin(ctx, adminAddr); err != nil {
		return err
	}
	o, ok := k.GetOracle(ctx, address)
	if !ok {
		return types.ErrOracleNotFound.Wrapf("address %s", address)
	}
	o.Active = false
	k.SetOracle(ctx, o)
	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeOracleSuspended,
		sdk.NewAttribute(types.AttributeKeyAddress, address),
		sdk.NewAttribute(types.AttributeKeyReason, reason),
	))
	return nil
}

func (k Keeper) ReactivateOracle(ctx sdk.Context, adminAddr, address string) error {
	if err := k.requireAdmin(ctx, adminAddr); err != nil {
		return err
	}
	o, ok := k.GetOracle(ctx, address)
	if !ok {
		return types.ErrOracleNotFound.Wrapf("address %s", address)
	}
	o.Active = true
	k.SetOracle(ctx, o)
	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeOracleReactivated,
		sdk.NewAttribute(types.AttributeKeyAddress, address),
	))
	return nil
}

// IsActiveOracle is called by the impact keeper to validate oracle confirmations.
func (k Keeper) IsActiveOracle(ctx sdk.Context, address string) bool {
	o, ok := k.GetOracle(ctx, address)
	return ok && o.Active
}

func (k Keeper) requireAdmin(ctx sdk.Context, address string) error {
	role, ok := k.identityKeeper.GetUserRole(ctx, address)
	if !ok || role != "ADMIN" {
		return types.ErrUnauthorized
	}
	return nil
}
