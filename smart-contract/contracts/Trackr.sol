// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.10;

import "./Identity.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Trackr is Identity, Ownable {
    struct Goods {
        bool exist;
        bool locked;
        uint256 id;
        string displayName;
        address owner;
        address currentCustody;
        address[] custodyList;
    }

    event ItemChangeHands(
        uint256 indexed _goodsId,
        address indexed _to,
        address indexed _owner,
        string _reason
    );

    /// @dev This variable will hold all of the goods, with the id being a uint256
    mapping(uint256 => Goods) private _allGoods;

    /// @dev This variable holds all of goods id owned by some address
    mapping(address => uint256[]) private _goodsList;

    /// @dev This variable hold all of the item a user has custody currently
    mapping(address => uint256[]) private _custodyList;

    modifier goodsExist(uint256 _goodsId) {
        require(_allGoods[_goodsId].exist, "Goods doesn't exist");
        _;
    }

    modifier inCustody(uint256 _goodsId, address _user) {
        require(
            _allGoods[_goodsId].currentCustody == _user,
            "User are currently not in custody of the goods"
        );
        _;
    }

    function getGoods(uint256 _goodsId) external view returns (Goods memory) {
        return _allGoods[_goodsId];
    }

    function getUserGoodsList() external view returns (uint256[] memory) {
        return _goodsList[msg.sender];
    }

    function getUserCustodyList() external view returns (uint256[] memory) {
        return _custodyList[msg.sender];
    }

    /// @dev Creates pseudo-random id in uint256 format, source : https://stackoverflow.com/a/58840890
    function rand() private view returns (uint256) {
        uint256 seed = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp +
                        block.difficulty +
                        ((
                            uint256(keccak256(abi.encodePacked(block.coinbase)))
                        ) / (block.timestamp)) +
                        block.gaslimit +
                        ((uint256(keccak256(abi.encodePacked(msg.sender)))) /
                            (block.timestamp)) +
                        block.number
                )
            )
        );

        return (seed - ((seed / 1000) * 1000));
    }

    function deleteCustodyAt(uint256 _index, address _user) private {
        delete _custodyList[_user][_index];
        _custodyList[_user][_index] = _custodyList[_user][
            _custodyList[_user].length - 1
        ];
        _custodyList[_user].pop();
    }

    function removeCustody(uint256 _goodsId, address _user) private {
        uint256 back = _custodyList[_user].length - 1;
        uint256 front = 0;

        while (front <= back) {
            if (_custodyList[_user][front] == _goodsId) {
                deleteCustodyAt(front, _user);

                break;
            } else if (_custodyList[_user][back] == _goodsId) {
                deleteCustodyAt(back, _user);

                break;
            }

            front += 1;
            back -= 1;
        }
    }

    function createGood(string memory _displayName, address _goodsOwner)
        external
        manufacturerOnly(msg.sender)
        userExist(_goodsOwner)
    {
        uint256 generatedGoodsId = rand();

        _allGoods[generatedGoodsId].exist = true;
        _allGoods[generatedGoodsId].locked = false;
        _allGoods[generatedGoodsId].id = generatedGoodsId;
        _allGoods[generatedGoodsId].displayName = _displayName;
        _allGoods[generatedGoodsId].owner = _goodsOwner;
        _allGoods[generatedGoodsId].currentCustody = msg.sender;
        _allGoods[generatedGoodsId].custodyList.push(msg.sender);

        _goodsList[_goodsOwner].push(generatedGoodsId);
        _custodyList[msg.sender].push(generatedGoodsId);

        emit ItemChangeHands(
            generatedGoodsId,
            msg.sender,
            _goodsOwner,
            "Goods manufactured"
        );
    }

    function moveCustody(uint256 _goodsId, address _to)
        external
        goodsExist(_goodsId)
        inCustody(_goodsId, msg.sender)
        userExist(_to)
    {
        require(
            !_allGoods[_goodsId].locked,
            "Owner has locked change of custody"
        );

        _allGoods[_goodsId].currentCustody = _to;
        _allGoods[_goodsId].custodyList.push(_to);

        removeCustody(_goodsId, msg.sender);
        _custodyList[_to].push(_goodsId);

        emit ItemChangeHands(
            _goodsId,
            _to,
            _allGoods[_goodsId].owner,
            "Goods changed custody"
        );
    }

    function lockGoods(uint256 _goodsId, bool _lockStatus)
        external
        goodsExist(_goodsId)
    {
        require(
            _allGoods[_goodsId].owner == msg.sender,
            "User are not the goods owner"
        );

        _allGoods[_goodsId].locked = _lockStatus;
    }
}
