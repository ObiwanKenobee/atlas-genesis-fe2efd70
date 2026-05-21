package types

import "cosmossdk.io/errors"

var ErrInvalidAllocation = errors.Register("governance", 1, "proposal allocation percentages must sum to 100")
