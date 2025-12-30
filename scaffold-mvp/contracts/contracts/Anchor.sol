// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Anchor {
    event Anchored(bytes32 indexed payloadHash, address indexed submitter, uint256 timestamp);

    function anchor(bytes32 payloadHash) external returns (bool) {
        emit Anchored(payloadHash, msg.sender, block.timestamp);
        return true;
    }
}
