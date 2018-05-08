const ERC1067 = artifacts.require('./mocks/MockERC1067.sol');
const DataCentre = artifacts.require('./token/DataCentre.sol');
const assertJump = require('./helpers/assertJump');
const assertRevert = require('./helpers/assertRevert');

contract('ERC1067', (accounts) => {
  let token;
  let dataCentre;

  beforeEach(async () => {
    dataCentre = await DataCentre.new();
    token = await ERC1067.new(dataCentre.address);
    await dataCentre.transferOwnership(token.address);
    await token.mint(accounts[0], 100);
  });

  // only needed because of the refactor
  describe('#transfer', () => {
    it('should allow investors to transfer', async () => {

      const TOKENHOLDER_1 = accounts[0];
      const BENEFICIARY = accounts[5];
      const tokensAmount = 100;

      await token.transfer(BENEFICIARY, tokensAmount, {from: TOKENHOLDER_1});
      const tokenBalanceTransfered = await token.balanceOf.call(BENEFICIARY);
      assert.equal(tokensAmount, tokenBalanceTransfered.toNumber(), 'tokens not transferred');
    });

    it('should not allow scammer and transfer un-owned tokens', async () => {

      const TOKENHOLDER_1 = accounts[0];
      const SCAMMER = accounts[4];
      const BENEFICIARY = accounts[5];
      const tokensAmount = 100;

      try {
        await token.transfer(BENEFICIARY, tokensAmount, {from: SCAMMER});
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
        const tokenBalanceTransfered = await token.balanceOf.call(BENEFICIARY);
        assert.equal(tokenBalanceTransfered.toNumber(), 0, 'tokens not transferred');
      }
    });

    it('should not allow transfer tokens more than balance', async () => {

      const TOKENHOLDER_1 = accounts[0];
      const BENEFICIARY = accounts[5];
      const tokensAmount = 100;

      await token.transfer(BENEFICIARY, tokensAmount, {from: TOKENHOLDER_1});
      try {
        await token.transfer(TOKENHOLDER_1, tokensAmount + 10, {from: BENEFICIARY});
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
        const tokenBalanceTransfered = await token.balanceOf.call(BENEFICIARY);
        assert.equal(tokenBalanceTransfered.toNumber(), tokensAmount, 'tokens transferred');
      }
    });

    it('should not allow transfer tokens when Paused', async () => {

      await token.pause();

      const TOKENHOLDER_1 = accounts[0];
      const BENEFICIARY = accounts[5];
      const tokensAmount = 100;

      try {
        await token.transfer(BENEFICIARY, tokensAmount, {from: TOKENHOLDER_1});
        assert.fail('should have failed before');
      } catch(error) {
        assertRevert(error);
        const tokenBalanceTransfered = await token.balanceOf.call(BENEFICIARY);
        assert.equal(tokenBalanceTransfered.toNumber(), 0, 'tokens transferred');
      }
    });

    it('should not allow minting tokens when mintingFinished', async () => {

      await token.finishMinting();
      const BENEFICIARY = accounts[5];

      try {
        await token.mint(BENEFICIARY, 100);
        assert.fail('should have failed before');
      } catch(error) {
        assertRevert(error);
        const tokenBalanceTransfered = await token.balanceOf.call(BENEFICIARY);
        assert.equal(tokenBalanceTransfered.toNumber(), 0, 'tokens transferred');
      }
    });

    it('should not allow transfer tokens to self', async () => {

      const TOKENHOLDER_1 = accounts[0];
      const BENEFICIARY = accounts[5];
      const tokensAmount = 100;

      try {
        await token.transfer(BENEFICIARY, tokensAmount, {from: BENEFICIARY});
        assert.fail('should have failed before');
      } catch(error) {
        assertRevert(error);
      }
    });

    it('should not allow transfer tokens to address(0)', async () => {

      const TOKENHOLDER_1 = accounts[0];
      const BENEFICIARY = accounts[5];
      const tokensAmount = 100;

      try {
        await token.transfer('0x00', tokensAmount, {from: BENEFICIARY});
        assert.fail('should have failed before');
      } catch(error) {
        assertRevert(error);
      }
    });

    it('should not allow transfer tokens to with zero amount', async () => {

      const TOKENHOLDER_1 = accounts[0];
      const BENEFICIARY = accounts[5];
      const tokensAmount = 100;

      try {
        await token.transfer(TOKENHOLDER_1, 0, {from: BENEFICIARY});
        assert.fail('should have failed before');
      } catch(error) {
        assertRevert(error);
      }
    });
  });

  describe('#transferFrom', () => {
    it('should allow investors to approve and transferFrom', async () => {

      const TOKENHOLDER_1 = accounts[0];
      const BENEFICIARY = accounts[5];
      const tokensAmount = 100;

      await token.approve(BENEFICIARY, tokensAmount, {from: TOKENHOLDER_1});

      const tokenBalanceAllowed = await token.allowance.call(TOKENHOLDER_1, BENEFICIARY);
      assert.equal(tokenBalanceAllowed.toNumber(), tokensAmount, 'tokens not allowed');

      await token.transferFrom(TOKENHOLDER_1, BENEFICIARY, tokensAmount, {from: BENEFICIARY});
      const tokenBalanceTransfered = await token.balanceOf.call(BENEFICIARY);
      assert.equal(tokensAmount, tokenBalanceTransfered.toNumber(), 'tokens not transferred');
    });

    it('should not allow investors to approve when Paused', async () => {

      await token.pause();

      const TOKENHOLDER_1 = accounts[0];
      const BENEFICIARY = accounts[5];
      const tokensAmount = 100;

      try {
        await token.approve(BENEFICIARY, tokensAmount, {from: TOKENHOLDER_1});
        assert.fail('should have failed before');
      } catch(error) {
        assertRevert(error);
        const tokenBalanceAllowed = await token.allowance.call(TOKENHOLDER_1, BENEFICIARY);
        assert.equal(tokenBalanceAllowed.toNumber(), 0, 'tokens still allowed');
      }
    });

    it('should not allow investors to approve tokens to self', async () => {

      const TOKENHOLDER_1 = accounts[0];
      const BENEFICIARY = accounts[5];
      const tokensAmount = 100;

      try {
        await token.approve(BENEFICIARY, tokensAmount, {from: BENEFICIARY});
        assert.fail('should have failed before');
      } catch(error) {
        assertRevert(error)
        const tokenBalanceAllowed = await token.allowance.call(TOKENHOLDER_1, BENEFICIARY);
        assert.equal(tokenBalanceAllowed.toNumber(), 0, 'tokens still allowed');
      }
    });

    it('should not allow transferFrom tokens more than allowed', async () => {

      const TOKENHOLDER_1 = accounts[0];
      const BENEFICIARY = accounts[5];
      const tokensAmount = 100;

      await token.approve(BENEFICIARY, tokensAmount, {from: TOKENHOLDER_1});
      const tokenBalanceAllowed = await token.allowance.call(TOKENHOLDER_1, BENEFICIARY);
      assert.equal(tokenBalanceAllowed.toNumber(), tokensAmount, 'tokens not allowed');
      try {
        await token.transferFrom(TOKENHOLDER_1, BENEFICIARY, tokensAmount + 10, {from: BENEFICIARY});
        assert.fail('should have failed before');
      } catch(error) {
        assertJump(error);
        const tokenBalanceTransfered = await token.balanceOf.call(BENEFICIARY);
        assert.equal(tokenBalanceTransfered.toNumber(), 0, 'tokens still transferred');
      }
    });

    it('should not allow transferFrom tokens when Paused', async () => {

      const TOKENHOLDER_1 = accounts[0];
      const BENEFICIARY = accounts[5];
      const tokensAmount = 100;

      await token.pause();

      try {
        await token.transferFrom(TOKENHOLDER_1, BENEFICIARY, tokensAmount, {from: BENEFICIARY});
        assert.fail('should have failed before');
      } catch(error) {
        assertRevert(error);
        const tokenBalanceTransfered = await token.balanceOf.call(BENEFICIARY);
        assert.equal(tokenBalanceTransfered.toNumber(), 0, 'tokens still transferred');
      }
    });

    it('should not allow scammers to approve un-owned tokens', async () => {

      const TOKENHOLDER_1 = accounts[0];
      const BENEFICIARY = accounts[5];
      const SCAMMER = accounts[4];
      const tokensAmount = 100;

      try {
        await token.approve(BENEFICIARY, tokensAmount, {from: SCAMMER});
        assert.fail('should have failed before');
      } catch(error) {
        assertRevert(error);
        const tokenBalanceAllowed = await token.allowance.call(TOKENHOLDER_1, BENEFICIARY);
        assert.equal(tokenBalanceAllowed.toNumber(), 0, 'tokens still transferred');
      }
    });
  });
})
