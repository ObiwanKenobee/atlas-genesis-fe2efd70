package types

import (
	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
)

const (
	ModuleName = "identity"
	StoreKey   = ModuleName
	RouterKey  = ModuleName

	MetadataMaxLen = 512

	RoleUnspecified = "UNSPECIFIED"
	RoleUser        = "USER"
	RoleClinic      = "CLINIC"
	RoleOracle      = "ORACLE"
	RoleValidator   = "VALIDATOR"
	RolePartner     = "PARTNER"
	RoleAdmin       = "ADMIN"

	EventTypeUserRegistered    = "user_registered"
	EventTypeReputationUpdated = "reputation_updated"
	AttributeKeyAddress        = "address"
	AttributeKeyRole           = "role"
	AttributeKeyScore          = "score"
)

var ValidRoles = map[string]bool{
	RoleUser: true, RoleClinic: true, RoleOracle: true,
	RoleValidator: true, RolePartner: true, RoleAdmin: true,
}

// User is the on-chain identity record.
type User struct {
	Address         string        `json:"address"`
	Role            string        `json:"role"`
	ReputationScore math.LegacyDec `json:"reputation_score"`
	Metadata        string        `json:"metadata"`
	RegisteredAt    int64         `json:"registered_at"`
}

// GenesisState holds the identity module genesis.
type GenesisState struct {
	Users []User `json:"users"`
}

func DefaultGenesis() *GenesisState { return &GenesisState{Users: []User{}} }

func (gs *GenesisState) Validate() error {
	seen := make(map[string]bool)
	for _, u := range gs.Users {
		if _, err := sdk.AccAddressFromBech32(u.Address); err != nil {
			return ErrInvalidAddress.Wrapf("address %s", u.Address)
		}
		if seen[u.Address] {
			return ErrDuplicateUser.Wrapf("address %s", u.Address)
		}
		seen[u.Address] = true
	}
	return nil
}
