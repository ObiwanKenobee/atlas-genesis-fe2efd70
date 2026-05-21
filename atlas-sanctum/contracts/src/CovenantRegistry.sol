// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CovenantRegistry
 * @notice Manages covenant lifecycle and conditions for Atlas Sanctum
 * @dev Stores covenant metadata and tracks execution status
 */
contract CovenantRegistry {
    // ==================== State ====================
    
    enum Status {
        Draft,
        Armed,
        Triggered,
        Executed,
        Verified,
        Failed
    }

    struct Covenant {
        uint256 id;
        string title;
        bytes32 regionId;
        uint256 minRiskScore;
        uint256 payoutAmount;
        bool autoExecute;
        Status status;
        address steward;
        uint256 createdAt;
        bytes32 interventionId;
    }

    uint256 private _nextCovenantId = 1;
    mapping(uint256 => Covenant) public covenants;
    mapping(address => uint256[]) public stewardCovenants;
    
    address public owner;
    
    // ==================== Events ====================
    
    event CovenantCreated(
        uint256 indexed covenantId,
        string title,
        bytes32 regionId,
        uint256 minRiskScore,
        uint256 payoutAmount,
        address steward
    );
    
    event CovenantArmed(uint256 indexed covenantId);
    event CovenantTriggered(uint256 indexed covenantId);
    event CovenantExecuted(uint256 indexed covenantId, bytes32 interventionId);
    event CovenantVerified(uint256 indexed covenantId);
    event CovenantFailed(uint256 indexed covenantId);
    
    // ==================== Modifiers ====================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlySteward(uint256 covenantId) {
        require(
            covenants[covenantId].steward == msg.sender,
            "Not covenant steward"
        );
        _;
    }
    
    modifier covenantExists(uint256 covenantId) {
        require(covenants[covenantId].createdAt != 0, "Covenant does not exist");
        _;
    }
    
    // ==================== Constructor ====================
    
    constructor() {
        owner = msg.sender;
    }
    
    // ==================== External Functions ====================
    
    /**
     * @notice Creates a new covenant draft
     * @param title Human-readable covenant title
     * @param regionId Identifier for the target region
     * @param minRiskScore Minimum risk score to trigger (0-100)
     * @param payoutAmount Amount to payout in USD (scaled by 1e18)
     * @param autoExecute Whether to auto-execute when conditions are met
     * @return covenantId The ID of the newly created covenant
     */
    function createCovenant(
        string calldata title,
        bytes32 regionId,
        uint256 minRiskScore,
        uint256 payoutAmount,
        bool autoExecute
    ) external returns (uint256) {
        require(minRiskScore <= 100, "Risk score must be <= 100");
        require(payoutAmount > 0, "Payout must be > 0");
        
        uint256 covenantId = _nextCovenantId++;
        
        covenants[covenantId] = Covenant({
            id: covenantId,
            title: title,
            regionId: regionId,
            minRiskScore: minRiskScore,
            payoutAmount: payoutAmount,
            autoExecute: autoExecute,
            status: Status.Draft,
            steward: msg.sender,
            createdAt: block.timestamp,
            interventionId: bytes32(0)
        });
        
        stewardCovenants[msg.sender].push(covenantId);
        
        emit CovenantCreated(
            covenantId,
            title,
            regionId,
            minRiskScore,
            payoutAmount,
            msg.sender
        );
        
        return covenantId;
    }
    
    /**
     * @notice Arms a covenant for execution
     * @param covenantId The ID of the covenant to arm
     */
    function armCovenant(uint256 covenantId) 
        external 
        covenantExists(covenantId) 
        onlySteward(covenantId) 
    {
        require(
            covenants[covenantId].status == Status.Draft,
            "Must be in Draft status"
        );
        
        covenants[covenantId].status = Status.Armed;
        emit CovenantArmed(covenantId);
    }
    
    /**
     * @notice Marks a covenant as triggered
     * @param covenantId The ID of the covenant
     */
    function markTriggered(uint256 covenantId) 
        external 
        covenantExists(covenantId) 
        onlySteward(covenantId) 
    {
        require(
            covenants[covenantId].status == Status.Armed,
            "Must be Armed"
        );
        
        covenants[covenantId].status = Status.Triggered;
        emit CovenantTriggered(covenantId);
    }
    
    /**
     * @notice Marks a covenant as executed with intervention reference
     * @param covenantId The ID of the covenant
     * @param interventionId Reference to the intervention record
     */
    function markExecuted(uint256 covenantId, bytes32 interventionId) 
        external 
        covenantExists(covenantId) 
        onlySteward(covenantId) 
    {
        require(
            covenants[covenantId].status == Status.Triggered,
            "Must be Triggered"
        );
        
        covenants[covenantId].status = Status.Executed;
        covenants[covenantId].interventionId = interventionId;
        emit CovenantExecuted(covenantId, interventionId);
    }
    
    /**
     * @notice Marks a covenant as verified after impact confirmation
     * @param covenantId The ID of the covenant
     */
    function markVerified(uint256 covenantId) 
        external 
        covenantExists(covenantId) 
        onlySteward(covenantId) 
    {
        require(
            covenants[covenantId].status == Status.Executed,
            "Must be Executed"
        );
        
        covenants[covenantId].status = Status.Verified;
        emit CovenantVerified(covenantId);
    }
    
    /**
     * @notice Marks a covenant as failed
     * @param covenantId The ID of the covenant
     */
    function markFailed(uint256 covenantId) 
        external 
        covenantExists(covenantId) 
        onlySteward(covenantId) 
    {
        require(
            covenants[covenantId].status == Status.Executed ||
            covenants[covenantId].status == Status.Triggered,
            "Must be Executed or Triggered"
        );
        
        covenants[covenantId].status = Status.Failed;
        emit CovenantFailed(covenantId);
    }
    
    // ==================== View Functions ====================
    
    /**
     * @notice Gets covenant details
     * @param covenantId The ID of the covenant
     * @return The covenant struct
     */
    function getCovenant(uint256 covenantId) 
        external 
        view 
        covenantExists(covenantId) 
        returns (Covenant memory) 
    {
        return covenants[covenantId];
    }
    
    /**
     * @notice Gets all covenants for a steward
     * @param steward The steward address
     * @return Array of covenant IDs
     */
    function getStewardCovenants(address steward) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return stewardCovenants[steward];
    }
    
    /**
     * @notice Gets the next covenant ID
     * @return The next covenant ID
     */
    function getNextCovenantId() external view returns (uint256) {
        return _nextCovenantId;
    }
}
