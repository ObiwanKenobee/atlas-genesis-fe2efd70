// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ImpactNFT
 * @notice On-chain impact certificates for verified regenerative projects
 * @dev Each NFT represents a verifiable impact milestone with immutable metadata
 */
contract ImpactNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    enum Rarity { Common, Rare, Epic, Legendary }

    struct ImpactMetadata {
        bytes32 projectId;
        uint256 carbonOffset;   // in kg CO2e
        uint256 treesPlanted;
        uint256 waterSavedLiters;
        uint256 speciesProtected;
        Rarity rarity;
        uint256 mintedAt;
        address verifier;
    }

    mapping(uint256 => ImpactMetadata) public impactData;
    mapping(address => bool) public authorizedMinters;

    event ImpactNFTMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        bytes32 projectId,
        Rarity rarity
    );

    modifier onlyMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor() ERC721("Atlas Impact Certificate", "AIC") Ownable(msg.sender) {}

    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }

    function revokeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = false;
    }

    /**
     * @notice Mint an impact certificate NFT
     * @param recipient The certificate recipient
     * @param tokenURI IPFS URI for the certificate metadata JSON
     * @param projectId Off-chain project reference
     * @param carbonOffset CO2e offset in kg
     * @param treesPlanted Number of trees planted
     * @param waterSavedLiters Liters of water saved/restored
     * @param speciesProtected Number of species protected
     * @param rarity Certificate rarity tier
     */
    function mintCertificate(
        address recipient,
        string calldata tokenURI,
        bytes32 projectId,
        uint256 carbonOffset,
        uint256 treesPlanted,
        uint256 waterSavedLiters,
        uint256 speciesProtected,
        Rarity rarity
    ) external onlyMinter returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        impactData[newTokenId] = ImpactMetadata({
            projectId: projectId,
            carbonOffset: carbonOffset,
            treesPlanted: treesPlanted,
            waterSavedLiters: waterSavedLiters,
            speciesProtected: speciesProtected,
            rarity: rarity,
            mintedAt: block.timestamp,
            verifier: msg.sender
        });

        emit ImpactNFTMinted(newTokenId, recipient, projectId, rarity);
        return newTokenId;
    }

    function getImpactData(uint256 tokenId) external view returns (ImpactMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return impactData[tokenId];
    }

    function totalMinted() external view returns (uint256) {
        return _tokenIds.current();
    }
}
