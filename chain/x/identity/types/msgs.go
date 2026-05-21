package types

import (
	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

var (
	_ sdk.Msg = &MsgRegisterUser{}
	_ sdk.Msg = &MsgUpdateReputation{}
	_ sdk.Msg = &MsgUpdateMetadata{}
)

// ─── MsgRegisterUser ─────────────────────────────────────────────────────────

type MsgRegisterUser struct {
	Address  string `json:"address"`
	Role     string `json:"role"`
	Metadata string `json:"metadata"`
}

func NewMsgRegisterUser(address, role, metadata string) *MsgRegisterUser {
	return &MsgRegisterUser{Address: address, Role: role, Metadata: metadata}
}

func (m *MsgRegisterUser) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.Address); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrapf("invalid address: %s", err)
	}
	if !ValidRoles[m.Role] {
		return ErrInvalidRole.Wrapf("role %s", m.Role)
	}
	if len(m.Metadata) > MetadataMaxLen {
		return ErrMetadataTooLong
	}
	return nil
}

func (m *MsgRegisterUser) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Address)
	return []sdk.AccAddress{addr}
}

// ─── MsgUpdateReputation ─────────────────────────────────────────────────────

type MsgUpdateReputation struct {
	Admin   string         `json:"admin"`
	Address string         `json:"address"`
	Delta   math.LegacyDec `json:"delta"`
}

func NewMsgUpdateReputation(admin, address string, delta math.LegacyDec) *MsgUpdateReputation {
	return &MsgUpdateReputation{Admin: admin, Address: address, Delta: delta}
}

func (m *MsgUpdateReputation) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.Admin); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrapf("invalid admin: %s", err)
	}
	if _, err := sdk.AccAddressFromBech32(m.Address); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrapf("invalid address: %s", err)
	}
	return nil
}

func (m *MsgUpdateReputation) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Admin)
	return []sdk.AccAddress{addr}
}

// ─── MsgUpdateMetadata ───────────────────────────────────────────────────────

type MsgUpdateMetadata struct {
	Address  string `json:"address"`
	Metadata string `json:"metadata"`
}

func NewMsgUpdateMetadata(address, metadata string) *MsgUpdateMetadata {
	return &MsgUpdateMetadata{Address: address, Metadata: metadata}
}

func (m *MsgUpdateMetadata) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.Address); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrapf("invalid address: %s", err)
	}
	if len(m.Metadata) > MetadataMaxLen {
		return ErrMetadataTooLong
	}
	return nil
}

func (m *MsgUpdateMetadata) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Address)
	return []sdk.AccAddress{addr}
}
