package types

import "cosmossdk.io/errors"

var (
	ErrInvalidAddress  = errors.Register(ModuleName, 1, "invalid address")
	ErrDuplicateUser   = errors.Register(ModuleName, 2, "user already registered")
	ErrUserNotFound    = errors.Register(ModuleName, 3, "user not found")
	ErrUnauthorized    = errors.Register(ModuleName, 4, "unauthorized: admin role required")
	ErrInvalidRole     = errors.Register(ModuleName, 5, "invalid role")
	ErrMetadataTooLong = errors.Register(ModuleName, 6, "metadata exceeds maximum length")
)
