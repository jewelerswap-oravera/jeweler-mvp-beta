// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
        expertPool = _platformWallet; // Пока платформа, потом пул экспертов
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
        uint256 modFee; // Ручная модерация, юзер платит $1-5
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
        uint256 modFee // Юзер платит за ручную мод $1-5
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

    // Функция для утверждения аренды (deduct modFee to expert, 10% share нам)
    function approveRental(uint256 rentalId, bool approve) external nonReentrant {
        Rental storage rental = rentals[rentalId];
        require(rental.itemId > 0, "Rental not found");
        require(ownerOf(rental.itemId) == msg.sender, "Not owner");

        if (approve) {
            // Отпустить деньги арендатора
            ecoTokenContract.transfer(rental.renter, rental.price);
            // Ювелиру 90% modFee, нам 10%
            address expert = rental.renter; // Stub, from DB
            ecoTokenContract.transfer(expert, rental.modFee * 90 / 100);
            ecoTokenContract.transfer(platformWallet, rental.modFee * 10 / 100);
            rental.active = false;
        } else {
            // Refund
            ecoTokenContract.transfer(msg.sender, rental.deposit + rental.insurance + rental.modFee);
        }
    }

    // Claim earnings for experts
    function claimExpertEarnings(address expert) external {
        uint256 amount = // Stub from mapping
        require(amount > 0, "No earnings");
        ecoTokenContract.transfer(expert, amount);
    }

    // Переопределения ERC721
    function tokenURI(uint256 itemId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(itemId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
