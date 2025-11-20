# jeweler-mvp-beta
Beta for JewelerSwap ecosystem".  
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract JewelrySwap is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _rentalIds;

    IERC20 public ecoTokenContract;
    address public platformWallet;
    address public expertPool;

    constructor(address _ecoToken, address _platformWallet) ERC721("JewelerSwap", "JSWP") {
        ecoTokenContract = IERC20(_ecoToken);
        platformWallet = _platformWallet;
        expertPool = _platformWallet; // пока просто платформа, потом отдельный пул
    }

    struct Item {
        uint256 itemId;
        address owner;
        string metadataURI;
        bool isListed;
        uint256 price;
    }

    struct Rental {
        uint256 rentalId;
        uint256 itemId;
        address renter;
        uint256 price;
        uint256 duration;
        uint256 deposit;
        uint256 insurance;
        uint256 modFee; // ручная модерация, юзер платит
        bool active;
    }

    mapping(uint256 => Item) public items;
    mapping(uint256 => Rental) public rentals;

    event ItemCreated(uint256 itemId, address owner, string metadataURI);
    event RentalCreated(uint256 rentalId, uint256 itemId, address renter, uint256 price, uint256 modFee);

    function createItem(string memory metadataURI) external returns (uint256) {
        _itemIds.increment();
        uint256 newItemId = _itemIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, metadataURI);
        items[newItemId] = Item(newItemId, msg.sender, metadataURI, false, 0);
        emit ItemCreated(newItemId, msg.sender, metadataURI);
        return newItemId;
    }

    function createRental(
        uint256 itemId,
        uint256 price,
        uint256 duration,
        uint256 deposit,
        uint256 insurance,
        uint256 modFee // ← сюда юзер платит за ручную модерацию
    ) external nonReentrant {
        require(ownerOf(itemId) == msg.sender, "Not owner");
        uint256 total = deposit + insurance + modFee;
        ecoTokenContract.transferFrom(msg.sender, address(this), total);

        _rentalIds.increment();
        uint256 rentalId = _rentalIds.current();
        rentals[rentalId] = Rental(
            rentalId,
            itemId,
            address(0),
            price,
            duration,
            deposit,
            insurance,
            modFee,
            true
        );

        emit RentalCreated(rentalId, itemId, msg.sender, price, modFee);
    }

    // остальное добавим позже — главное, уже работает mint + rental с modFee
}
