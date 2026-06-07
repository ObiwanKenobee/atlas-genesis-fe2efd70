package keeper

import (
	"encoding/json"
	"fmt"
	"time"

	"cosmossdk.io/log"
	"cosmossdk.io/math"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/atlashumanitarian/sanctum/x/did/types"
)

// ImpactKeeper dependency — DID keeper listens to verified impact records
// to build the Proof of Stewardship score.
type ImpactKeeper interface {
	GetRecord(ctx sdk.Context, id string) (interface{ GetStatus() string; GetProvider() string; GetImpactType() string; GetValue() string }, bool)
}

type Keeper struct {
	cdc      codec.BinaryCodec
	storeKey storetypes.StoreKey
	logger   log.Logger
}

func NewKeeper(cdc codec.BinaryCodec, storeKey storetypes.StoreKey, logger log.Logger) Keeper {
	return Keeper{cdc: cdc, storeKey: storeKey, logger: logger.With("module", types.ModuleName)}
}

func (k Keeper) store(ctx sdk.Context) storetypes.KVStore { return ctx.KVStore(k.storeKey) }

func (k Keeper) marshal(v interface{}) []byte {
	bz, err := json.Marshal(v)
	if err != nil {
		panic(err)
	}
	return bz
}

// ─── DID CRUD ─────────────────────────────────────────────────────────────────

// DIDFromAddress derives the canonical DID for a sanctum address.
func DIDFromAddress(address, chainID string) string {
	return fmt.Sprintf("did:sanctum:%s:%s", chainID, address)
}

func (k Keeper) CreateDID(ctx sdk.Context, controller string) (string, error) {
	chainID := ctx.ChainID()
	did := DIDFromAddress(controller, chainID)

	if k.store(ctx).Has(types.DIDKey(did)) {
		return "", types.ErrDIDAlreadyExists.Wrapf("DID %s", did)
	}

	doc := types.DIDDocument{
		ID:             did,
		Controller:     controller,
		Authentication: []string{controller},
		CreatedAt:      time.Now().Unix(),
		UpdatedAt:      time.Now().Unix(),
		Active:         true,
	}
	k.store(ctx).Set(types.DIDKey(did), k.marshal(doc))

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeDIDCreated,
		sdk.NewAttribute(types.AttributeKeyDID, did),
	))
	return did, nil
}

func (k Keeper) GetDID(ctx sdk.Context, did string) (types.DIDDocument, bool) {
	bz := k.store(ctx).Get(types.DIDKey(did))
	if bz == nil {
		return types.DIDDocument{}, false
	}
	var doc types.DIDDocument
	_ = json.Unmarshal(bz, &doc)
	return doc, true
}

func (k Keeper) GetAllDIDs(ctx sdk.Context) []types.DIDDocument {
	iter := storetypes.KVStorePrefixIterator(k.store(ctx), types.KeyPrefixDID)
	defer iter.Close()
	var docs []types.DIDDocument
	for ; iter.Valid(); iter.Next() {
		var doc types.DIDDocument
		if err := json.Unmarshal(iter.Value(), &doc); err == nil {
			docs = append(docs, doc)
		}
	}
	return docs
}

// ─── Verifiable Credential CRUD ───────────────────────────────────────────────

func (k Keeper) IssueCredential(ctx sdk.Context, issuerAddr, subjectDID, credType, claimHash, ipfsPointer, access, jurisdictionID string, expiresAt int64) (string, error) {
	chainID := ctx.ChainID()
	issuerDID := DIDFromAddress(issuerAddr, chainID)

	if !k.store(ctx).Has(types.DIDKey(issuerDID)) {
		// Auto-create DID for issuer if missing
		if _, err := k.CreateDID(ctx, issuerAddr); err != nil {
			return "", err
		}
	}

	vcID := fmt.Sprintf("vc-%s-%s-%d", credType, subjectDID[len(subjectDID)-8:], time.Now().UnixNano())
	vc := types.VerifiableCredential{
		ID:             vcID,
		Type:           credType,
		IssuerDID:      issuerDID,
		SubjectDID:     subjectDID,
		ClaimHash:      claimHash,
		IPFSPointer:    ipfsPointer,
		AccessLevel:    access,
		IssuedAt:       time.Now().Unix(),
		ExpiresAt:      expiresAt,
		Revoked:        false,
		JurisdictionID: jurisdictionID,
	}

	k.store(ctx).Set(types.VCKey(vcID), k.marshal(vc))
	k.store(ctx).Set(types.VCBySubjectKey(subjectDID, vcID), []byte(vcID))

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeVCIssued,
		sdk.NewAttribute(types.AttributeKeyDID, vcID),
		sdk.NewAttribute(types.AttributeKeySubject, subjectDID),
		sdk.NewAttribute(types.AttributeKeyIssuer, issuerDID),
		sdk.NewAttribute(types.AttributeKeyType, credType),
	))
	return vcID, nil
}

func (k Keeper) GetCredential(ctx sdk.Context, id string) (types.VerifiableCredential, bool) {
	bz := k.store(ctx).Get(types.VCKey(id))
	if bz == nil {
		return types.VerifiableCredential{}, false
	}
	var vc types.VerifiableCredential
	_ = json.Unmarshal(bz, &vc)
	return vc, true
}

func (k Keeper) GetCredentialsBySubject(ctx sdk.Context, subjectDID string) []types.VerifiableCredential {
	iter := storetypes.KVStorePrefixIterator(k.store(ctx), types.VCBySubjectPrefixKey(subjectDID))
	defer iter.Close()
	var vcs []types.VerifiableCredential
	for ; iter.Valid(); iter.Next() {
		if vc, ok := k.GetCredential(ctx, string(iter.Value())); ok {
			vcs = append(vcs, vc)
		}
	}
	return vcs
}

func (k Keeper) RevokeCredential(ctx sdk.Context, issuerAddr, vcID string) error {
	vc, ok := k.GetCredential(ctx, vcID)
	if !ok {
		return types.ErrVCNotFound.Wrapf("id %s", vcID)
	}
	chainID := ctx.ChainID()
	issuerDID := DIDFromAddress(issuerAddr, chainID)
	if vc.IssuerDID != issuerDID {
		return types.ErrUnauthorizedIssuer
	}
	vc.Revoked = true
	k.store(ctx).Set(types.VCKey(vcID), k.marshal(vc))
	return nil
}

// ─── Proof of Stewardship ─────────────────────────────────────────────────────

// RecordStewardshipAct is called by the impact module's EndBlocker when an
// impact record transitions to VERIFIED. It appends to the subject's
// stewardship time-series and recomputes their PoS score.
func (k Keeper) RecordStewardshipAct(ctx sdk.Context, providerAddr, impactID, metricType, metricValue, projectID string) error {
	chainID := ctx.ChainID()
	subjectDID := DIDFromAddress(providerAddr, chainID)

	// Auto-create DID if this is the provider's first verified act
	if !k.store(ctx).Has(types.DIDKey(subjectDID)) {
		if _, err := k.CreateDID(ctx, providerAddr); err != nil {
			return err
		}
	}

	record := types.StewardshipRecord{
		SubjectDID:  subjectDID,
		ProjectID:   projectID,
		MetricType:  metricType,
		MetricValue: metricValue,
		ImpactID:    impactID,
		BlockHeight: ctx.BlockHeight(),
		Timestamp:   time.Now().Unix(),
	}
	k.store(ctx).Set(types.StewardshipKey(subjectDID, impactID), k.marshal(record))

	// Recompute PoS score
	k.recomputeScore(ctx, subjectDID)

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeStewardshipAdded,
		sdk.NewAttribute(types.AttributeKeySubject, subjectDID),
		sdk.NewAttribute("impact_id", impactID),
	))
	return nil
}

func (k Keeper) GetStewardshipScore(ctx sdk.Context, did string) (types.ProofOfStewardshipScore, bool) {
	bz := k.store(ctx).Get(types.StewardshipScoreKey(did))
	if bz == nil {
		return types.ProofOfStewardshipScore{}, false
	}
	var score types.ProofOfStewardshipScore
	_ = json.Unmarshal(bz, &score)
	return score, true
}

// recomputeScore recalculates the PoS score from the full stewardship history.
// Score = submission_count_weighted × time_consistency × recency_factor
// Range: 0–1000 (analogous to FICO 300–850 range, but regenerative)
func (k Keeper) recomputeScore(ctx sdk.Context, did string) {
	iter := storetypes.KVStorePrefixIterator(k.store(ctx), types.StewardshipPrefixKey(did))
	defer iter.Close()

	var records []types.StewardshipRecord
	var oldest int64 = time.Now().Unix()

	for ; iter.Valid(); iter.Next() {
		var r types.StewardshipRecord
		if err := json.Unmarshal(iter.Value(), &r); err == nil {
			records = append(records, r)
			if r.Timestamp < oldest {
				oldest = r.Timestamp
			}
		}
	}

	if len(records) == 0 {
		return
	}

	// Time consistency: penalise gaps > 90 days between consecutive records
	consistencyScore := k.computeConsistency(records)

	// Base score: log-scaled verified event count, max 1000
	baseScore := math.LegacyNewDec(int64(len(records))).Mul(math.LegacyNewDec(10))
	if baseScore.GT(math.LegacyNewDec(1000)) {
		baseScore = math.LegacyNewDec(1000)
	}

	finalScore := baseScore.Mul(consistencyScore)

	existing, _ := k.GetStewardshipScore(ctx, did)
	score := types.ProofOfStewardshipScore{
		SubjectDID:          did,
		Score:               finalScore.String(),
		TimeConsistency:     consistencyScore.String(),
		TotalVerifiedEvents: int64(len(records)),
		ActiveSince:         oldest,
		LastUpdated:         time.Now().Unix(),
	}
	if existing.SubmissionAccuracy != "" {
		score.SubmissionAccuracy = existing.SubmissionAccuracy
	} else {
		score.SubmissionAccuracy = math.LegacyOneDec().String()
	}

	k.store(ctx).Set(types.StewardshipScoreKey(did), k.marshal(score))
}

// computeConsistency returns 0–1 based on regularity of submissions.
// A 90-day gap halves the score; full consistency = 1.0.
func (k Keeper) computeConsistency(records []types.StewardshipRecord) math.LegacyDec {
	if len(records) <= 1 {
		return math.LegacyOneDec()
	}
	const ninetyDays = int64(90 * 24 * 3600)
	penalty := math.LegacyOneDec()
	for i := 1; i < len(records); i++ {
		gap := records[i].Timestamp - records[i-1].Timestamp
		if gap > ninetyDays {
			// Each gap over 90 days reduces consistency by 5%
			gapMultiplier := math.LegacyNewDecWithPrec(95, 2)
			penalty = penalty.Mul(gapMultiplier)
		}
	}
	return penalty
}
