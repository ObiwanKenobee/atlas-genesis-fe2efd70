// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ReserveVault
 * @notice Manages emergency reserve funds for covenant payouts
 * @dev Holds stablecoin balances and authorizes payouts
 */
contract ReserveVault is ReentrancyGuard {
    // ==================== State ====================
    
    struct ReserveBalance {
        uint256 totalDeposited;
        uint256 totalAllocated;
        uint256 lastUpdated;
    }
    
    mapping(address => ReserveBalance) public tokenBalances;
    mapping(address => mapping(uint256 => bool)) public covenantAllocations;
    
    address public owner;
    address public covenantRegistry;
    mapping(address => bool) public authorizedOperators;
    
    // ==================== Events ====================
    
    event Deposited(
        address indexed token,
        address indexed depositor,
        uint256 amount
    );
    
    event Withdrawn(
        address indexed token,
        address indexed recipient,
        uint256 amount
    );
    
    event PayoutAllocated(
        uint256 indexed covenantId,
        address indexed token,
        address indexed recipient,
        uint256 amount
    );
    
    event OperatorAuthorized(address indexed operator);
    event OperatorRevoked(address indexed operator);
    
    // ==================== Modifiers ====================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedOperators[msg.sender],
            "Not authorized"
        );
        _;
    }
    
    // ==================== Constructor ====================
    
    constructor(address _covenantRegistry) {
        owner = msg.sender;
        covenantRegistry = _covenantRegistry;
        authorizedOperators[msg.sender] = true;
    }
    
    // ==================== External Functions ====================
    
    /**
     * @notice Deposits tokens into the reserve vault
     * @param token The token address
     * @param amount The amount to deposit
     */
    function deposit(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        tokenBalances[token].totalDeposited += amount;
        tokenBalances[token].lastUpdated = block.timestamp;
        
        emit Deposited(token, msg.sender, amount);
    }
    
    /**
     * @notice Withdraws tokens from the reserve vault (owner only)
     * @param token The token address
     * @param recipient The recipient address
     * @param amount The amount to withdraw
     */
    function withdraw(
        address token,
        address recipient,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        uint256 available = availableBalance(token);
        require(amount <= available, "Insufficient available balance");
        
        IERC20(token).transfer(recipient, amount);
        
        tokenBalances[token].totalDeposited -= amount;
        tokenBalances[token].lastUpdated = block.timestamp;
        
        emit Withdrawn(token, recipient, amount);
    }
    
    /**
     * @notice Allocates a payout for a covenant execution
     * @param covenantId The covenant ID
     * @param token The token address
     * @param recipient The recipient address
     * @param amount The payout amount
     */
    function allocatePayout(
        uint256 covenantId,
        address token,
        address recipient,
        uint256 amount
    ) external onlyAuthorized nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(!covenantAllocations[token][covenantId], "Already allocated");
        
        uint256 available = availableBalance(token);
        require(amount <= available, "Insufficient available balance");
        
        covenantAllocations[token][covenantId] = true;
        tokenBalances[token].totalAllocated += amount;
        tokenBalances[token].lastUpdated = block.timestamp;
        
        IERC20(token).transfer(recipient, amount);
        
        emit PayoutAllocated(covenantId, token, recipient, amount);
    }
    
    /**
     * @notice Authorizes an operator
     * @param operator The operator address
     */
    function authorizeOperator(address operator) external onlyOwner {
        authorizedOperators[operator] = true;
        emit OperatorAuthorized(operator);
    }
    
    /**
     * @notice Revokes an operator
     * @param operator The operator address
     */
    function revokeOperator(address operator) external onlyOwner {
        require(operator != owner, "Cannot revoke owner");
        authorizedOperators[operator] = false;
        emit OperatorRevoked(operator);
    }
    
    // ==================== View Functions ====================
    
    /**
     * @notice Gets the available balance for a token
     * @param token The token address
     * @return The available balance
     */
    function availableBalance(address token) public view returns (uint256) {
        ReserveBalance memory balance = tokenBalances[token];
        if (balance.totalDeposited <= balance.totalAllocated) {
            return 0;
        }
        return balance.totalDeposited - balance.totalAllocated;
    }
    
    /**
     * @notice Gets the total balance for a token
     * @param token The token address
     * @return The total balance
     */
    function totalBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    
    /**
     * @notice Checks if a covenant has been allocated
     * @param token The token address
     * @param covenantId The covenant ID
     * @return Whether the covenant has been allocated
     */
    function isCovenantAllocated(
        address token,
        uint256 covenantId
    ) external view returns (bool) {
        return covenantAllocations[token][covenantId];
    }
}
