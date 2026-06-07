package types

import (
	"cosmossdk.io/errors"
	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
)

const (
	ModuleName = "did"
	StoreKey   = ModuleName

	// Verifiable Credential access levels
	AccessPublic    = "PUBLIC"
	AccessPrivate   = "PRIVATE"
	AccessSovereign = "SOVEREIGN"

	// Credential types
	CredentialProfessional  = "PROFESSIONAL"
	CredentialLandTenure    = "LAND_TENURE"
	CredentialStewardship   = "STEWARDSHIP"
	CredentialIndigenous    = "INDIGENOUS_COMMUNITY"
	CredentialOracle        = "ORACLE_CERTIFICATION"
	CredentialOrganisation  = "ORGANISATION"

	EventTypeDIDCreated       = "did_created"
	EventTypeVCIssued         = "vc_issued"
	EventTypeStewardshipAdded = "stewardship_added"
	AttributeKeyDID           = "did"
	AttributeKeySubject       = "subject"
	AttributeKeyIssuer        = "issuer"
	AttributeKeyType          = "credential_type"
)

var (
	ErrDIDNotFound        = errors.Register(ModuleName, 1, "DID not found")
	ErrDIDAlreadyExists   = errors.Register(ModuleName, 2, "DID already exists")
	ErrUnauthorizedIssuer = errors.Register(ModuleName, 3, "issuer not authorised to issue this credential type")
	ErrVCNotFound         = errors.Register(ModuleName, 4, "verifiable credential not found")
	ErrInvalidDID         = errors.Register(ModuleName, 5, "invalid DID format")
	ErrExpiredCredential  = errors.Register(ModuleName, 6, "credential has expired")
)

// DIDDocument is a W3C-compliant decentralized identifier document.
type DIDDocument struct {
	// did:sanctum:<chain-id>:<address>
	ID             string   `json:"id"`
	Controller     string   `json:"controller"`
	Authentication []string `json:"authentication"`
	CreatedAt      int64    `json:"created_at"`
	UpdatedAt      int64    `json:"updated_at"`
	Active         bool     `json:"active"`
}

// VerifiableCredential is a W3C VC anchored on-chain.
type VerifiableCredential struct {
	ID             string `json:"id"`
	Type           string `json:"credential_type"`
	IssuerDID      string `json:"issuer_did"`
	SubjectDID     string `json:"subject_did"`
	ClaimHash      string `json:"claim_hash"`    // SHA-256 of the credential JSON stored off-chain
	IPFSPointer    string `json:"ipfs_pointer"`  // content-addressed off-chain storage
	AccessLevel    string `json:"access_level"`
	IssuedAt       int64  `json:"issued_at"`
	ExpiresAt      int64  `json:"expires_at"`    // 0 = no expiry
	Revoked        bool   `json:"revoked"`
	JurisdictionID string `json:"jurisdiction_id"` // ISO 3166-1
}

// StewardshipRecord is an append-only time-series of verified stewardship acts.
// This is the Proof of Stewardship primitive — the most valuable identity
// credential in the regenerative finance ecosystem.
type StewardshipRecord struct {
	SubjectDID   string  `json:"subject_did"`
	ProjectID    string  `json:"project_id"`
	MetricType   string  `json:"metric_type"`   // e.g. "carbon", "biodiversity", "water"
	MetricValue  string  `json:"metric_value"`  // math.LegacyDec as string
	ImpactID     string  `json:"impact_id"`     // references x/impact verified record
	BlockHeight  int64   `json:"block_height"`
	Timestamp    int64   `json:"timestamp"`
}

// ProofOfStewardshipScore is the aggregated creditworthiness score derived
// from the full stewardship history — the world's first reality-grounded
// ecological credit score.
type ProofOfStewardshipScore struct {
	SubjectDID          string `json:"subject_did"`
	Score               string `json:"score"`                 // 0–1000, LegacyDec
	SubmissionAccuracy  string `json:"submission_accuracy"`   // fraction
	TimeConsistency     string `json:"time_consistency"`      // penalises gaps
	TotalVerifiedEvents int64  `json:"total_verified_events"`
	ActiveSince         int64  `json:"active_since"`
	LastUpdated         int64  `json:"last_updated"`
}

type GenesisState struct {
	Documents          []DIDDocument          `json:"documents"`
	Credentials        []VerifiableCredential `json:"credentials"`
	StewardshipRecords []StewardshipRecord    `json:"stewardship_records"`
}

func DefaultGenesis() *GenesisState {
	return &GenesisState{
		Documents:          []DIDDocument{},
		Credentials:        []VerifiableCredential{},
		StewardshipRecords: []StewardshipRecord{},
	}
}

// ─── Messages ─────────────────────────────────────────────────────────────────

var (
	_ sdk.Msg = &MsgCreateDID{}
	_ sdk.Msg = &MsgIssueCredential{}
	_ sdk.Msg = &MsgRevokeCredential{}
)

type MsgCreateDID struct {
	Controller string `json:"controller"` // bech32 address
}

func (m *MsgCreateDID) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.Controller); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrap(err.Error())
	}
	return nil
}
func (m *MsgCreateDID) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.Controller)
	return []sdk.AccAddress{addr}
}

type MsgIssueCredential struct {
	IssuerAddress  string `json:"issuer_address"`
	SubjectDID     string `json:"subject_did"`
	CredentialType string `json:"credential_type"`
	ClaimHash      string `json:"claim_hash"`
	IPFSPointer    string `json:"ipfs_pointer"`
	AccessLevel    string `json:"access_level"`
	ExpiresAt      int64  `json:"expires_at"`
	JurisdictionID string `json:"jurisdiction_id"`
}

func (m *MsgIssueCredential) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.IssuerAddress); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrap(err.Error())
	}
	if m.ClaimHash == "" {
		return sdkerrors.ErrInvalidRequest.Wrap("claim_hash required")
	}
	return nil
}
func (m *MsgIssueCredential) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.IssuerAddress)
	return []sdk.AccAddress{addr}
}

type MsgRevokeCredential struct {
	IssuerAddress string `json:"issuer_address"`
	CredentialID  string `json:"credential_id"`
	Reason        string `json:"reason"`
}

func (m *MsgRevokeCredential) ValidateBasic() error {
	if _, err := sdk.AccAddressFromBech32(m.IssuerAddress); err != nil {
		return sdkerrors.ErrInvalidAddress.Wrap(err.Error())
	}
	return nil
}
func (m *MsgRevokeCredential) GetSigners() []sdk.AccAddress {
	addr, _ := sdk.AccAddressFromBech32(m.IssuerAddress)
	return []sdk.AccAddress{addr}
}

// Response / Query types
type MsgCreateDIDResponse       struct{ DID string }
type MsgIssueCredentialResponse struct{ CredentialID string }
type MsgRevokeCredentialResponse struct{}

type QueryDIDRequest                  struct{ DID string }
type QueryDIDResponse                 struct{ Document DIDDocument }
type QueryCredentialRequest           struct{ CredentialID string }
type QueryCredentialResponse          struct{ Credential VerifiableCredential }
type QueryStewardshipScoreRequest     struct{ DID string }
type QueryStewardshipScoreResponse    struct{ Score ProofOfStewardshipScore }
type QueryCredentialsBySubjectRequest struct{ SubjectDID string }
type QueryCredentialsBySubjectResponse struct{ Credentials []VerifiableCredential }

// Store key prefixes
var (
	KeyPrefixDID              = []byte{0x01}
	KeyPrefixVC               = []byte{0x02}
	KeyPrefixVCBySubject      = []byte{0x03}
	KeyPrefixStewardship      = []byte{0x04}
	KeyPrefixStewardshipScore = []byte{0x05}
)

func DIDKey(did string) []byte        { return append(KeyPrefixDID, []byte(did)...) }
func VCKey(id string) []byte          { return append(KeyPrefixVC, []byte(id)...) }
func VCBySubjectKey(sub, id string) []byte {
	return append(append(KeyPrefixVCBySubject, []byte(sub+"/")...), []byte(id)...)
}
func VCBySubjectPrefixKey(sub string) []byte {
	return append(KeyPrefixVCBySubject, []byte(sub+"/")...)
}
func StewardshipKey(did, impactID string) []byte {
	return append(append(KeyPrefixStewardship, []byte(did+"/")...), []byte(impactID)...)
}
func StewardshipPrefixKey(did string) []byte {
	return append(KeyPrefixStewardship, []byte(did+"/")...)
}
func StewardshipScoreKey(did string) []byte {
	return append(KeyPrefixStewardshipScore, []byte(did)...)
}

// Server interfaces
type MsgServer interface {
	CreateDID(ctx interface{}, msg *MsgCreateDID) (*MsgCreateDIDResponse, error)
	IssueCredential(ctx interface{}, msg *MsgIssueCredential) (*MsgIssueCredentialResponse, error)
	RevokeCredential(ctx interface{}, msg *MsgRevokeCredential) (*MsgRevokeCredentialResponse, error)
}

type QueryServer interface {
	DID(ctx interface{}, req *QueryDIDRequest) (*QueryDIDResponse, error)
	Credential(ctx interface{}, req *QueryCredentialRequest) (*QueryCredentialResponse, error)
	StewardshipScore(ctx interface{}, req *QueryStewardshipScoreRequest) (*QueryStewardshipScoreResponse, error)
	CredentialsBySubject(ctx interface{}, req *QueryCredentialsBySubjectRequest) (*QueryCredentialsBySubjectResponse, error)
}
