// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title RIUToken
 * @notice Regenerative Impact Unit — the core tradeable carbon credit token
 * @dev 1 RIU = 1 verified tonne of CO2-equivalent impact, 18 decimals
 */
contract RIUToken is ERC20, ERC20Burnable, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 1e18; // 100M RIUs

    mapping(address => bool) public minters;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event RIUMinted(address indexed to, uint256 amount, bytes32 projectId);
    event RIURetired(address indexed from, uint256 amount, bytes32 projectId, string reason);

    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not a minter");
        _;
    }

    constructor() ERC20("Regenerative Impact Unit", "RIU") Ownable(msg.sender) {}

    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @notice Mint RIUs for a verified project
     * @param to Recipient address
     * @param amount Amount in wei (1e18 = 1 RIU)
     * @param projectId Off-chain project identifier
     */
    function mint(address to, uint256 amount, bytes32 projectId) external onlyMinter whenNotPaused {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
        emit RIUMinted(to, amount, projectId);
    }

    /**
     * @notice Retire (permanently burn) RIUs to claim carbon offset
     * @param amount Amount to retire
     * @param projectId Project the offset is attributed to
     * @param reason Retirement reason (e.g. "Corporate net-zero 2025")
     */
    function retire(uint256 amount, bytes32 projectId, string calldata reason) external whenNotPaused {
        _burn(msg.sender, amount);
        emit RIURetired(msg.sender, amount, projectId, reason);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }
}
