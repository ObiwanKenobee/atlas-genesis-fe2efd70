package keeper

import (
	"context"
	"fmt"
	"time"

	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/atlashumanitarian/sanctum/x/impact/types"
)

type msgServer struct{ Keeper }

func NewMsgServer(k Keeper) types.MsgServer { return &msgServer{k} }

func (s *msgServer) SubmitImpact(goCtx context.Context, msg *types.MsgSubmitImpact) (*types.MsgSubmitImpactResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	if err := msg.ValidateBasic(); err != nil {
		return nil, err
	}

	// Deterministic ID: provider prefix + type + block height + tx index.
	id := fmt.Sprintf("%s-%s-%d-%d", msg.Provider[:8], msg.ImpactType, ctx.BlockHeight(), ctx.BlockTime().UnixNano())

	if _, exists := s.Keeper.GetRecord(ctx, id); exists {
		return nil, types.ErrDuplicateImpact.Wrapf("id %s", id)
	}

	record := types.ImpactRecord{
		ID:                  id,
		Provider:            msg.Provider,
		ImpactType:          msg.ImpactType,
		Metric:              msg.Metric,
		Value:               msg.Value,
		Status:              types.StatusPending,
		OracleConfirmations: 0,
		ConfirmingOracles:   []string{},
		Timestamp:           time.Now().Unix(),
	}
	s.Keeper.SetRecord(ctx, record)

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeImpactSubmitted,
		sdk.NewAttribute(types.AttributeKeyID, id),
		sdk.NewAttribute(types.AttributeKeyProvider, msg.Provider),
	))
	return &types.MsgSubmitImpactResponse{ID: id}, nil
}

func (s *msgServer) VerifyImpact(goCtx context.Context, msg *types.MsgVerifyImpact) (*types.MsgVerifyImpactResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	if err := msg.ValidateBasic(); err != nil {
		return nil, err
	}
	verified, err := s.Keeper.VerifyImpact(ctx, msg.Oracle, msg.ImpactID)
	if err != nil {
		return nil, err
	}
	return &types.MsgVerifyImpactResponse{Verified: verified}, nil
}

func (s *msgServer) RejectImpact(goCtx context.Context, msg *types.MsgRejectImpact) (*types.MsgRejectImpactResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	if err := msg.ValidateBasic(); err != nil {
		return nil, err
	}
	if err := s.Keeper.RejectImpact(ctx, msg.Oracle, msg.ImpactID, msg.Reason); err != nil {
		return nil, err
	}
	return &types.MsgRejectImpactResponse{}, nil
}

type queryServer struct{ Keeper }

func NewQueryServer(k Keeper) types.QueryServer { return &queryServer{k} }

func (q *queryServer) Impact(goCtx context.Context, req *types.QueryImpactRequest) (*types.QueryImpactResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	r, ok := q.Keeper.GetRecord(ctx, req.ID)
	if !ok {
		return nil, types.ErrImpactNotFound.Wrapf("id %s", req.ID)
	}
	return &types.QueryImpactResponse{Record: r}, nil
}

func (q *queryServer) ImpactsByStatus(goCtx context.Context, req *types.QueryImpactsByStatusRequest) (*types.QueryImpactsByStatusResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	return &types.QueryImpactsByStatusResponse{Records: q.Keeper.GetRecordsByStatus(ctx, req.Status)}, nil
}

func (q *queryServer) ImpactsByProvider(goCtx context.Context, req *types.QueryImpactsByProviderRequest) (*types.QueryImpactsByProviderResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	return &types.QueryImpactsByProviderResponse{Records: q.Keeper.GetRecordsByProvider(ctx, req.Provider)}, nil
}
