package cli

import (
	"github.com/spf13/cobra"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/tx"

	"github.com/atlashumanitarian/sanctum/x/impact/types"
)

func GetTxCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:                        types.ModuleName,
		Short:                      "Impact transaction subcommands",
		DisableFlagParsing:         true,
		SuggestionsMinimumDistance: 2,
		RunE:                       client.ValidateCmd,
	}
	cmd.AddCommand(CmdSubmitImpact(), CmdVerifyImpact(), CmdRejectImpact())
	return cmd
}

func CmdSubmitImpact() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "submit [type] [metric] [value]",
		Short: "Submit a new impact record",
		Args:  cobra.ExactArgs(3),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}
			// Value parsing omitted for brevity — use sdk.NewDecFromStr in production.
			_ = clientCtx
			_ = args
			return nil
		},
	}
	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

func CmdVerifyImpact() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "verify [impact-id]",
		Short: "Submit oracle verification for an impact record",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}
			msg := &types.MsgVerifyImpact{
				Oracle:   clientCtx.GetFromAddress().String(),
				ImpactID: args[0],
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}
	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

func CmdRejectImpact() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "reject [impact-id] [reason]",
		Short: "Reject an impact record",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}
			msg := &types.MsgRejectImpact{
				Oracle:   clientCtx.GetFromAddress().String(),
				ImpactID: args[0],
				Reason:   args[1],
			}
			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}
	flags.AddTxFlagsToCmd(cmd)
	return cmd
}

func GetQueryCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "impact",
		Short: "Impact query subcommands",
		RunE:  client.ValidateCmd,
	}
	cmd.AddCommand(CmdQueryImpact(), CmdQueryImpactsByStatus(), CmdQueryImpactsByProvider())
	return cmd
}

func CmdQueryImpact() *cobra.Command {
	cmd := &cobra.Command{
		Use:  "record [id]",
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error { return nil },
	}
	flags.AddQueryFlagsToCmd(cmd)
	return cmd
}

func CmdQueryImpactsByStatus() *cobra.Command {
	cmd := &cobra.Command{
		Use:  "by-status [status]",
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error { return nil },
	}
	flags.AddQueryFlagsToCmd(cmd)
	return cmd
}

func CmdQueryImpactsByProvider() *cobra.Command {
	cmd := &cobra.Command{
		Use:  "by-provider [address]",
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error { return nil },
	}
	flags.AddQueryFlagsToCmd(cmd)
	return cmd
}
