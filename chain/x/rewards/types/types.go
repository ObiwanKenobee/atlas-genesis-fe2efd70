package types

import (
	"cosmossdk.io/errors"
	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

const (
	ModuleName = "rewards"
	StoreKey   = ModuleName

	// Token denoms
	DenomSAN = "usan"
	DenomHLT = "uhlt"
	DenomREG = "ureg"

	// Distribution splits (basis points out of 100)
	ProviderSharePct  = 70
	OracleSharePct    = 20
	TreasurySharePct  = 10

	// Base reward amounts per verified impact (in micro-units)
	BaseHealthReward  = 1_000_000  // 1 HLT
	BaseClimateReward = 1_000_000  // 1 REG

	EventTypeRewardsDistributed = "rewards_distributed"
	AttributeKeyImpactID        = "impact_id"
	AttributeKeyProvider        = "provider"
	AttributeKeyProviderAmt     = "provider_amount"
	AttributeKeyOracleAmt       = "oracle_amount"
	AttributeKeyTreasuryAmt     = "treasury_amount"
	AttributeKeyDenom           = "denom"
)

var (
	ErrDistributionFailed = errors.Register(ModuleName, 1, "reward distribution failed")
	ErrInvalidImpactType  = errors.Register(ModuleName, 2, "unknown impact type for reward")
	ErrAlreadyDistributed = errors.Register(ModuleName, 3, "rewards already distributed for this impact")
)

// RewardDistribution is the on-chain record of a completed distribution.
type RewardDistribution struct {
	ImpactID       string   `json:"impact_id"`
	Provider       string   `json:"provider"`
	ProviderAmount math.Int `json:"provider_amount"`
	OracleAmount   math.Int `json:"oracle_amount"`
	TreasuryAmount math.Int `json:"treasury_amount"`
	Denom          string   `json:"denom"`
	DistributedAt  int64    `json:"distributed_at"`
}

type GenesisState struct {
	Distributions   []RewardDistribution `json:"distributions"`
	TreasuryAddress string               `json:"treasury_address"`
}

func DefaultGenesis() *GenesisState {
	return &GenesisState{Distributions: []RewardDistribution{}}
}

// ─── Messages ─────────────────────────────────────────────────────────────────

var _ sdk.Msg = &MsgDistributeRewards{}

type MsgDistributeRewards struct {
	Signer   string `json:"signer"`
	ImpactID string `json:"impact_id"`
}

func (m *MsgDistributeRewards) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.Signer); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrap(err.Error())
	}
	if m.ImpactID == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("impact_id cannot be empty")
	}
	return nil
}

func (m *MsgDistributeRewards) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Signer)
	return []sdk.AccAddress{addr}
}

type MsgDistributeRewardsResponse struct {
	Distributed []sdk.Coin `json:"distributed"`
}

// Store key prefixes
var (
	KeyPrefixDistribution = []byte{0x01}
)

func DistributionKey(impactID string) []byte {
	return append(KeyPrefixDistribution, []byte(impactID)...)
}

// Server interfaces
type MsgServer interface {
	DistributeRewards(ctx interface{}, msg *MsgDistributeRewards) (*MsgDistributeRewardsResponse, error)
}
