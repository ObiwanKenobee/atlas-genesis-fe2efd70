// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleDAO {
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 start;
        uint256 end;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 id, address proposer);
    event Voted(uint256 id, address voter, bool support, uint256 weight);

    function createProposal(string memory title, string memory description, uint256 durationSeconds) external returns (uint256) {
        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            title: title,
            description: description,
            start: block.timestamp,
            end: block.timestamp + durationSeconds,
            forVotes: 0,
            againstVotes: 0,
            executed: false
        });
        emit ProposalCreated(proposalCount, msg.sender);
        return proposalCount;
    }

    function vote(uint256 id, bool support) external {
        require(id > 0 && id <= proposalCount, "invalid proposal");
        Proposal storage p = proposals[id];
        require(block.timestamp >= p.start && block.timestamp <= p.end, "voting closed");
        require(!hasVoted[id][msg.sender], "already voted");
        hasVoted[id][msg.sender] = true;
        uint256 weight = 1; // simple 1 vote per address in Phase 0
        if (support) p.forVotes += weight; else p.againstVotes += weight;
        emit Voted(id, msg.sender, support, weight);
    }
}
