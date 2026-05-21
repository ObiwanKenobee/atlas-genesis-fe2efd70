package types

import (
	"cosmossdk.io/errors"
	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

const (
	ModuleName = "impact"
	StoreKey   = ModuleName

	// OracleConfirmationThreshold is the minimum confirmations for VERIFIED status.
	OracleConfirmationThreshold = 3

	StatusPending  = "PENDING"
	StatusVerified = "VERIFIED"
	StatusRejected = "REJECTED"

	TypeHealth      = "HEALTH"
	TypeClimate     = "CLIMATE"
	TypeBiodiversity = "BIODIVERSITY"
	TypeWater       = "WATER"

	EventTypeImpactSubmitted = "impact_submitted"
	EventTypeImpactVerified  = "impact_verified"
	EventTypeImpactRejected  = "impact_rejected"
	AttributeKeyID           = "impact_id"
	AttributeKeyProvider     = "provider"
	AttributeKeyOracle       = "oracle"
	AttributeKeyConfirmations = "confirmations"
	AttributeKeyReason       = "reason"
)

var ValidImpactTypes = map[string]bool{
	TypeHealth: true, TypeClimate: true, TypeBiodiversity: true, TypeWater: true,
}

var (
	ErrImpactNotFound    = errors.Register(ModuleName, 1, "impact record not found")
	ErrDuplicateImpact   = errors.Register(ModuleName, 2, "impact ID already exists")
	ErrNotOracle         = errors.Register(ModuleName, 3, "signer is not an active oracle")
	ErrAlreadyVerified   = errors.Register(ModuleName, 4, "impact record is already verified")
	ErrAlreadyRejected   = errors.Register(ModuleName, 5, "impact record is already rejected")
	ErrDuplicateConfirm  = errors.Register(ModuleName, 6, "oracle has already confirmed this record")
	ErrInvalidImpactType = errors.Register(ModuleName, 7, "invalid impact type")
	ErrNotProvider       = errors.Register(ModuleName, 8, "signer is not the impact provider")
)

// ImpactRecord is an immutable-once-verified on-chain impact record.
type ImpactRecord struct {
	ID                  string         `json:"id"`
	Provider            string         `json:"provider"`
	ImpactType          string         `json:"impact_type"`
	Metric              string         `json:"metric"`
	Value               math.LegacyDec `json:"value"`
	Status              string         `json:"status"`
	OracleConfirmations uint64         `json:"oracle_confirmations"`
	ConfirmingOracles   []string       `json:"confirming_oracles"`
	Timestamp           int64          `json:"timestamp"`
}

type GenesisState struct {
	Records []ImpactRecord `json:"records"`
}

func DefaultGenesis() *GenesisState { return &GenesisState{Records: []ImpactRecord{}} }

func (gs *GenesisState) Validate() error {
	seen := make(map[string]bool)
	for _, r := range gs.Records {
		if seen[r.ID] {
			return ErrDuplicateImpact.Wrapf("id %s", r.ID)
		}
		seen[r.ID] = true
	}
	return nil
}

// ─── Messages ─────────────────────────────────────────────────────────────────

var (
	_ sdk.Msg = &MsgSubmitImpact{}
	_ sdk.Msg = &MsgVerifyImpact{}
	_ sdk.Msg = &MsgRejectImpact{}
)

type MsgSubmitImpact struct {
	Provider   string         `json:"provider"`
	ImpactType string         `json:"impact_type"`
	Metric     string         `json:"metric"`
	Value      math.LegacyDec `json:"value"`
}

func (m *MsgSubmitImpact) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.Provider); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrap(err.Error())
	}
	if !ValidImpactTypes[m.ImpactType] {
		return ErrInvalidImpactType.Wrapf("type %s", m.ImpactType)
	}
	if m.Metric == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("metric cannot be empty")
	}
	if m.Value.IsNegative() {
		return sdkerrors.ErrInvalidRequest.Wrap("value cannot be negative")
	}
	return nil
}

func (m *MsgSubmitImpact) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Provider)
	return []sdk.AccAddress{addr}
}

type MsgVerifyImpact struct {
	Oracle   string `json:"oracle"`
	ImpactID string `json:"impact_id"`
}

func (m *MsgVerifyImpact) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.Oracle); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrap(err.Error())
	}
	if m.ImpactID == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("impact_id cannot be empty")
	}
	return nil
}

func (m *MsgVerifyImpact) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Oracle)
	return []sdk.AccAddress{addr}
}

type MsgRejectImpact struct {
	Oracle   string `json:"oracle"`
	ImpactID string `json:"impact_id"`
	Reason   string `json:"reason"`
}

func (m *MsgRejectImpact) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.Oracle); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrap(err.Error())
	}
	if m.ImpactID == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("impact_id cannot be empty")
	}
	return nil
}

func (m *MsgRejectImpact) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Oracle)
	return []sdk.AccAddress{addr}
}

// Response / Query types
type MsgSubmitImpactResponse struct{ ID string }
type MsgVerifyImpactResponse  struct{ Verified bool }
type MsgRejectImpactResponse  struct{}

type QueryImpactRequest              struct{ ID string }
type QueryImpactResponse             struct{ Record ImpactRecord }
type QueryImpactsByStatusRequest     struct{ Status string }
type QueryImpactsByStatusResponse    struct{ Records []ImpactRecord }
type QueryImpactsByProviderRequest   struct{ Provider string }
type QueryImpactsByProviderResponse  struct{ Records []ImpactRecord }

// Store key prefixes
var (
	KeyPrefixImpact          = []byte{0x01}
	KeyPrefixImpactByStatus  = []byte{0x02}
	KeyPrefixImpactByProvider = []byte{0x03}
)

func ImpactKey(id string) []byte {
	return append(KeyPrefixImpact, []byte(id)...)
}

func ImpactByStatusKey(status, id string) []byte {
	return append(append(KeyPrefixImpactByStatus, []byte(status+"/")...), []byte(id)...)
}

func ImpactByStatusPrefixKey(status string) []byte {
	return append(KeyPrefixImpactByStatus, []byte(status+"/")...)
}

func ImpactByProviderKey(provider, id string) []byte {
	return append(append(KeyPrefixImpactByProvider, []byte(provider+"/")...), []byte(id)...)
}

func ImpactByProviderPrefixKey(provider string) []byte {
	return append(KeyPrefixImpactByProvider, []byte(provider+"/")...)
}

// Server interfaces
type MsgServer interface {
	SubmitImpact(ctx interface{}, msg *MsgSubmitImpact) (*MsgSubmitImpactResponse, error)
	VerifyImpact(ctx interface{}, msg *MsgVerifyImpact) (*MsgVerifyImpactResponse, error)
	RejectImpact(ctx interface{}, msg *MsgRejectImpact) (*MsgRejectImpactResponse, error)
}

type QueryServer interface {
	Impact(ctx interface{}, req *QueryImpactRequest) (*QueryImpactResponse, error)
	ImpactsByStatus(ctx interface{}, req *QueryImpactsByStatusRequest) (*QueryImpactsByStatusResponse, error)
	ImpactsByProvider(ctx interface{}, req *QueryImpactsByProviderRequest) (*QueryImpactsByProviderResponse, error)
}
