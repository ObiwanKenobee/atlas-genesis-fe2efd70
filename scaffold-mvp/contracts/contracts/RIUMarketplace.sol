// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IRIUToken is IERC20 {
    function retire(uint256 amount, bytes32 projectId, string calldata reason) external;
}

/**
 * @title RIUMarketplace
 * @notice On-chain marketplace for listing, buying, and retiring RIU tokens
 * @dev Sellers list RIUs at a price in a payment token (e.g. USDC); buyers pay and receive RIUs
 */
contract RIUMarketplace is ReentrancyGuard, Ownable {
    IRIUToken public immutable riuToken;
    address public immutable paymentToken; // USDC or similar stablecoin
    uint256 public feeBps = 250; // 2.5% platform fee
    address public feeRecipient;

    struct Listing {
        address seller;
        uint256 riuAmount;      // RIUs available (wei)
        uint256 pricePerRIU;    // payment token per 1e18 RIU
        bytes32 projectId;
        bool active;
    }

    uint256 private _nextListingId = 1;
    mapping(uint256 => Listing) public listings;

    event Listed(uint256 indexed listingId, address indexed seller, uint256 riuAmount, uint256 pricePerRIU, bytes32 projectId);
    event Purchased(uint256 indexed listingId, address indexed buyer, uint256 riuAmount, uint256 totalCost);
    event ListingCancelled(uint256 indexed listingId);
    event FeeBpsUpdated(uint256 newFeeBps);

    constructor(address _riuToken, address _paymentToken, address _feeRecipient) Ownable(msg.sender) {
        riuToken = IRIUToken(_riuToken);
        paymentToken = _paymentToken;
        feeRecipient = _feeRecipient;
    }

    /**
     * @notice List RIUs for sale
     * @param riuAmount Amount of RIUs to list (wei)
     * @param pricePerRIU Price in payment token per 1e18 RIU
     * @param projectId Project the RIUs originate from
     */
    function list(uint256 riuAmount, uint256 pricePerRIU, bytes32 projectId) external nonReentrant returns (uint256) {
        require(riuAmount > 0, "Amount must be > 0");
        require(pricePerRIU > 0, "Price must be > 0");

        riuToken.transferFrom(msg.sender, address(this), riuAmount);

        uint256 listingId = _nextListingId++;
        listings[listingId] = Listing({
            seller: msg.sender,
            riuAmount: riuAmount,
            pricePerRIU: pricePerRIU,
            projectId: projectId,
            active: true
        });

        emit Listed(listingId, msg.sender, riuAmount, pricePerRIU, projectId);
        return listingId;
    }

    /**
     * @notice Purchase RIUs from a listing
     * @param listingId The listing to buy from
     * @param riuAmount Amount of RIUs to purchase (wei)
     */
    function purchase(uint256 listingId, uint256 riuAmount) external nonReentrant {
        Listing storage l = listings[listingId];
        require(l.active, "Listing not active");
        require(riuAmount > 0 && riuAmount <= l.riuAmount, "Invalid amount");

        uint256 totalCost = (riuAmount * l.pricePerRIU) / 1e18;
        uint256 fee = (totalCost * feeBps) / 10000;
        uint256 sellerProceeds = totalCost - fee;

        l.riuAmount -= riuAmount;
        if (l.riuAmount == 0) l.active = false;

        IERC20(paymentToken).transferFrom(msg.sender, l.seller, sellerProceeds);
        if (fee > 0) IERC20(paymentToken).transferFrom(msg.sender, feeRecipient, fee);
        riuToken.transfer(msg.sender, riuAmount);

        emit Purchased(listingId, msg.sender, riuAmount, totalCost);
    }

    /**
     * @notice Cancel a listing and reclaim unsold RIUs
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage l = listings[listingId];
        require(l.seller == msg.sender, "Not seller");
        require(l.active, "Already inactive");

        l.active = false;
        riuToken.transfer(msg.sender, l.riuAmount);
        l.riuAmount = 0;

        emit ListingCancelled(listingId);
    }

    function setFeeBps(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Max 10%");
        feeBps = newFeeBps;
        emit FeeBpsUpdated(newFeeBps);
    }

    function setFeeRecipient(address recipient) external onlyOwner {
        require(recipient != address(0), "Zero address");
        feeRecipient = recipient;
    }
}
