package rewards

import (
	"encoding/json"

	"cosmossdk.io/log"
	storetypes "cosmossdk.io/store/types"
	"github.com/cosmos/cosmos-sdk/codec"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"

	"github.com/atlashumanitarian/sanctum/x/rewards/keeper"
	"github.com/atlashumanitarian/sanctum/x/rewards/types"
)

// TreasuryAddress is the default treasury module account address.
// Override via governance TreasuryProposal.
const TreasuryAddress = "sanctum1treasury000000000000000000000000000000"

type AppModule struct {
	keeper keeper.Keeper
}

func NewAppModule(cdc codec.BinaryCodec, storeKey storetypes.StoreKey, logger log.Logger, bk keeper.BankKeeper) AppModule {
	return AppModule{keeper: keeper.NewKeeper(cdc, storeKey, logger, bk, TreasuryAddress)}
}

func (AppModule) IsAppModule()           {}
func (AppModule) IsOnePerModuleType()    {}
func (AppModule) Name() string           { return types.ModuleName }
func (AppModule) ConsensusVersion() uint64 { return 1 }

func (am AppModule) RegisterServices(_ module.Configurator) {}

func (am AppModule) DefaultGenesis(cdc codec.JSONCodec) json.RawMessage {
	return cdc.MustMarshalJSON(types.DefaultGenesis())
}

func (am AppModule) ValidateGenesis(_ codec.JSONCodec, _ interface{}, _ json.RawMessage) error {
	return nil
}

func (am AppModule) InitGenesis(_ sdk.Context, _ codec.JSONCodec, _ json.RawMessage) {}

func (am AppModule) ExportGenesis(ctx sdk.Context, cdc codec.JSONCodec) json.RawMessage {
	gs := &types.GenesisState{Distributions: am.keeper.GetAllDistributions(ctx)}
	return cdc.MustMarshalJSON(gs)
}
