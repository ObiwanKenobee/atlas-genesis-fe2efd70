package keeper

import (
	"encoding/json"
	"fmt"
	"time"

	"cosmossdk.io/log"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/atlashumanitarian/sanctum/x/knowledge/types"
)

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
	bz, _ := json.Marshal(v)
	return bz
}

// ─── Knowledge Events ─────────────────────────────────────────────────────────

// RecordEvent appends an immutable knowledge event to the institutional memory.
// Called by other modules' msg servers — never directly by users.
func (k Keeper) RecordEvent(ctx sdk.Context, recorder, category, relatedID, summary string, metadata map[string]string, ipfsPointer string) string {
	eventID := fmt.Sprintf("ke-%s-%d", category[:4], time.Now().UnixNano())

	event := types.KnowledgeEvent{
		ID:          eventID,
		Category:    category,
		RelatedID:   relatedID,
		ActorDID:    recorder,
		Summary:     summary,
		Metadata:    metadata,
		IPFSPointer: ipfsPointer,
		BlockHeight: ctx.BlockHeight(),
		Timestamp:   time.Now().Unix(),
	}

	store := k.store(ctx)
	store.Set(types.EventKey(eventID), k.marshal(event))
	store.Set(types.EventByCategoryKey(category, eventID), []byte(eventID))
	if relatedID != "" {
		store.Set(types.EventByRelatedKey(relatedID, eventID), []byte(eventID))
	}

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeKnowledgeRecorded,
		sdk.NewAttribute(types.AttributeKeyCategory, category),
		sdk.NewAttribute(types.AttributeKeyEventID, eventID),
		sdk.NewAttribute(types.AttributeKeyRelatedID, relatedID),
	))
	return eventID
}

func (k Keeper) GetEventsByCategory(ctx sdk.Context, category string) []types.KnowledgeEvent {
	iter := storetypes.KVStorePrefixIterator(k.store(ctx), types.EventByCategoryPrefixKey(category))
	defer iter.Close()
	var events []types.KnowledgeEvent
	for ; iter.Valid(); iter.Next() {
		if bz := k.store(ctx).Get(types.EventKey(string(iter.Value()))); bz != nil {
			var e types.KnowledgeEvent
			if err := json.Unmarshal(bz, &e); err == nil {
				events = append(events, e)
			}
		}
	}
	return events
}

func (k Keeper) GetEventsByRelated(ctx sdk.Context, relatedID string) []types.KnowledgeEvent {
	iter := storetypes.KVStorePrefixIterator(k.store(ctx), types.EventByRelatedPrefixKey(relatedID))
	defer iter.Close()
	var events []types.KnowledgeEvent
	for ; iter.Valid(); iter.Next() {
		if bz := k.store(ctx).Get(types.EventKey(string(iter.Value()))); bz != nil {
			var e types.KnowledgeEvent
			if err := json.Unmarshal(bz, &e); err == nil {
				events = append(events, e)
			}
		}
	}
	return events
}

func (k Keeper) GetAllEvents(ctx sdk.Context) []types.KnowledgeEvent {
	iter := storetypes.KVStorePrefixIterator(k.store(ctx), types.KeyPrefixEvent)
	defer iter.Close()
	var events []types.KnowledgeEvent
	for ; iter.Valid(); iter.Next() {
		var e types.KnowledgeEvent
		if err := json.Unmarshal(iter.Value(), &e); err == nil {
			events = append(events, e)
		}
	}
	return events
}

// ─── Ecosystem Baselines ──────────────────────────────────────────────────────

// SetBaseline stores the pre-intervention ecosystem state for a project.
// This is the foundation of counterfactual accounting.
func (k Keeper) SetBaseline(ctx sdk.Context, oracle string, msg interface{}) error {
	// Type-assert the message — in practice this is called from the msg server
	// with a fully typed MsgSetBaseline
	switch m := msg.(type) {
	case *types.MsgSetBaseline:
		if k.store(ctx).Has(types.BaselineKey(m.ProjectID)) {
			// Baseline is immutable once set — protects against baseline manipulation
			return fmt.Errorf("baseline already set for project %s", m.ProjectID)
		}
		baseline := types.EcosystemBaseline{
			ProjectID:    m.ProjectID,
			BiomeID:      m.BiomeID,
			Location:     m.Location,
			BaselineYear: ctx.BlockTime().Year(),
			NDVI:         m.NDVI,
			CarbonStock:  m.CarbonStock,
			SpeciesCount: m.SpeciesCount,
			WaterQuality: m.WaterQuality,
			SatelliteRef: m.SatelliteRef,
			OraclesDID:   []string{oracle},
			CreatedAt:    time.Now().Unix(),
		}
		k.store(ctx).Set(types.BaselineKey(m.ProjectID), k.marshal(baseline))

		// Record in knowledge graph
		k.RecordEvent(ctx, oracle, types.CategoryBaseline, m.ProjectID,
			fmt.Sprintf("Ecosystem baseline set for project %s, biome %s", m.ProjectID, m.BiomeID),
			map[string]string{
				"carbon_stock": m.CarbonStock,
				"ndvi":         m.NDVI,
				"satellite":    m.SatelliteRef,
			}, "")
		return nil
	}
	return fmt.Errorf("unsupported message type")
}

func (k Keeper) GetBaseline(ctx sdk.Context, projectID string) (types.EcosystemBaseline, bool) {
	bz := k.store(ctx).Get(types.BaselineKey(projectID))
	if bz == nil {
		return types.EcosystemBaseline{}, false
	}
	var b types.EcosystemBaseline
	_ = json.Unmarshal(bz, &b)
	return b, true
}

func (k Keeper) GetAllBaselines(ctx sdk.Context) []types.EcosystemBaseline {
	iter := storetypes.KVStorePrefixIterator(k.store(ctx), types.KeyPrefixBaseline)
	defer iter.Close()
	var baselines []types.EcosystemBaseline
	for ; iter.Valid(); iter.Next() {
		var b types.EcosystemBaseline
		if err := json.Unmarshal(iter.Value(), &b); err == nil {
			baselines = append(baselines, b)
		}
	}
	return baselines
}
