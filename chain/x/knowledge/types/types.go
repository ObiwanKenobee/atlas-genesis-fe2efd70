package types

import (
	"cosmossdk.io/errors"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

const (
	ModuleName = "knowledge"
	StoreKey   = ModuleName

	// Event categories — every significant protocol action writes here
	CategoryVerification = "VERIFICATION"
	CategoryGovernance   = "GOVERNANCE"
	CategoryFraud        = "FRAUD"
	CategoryStewardship  = "STEWARDSHIP"
	CategoryMethodology  = "METHODOLOGY"
	CategoryBaseline     = "BASELINE"

	EventTypeKnowledgeRecorded = "knowledge_recorded"
	AttributeKeyCategory       = "category"
	AttributeKeyEventID        = "event_id"
	AttributeKeyRelatedID      = "related_id"
)

var (
	ErrEventNotFound = errors.Register(ModuleName, 1, "knowledge event not found")
	ErrUnauthorized  = errors.Register(ModuleName, 2, "unauthorized to record knowledge event")
)

// KnowledgeEvent is an append-only structured record written by the protocol
// whenever a significant action occurs. This is the institutional memory layer.
type KnowledgeEvent struct {
	ID          string                 `json:"id"`
	Category    string                 `json:"category"`
	RelatedID   string                 `json:"related_id"`   // impact_id, proposal_id, etc.
	ActorDID    string                 `json:"actor_did"`
	Summary     string                 `json:"summary"`
	Metadata    map[string]string      `json:"metadata"`
	IPFSPointer string                 `json:"ipfs_pointer"` // detailed evidence stored off-chain
	BlockHeight int64                  `json:"block_height"`
	Timestamp   int64                  `json:"timestamp"`
}

// EcosystemBaseline captures the pre-intervention state of an ecosystem,
// enabling counterfactual accounting — the most defensible impact methodology.
type EcosystemBaseline struct {
	ProjectID     string             `json:"project_id"`
	BiomeID       string             `json:"biome_id"`
	Location      string             `json:"location"`       // GeoJSON
	BaselineYear  int64              `json:"baseline_year"`
	NDVI          string             `json:"ndvi"`           // LegacyDec
	CarbonStock   string             `json:"carbon_stock"`   // tonnes, LegacyDec
	SpeciesCount  int64              `json:"species_count"`
	WaterQuality  string             `json:"water_quality"`  // 0–100, LegacyDec
	SatelliteRef  string             `json:"satellite_ref"`  // scene ID
	OraclesDID    []string           `json:"oracles_did"`
	CreatedAt     int64              `json:"created_at"`
	// CounterfactualTrajectory is the modelled "no-intervention" future.
	// Updated by the AI layer; compared against actual measurements.
	CounterfactualJSON string `json:"counterfactual_json"` // IPFS pointer
}

type GenesisState struct {
	Events    []KnowledgeEvent    `json:"events"`
	Baselines []EcosystemBaseline `json:"baselines"`
}

func DefaultGenesis() *GenesisState {
	return &GenesisState{Events: []KnowledgeEvent{}, Baselines: []EcosystemBaseline{}}
}

// ─── Messages ─────────────────────────────────────────────────────────────────

var (
	_ sdk.Msg = &MsgRecordEvent{}
	_ sdk.Msg = &MsgSetBaseline{}
)

type MsgRecordEvent struct {
	Recorder    string            `json:"recorder"`    // authorised module account or oracle
	Category    string            `json:"category"`
	RelatedID   string            `json:"related_id"`
	Summary     string            `json:"summary"`
	Metadata    map[string]string `json:"metadata"`
	IPFSPointer string            `json:"ipfs_pointer"`
}

func (m *MsgRecordEvent) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.Recorder); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrap(err.Error())
	}
	if m.Summary == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("summary required")
	}
	return nil
}
func (m *MsgRecordEvent) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Recorder)
	return []sdk.AccAddress{addr}
}

type MsgSetBaseline struct {
	OracleAddress string `json:"oracle_address"`
	ProjectID     string `json:"project_id"`
	BiomeID       string `json:"biome_id"`
	Location      string `json:"location"`
	NDVI          string `json:"ndvi"`
	CarbonStock   string `json:"carbon_stock"`
	SpeciesCount  int64  `json:"species_count"`
	WaterQuality  string `json:"water_quality"`
	SatelliteRef  string `json:"satellite_ref"`
}

func (m *MsgSetBaseline) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.OracleAddress); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrap(err.Error())
	}
	if m.ProjectID == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("project_id required")
	}
	return nil
}
func (m *MsgSetBaseline) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.OracleAddress)
	return []sdk.AccAddress{addr}
}

type MsgRecordEventResponse  struct{ EventID string }
type MsgSetBaselineResponse  struct{}

type QueryEventsRequest         struct{ Category string; RelatedID string }
type QueryEventsResponse        struct{ Events []KnowledgeEvent }
type QueryBaselineRequest       struct{ ProjectID string }
type QueryBaselineResponse      struct{ Baseline EcosystemBaseline }

var (
	KeyPrefixEvent           = []byte{0x01}
	KeyPrefixEventByCategory = []byte{0x02}
	KeyPrefixEventByRelated  = []byte{0x03}
	KeyPrefixBaseline        = []byte{0x04}
)

func EventKey(id string) []byte               { return append(KeyPrefixEvent, []byte(id)...) }
func EventByCategoryKey(cat, id string) []byte {
	return append(append(KeyPrefixEventByCategory, []byte(cat+"/")...), []byte(id)...)
}
func EventByCategoryPrefixKey(cat string) []byte {
	return append(KeyPrefixEventByCategory, []byte(cat+"/")...)
}
func EventByRelatedKey(rel, id string) []byte {
	return append(append(KeyPrefixEventByRelated, []byte(rel+"/")...), []byte(id)...)
}
func EventByRelatedPrefixKey(rel string) []byte {
	return append(KeyPrefixEventByRelated, []byte(rel+"/")...)
}
func BaselineKey(projectID string) []byte { return append(KeyPrefixBaseline, []byte(projectID)...) }

type MsgServer interface {
	RecordEvent(ctx interface{}, msg *MsgRecordEvent) (*MsgRecordEventResponse, error)
	SetBaseline(ctx interface{}, msg *MsgSetBaseline) (*MsgSetBaselineResponse, error)
}

type QueryServer interface {
	Events(ctx interface{}, req *QueryEventsRequest) (*QueryEventsResponse, error)
	Baseline(ctx interface{}, req *QueryBaselineRequest) (*QueryBaselineResponse, error)
}
