pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract DataCentre is Ownable {
    struct Container {
        mapping(bytes32 => uint256) values;
        mapping(address => uint256) balances;
        mapping(address => mapping (address => uint)) constraints;
    }

    mapping(bytes32 => Container) internal containers;

    // Owner Functions
    function setValue(bytes32 _container, bytes32 _key, uint256 _value) public onlyOwner {
        containers[_container].values[_key] = _value;
    }

    function setBalanace(bytes32 _container, address _key, uint256 _value) public onlyOwner {
        containers[_container].balances[_key] = _value;
    }

    function setConstraint(bytes32 _container, address _source, address _key, uint256 _value) public onlyOwner {
        containers[_container].constraints[_source][_key] = _value;
    }

    // view Functions
    function getValue(bytes32 _container, bytes32 _key) public view returns(uint256) {
        return containers[_container].values[_key];
    }

    function getBalanace(bytes32 _container, address _key) public constant returns(uint256) {
        return containers[_container].balances[_key];
    }

    function getConstraint(bytes32 _container, address _source, address _key) view returns(uint256) {
        return containers[_container].constraints[_source][_key];
    }
}
