package cmd

import (
	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/keys"
	"github.com/cosmos/cosmos-sdk/server"
	genutilcli "github.com/cosmos/cosmos-sdk/x/genutil/client/cli"

	identitycli "github.com/atlashumanitarian/sanctum/x/identity/cli"
	impactcli "github.com/atlashumanitarian/sanctum/x/impact/cli"
)

func InitCmd() *cobra.Command    { return genutilcli.InitCmd(nil, "") }
func StartCmd() *cobra.Command   { return server.StartCmd(nil, "") }
func KeysCmd() *cobra.Command    { return keys.Commands() }

func StatusCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "status",
		Short: "Query remote node for status",
		RunE: func(cmd *cobra.Command, _ []string) error {
			_, err := client.GetClientQueryContext(cmd)
			return err
		},
	}
	flags.AddQueryFlagsToCmd(cmd)
	return cmd
}

// TxCmd aggregates all module transaction commands.
func TxCmd() *cobra.Command {
	txCmd := &cobra.Command{
		Use:   "tx",
		Short: "Transaction subcommands",
		RunE:  client.ValidateCmd,
	}
	flags.AddTxFlagsToCmd(txCmd)
	txCmd.AddCommand(
		identitycli.GetTxCmd(),
		impactcli.GetTxCmd(),
	)
	return txCmd
}

// QueryCmd aggregates all module query commands.
func QueryCmd() *cobra.Command {
	queryCmd := &cobra.Command{
		Use:   "query",
		Short: "Query subcommands",
		RunE:  client.ValidateCmd,
	}
	queryCmd.AddCommand(
		identitycli.GetQueryCmd(),
		impactcli.GetQueryCmd(),
	)
	return queryCmd
}

func GenesisCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "genesis",
		Short: "Genesis file subcommands",
	}
}
