// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.10;

/// @title Identity Tracking Contract
/// @author Fauzan Lubis (fauh45)
/// @dev Hold customer and manufacturer identity (address, display name, and type of user)
contract Identity {
    // Customer in this case are the MSEs
    enum USER_TYPE {
        MANUFACTURER,
        CONSUMER
    }

    struct User {
        bool exist;
        string display_name;
        USER_TYPE user_type;
    }

    mapping(address => User) internal users;

    modifier userExist(address _userAddress) {
        require(users[_userAddress].exist, "User does not exists");
        _;
    }

    modifier customerOnly(address _userAddress) {
        require(
            users[_userAddress].user_type == USER_TYPE.CONSUMER,
            "User are not customer"
        );
        _;
    }

    modifier manufacturerOnly(address _userAddress) {
        require(
            users[_userAddress].user_type == USER_TYPE.MANUFACTURER,
            "User are not manufacturer"
        );
        _;
    }

    function getUser(address _userAddress) external view returns (User memory) {
        return users[_userAddress];
    }

    function registerAsCustomer(string memory _displayName) external {
        require(!users[msg.sender].exist, "User already exists");

        // No need to check for user type, as if the user already exist
        // then user must be either MANUFACTURER or CUSTOMER

        users[msg.sender] = User(true, _displayName, USER_TYPE.CONSUMER);
    }

    function registerAsManufacturer(string memory _displayName) external {
        require(!users[msg.sender].exist, "User already exists");

        // No need to check for user type, as if the user already exist
        // then user must be either MANUFACTURER or CUSTOMER

        users[msg.sender] = User(true, _displayName, USER_TYPE.MANUFACTURER);
    }
}
