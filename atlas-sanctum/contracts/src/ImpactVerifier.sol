// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ImpactVerifier
 * @notice Stores verification results and confidence scores for interventions
 * @dev Provides onchain proof of impact verification
 */
contract ImpactVerifier {
    // ==================== State ====================
    
    struct VerificationResult {
        uint256 covenantId;
        bytes32 interventionId;
        bytes32 evidenceRoot;
        uint256 confidenceBps;
        bool success;
        uint256 verifiedAt;
        address verifier;
    }
    
    mapping(bytes32 => VerificationResult) public verifications;
    mapping(uint256 => bytes32[]) public covenantVerifications;
    
    address public owner;
    mapping(address => bool) public authorizedVerifiers;
    
    // ==================== Events ====================
    
    event VerificationSubmitted(
        uint256 indexed covenantId,
        bytes32 indexed interventionId,
        bytes32 evidenceRoot,
        uint256 confidenceBps,
        bool success,
        bytes32 verificationId
    );
    
    event VerifierAuthorized(address indexed verifier);
    event VerifierRevoked(address indexed verifier);
    
    // ==================== Modifiers ====================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedVerifiers[msg.sender],
            "Not authorized"
        );
        _;
    }
    
    // ==================== Constructor ====================
    
    constructor() {
        owner = msg.sender;
        authorizedVerifiers[msg.sender] = true;
    }
    
    // ==================== External Functions ====================
    
    /**
     * @notice Submits a verification result for an intervention
     * @param covenantId The covenant ID
     * @param interventionId The intervention ID
     * @param evidenceRoot Merkle root of evidence
     * @param confidenceBps Confidence score in basis points (0-10000)
     * @param success Whether the intervention was successful
     * @return verificationId The unique verification identifier
     */
    function submitVerificationResult(
        uint256 covenantId,
        bytes32 interventionId,
        bytes32 evidenceRoot,
        uint256 confidenceBps,
        bool success
    ) external onlyAuthorized returns (bytes32) {
        require(confidenceBps <= 10000, "Confidence must be <= 10000");
        require(interventionId != bytes32(0), "Invalid intervention ID");
        
        // Generate unique verification ID
        bytes32 verificationId = keccak256(
            abi.encodePacked(
                covenantId,
                interventionId,
                evidenceRoot,
                confidenceBps,
                success,
                block.timestamp
            )
        );
        
        require(
            verifications[verificationId].verifiedAt == 0,
            "Verification already exists"
        );
        
        // Store verification result
        verifications[verificationId] = VerificationResult({
            covenantId: covenantId,
            interventionId: interventionId,
            evidenceRoot: evidenceRoot,
            confidenceBps: confidenceBps,
            success: success,
            verifiedAt: block.timestamp,
            verifier: msg.sender
        });
        
        covenantVerifications[covenantId].push(verificationId);
        
        emit VerificationSubmitted(
            covenantId,
            interventionId,
            evidenceRoot,
            confidenceBps,
            success,
            verificationId
        );
        
        return verificationId;
    }
    
    /**
     * @notice Authorizes a verifier
     * @param verifier The verifier address
     */
    function authorizeVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = true;
        emit VerifierAuthorized(verifier);
    }
    
    /**
     * @notice Revokes a verifier
     * @param verifier The verifier address
     */
    function revokeVerifier(address verifier) external onlyOwner {
        require(verifier != owner, "Cannot revoke owner");
        authorizedVerifiers[verifier] = false;
        emit VerifierRevoked(verifier);
    }
    
    // ==================== View Functions ====================
    
    /**
     * @notice Gets verification details
     * @param verificationId The verification ID
     * @return The verification result
     */
    function getVerification(bytes32 verificationId) 
        external 
        view 
        returns (VerificationResult memory) 
    {
        return verifications[verificationId];
    }
    
    /**
     * @notice Gets all verification IDs for a covenant
     * @param covenantId The covenant ID
     * @return Array of verification IDs
     */
    function getCovenantVerifications(uint256 covenantId) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return covenantVerifications[covenantId];
    }
    
    /**
     * @notice Checks if a verifier is authorized
     * @param verifier The verifier address
     * @return Whether the verifier is authorized
     */
    function isVerifierAuthorized(address verifier) 
        external 
        view 
        returns (bool) 
    {
        return authorizedVerifiers[verifier];
    }
    
    /**
     * @notice Gets the latest verification for a covenant
     * @param covenantId The covenant ID
     * @return The latest verification result
     */
    function getLatestVerification(uint256 covenantId) 
        external 
        view 
        returns (VerificationResult memory) 
    {
        bytes32[] memory ids = covenantVerifications[covenantId];
        require(ids.length > 0, "No verifications found");
        return verifications[ids[ids.length - 1]];
    }
}
