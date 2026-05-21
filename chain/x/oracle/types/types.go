package types

import (
	"cosmossdk.io/errors"
	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

const (
	ModuleName = "oracle"
	StoreKey   = ModuleName

	OracleTypeHuman  = "HUMAN"
	OracleTypeAPI    = "API"
	OracleTypeSensor = "SENSOR"

	EventTypeOracleRegistered  = "oracle_registered"
	EventTypeOracleSuspended   = "oracle_suspended"
	EventTypeOracleReactivated = "oracle_reactivated"
	AttributeKeyAddress        = "address"
	AttributeKeyType           = "oracle_type"
	AttributeKeyReason         = "reason"
)

var ValidOracleTypes = map[string]bool{
	OracleTypeHuman: true, OracleTypeAPI: true, OracleTypeSensor: true,
}

var (
	ErrOracleNotFound  = errors.Register(ModuleName, 1, "oracle not found")
	ErrDuplicateOracle = errors.Register(ModuleName, 2, "oracle already registered")
	ErrOracleInactive  = errors.Register(ModuleName, 3, "oracle is not active")
	ErrUnauthorized    = errors.Register(ModuleName, 4, "unauthorized")
	ErrInvalidType     = errors.Register(ModuleName, 5, "invalid oracle type")
)

// Oracle is a trusted verification node.
type Oracle struct {
	Address      string         `json:"address"`
	OracleType   string         `json:"oracle_type"`
	Reputation   math.LegacyDec `json:"reputation"`
	Active       bool           `json:"active"`
	RegisteredAt int64          `json:"registered_at"`
}

type GenesisState struct {
	Oracles []Oracle `json:"oracles"`
}

func DefaultGenesis() *GenesisState { return &GenesisState{Oracles: []Oracle{}} }

func (gs *GenesisState) Validate() error {
	seen := make(map[string]bool)
	for _, o := range gs.Oracles {
		if seen[o.Address] {
			return ErrDuplicateOracle.Wrapf("address %s", o.Address)
		}
		seen[o.Address] = true
	}
	return nil
}

// ─── Messages ─────────────────────────────────────────────────────────────────

var (
	_ sdk.Msg = &MsgRegisterOracle{}
	_ sdk.Msg = &MsgSuspendOracle{}
	_ sdk.Msg = &MsgReactivateOracle{}
)

type MsgRegisterOracle struct {
	Address    string `json:"address"`
	OracleType string `json:"oracle_type"`
}

func (m *MsgRegisterOracle) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.Address); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrap(err.Error())
	}
	if !ValidOracleTypes[m.OracleType] {
		return ErrInvalidType.Wrapf("type %s", m.OracleType)
	}
	return nil
}

func (m *MsgRegisterOracle) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Address)
	return []sdk.AccAddress{addr}
}

type MsgSuspendOracle struct {
	Admin   string `json:"admin"`
	Address string `json:"address"`
	Reason  string `json:"reason"`
}

func (m *MsgSuspendOracle) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.Admin); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrap(err.Error())
	}
	if _, err := sdk.AccAddressFromBech32(m.Address); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrap(err.Error())
	}
	return nil
}

func (m *MsgSuspendOracle) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Admin)
	return []sdk.AccAddress{addr}
}

type MsgReactivateOracle struct {
	Admin   string `json:"admin"`
	Address string `json:"address"`
}

func (m *MsgReactivateOracle) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.Admin); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrap(err.Error())
	}
	return nil
}

func (m *MsgReactivateOracle) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Admin)
	return []sdk.AccAddress{addr}
}

// Response / Query types
type MsgRegisterOracleResponse   struct{}
type MsgSuspendOracleResponse    struct{}
type MsgReactivateOracleResponse struct{}

type QueryOracleRequest          struct{ Address string }
type QueryOracleResponse         struct{ Oracle Oracle }
type QueryActiveOraclesRequest   struct{}
type QueryActiveOraclesResponse  struct{ Oracles []Oracle }

// Store key prefixes
var (
	KeyPrefixOracle = []byte{0x01}
)

func OracleKey(address string) []byte {
	return append(KeyPrefixOracle, []byte(address)...)
}

// Server interfaces
type MsgServer interface {
	RegisterOracle(ctx interface{}, msg *MsgRegisterOracle) (*MsgRegisterOracleResponse, error)
	SuspendOracle(ctx interface{}, msg *MsgSuspendOracle) (*MsgSuspendOracleResponse, error)
	ReactivateOracle(ctx interface{}, msg *MsgReactivateOracle) (*MsgReactivateOracleResponse, error)
}

type QueryServer interface {
	Oracle(ctx interface{}, req *QueryOracleRequest) (*QueryOracleResponse, error)
	ActiveOracles(ctx interface{}, req *QueryActiveOraclesRequest) (*QueryActiveOraclesResponse, error)
}
