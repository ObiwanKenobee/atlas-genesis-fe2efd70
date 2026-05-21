package types

import "encoding/binary"

// Store key prefixes — isolated per entity to prevent key collisions.
var (
	KeyPrefixUser       = []byte{0x01}
	KeyPrefixUserByRole = []byte{0x02}
)

func UserKey(address string) []byte {
	return append(KeyPrefixUser, []byte(address)...)
}

func UserByRoleKey(role, address string) []byte {
	roleBytes := []byte(role)
	key := make([]byte, len(KeyPrefixUserByRole)+4+len(roleBytes)+len(address))
	copy(key, KeyPrefixUserByRole)
	binary.BigEndian.PutUint32(key[len(KeyPrefixUserByRole):], uint32(len(roleBytes)))
	copy(key[len(KeyPrefixUserByRole)+4:], roleBytes)
	copy(key[len(KeyPrefixUserByRole)+4+len(roleBytes):], []byte(address))
	return key
}

func UserByRolePrefixKey(role string) []byte {
	roleBytes := []byte(role)
	key := make([]byte, len(KeyPrefixUserByRole)+4+len(roleBytes))
	copy(key, KeyPrefixUserByRole)
	binary.BigEndian.PutUint32(key[len(KeyPrefixUserByRole):], uint32(len(roleBytes)))
	copy(key[len(KeyPrefixUserByRole)+4:], roleBytes)
	return key
}
