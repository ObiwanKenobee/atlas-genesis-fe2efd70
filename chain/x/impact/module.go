package impact

import (
	"encoding/json"

	"cosmossdk.io/log"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"

	"github.com/atlashumanitarian/sanctum/x/impact/keeper"
	"github.com/atlashumanitarian/sanctum/x/impact/types"
)

type AppModule struct {
	keeper keeper.Keeper
}

func NewAppModule(
	cdc codec.BinaryCodec,
	storeKey storetypes.StoreKey,
	logger log.Logger,
	ik keeper.IdentityKeeper,
	ok keeper.OracleKeeper,
	rk keeper.RewardsKeeper,
) AppModule {
	return AppModule{keeper: keeper.NewKeeper(cdc, storeKey, logger, ik, ok, rk)}
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
	for _, r := range gs.Records {
		am.keeper.SetRecord(ctx, r)
	}
}

func (am AppModule) ExportGenesis(ctx sdk.Context, cdc codec.JSONCodec) json.RawMessage {
	gs := &types.GenesisState{Records: am.keeper.GetAllRecords(ctx)}
	return cdc.MustMarshalJSON(gs)
}
