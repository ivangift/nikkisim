class Item {
  constructor(id, name, type, rarity) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.rarity = rarity;
  }

  toString() {
    return this.name;
  }
}

function genItem(type, num, rarity) {
  let ret = [];
  for (let i = 0; i < num; i++) {
    const name = type + "_" + i;
    ret.push(new Item(name /* id */, name, type, rarity));
  }
  return ret;
}

class Progress {
  constructor() {
    this.pool = new Set();
    this.inventory = new Set();
    this.total = 0;
  }

  updatePool(item) {
    this.pool.add(item.id);
  }

  updateInventory(item) {
    if (this.pool.has(item.id)) {
      this.inventory.add(item.id);
      this.total ++;
    }
  }

  getPoolSize() {
    return this.pool.size;
  }

  getUniqueItems() {
    return this.inventory.size;
  }
}

class LotteryInfo extends Progress {
  constructor(lottery) {
    super();
    this.lottery = lottery;
    lottery.items.map( (item) => {this.updatePool(item)});
    this.mean = lottery.expectation(lottery.num);
    const percentile = lottery.percentile();
    for (let i in percentile) {
      if (percentile[i] >= 0.5) {
        this.median = i;
        break;
      }
    }
  }

  getMean() {
    return this.mean;
  }

  getMedian() {
    return this.median;
  }
}

class Inventory {
  constructor(roulette) {
    this.inv = {};
    this.total = new Progress();
    this.lotteries = {};
    this.types = {};
    this.roulette = roulette;

    for (let i in roulette.lotteries) {
      roulette.lotteries[i].items.map((item) => {
        if (!this.inv[item.id]) {
          this.inv[item.id] = 0;
        }
        if (!this.types[item.type]) {
          this.types[item.type] = new Progress();
        }
        this.total.updatePool(item);
        this.types[item.type].updatePool(item);
      });
      this.lotteries[roulette.lotteries[i].name] = new LotteryInfo(roulette.lotteries[i]);
    }
  }

  addItem(item) {
    this.inv[item.id]++;
    this.total.updateInventory(item)
    this.types[item.type].updateInventory(item);
    for (let i in this.lotteries) {
      this.lotteries[i].updateInventory(item);
    }
    return this.inv[item.id]==1;
  }
}
