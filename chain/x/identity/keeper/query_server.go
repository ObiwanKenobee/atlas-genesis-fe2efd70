package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/atlashumanitarian/sanctum/x/identity/types"
)

type queryServer struct{ Keeper }

func NewQueryServer(k Keeper) types.QueryServer { return &queryServer{k} }

func (q *queryServer) User(goCtx context.Context, req *types.QueryUserRequest) (*types.QueryUserResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	user, ok := q.Keeper.GetUser(ctx, req.Address)
	if !ok {
		return nil, types.ErrUserNotFound.Wrapf("address %s", req.Address)
	}
	return &types.QueryUserResponse{User: user}, nil
}

func (q *queryServer) UsersByRole(goCtx context.Context, req *types.QueryUsersByRoleRequest) (*types.QueryUsersByRoleResponse, error) {
	ctx := sdk.UnwrapSDKContext(goCtx)
	users := q.Keeper.GetUsersByRole(ctx, req.Role)
	return &types.QueryUsersByRoleResponse{Users: users}, nil
}
