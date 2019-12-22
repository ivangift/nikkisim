class Item {
  constructor(name, category) {
    this.name = name;
    this.category = category;
  }

  toString() {
    return this.name;
  }
}

function genItem(name, num) {
  let ret = [];
  for (let i = 0; i < num; i++) {
    ret.push(new Item(name + "_" + i, name));
  }
  return ret;
}

function init() {
  const lots = [
    new Lottery("非凡衣服", genItem("非凡衣服", 6), 0.16),
    new Lottery("稀有衣服", genItem("稀有衣服", 5), 0.4),
    new Lottery("非凡卡", genItem("非凡卡", 5), 0.027),
    new Lottery("稀有卡", genItem("稀有卡", 5), 0.0558)
  ];
  let r = new Roulette(lots);
  for (let i in lots) {
    $("#log").append(lots[i].name + ' ' + lots[i].expectation(lots[i].num) + "<br/>");
  }
  let inv = {};
  for (let i = 0; i < 400; i++) {
    const loot = r.draw();
    if (inv[loot.category]) {
      inv[loot.category].add(loot);
    } else {
      inv[loot.category] = new Set([loot]);
    }
    $("#log").append(i + "&nbsp;" + loot + "&nbsp;");
    for (let i in inv) {
      $("#log").append(i + ":" + inv[i].size + "&nbsp;");
    }
    $("#log").append("<br/>");
  }
}

$(document).ready(function () {
  init();
});
