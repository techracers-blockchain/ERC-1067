pragma solidity ^0.4.11;

import "./SimpleControl.sol";


/**
 Logical Token based on UIP2 model
 */
contract LogicalToken is SimpleControl {

    uint256 public constant INITIAL_SUPPLY = 0;

    /**
    * @dev Constructor that gives msg.sender all of existing tokens.
    */
    function LogicalToken(address _dataCentreAddr) public
        SimpleControl(_dataCentreAddr)
    {
    
    }
}
