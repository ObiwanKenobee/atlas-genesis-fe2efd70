package keeper

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
)

// GetUserRole exposes the role of a user — used by oracle and impact keepers.
func (k Keeper) GetUserRole(ctx sdk.Context, address string) (string, bool) {
	u, ok := k.GetUser(ctx, address)
	if !ok {
		return "", false
	}
	return u.Role, true
}
