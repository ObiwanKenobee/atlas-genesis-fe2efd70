package types

// Custom governance proposal types for Atlas Sanctum Protocol.
// These extend the Cosmos SDK governance module with domain-specific proposals.

const (
	ProposalTypeOracle       = "OracleProposal"
	ProposalTypeTreasury     = "TreasuryProposal"
	ProposalTypeRegeneration = "RegenerationProposal"
)

// OracleProposal proposes changes to oracle registration policy or
// bulk suspension/reactivation of oracle sets.
type OracleProposal struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	// Action: "SUSPEND_ALL" | "REACTIVATE" | "UPDATE_THRESHOLD"
	Action  string `json:"action"`
	Payload string `json:"payload"`
}

func (p *OracleProposal) ProposalType() string  { return ProposalTypeOracle }
func (p *OracleProposal) ProposalRoute() string { return "sanctum" }
func (p *OracleProposal) GetTitle() string       { return p.Title }
func (p *OracleProposal) GetDescription() string { return p.Description }
func (p *OracleProposal) ValidateBasic() error   { return nil }
func (p *OracleProposal) String() string         { return p.Title }

// TreasuryProposal proposes changes to treasury address or fund allocation.
type TreasuryProposal struct {
	Title          string `json:"title"`
	Description    string `json:"description"`
	NewTreasuryAddr string `json:"new_treasury_addr"`
	// Allocation: percentage split adjustments (must sum to 100).
	ProviderPct  uint64 `json:"provider_pct"`
	OraclePct    uint64 `json:"oracle_pct"`
	TreasuryPct  uint64 `json:"treasury_pct"`
}

func (p *TreasuryProposal) ProposalType() string  { return ProposalTypeTreasury }
func (p *TreasuryProposal) ProposalRoute() string { return "sanctum" }
func (p *TreasuryProposal) GetTitle() string       { return p.Title }
func (p *TreasuryProposal) GetDescription() string { return p.Description }
func (p *TreasuryProposal) ValidateBasic() error {
	if p.ProviderPct+p.OraclePct+p.TreasuryPct != 100 {
		return ErrInvalidAllocation
	}
	return nil
}
func (p *TreasuryProposal) String() string { return p.Title }

// RegenerationProposal proposes changes to regeneration project eligibility
// criteria or carbon accounting methodology.
type RegenerationProposal struct {
	Title              string `json:"title"`
	Description        string `json:"description"`
	MinCarbonThreshold string `json:"min_carbon_threshold"`
	RequiredOracles    uint64 `json:"required_oracles"`
}

func (p *RegenerationProposal) ProposalType() string  { return ProposalTypeRegeneration }
func (p *RegenerationProposal) ProposalRoute() string { return "sanctum" }
func (p *RegenerationProposal) GetTitle() string       { return p.Title }
func (p *RegenerationProposal) GetDescription() string { return p.Description }
func (p *RegenerationProposal) ValidateBasic() error   { return nil }
func (p *RegenerationProposal) String() string         { return p.Title }
