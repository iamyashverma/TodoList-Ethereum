// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <8.10.0;

contract TodoList {
  struct listItem {
    uint id;
    string text;
    bool isCompleted;
  }

  event ItemAdded(
    uint id,
    string content,
    bool completed
  );

  event TaskCompleted(
    uint id,
    bool completed
  );

  mapping (uint => listItem ) listMap;
  uint totalCount = 0;

  function getTotalCount() public view returns (uint){
    return totalCount;
  }

  function addItem(string memory text) public {
    totalCount++;
    listMap[totalCount] = listItem(totalCount, text, false);
    emit ItemAdded(totalCount, text , false);
  }

  function getItem(uint index) public view returns (uint, string memory, bool){
    return (listMap[index].id, listMap[index].text,listMap[index].isCompleted);
  }

  function toggleCompleted(uint id) public {
    listMap[id].isCompleted = !listMap[id].isCompleted;
    emit TaskCompleted(id,listMap[id].isCompleted);
  }
}
