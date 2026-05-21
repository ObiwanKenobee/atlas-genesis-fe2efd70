package keeper

import (
	"encoding/json"
	"time"

	"cosmossdk.io/log"
	"cosmossdk.io/math"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	impacttypes "github.com/atlashumanitarian/sanctum/x/impact/types"
	"github.com/atlashumanitarian/sanctum/x/rewards/types"
)

// BankKeeper is the subset of the Cosmos bank module used by rewards.
type BankKeeper interface {
	MintCoins(ctx sdk.Context, moduleName string, amounts sdk.Coins) error
	SendCoinsFromModuleToAccount(ctx sdk.Context, senderModule string, recipientAddr sdk.AccAddress, amt sdk.Coins) error
}

// OracleKeeper subset for fetching oracle addresses for pool distribution.
type OracleKeeper interface {
	GetActiveOracles(ctx sdk.Context) []struct{ Address string }
}

type Keeper struct {
	cdc             codec.BinaryCodec
	storeKey        storetypes.StoreKey
	logger          log.Logger
	bankKeeper      BankKeeper
	treasuryAddress string
}

func NewKeeper(
	cdc codec.BinaryCodec,
	storeKey storetypes.StoreKey,
	logger log.Logger,
	bk BankKeeper,
	treasuryAddress string,
) Keeper {
	return Keeper{
		cdc:             cdc,
		storeKey:        storeKey,
		logger:          logger.With("module", types.ModuleName),
		bankKeeper:      bk,
		treasuryAddress: treasuryAddress,
	}
}

func (k Keeper) store(ctx sdk.Context) storetypes.KVStore { return ctx.KVStore(k.storeKey) }

// ─── Distribution Logic ───────────────────────────────────────────────────────

// DistributeForImpact is called by the impact keeper when a record reaches VERIFIED.
// It mints the appropriate token and splits: 70% provider / 20% oracle pool / 10% treasury.
func (k Keeper) DistributeForImpact(ctx sdk.Context, record impacttypes.ImpactRecord) error {
	// Idempotency guard.
	if k.store(ctx).Has(types.DistributionKey(record.ID)) {
		return types.ErrAlreadyDistributed.Wrapf("impact %s", record.ID)
	}

	denom, baseAmt, err := k.denomAndAmount(record.ImpactType)
	if err != nil {
		return err
	}

	total := math.NewInt(baseAmt)
	providerAmt := total.MulRaw(types.ProviderSharePct).QuoRaw(100)
	oracleAmt := total.MulRaw(types.OracleSharePct).QuoRaw(100)
	treasuryAmt := total.Sub(providerAmt).Sub(oracleAmt) // remainder avoids rounding loss

	// Mint total supply for this distribution.
	mintCoins := sdk.NewCoins(sdk.NewCoin(denom, total))
	if err := k.bankKeeper.MintCoins(ctx, types.ModuleName, mintCoins); err != nil {
		return types.ErrDistributionFailed.Wrap(err.Error())
	}

	// Send to provider.
	providerAddr, _ := sdk.AccAddressFromBech32(record.Provider)
	if err := k.bankKeeper.SendCoinsFromModuleToAccount(ctx, types.ModuleName, providerAddr, sdk.NewCoins(sdk.NewCoin(denom, providerAmt))); err != nil {
		return types.ErrDistributionFailed.Wrap(err.Error())
	}

	// Send oracle pool share to treasury (oracle-specific distribution handled by governance).
	treasuryAddr, _ := sdk.AccAddressFromBech32(k.treasuryAddress)
	totalTreasuryAmt := oracleAmt.Add(treasuryAmt)
	if err := k.bankKeeper.SendCoinsFromModuleToAccount(ctx, types.ModuleName, treasuryAddr, sdk.NewCoins(sdk.NewCoin(denom, totalTreasuryAmt))); err != nil {
		return types.ErrDistributionFailed.Wrap(err.Error())
	}

	dist := types.RewardDistribution{
		ImpactID:       record.ID,
		Provider:       record.Provider,
		ProviderAmount: providerAmt,
		OracleAmount:   oracleAmt,
		TreasuryAmount: treasuryAmt,
		Denom:          denom,
		DistributedAt:  time.Now().Unix(),
	}
	bz, _ := json.Marshal(dist)
	k.store(ctx).Set(types.DistributionKey(record.ID), bz)

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeRewardsDistributed,
		sdk.NewAttribute(types.AttributeKeyImpactID, record.ID),
		sdk.NewAttribute(types.AttributeKeyProvider, record.Provider),
		sdk.NewAttribute(types.AttributeKeyProviderAmt, providerAmt.String()),
		sdk.NewAttribute(types.AttributeKeyOracleAmt, oracleAmt.String()),
		sdk.NewAttribute(types.AttributeKeyTreasuryAmt, treasuryAmt.String()),
		sdk.NewAttribute(types.AttributeKeyDenom, denom),
	))
	return nil
}

func (k Keeper) denomAndAmount(impactType string) (string, int64, error) {
	switch impactType {
	case impacttypes.TypeHealth:
		return types.DenomHLT, types.BaseHealthReward, nil
	case impacttypes.TypeClimate, impacttypes.TypeBiodiversity, impacttypes.TypeWater:
		return types.DenomREG, types.BaseClimateReward, nil
	default:
		return "", 0, types.ErrInvalidImpactType.Wrapf("type %s", impactType)
	}
}

func (k Keeper) GetAllDistributions(ctx sdk.Context) []types.RewardDistribution {
	iter := storetypes.KVStorePrefixIterator(k.store(ctx), types.KeyPrefixDistribution)
	defer iter.Close()
	var dists []types.RewardDistribution
	for ; iter.Valid(); iter.Next() {
		var d types.RewardDistribution
		if err := json.Unmarshal(iter.Value(), &d); err == nil {
			dists = append(dists, d)
		}
	}
	return dists
}
