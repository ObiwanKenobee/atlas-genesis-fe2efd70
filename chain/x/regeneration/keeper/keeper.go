package keeper

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"cosmossdk.io/log"
	"cosmossdk.io/math"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/atlashumanitarian/sanctum/x/regeneration/types"
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

func (k Keeper) marshal(p types.RegenerationProject) []byte {
	bz, _ := json.Marshal(p)
	return bz
}

func (k Keeper) unmarshal(bz []byte) types.RegenerationProject {
	var p types.RegenerationProject
	_ = json.Unmarshal(bz, &p)
	return p
}

func (k Keeper) SetProject(ctx sdk.Context, p types.RegenerationProject) {
	store := k.store(ctx)
	store.Set(types.ProjectKey(p.ID), k.marshal(p))
	store.Set(types.ProjectByOwnerKey(p.Owner, p.ID), []byte(p.ID))
}

func (k Keeper) GetProject(ctx sdk.Context, id string) (types.RegenerationProject, bool) {
	bz := k.store(ctx).Get(types.ProjectKey(id))
	if bz == nil {
		return types.RegenerationProject{}, false
	}
	return k.unmarshal(bz), true
}

func (k Keeper) GetProjectsByOwner(ctx sdk.Context, owner string) []types.RegenerationProject {
	iter := storetypes.KVStorePrefixIterator(k.store(ctx), types.ProjectByOwnerPrefixKey(owner))
	defer iter.Close()
	var projects []types.RegenerationProject
	for ; iter.Valid(); iter.Next() {
		id := string(iter.Value())
		if p, ok := k.GetProject(ctx, id); ok {
			projects = append(projects, p)
		}
	}
	return projects
}

func (k Keeper) GetAllProjects(ctx sdk.Context) []types.RegenerationProject {
	iter := storetypes.KVStorePrefixIterator(k.store(ctx), types.KeyPrefixProject)
	defer iter.Close()
	var projects []types.RegenerationProject
	for ; iter.Valid(); iter.Next() {
		projects = append(projects, k.unmarshal(iter.Value()))
	}
	return projects
}

func (k Keeper) CreateProject(ctx sdk.Context, owner, name, location string) (string, error) {
	id := fmt.Sprintf("regen-%s-%d", owner[:8], ctx.BlockHeight())
	if _, exists := k.GetProject(ctx, id); exists {
		return "", types.ErrDuplicateProject.Wrapf("id %s", id)
	}
	now := time.Now().Unix()
	p := types.RegenerationProject{
		ID:                id,
		Owner:             owner,
		Name:              name,
		Location:          location,
		CarbonTonnes:      math.LegacyZeroDec(),
		BiodiversityScore: math.LegacyZeroDec(),
		TreesPlanted:      0,
		Status:            types.StatusActive,
		CreatedAt:         now,
		UpdatedAt:         now,
	}
	k.SetProject(ctx, p)
	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeProjectCreated,
		sdk.NewAttribute(types.AttributeKeyID, id),
		sdk.NewAttribute(types.AttributeKeyOwner, owner),
	))
	return id, nil
}

func (k Keeper) UpdateMetrics(ctx sdk.Context, signer, projectID string, carbonDelta, biodiversityDelta math.LegacyDec, treesDelta uint64) error {
	p, ok := k.GetProject(ctx, projectID)
	if !ok {
		return types.ErrProjectNotFound.Wrapf("id %s", projectID)
	}
	if p.Owner != signer {
		return types.ErrNotOwner
	}
	p.CarbonTonnes = p.CarbonTonnes.Add(carbonDelta)
	p.BiodiversityScore = p.BiodiversityScore.Add(biodiversityDelta)
	p.TreesPlanted += treesDelta
	p.UpdatedAt = time.Now().Unix()
	k.SetProject(ctx, p)

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeMetricsUpdated,
		sdk.NewAttribute(types.AttributeKeyID, projectID),
		sdk.NewAttribute(types.AttributeKeyCarbon, p.CarbonTonnes.String()),
		sdk.NewAttribute(types.AttributeKeyTrees, fmt.Sprintf("%d", p.TreesPlanted)),
	))
	return nil
}

// ─── Servers ──────────────────────────────────────────────────────────────────

type msgServer struct{ Keeper }

func NewMsgServer(k Keeper) types.MsgServer { return &msgServer{k} }

func (s *msgServer) CreateProject(goCtx context.Context, msg *types.MsgCreateProject) (*types.MsgCreateProjectResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	if err := msg.ValidateBasic(); err != nil {
		return nil, err
	}
	id, err := s.Keeper.CreateProject(ctx, msg.Owner, msg.Name, msg.Location)
	if err != nil {
		return nil, err
	}
	return &types.MsgCreateProjectResponse{ID: id}, nil
}

func (s *msgServer) UpdateProjectMetrics(goCtx context.Context, msg *types.MsgUpdateProjectMetrics) (*types.MsgUpdateProjectMetricsResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	if err := msg.ValidateBasic(); err != nil {
		return nil, err
	}
	if err := s.Keeper.UpdateMetrics(ctx, msg.Signer, msg.ProjectID, msg.CarbonTonnesDelta, msg.BiodiversityDelta, msg.TreesPlantedDelta); err != nil {
		return nil, err
	}
	return &types.MsgUpdateProjectMetricsResponse{}, nil
}

type queryServer struct{ Keeper }

func NewQueryServer(k Keeper) types.QueryServer { return &queryServer{k} }

func (q *queryServer) Project(goCtx context.Context, req *types.QueryProjectRequest) (*types.QueryProjectResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	p, ok := q.Keeper.GetProject(ctx, req.ID)
	if !ok {
		return nil, types.ErrProjectNotFound.Wrapf("id %s", req.ID)
	}
	return &types.QueryProjectResponse{Project: p}, nil
}

func (q *queryServer) ProjectsByOwner(goCtx context.Context, req *types.QueryProjectsByOwnerRequest) (*types.QueryProjectsByOwnerResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	return &types.QueryProjectsByOwnerResponse{Projects: q.Keeper.GetProjectsByOwner(ctx, req.Owner)}, nil
}
