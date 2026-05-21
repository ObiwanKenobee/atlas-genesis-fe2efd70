package types

// MsgServer defines the identity message server interface.
type MsgServer interface {
	RegisterUser(ctx interface{}, msg *MsgRegisterUser) (*MsgRegisterUserResponse, error)
	UpdateReputation(ctx interface{}, msg *MsgUpdateReputation) (*MsgUpdateReputationResponse, error)
	UpdateMetadata(ctx interface{}, msg *MsgUpdateMetadata) (*MsgUpdateMetadataResponse, error)
}

// QueryServer defines the identity query server interface.
type QueryServer interface {
	User(ctx interface{}, req *QueryUserRequest) (*QueryUserResponse, error)
	UsersByRole(ctx interface{}, req *QueryUsersByRoleRequest) (*QueryUsersByRoleResponse, error)
}

// Response types
type MsgRegisterUserResponse    struct{}
type MsgUpdateReputationResponse struct{}
type MsgUpdateMetadataResponse  struct{}

type QueryUserRequest        struct{ Address string }
type QueryUserResponse       struct{ User User }
type QueryUsersByRoleRequest  struct{ Role string }
type QueryUsersByRoleResponse struct{ Users []User }
