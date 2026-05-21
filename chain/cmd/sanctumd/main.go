package main

import (
	"os"

	"cosmossdk.io/log"
	"github.com/cosmos/cosmos-sdk/server"
	svrcmd "github.com/cosmos/cosmos-sdk/server/cmd"
	"github.com/spf13/cobra"

	"github.com/atlashumanitarian/sanctum/app"
	"github.com/atlashumanitarian/sanctum/cmd/sanctumd/cmd"
)

func main() {
	rootCmd := buildRootCmd()
	if err := svrcmd.Execute(rootCmd, "SANCTUMD", app.DefaultNodeHome); err != nil {
		log.NewLogger(os.Stderr).Error("failed to execute", "err", err)
		os.Exit(1)
	}
}

func buildRootCmd() *cobra.Command {
	rootCmd := &cobra.Command{
		Use:   "sanctumd",
		Short: "Atlas Sanctum Chain — verified impact coordination protocol",
	}

	rootCmd.AddCommand(
		cmd.InitCmd(),
		cmd.StartCmd(),
		cmd.KeysCmd(),
		cmd.StatusCmd(),
		cmd.TxCmd(),
		cmd.QueryCmd(),
		cmd.GenesisCmd(),
		server.NewRollbackCmd(appCreator, app.DefaultNodeHome),
	)

	return rootCmd
}

// appCreator satisfies the server.AppCreator interface.
var appCreator = server.AppCreatorFunc(func(logger log.Logger, db interface{}, traceStore interface{}, appOpts interface{}) server.Application {
	// In production: wire db, traceStore, appOpts properly.
	return nil
})
