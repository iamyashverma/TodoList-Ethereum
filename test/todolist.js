const { expect } = require('chai');

const TodoList = artifacts.require('./TodoList.sol');

require('chai').use(require('chai-as-promised')).should();

contract('TodoList', ([deployer, user]) => {
  let todoList;

  beforeEach(async () => {
    todoList = await TodoList.new();
  });

  describe('TodoList', async () => {
    it('checking ListSize to be 0', async () => {
      expect(Number(await todoList.getTotalCount())).to.eq(0);
    });

    it('should add to the list', async () => {
      await todoList.addItem('task1', { from: deployer });
      const TC = Number(await todoList.getTotalCount());
      expect(TC).to.eq(1);
      const item = await todoList.getItem(TC, { from: deployer });
      expect(Number(item[0])).to.eq(1);
      expect(item[1]).to.be.eq('task1');
      expect(item[2]).to.eq(false);
    });

    it('should toggle isCompleted ', async () => {
      await todoList.addItem('task1', { from: deployer });
      const TC = Number(await todoList.getTotalCount());
      expect(TC).to.eq(1);
      const item = await todoList.getItem(TC, { from: deployer });
      expect(Number(item[0])).to.eq(1);
      expect(item[1]).to.be.eq('task1');
      expect(item[2]).to.eq(false);
      await todoList.toggleCompleted(TC, { from: deployer });
      const completedItem = await todoList.getItem(TC, { from: deployer });
      expect(completedItem[2]).to.eq(true);
    });
  });
});
