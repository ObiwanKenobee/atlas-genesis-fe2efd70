package types

import (
	"cosmossdk.io/errors"
	"cosmossdk.io/math"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

const (
	ModuleName = "regeneration"
	StoreKey   = ModuleName

	StatusActive    = "ACTIVE"
	StatusCompleted = "COMPLETED"
	StatusSuspended = "SUSPENDED"

	EventTypeProjectCreated = "project_created"
	EventTypeMetricsUpdated = "metrics_updated"
	AttributeKeyID          = "project_id"
	AttributeKeyOwner       = "owner"
	AttributeKeyCarbon      = "carbon_tonnes"
	AttributeKeyTrees       = "trees_planted"
)

var (
	ErrProjectNotFound  = errors.Register(ModuleName, 1, "project not found")
	ErrDuplicateProject = errors.Register(ModuleName, 2, "project already exists")
	ErrNotOwner         = errors.Register(ModuleName, 3, "signer is not the project owner")
	ErrInvalidMetrics   = errors.Register(ModuleName, 4, "invalid metric values")
)

// RegenerationProject tracks an ecological restoration project.
type RegenerationProject struct {
	ID                 string         `json:"id"`
	Owner              string         `json:"owner"`
	Name               string         `json:"name"`
	Location           string         `json:"location"`
	CarbonTonnes       math.LegacyDec `json:"carbon_tonnes"`
	BiodiversityScore  math.LegacyDec `json:"biodiversity_score"`
	TreesPlanted       uint64         `json:"trees_planted"`
	Status             string         `json:"status"`
	CreatedAt          int64          `json:"created_at"`
	UpdatedAt          int64          `json:"updated_at"`
}

type GenesisState struct {
	Projects []RegenerationProject `json:"projects"`
}

func DefaultGenesis() *GenesisState { return &GenesisState{Projects: []RegenerationProject{}} }

// ─── Messages ─────────────────────────────────────────────────────────────────

var (
	_ sdk.Msg = &MsgCreateProject{}
	_ sdk.Msg = &MsgUpdateProjectMetrics{}
)

type MsgCreateProject struct {
	Owner    string `json:"owner"`
	Name     string `json:"name"`
	Location string `json:"location"`
}

func (m *MsgCreateProject) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.Owner); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrap(err.Error())
	}
	if m.Name == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("name cannot be empty")
	}
	return nil
}

func (m *MsgCreateProject) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Owner)
	return []sdk.AccAddress{addr}
}

type MsgUpdateProjectMetrics struct {
	Signer             string         `json:"signer"`
	ProjectID          string         `json:"project_id"`
	CarbonTonnesDelta  math.LegacyDec `json:"carbon_tonnes_delta"`
	BiodiversityDelta  math.LegacyDec `json:"biodiversity_delta"`
	TreesPlantedDelta  uint64         `json:"trees_planted_delta"`
}

func (m *MsgUpdateProjectMetrics) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.Signer); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrap(err.Error())
	}
	if m.ProjectID == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("project_id cannot be empty")
	}
	if m.CarbonTonnesDelta.IsNegative() || m.BiodiversityDelta.IsNegative() {
		return ErrInvalidMetrics.Wrap("deltas cannot be negative")
	}
	return nil
}

func (m *MsgUpdateProjectMetrics) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Signer)
	return []sdk.AccAddress{addr}
}

// Response / Query types
type MsgCreateProjectResponse        struct{ ID string }
type MsgUpdateProjectMetricsResponse struct{}

type QueryProjectRequest          struct{ ID string }
type QueryProjectResponse         struct{ Project RegenerationProject }
type QueryProjectsByOwnerRequest  struct{ Owner string }
type QueryProjectsByOwnerResponse struct{ Projects []RegenerationProject }

// Store key prefixes
var (
	KeyPrefixProject        = []byte{0x01}
	KeyPrefixProjectByOwner = []byte{0x02}
)

func ProjectKey(id string) []byte {
	return append(KeyPrefixProject, []byte(id)...)
}

func ProjectByOwnerKey(owner, id string) []byte {
	return append(append(KeyPrefixProjectByOwner, []byte(owner+"/")...), []byte(id)...)
}

func ProjectByOwnerPrefixKey(owner string) []byte {
	return append(KeyPrefixProjectByOwner, []byte(owner+"/")...)
}

// Server interfaces
type MsgServer interface {
	CreateProject(ctx interface{}, msg *MsgCreateProject) (*MsgCreateProjectResponse, error)
	UpdateProjectMetrics(ctx interface{}, msg *MsgUpdateProjectMetrics) (*MsgUpdateProjectMetricsResponse, error)
}

type QueryServer interface {
	Project(ctx interface{}, req *QueryProjectRequest) (*QueryProjectResponse, error)
	ProjectsByOwner(ctx interface{}, req *QueryProjectsByOwnerRequest) (*QueryProjectsByOwnerResponse, error)
}
