package app

import (
	"io"
	"os"
	"path/filepath"
	"strings"

	"cosmossdk.io/log"
	storetypes "cosmossdk.io/store/types"
	dbm "github.com/cosmos/cosmos-db"
	"github.com/cosmos/cosmos-sdk/baseapp"
	"github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	"github.com/cosmos/cosmos-sdk/runtime"
	"github.com/cosmos/cosmos-sdk/server/api"
	"github.com/cosmos/cosmos-sdk/server/config"
	servertypes "github.com/cosmos/cosmos-sdk/server/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"
	"github.com/cosmos/cosmos-sdk/x/auth"
	authkeeper "github.com/cosmos/cosmos-sdk/x/auth/keeper"
	authtypes "github.com/cosmos/cosmos-sdk/x/auth/types"
	"github.com/cosmos/cosmos-sdk/x/bank"
	bankkeeper "github.com/cosmos/cosmos-sdk/x/bank/keeper"
	banktypes "github.com/cosmos/cosmos-sdk/x/bank/types"
	govtypes "github.com/cosmos/cosmos-sdk/x/gov/types"
	"github.com/cosmos/cosmos-sdk/x/staking"
	stakingkeeper "github.com/cosmos/cosmos-sdk/x/staking/keeper"
	stakingtypes "github.com/cosmos/cosmos-sdk/x/staking/types"

	identitymodule "github.com/atlashumanitarian/sanctum/x/identity"
	identitykeeper "github.com/atlashumanitarian/sanctum/x/identity/keeper"
	identitytypes "github.com/atlashumanitarian/sanctum/x/identity/types"

	oraclemodule "github.com/atlashumanitarian/sanctum/x/oracle"
	oraclekeeper "github.com/atlashumanitarian/sanctum/x/oracle/keeper"
	oracletypes "github.com/atlashumanitarian/sanctum/x/oracle/types"

	impactmodule "github.com/atlashumanitarian/sanctum/x/impact"
	impactkeeper "github.com/atlashumanitarian/sanctum/x/impact/keeper"
	impacttypes "github.com/atlashumanitarian/sanctum/x/impact/types"

	rewardsmodule "github.com/atlashumanitarian/sanctum/x/rewards"
	rewardskeeper "github.com/atlashumanitarian/sanctum/x/rewards/keeper"
	rewardstypes "github.com/atlashumanitarian/sanctum/x/rewards/types"

	regenmodule "github.com/atlashumanitarian/sanctum/x/regeneration"
	regenkeeper "github.com/atlashumanitarian/sanctum/x/regeneration/keeper"
	regentypes "github.com/atlashumanitarian/sanctum/x/regeneration/types"
)

const (
	Name            = "sanctum"
	AccountAddressPrefix = "sanctum"
)

var (
	DefaultNodeHome = os.ExpandEnv("$HOME/.sanctumd")
	ModuleBasics    = module.NewBasicManager(
		auth.AppModuleBasic{},
		bank.AppModuleBasic{},
		staking.AppModuleBasic{},
	)
)

// SanctumApp is the Atlas Sanctum chain application.
type SanctumApp struct {
	*baseapp.BaseApp

	cdc               *codec.ProtoCodec
	interfaceRegistry codectypes.InterfaceRegistry

	// Store keys — one per module, prefix-isolated.
	keys map[string]*storetypes.KVStoreKey

	// Cosmos SDK keepers
	AccountKeeper authkeeper.AccountKeeper
	BankKeeper    bankkeeper.Keeper
	StakingKeeper *stakingkeeper.Keeper

	// Sanctum module keepers
	IdentityKeeper   identitykeeper.Keeper
	OracleKeeper     oraclekeeper.Keeper
	ImpactKeeper     impactkeeper.Keeper
	RewardsKeeper    rewardskeeper.Keeper
	RegenKeeper      regenkeeper.Keeper

	mm *module.Manager
}

// NewSanctumApp constructs the application with all modules wired.
func NewSanctumApp(
	logger log.Logger,
	db dbm.DB,
	traceStore io.Writer,
	loadLatest bool,
	appOpts servertypes.AppOptions,
	baseAppOptions ...func(*baseapp.BaseApp),
) *SanctumApp {
	interfaceRegistry, _ := codectypes.NewInterfaceRegistryWithOptions(codectypes.InterfaceRegistryOptions{
		ProtoFiles: nil,
	})
	cdc := codec.NewProtoCodec(interfaceRegistry)

	bApp := baseapp.NewBaseApp(Name, logger, db, nil, baseAppOptions...)
	bApp.SetCommitMultiStoreTracer(traceStore)

	app := &SanctumApp{
		BaseApp:           bApp,
		cdc:               cdc,
		interfaceRegistry: interfaceRegistry,
		keys:              storetypes.NewKVStoreKeys(
			authtypes.StoreKey,
			banktypes.StoreKey,
			stakingtypes.StoreKey,
			identitytypes.StoreKey,
			oracletypes.StoreKey,
			impacttypes.StoreKey,
			rewardstypes.StoreKey,
			regentypes.StoreKey,
		),
	}

	// ─── Cosmos SDK keepers ───────────────────────────────────────────────────

	app.AccountKeeper = authkeeper.NewAccountKeeper(
		cdc,
		runtime.NewKVStoreService(app.keys[authtypes.StoreKey]),
		authtypes.ProtoBaseAccount,
		maccPerms(),
		sdk.Bech32PrefixAccAddr,
		authtypes.NewModuleAddress(govtypes.ModuleName).String(),
	)

	app.BankKeeper = bankkeeper.NewKeeper(
		cdc,
		runtime.NewKVStoreService(app.keys[banktypes.StoreKey]),
		app.AccountKeeper,
		blockedAddrs(),
		authtypes.NewModuleAddress(govtypes.ModuleName).String(),
		logger,
	)

	app.StakingKeeper = stakingkeeper.NewKeeper(
		cdc,
		runtime.NewKVStoreService(app.keys[stakingtypes.StoreKey]),
		app.AccountKeeper,
		app.BankKeeper,
		authtypes.NewModuleAddress(govtypes.ModuleName).String(),
		nil, nil,
	)

	// ─── Sanctum keepers (dependency order matters) ───────────────────────────

	app.IdentityKeeper = identitykeeper.NewKeeper(
		cdc,
		app.keys[identitytypes.StoreKey],
		logger,
	)

	app.OracleKeeper = oraclekeeper.NewKeeper(
		cdc,
		app.keys[oracletypes.StoreKey],
		logger,
		app.IdentityKeeper, // IdentityKeeper for admin checks
	)

	app.RewardsKeeper = rewardskeeper.NewKeeper(
		cdc,
		app.keys[rewardstypes.StoreKey],
		logger,
		app.BankKeeper,
		TreasuryAddress,
	)

	app.ImpactKeeper = impactkeeper.NewKeeper(
		cdc,
		app.keys[impacttypes.StoreKey],
		logger,
		app.IdentityKeeper,
		app.OracleKeeper,
		app.RewardsKeeper,
	)

	app.RegenKeeper = regenkeeper.NewKeeper(
		cdc,
		app.keys[regentypes.StoreKey],
		logger,
	)

	// ─── Module manager ───────────────────────────────────────────────────────

	app.mm = module.NewManager(
		auth.NewAppModule(cdc, app.AccountKeeper, nil, nil),
		bank.NewAppModule(cdc, app.BankKeeper, app.AccountKeeper, nil),
		staking.NewAppModule(cdc, app.StakingKeeper, app.AccountKeeper, app.BankKeeper, nil),
		identitymodule.NewAppModule(cdc, app.keys[identitytypes.StoreKey], logger),
		oraclemodule.NewAppModule(cdc, app.keys[oracletypes.StoreKey], logger, app.IdentityKeeper),
		impactmodule.NewAppModule(cdc, app.keys[impacttypes.StoreKey], logger, app.IdentityKeeper, app.OracleKeeper, app.RewardsKeeper),
		rewardsmodule.NewAppModule(cdc, app.keys[rewardstypes.StoreKey], logger, app.BankKeeper),
		regenmodule.NewAppModule(cdc, app.keys[regentypes.StoreKey], logger),
	)

	app.mm.SetOrderBeginBlockers(
		stakingtypes.ModuleName,
		authtypes.ModuleName,
		banktypes.ModuleName,
		identitytypes.ModuleName,
		oracletypes.ModuleName,
		impacttypes.ModuleName,
		rewardstypes.ModuleName,
		regentypes.ModuleName,
	)

	app.mm.SetOrderEndBlockers(
		stakingtypes.ModuleName,
		identitytypes.ModuleName,
		oracletypes.ModuleName,
		impacttypes.ModuleName,
		rewardstypes.ModuleName,
		regentypes.ModuleName,
	)

	app.mm.SetOrderInitGenesis(
		authtypes.ModuleName,
		banktypes.ModuleName,
		stakingtypes.ModuleName,
		identitytypes.ModuleName,
		oracletypes.ModuleName,
		impacttypes.ModuleName,
		rewardstypes.ModuleName,
		regentypes.ModuleName,
	)

	app.mm.RegisterRoutes(app.Router(), app.QueryRouter(), cdc)

	app.MountKVStores(app.keys)

	if loadLatest {
		if err := app.LoadLatestVersion(); err != nil {
			panic(err)
		}
	}
	return app
}

// TreasuryAddress is the module account for the protocol treasury.
// In production this is set via governance.
const TreasuryAddress = "sanctum1treasury000000000000000000000000000000"

func maccPerms() map[string][]string {
	return map[string][]string{
		authtypes.FeeCollectorName: nil,
		stakingtypes.BondedPoolName:    {authtypes.Burner, authtypes.Staking},
		stakingtypes.NotBondedPoolName: {authtypes.Burner, authtypes.Staking},
		rewardstypes.ModuleName:        {authtypes.Minter, authtypes.Burner},
	}
}

func blockedAddrs() map[string]bool {
	return map[string]bool{
		authtypes.NewModuleAddress(authtypes.FeeCollectorName).String():      true,
		authtypes.NewModuleAddress(stakingtypes.BondedPoolName).String():     true,
		authtypes.NewModuleAddress(stakingtypes.NotBondedPoolName).String():  true,
	}
}

// RegisterAPIRoutes registers REST/gRPC-gateway routes.
func (app *SanctumApp) RegisterAPIRoutes(apiSvr *api.Server, apiConfig config.APIConfig) {
	// gRPC-gateway routes registered automatically via module manager.
}

// DefaultGenesis returns the default genesis state for all modules.
func (app *SanctumApp) DefaultGenesis() map[string]interface{} {
	return map[string]interface{}{
		identitytypes.ModuleName:   identitytypes.DefaultGenesis(),
		oracletypes.ModuleName:     oracletypes.DefaultGenesis(),
		impacttypes.ModuleName:     impacttypes.DefaultGenesis(),
		rewardstypes.ModuleName:    rewardstypes.DefaultGenesis(),
		regentypes.ModuleName:      regentypes.DefaultGenesis(),
	}
}

// HomeDir returns the validated home directory for the sanctumd binary.
func HomeDir() string {
	home, err := os.UserHomeDir()
	if err != nil || home == "" {
		// Fall back to a safe fixed path rather than an empty/unvalidated one
		return filepath.Clean("/tmp/.sanctumd")
	}
	// Resolve the full path and confirm it stays within the user home
	resolved := filepath.Join(filepath.Clean(home), ".sanctumd")
	if !strings.HasPrefix(resolved, filepath.Clean(home)) {
		return filepath.Clean("/tmp/.sanctumd")
	}
	return resolved
}
