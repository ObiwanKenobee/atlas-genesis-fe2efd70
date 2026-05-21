package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/atlashumanitarian/sanctum/x/identity/types"
)

type msgServer struct{ Keeper }

func NewMsgServer(k Keeper) types.MsgServer { return &msgServer{k} }

func (s *msgServer) RegisterUser(goCtx context.Context, msg *types.MsgRegisterUser) (*types.MsgRegisterUserResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	if err := msg.ValidateBasic(); err != nil {
		return nil, err
	}
	if err := s.Keeper.RegisterUser(ctx, msg.Address, msg.Role, msg.Metadata); err != nil {
		return nil, err
	}
	return &types.MsgRegisterUserResponse{}, nil
}

func (s *msgServer) UpdateReputation(goCtx context.Context, msg *types.MsgUpdateReputation) (*types.MsgUpdateReputationResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	if err := msg.ValidateBasic(); err != nil {
		return nil, err
	}
	if err := s.Keeper.UpdateReputation(ctx, msg.Admin, msg.Address, msg.Delta); err != nil {
		return nil, err
	}
	return &types.MsgUpdateReputationResponse{}, nil
}

func (s *msgServer) UpdateMetadata(goCtx context.Context, msg *types.MsgUpdateMetadata) (*types.MsgUpdateMetadataResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	if err := msg.ValidateBasic(); err != nil {
		return nil, err
	}
	if err := s.Keeper.UpdateMetadata(ctx, msg.Address, msg.Metadata); err != nil {
		return nil, err
	}
	return &types.MsgUpdateMetadataResponse{}, nil
}
