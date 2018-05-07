const Token = artifacts.require('./mocks/MockLogicalToken.sol');
const DataCentre = artifacts.require('./token/DataCentre.sol');
const assertJump = require('./helpers/assertJump');
const assertRevert = require('./helpers/assertRevert');

contract('UIP1', (accounts) => {
  let token;
  let dataCentre;

  beforeEach(async () => {
    dataCentre = await DataCentre.new();
    token = await Token.new(dataCentre.address);
    await dataCentre.transferOwnership(token.address);
    await token.mint(accounts[0], 100);
  });

  it('should allow upgrading token using UIP2', async () => {

      const TOKENHOLDER_1 = accounts[0];
      const BENEFICIARY = accounts[5];
      const tokensAmount = 100;

      await token.transfer(BENEFICIARY, tokensAmount, {from: TOKENHOLDER_1});
      const tokenBalanceTransfered = await token.balanceOf.call(BENEFICIARY);

      // Begin upgrade
      await token.pause();
      const dataCentre = await DataCentre.at(await token.dataCentreAddr.call());
      const newToken = await Token.new(dataCentre.address);
      await token.kill(newToken.address);
      await dataCentre.transferOwnership(newToken.address);

      // check balances and functions after upgrade
      const tokenBalanceTransfered1 = await newToken.balanceOf.call(BENEFICIARY);      
      assert.equal(tokensAmount, tokenBalanceTransfered1.toNumber(), 'tokens not transferred');      
      await newToken.transfer(TOKENHOLDER_1, tokensAmount, {from: BENEFICIARY});
      const tokenBalanceTransfered2 = await newToken.balanceOf.call(TOKENHOLDER_1);            
      assert.equal(tokensAmount, tokenBalanceTransfered2.toNumber(), 'tokens not transferred');            
    });

    it('should not allow killing token when not paused', async () => {
      
      const dataCentre = await DataCentre.at(await token.dataCentreAddr.call());
      const newToken = await Token.new(dataCentre.address);
      try {
        await token.kill(newToken.address);
        assert.fail('should have failed before');
      } catch (error) {
        assertRevert(error)
      }
    });

})