pragma solidity ^0.4.11;

import "../ERC1067.sol";


/**
 Logical Token based on UIP2 model
 */
contract MockERC1067 is ERC1067 {

    /**
    * @dev Constructor that gives msg.sender all of existing tokens.
    */
    function MockERC1067(address _dataCentreAddr) public
        ERC1067(_dataCentreAddr)
    {

    }

    function mint(address _to, uint256 _amount) public whenNotPaused onlyOwner canMint returns (bool) {
        _setTotalSupply(totalSupply().add(_amount));
        _setBalanceOf(_to, balanceOf(_to).add(_amount));
        Mint(_to, _amount);
        Transfer(address(0), _to, _amount);
        return true;
    }

    function startMinting() public whenNotPaused onlyOwner returns (bool) {
        mintingFinished = false;
        MintToggle(mintingFinished);
        return true;
    }

    function finishMinting() public whenNotPaused onlyOwner returns (bool) {
        mintingFinished = true;
        MintToggle(mintingFinished);
        return true;
    }

}
