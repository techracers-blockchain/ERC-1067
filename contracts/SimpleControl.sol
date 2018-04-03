pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./DataManager.sol";


contract SimpleControl is ERC20, DataManager {
    using SafeMath for uint;

    // not necessary to store in data centre
    bool public mintingFinished = false;

    event Mint(address indexed to, uint256 amount);
    event MintToggle(bool status);

    modifier canMint() {
        require(!mintingFinished);
        _;
    }

    function SimpleControl(address _dataCentreAddr) public
        DataManager(_dataCentreAddr) {
    }

    // public functions
    function approve(address _spender, uint256 _value) public whenNotPaused returns (bool) {
        require(msg.sender != _spender);
        _setAllowance(msg.sender, _spender, _value);
        return true;
    }

    function transfer(address _to, uint256 _value) public whenNotPaused returns (bool) {
        bytes memory empty;
        return transfer(_to, _value, empty);
    }

    function transfer(address to, uint value, bytes data) public whenNotPaused returns (bool) {
        _transfer(msg.sender, to, value, data);
        return true;
    }

    function transferFrom(address _from, address _to, uint _value) public returns (bool) {
        bytes memory empty;
        return transferFrom(_from, _to, _value, empty);
    }

    function transferFrom(address _from, address _to, uint256 _amount, bytes _data) public whenNotPaused returns (bool) {
        _setAllowance(_from, _to, allowance(_from, _to).sub(_amount));
        _transfer(_from, _to, _amount, _data);
        return true;
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

    function _transfer(address _from, address _to, uint256 _amount, bytes _data) internal {
        require(_to != address(this));
        require(_to != address(0));
        require(_amount > 0);
        require(_from != _to);
        _setBalanceOf(_from, balanceOf(_from).sub(_amount));
        _setBalanceOf(_to, balanceOf(_to).add(_amount));
        Transfer(_from, _to, _amount);
    }
}
