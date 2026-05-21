package keeper

import (
	"encoding/json"
	"time"

	"cosmossdk.io/log"
	"cosmossdk.io/math"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"

	"github.com/atlashumanitarian/sanctum/x/identity/types"
)

// Keeper manages the identity module state.
type Keeper struct {
	cdc      codec.BinaryCodec
	storeKey storetypes.StoreKey
	logger   log.Logger
}

func NewKeeper(cdc codec.BinaryCodec, storeKey storetypes.StoreKey, logger log.Logger) Keeper {
	return Keeper{cdc: cdc, storeKey: storeKey, logger: logger.With("module", types.ModuleName)}
}

func (k Keeper) Logger(ctx sdk.Context) log.Logger {
	return k.logger
}

// ─── Store helpers ────────────────────────────────────────────────────────────

func (k Keeper) store(ctx sdk.Context) storetypes.KVStore {
	return ctx.KVStore(k.storeKey)
}

func (k Keeper) marshal(u types.User) []byte {
	bz, err := json.Marshal(u)
	if err != nil {
		panic(err)
	}
	return bz
}

func (k Keeper) unmarshal(bz []byte) types.User {
	var u types.User
	if err := json.Unmarshal(bz, &u); err != nil {
		panic(err)
	}
	return u
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

func (k Keeper) SetUser(ctx sdk.Context, user types.User) {
	store := k.store(ctx)
	store.Set(types.UserKey(user.Address), k.marshal(user))
	store.Set(types.UserByRoleKey(user.Role, user.Address), []byte(user.Address))
}

func (k Keeper) GetUser(ctx sdk.Context, address string) (types.User, bool) {
	bz := k.store(ctx).Get(types.UserKey(address))
	if bz == nil {
		return types.User{}, false
	}
	return k.unmarshal(bz), true
}

func (k Keeper) HasUser(ctx sdk.Context, address string) bool {
	return k.store(ctx).Has(types.UserKey(address))
}

func (k Keeper) GetUsersByRole(ctx sdk.Context, role string) []types.User {
	store := k.store(ctx)
	prefix := types.UserByRolePrefixKey(role)
	iter := storetypes.KVStorePrefixIterator(store, prefix)
	defer iter.Close()

	var users []types.User
	for ; iter.Valid(); iter.Next() {
		address := string(iter.Value())
		if u, ok := k.GetUser(ctx, address); ok {
			users = append(users, u)
		}
	}
	return users
}

func (k Keeper) GetAllUsers(ctx sdk.Context) []types.User {
	store := k.store(ctx)
	iter := storetypes.KVStorePrefixIterator(store, types.KeyPrefixUser)
	defer iter.Close()

	var users []types.User
	for ; iter.Valid(); iter.Next() {
		users = append(users, k.unmarshal(iter.Value()))
	}
	return users
}

// ─── Business Logic ───────────────────────────────────────────────────────────

func (k Keeper) RegisterUser(ctx sdk.Context, address, role, metadata string) error {
	if k.HasUser(ctx, address) {
		return types.ErrDuplicateUser.Wrapf("address %s", address)
	}
	user := types.User{
		Address:         address,
		Role:            role,
		ReputationScore: math.LegacyZeroDec(),
		Metadata:        metadata,
		RegisteredAt:    time.Now().Unix(),
	}
	k.SetUser(ctx, user)

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeUserRegistered,
		sdk.NewAttribute(types.AttributeKeyAddress, address),
		sdk.NewAttribute(types.AttributeKeyRole, role),
	))
	return nil
}

func (k Keeper) UpdateReputation(ctx sdk.Context, adminAddr, targetAddr string, delta math.LegacyDec) error {
	admin, ok := k.GetUser(ctx, adminAddr)
	if !ok {
		return types.ErrUserNotFound.Wrapf("admin %s", adminAddr)
	}
	if admin.Role != types.RoleAdmin {
		return types.ErrUnauthorized
	}
	user, ok := k.GetUser(ctx, targetAddr)
	if !ok {
		return types.ErrUserNotFound.Wrapf("target %s", targetAddr)
	}
	user.ReputationScore = user.ReputationScore.Add(delta)
	if user.ReputationScore.IsNegative() {
		user.ReputationScore = math.LegacyZeroDec()
	}
	k.SetUser(ctx, user)

	ctx.EventManager().EmitEvent(sdk.NewEvent(
		types.EventTypeReputationUpdated,
		sdk.NewAttribute(types.AttributeKeyAddress, targetAddr),
		sdk.NewAttribute(types.AttributeKeyScore, user.ReputationScore.String()),
	))
	return nil
}

func (k Keeper) UpdateMetadata(ctx sdk.Context, address, metadata string) error {
	user, ok := k.GetUser(ctx, address)
	if !ok {
		return types.ErrUserNotFound.Wrapf("address %s", address)
	}
	user.Metadata = metadata
	k.SetUser(ctx, user)
	return nil
}
