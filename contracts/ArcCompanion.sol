// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title Arc Companion
/// @notice One non-transferable companion per wallet. Daily care, streaks and evolution live on Arc.
contract ArcCompanion is ERC721, Ownable {
    using Strings for uint256;

    uint256 public constant CARE_XP = 100;
    uint256 public constant EVOLUTION_XP = 1_000;
    uint8 public constant MAX_SHIELDS = 2;

    uint8 public constant ACTION_FEED = 1 << 0;
    uint8 public constant ACTION_CARE = 1 << 1;
    uint8 public constant ACTION_PLAY = 1 << 2;
    uint8 public constant ACTION_CLEAN = 1 << 3;
    uint8 public constant ACTION_RECHARGE = 1 << 4;
    uint8 private constant VALID_ACTION_MASK = 0x1F;

    struct Companion {
        uint64 bornOnArc;
        uint64 adoptedAt;
        uint32 xp;
        uint16 currentStreak;
        uint16 longestStreak;
        uint32 lastCareDay;
        uint8 archetype;
        uint8 family;
        uint8 evolutionPath;
        uint8 shields;
        uint8 milestoneFlags;
        bytes32 dna;
        string name;
    }

    error AlreadyHasCompanion();
    error CompanionNotFound();
    error InvalidBirthTimestamp();
    error InvalidArchetype();
    error InvalidName();
    error InvalidCareActions();
    error AlreadyCompletedToday();
    error EvolutionLocked();
    error EvolutionAlreadyChosen();
    error InvalidEvolutionPath();
    error Soulbound();

    event CompanionMinted(uint256 indexed tokenId,address indexed owner,bytes32 dna,uint8 family,uint8 archetype,uint64 bornOnArc);
    event DailyCareCompleted(uint256 indexed tokenId,uint32 indexed day,uint8 actionsMask,uint16 streak,uint32 xp,bool shieldUsed);
    event MilestoneReached(uint256 indexed tokenId, uint16 daysTogether);
    event EvolutionChosen(uint256 indexed tokenId, uint8 indexed path);
    event MetadataUpdate(uint256 indexed tokenId);

    uint256 private _nextTokenId = 1;
    string private _metadataBaseURI;

    mapping(uint256 tokenId => Companion) private _companions;
    mapping(address owner => uint256 tokenId) public companionOf;

    constructor(string memory metadataBaseURI_) ERC721("Arc Companion", "ARCC") Ownable(msg.sender) {
        _metadataBaseURI = metadataBaseURI_;
    }

    /// @param bornOnArc Earliest verified Arc activity timestamp. Pass 0 for a wallet with no prior Arc history;
    /// the mint block timestamp then becomes its birth timestamp.
    function mintCompanion(uint64 bornOnArc, uint8 archetype, string calldata companionName) external returns (uint256 tokenId) {
        if (companionOf[msg.sender] != 0) revert AlreadyHasCompanion();
        if (bornOnArc > block.timestamp) revert InvalidBirthTimestamp();
        if (archetype > 5) revert InvalidArchetype();
        bytes memory rawName = bytes(companionName);
        if (rawName.length < 2 || rawName.length > 24) revert InvalidName();

        uint64 resolvedBirth = bornOnArc == 0 ? uint64(block.timestamp) : bornOnArc;
        tokenId = _nextTokenId++;

        // Stable genesis identity: the same wallet always resolves to the same DNA/family.
        bytes32 dna = keccak256(abi.encodePacked(msg.sender));
        uint8 family = uint8(uint256(dna) % 3);

        _companions[tokenId] = Companion({
            bornOnArc: resolvedBirth,
            adoptedAt: uint64(block.timestamp),
            xp: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastCareDay: 0,
            archetype: archetype,
            family: family,
            evolutionPath: 0,
            shields: 0,
            milestoneFlags: 0,
            dna: dna,
            name: companionName
        });

        companionOf[msg.sender] = tokenId;
        _safeMint(msg.sender, tokenId);

        emit CompanionMinted(tokenId, msg.sender, dna, family, archetype, resolvedBirth);
        emit MetadataUpdate(tokenId);
    }

    function completeDailyCare(uint8 actionsMask) external {
        uint256 tokenId = companionOf[msg.sender];
        if (tokenId == 0) revert CompanionNotFound();
        if ((actionsMask & ~VALID_ACTION_MASK) != 0) revert InvalidCareActions();
        uint8 actionCount = _popcount(actionsMask);
        if (actionCount < 2 || actionCount > 3) revert InvalidCareActions();

        Companion storage c = _companions[tokenId];
        uint32 today = uint32(block.timestamp / 1 days);
        if (c.lastCareDay == today) revert AlreadyCompletedToday();

        bool shieldUsed;
        if (c.lastCareDay == 0) {
            c.currentStreak = 1;
        } else {
            uint32 gap = today - c.lastCareDay;
            if (gap == 1) c.currentStreak += 1;
            else if (gap == 2 && c.shields > 0) {
                c.shields -= 1;
                c.currentStreak += 1;
                shieldUsed = true;
            } else c.currentStreak = 1;
        }

        c.lastCareDay = today;
        c.xp += uint32(CARE_XP + uint256(actionCount) * 10);
        if (c.currentStreak > c.longestStreak) c.longestStreak = c.currentStreak;
        if (c.currentStreak > 0 && c.currentStreak % 7 == 0 && c.shields < MAX_SHIELDS) c.shields += 1;

        _applyMilestones(tokenId, c);
        emit DailyCareCompleted(tokenId, today, actionsMask, c.currentStreak, c.xp, shieldUsed);
        emit MetadataUpdate(tokenId);
    }

    function chooseEvolution(uint8 path) external {
        uint256 tokenId = companionOf[msg.sender];
        if (tokenId == 0) revert CompanionNotFound();
        Companion storage c = _companions[tokenId];
        if (c.xp < EVOLUTION_XP) revert EvolutionLocked();
        if (c.evolutionPath != 0) revert EvolutionAlreadyChosen();
        if (path < 1 || path > 2) revert InvalidEvolutionPath();
        c.evolutionPath = path;
        emit EvolutionChosen(tokenId, path);
        emit MetadataUpdate(tokenId);
    }

    function companion(uint256 tokenId) external view returns (Companion memory) {
        if (_ownerOf(tokenId) == address(0)) revert CompanionNotFound();
        return _companions[tokenId];
    }

    function levelOf(uint256 tokenId) external view returns (uint256) {
        if (_ownerOf(tokenId) == address(0)) revert CompanionNotFound();
        return uint256(_companions[tokenId].xp) / 500 + 1;
    }

    function setMetadataBaseURI(string calldata newBaseURI) external onlyOwner { _metadataBaseURI = newBaseURI; }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert CompanionNotFound();
        if (bytes(_metadataBaseURI).length == 0) return "";
        return string.concat(_metadataBaseURI, tokenId.toString());
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert Soulbound();
        return super._update(to, tokenId, auth);
    }

    function _applyMilestones(uint256 tokenId, Companion storage c) private {
        if (c.currentStreak >= 7 && (c.milestoneFlags & 1) == 0) { c.milestoneFlags |= 1; emit MilestoneReached(tokenId, 7); }
        if (c.currentStreak >= 30 && (c.milestoneFlags & 2) == 0) { c.milestoneFlags |= 2; emit MilestoneReached(tokenId, 30); }
        if (c.currentStreak >= 100 && (c.milestoneFlags & 4) == 0) { c.milestoneFlags |= 4; emit MilestoneReached(tokenId, 100); }
    }

    function _popcount(uint8 value) private pure returns (uint8 count) {
        while (value != 0) { count += value & 1; value >>= 1; }
    }
}
