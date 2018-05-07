module.exports = function(error) {
  assert.isAbove(error.message.search('revert'), -1, 'Revert opcode must be returned');
}
