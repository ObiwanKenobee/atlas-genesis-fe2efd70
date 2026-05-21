package regeneration

import (
	"encoding/json"

	"cosmossdk.io/log"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"

	"github.com/atlashumanitarian/sanctum/x/regeneration/keeper"
	"github.com/atlashumanitarian/sanctum/x/regeneration/types"
)

type AppModule struct {
	keeper keeper.Keeper
}

func NewAppModule(cdc codec.BinaryCodec, storeKey storetypes.StoreKey, logger log.Logger) AppModule {
	return AppModule{keeper: keeper.NewKeeper(cdc, storeKey, logger)}
}

func (AppModule) IsAppModule()        {}
func (AppModule) IsOnePerModuleType() {}
func (AppModule) Name() string        { return types.ModuleName }
func (AppModule) ConsensusVersion() uint64 { return 1 }

func (am AppModule) RegisterServices(cfg module.Configurator) {
	types.RegisterMsgServer(cfg.MsgServer(), keeper.NewMsgServer(am.keeper))
	types.RegisterQueryServer(cfg.QueryServer(), keeper.NewQueryServer(am.keeper))
}

func (am AppModule) DefaultGenesis(cdc codec.JSONCodec) json.RawMessage {
	return cdc.MustMarshalJSON(types.DefaultGenesis())
}

func (am AppModule) ValidateGenesis(_ codec.JSONCodec, _ interface{}, _ json.RawMessage) error {
	return nil
}

func (am AppModule) InitGenesis(ctx sdk.Context, cdc codec.JSONCodec, bz json.RawMessage) {
	var gs types.GenesisState
	cdc.MustUnmarshalJSON(bz, &gs)
	for _, p := range gs.Projects {
		am.keeper.SetProject(ctx, p)
	}
}

func (am AppModule) ExportGenesis(ctx sdk.Context, cdc codec.JSONCodec) json.RawMessage {
	gs := &types.GenesisState{Projects: am.keeper.GetAllProjects(ctx)}
	return cdc.MustMarshalJSON(gs)
}
