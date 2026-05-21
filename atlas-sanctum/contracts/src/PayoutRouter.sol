// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PayoutRouter
 * @notice Routes validated payout executions and emits audit events
 * @dev Acts as the execution layer between covenant evaluation and fund release
 */
contract PayoutRouter is ReentrancyGuard {
    // ==================== State ====================
    
    struct PayoutRecord {
        uint256 covenantId;
        address token;
        address recipient;
        uint256 amount;
        bytes32 executionRef;
        uint256 timestamp;
        bool executed;
    }
    
    mapping(bytes32 => PayoutRecord) public payouts;
    uint256 public totalPayouts;
    
    address public owner;
    address public covenantRegistry;
    address public reserveVault;
    mapping(address => bool) public authorizedCallers;
    
    // ==================== Events ====================
    
    event PayoutExecuted(
        uint256 indexed covenantId,
        address indexed recipient,
        uint256 amount,
        bytes32 executionRef,
        bytes32 payoutId
    );
    
    event CallerAuthorized(address indexed caller);
    event CallerRevoked(address indexed caller);
    
    // ==================== Modifiers ====================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedCallers[msg.sender],
            "Not authorized"
        );
        _;
    }
    
    // ==================== Constructor ====================
    
    constructor(address _covenantRegistry, address _reserveVault) {
        owner = msg.sender;
        covenantRegistry = _covenantRegistry;
        reserveVault = _reserveVault;
        authorizedCallers[msg.sender] = true;
    }
    
    // ==================== External Functions ====================
    
    /**
     * @notice Executes a payout for a covenant
     * @param covenantId The covenant ID
     * @param token The token address
     * @param recipient The recipient address
     * @param amount The payout amount
     * @param executionRef Reference to the execution context
     * @return payoutId The unique payout identifier
     */
    function executePayout(
        uint256 covenantId,
        address token,
        address recipient,
        uint256 amount,
        bytes32 executionRef
    ) external onlyAuthorized nonReentrant returns (bytes32) {
        require(amount > 0, "Amount must be > 0");
        require(recipient != address(0), "Invalid recipient");
        
        // Generate unique payout ID
        bytes32 payoutId = keccak256(
            abi.encodePacked(
                covenantId,
                token,
                recipient,
                amount,
                executionRef,
                block.timestamp,
                totalPayouts
            )
        );
        
        require(!payouts[payoutId].executed, "Payout already executed");
        
        // Store payout record
        payouts[payoutId] = PayoutRecord({
            covenantId: covenantId,
            token: token,
            recipient: recipient,
            amount: amount,
            executionRef: executionRef,
            timestamp: block.timestamp,
            executed: true
        });
        
        totalPayouts++;
        
        emit PayoutExecuted(
            covenantId,
            recipient,
            amount,
            executionRef,
            payoutId
        );
        
        return payoutId;
    }
    
    /**
     * @notice Authorizes a caller
     * @param caller The caller address
     */
    function authorizeCaller(address caller) external onlyOwner {
        authorizedCallers[caller] = true;
        emit CallerAuthorized(caller);
    }
    
    /**
     * @notice Revokes a caller
     * @param caller The caller address
     */
    function revokeCaller(address caller) external onlyOwner {
        require(caller != owner, "Cannot revoke owner");
        authorizedCallers[caller] = false;
        emit CallerRevoked(caller);
    }
    
    // ==================== View Functions ====================
    
    /**
     * @notice Gets payout details
     * @param payoutId The payout ID
     * @return The payout record
     */
    function getPayout(bytes32 payoutId) 
        external 
        view 
        returns (PayoutRecord memory) 
    {
        return payouts[payoutId];
    }
    
    /**
     * @notice Checks if a caller is authorized
     * @param caller The caller address
     * @return Whether the caller is authorized
     */
    function isCallerAuthorized(address caller) external view returns (bool) {
        return authorizedCallers[caller];
    }
}
