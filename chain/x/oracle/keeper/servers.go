package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/atlashumanitarian/sanctum/x/oracle/types"
)

type msgServer struct{ Keeper }

func NewMsgServer(k Keeper) types.MsgServer { return &msgServer{k} }

func (s *msgServer) RegisterOracle(goCtx context.Context, msg *types.MsgRegisterOracle) (*types.MsgRegisterOracleResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	if err := msg.ValidateBasic(); err != nil {
		return nil, err
	}
	if err := s.Keeper.RegisterOracle(ctx, msg.Address, msg.OracleType); err != nil {
		return nil, err
	}
	return &types.MsgRegisterOracleResponse{}, nil
}

func (s *msgServer) SuspendOracle(goCtx context.Context, msg *types.MsgSuspendOracle) (*types.MsgSuspendOracleResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	if err := msg.ValidateBasic(); err != nil {
		return nil, err
	}
	if err := s.Keeper.SuspendOracle(ctx, msg.Admin, msg.Address, msg.Reason); err != nil {
		return nil, err
	}
	return &types.MsgSuspendOracleResponse{}, nil
}

func (s *msgServer) ReactivateOracle(goCtx context.Context, msg *types.MsgReactivateOracle) (*types.MsgReactivateOracleResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	if err := msg.ValidateBasic(); err != nil {
		return nil, err
	}
	if err := s.Keeper.ReactivateOracle(ctx, msg.Admin, msg.Address); err != nil {
		return nil, err
	}
	return &types.MsgReactivateOracleResponse{}, nil
}

type queryServer struct{ Keeper }

func NewQueryServer(k Keeper) types.QueryServer { return &queryServer{k} }

func (q *queryServer) Oracle(goCtx context.Context, req *types.QueryOracleRequest) (*types.QueryOracleResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	o, ok := q.Keeper.GetOracle(ctx, req.Address)
	if !ok {
		return nil, types.ErrOracleNotFound.Wrapf("address %s", req.Address)
	}
	return &types.QueryOracleResponse{Oracle: o}, nil
}

func (q *queryServer) ActiveOracles(goCtx context.Context, _ *types.QueryActiveOraclesRequest) (*types.QueryActiveOraclesResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	return &types.QueryActiveOraclesResponse{Oracles: q.Keeper.GetActiveOracles(ctx)}, nil
}
