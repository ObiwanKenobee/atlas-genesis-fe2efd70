package identity

import (
	"encoding/json"

	"cosmossdk.io/core/appmodule"
	"cosmossdk.io/log"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"

	"github.com/atlashumanitarian/sanctum/x/identity/keeper"
	"github.com/atlashumanitarian/sanctum/x/identity/types"
)

var (
	_ module.AppModule      = AppModule{}
	_ appmodule.AppModule   = AppModule{}
	_ module.HasGenesis     = AppModule{}
)

// AppModule implements the identity module.
type AppModule struct {
	keeper keeper.Keeper
}

func NewAppModule(cdc codec.BinaryCodec, storeKey storetypes.StoreKey, logger log.Logger) AppModule {
	return AppModule{keeper: keeper.NewKeeper(cdc, storeKey, logger)}
}

func (AppModule) IsAppModule()   {}
func (AppModule) IsOnePerModuleType() {}

func (AppModule) Name() string { return types.ModuleName }

func (am AppModule) RegisterServices(cfg module.Configurator) {
	types.RegisterMsgServer(cfg.MsgServer(), keeper.NewMsgServer(am.keeper))
	types.RegisterQueryServer(cfg.QueryServer(), keeper.NewQueryServer(am.keeper))
}

func (am AppModule) DefaultGenesis(cdc codec.JSONCodec) json.RawMessage {
	gs := types.DefaultGenesis()
	return cdc.MustMarshalJSON(gs)
}

func (am AppModule) ValidateGenesis(cdc codec.JSONCodec, _ interface{}, bz json.RawMessage) error {
	var gs types.GenesisState
	if err := cdc.UnmarshalJSON(bz, &gs); err != nil {
		return err
	}
	return gs.Validate()
}

func (am AppModule) InitGenesis(ctx sdk.Context, cdc codec.JSONCodec, bz json.RawMessage) {
	var gs types.GenesisState
	cdc.MustUnmarshalJSON(bz, &gs)
	for _, u := range gs.Users {
		am.keeper.SetUser(ctx, u)
	}
}

func (am AppModule) ExportGenesis(ctx sdk.Context, cdc codec.JSONCodec) json.RawMessage {
	gs := &types.GenesisState{Users: am.keeper.GetAllUsers(ctx)}
	return cdc.MustMarshalJSON(gs)
}

func (am AppModule) ConsensusVersion() uint64 { return 1 }
