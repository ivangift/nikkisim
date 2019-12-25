'use strict';

const lots = [
  new Lottery("闪耀衣服", genItem("闪耀衣服", 25+5, 3), 0.025),
  new Lottery("非凡衣服", genItem("非凡衣服", 40+13, 2), 0.25),
  new Lottery("稀有衣服", genItem("稀有衣服", 39+20, 1), 0.628),
  new Lottery("闪耀卡", genItem("闪耀卡", 2, 3), 0.005),
  new Lottery("非凡卡", genItem("非凡卡", 6, 2), 0.03),
  new Lottery("稀有卡", genItem("稀有卡", 5, 1), 0.062),
];
const r = new Roulette(lots);

const e = React.createElement;

const domContainer = document.querySelector('#button_container');
const loot = document.querySelector('#loot');

const inv = new Inventory(r);

class DrawItem {
  constructor(item, isNew) {
    this.item = item;
    this.isNew = isNew;
  }
}

function doDraw(item) {
  let loots = [];
  for (let i = 0; i < item; i++) {
    const loot = r.draw();
    const isNew = inv.addItem(loot);
    loots.push(new DrawItem(loot, isNew));
  }
  ReactDOM.render(e(DrawResult, { items: loots }), loot);
  ReactDOM.render(e(SummaryCard, { inventory: inv }), summary);
}

const draw1 = e(DrawButton, { count: 1, onClick: doDraw })
const draw10 = e(DrawButton, { count: 10, onClick: doDraw })
ReactDOM.render(e(Box, { btns: [draw1, draw10] }), domContainer);
ReactDOM.render(e(SummaryCard, { inventory: inv }), summary);
