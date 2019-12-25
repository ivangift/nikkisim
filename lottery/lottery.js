class Lottery {
  /**
   * @param {string} name of the pool
   * @param {Array} items in the pool
   * @param {number} prob that the pool to be drawn
   */
  constructor(name, items, prob) {
    this.name = name;
    this.items = items;
    this.num = items.length;
    this.prob = prob;
  }

  /**
   * Randomly draw an item from pool
   * @return the index of drawn item, starting from 0 
   */
  draw() {
    return this.items[Math.floor(Math.random() * this.num)];
  }

  /**
   * @return the expected rounds to draw to collect {@link collected} items
   */
  expectation(collected) {
    if (collected > this.num) {
      collected = this.num;
    }
    let e = 0;
    for (let i = 0; i < collected; i++) {
      e += (this.num / this.prob) * (1.0 / (this.num - i));
    }
    return e;
  }

  /**
   * Calculates the percentile when draw n rounds to collect all items.
   * @return an array, a[n] means the population that have collected all items after n draws
   */
  percentile() {
    let ret = [];
    let p = new Array(this.num + 1);
    p.fill(0);
    p[0] = 1.0;
    ret.push(p[this.num]);
    while (p[this.num] < 0.999) {
      for (let i = this.num; i >= 0; i--) {
        const getNothing = p[i] * (1 - this.newProb(i));
        const getNew = i > 0 ? p[i-1] * this.newProb(i - 1) : 0;
        p[i] = getNothing + getNew;
      }
      ret.push(p[this.num]);
    }
    return ret;
  }

  /** @return the probabilty to draw a new item given i already collected ones */
  newProb(i) {
    return this.prob * (1 - 1.0 * i / this.num);
  }

  toString() {
    return '(' + this.name + ', ' + this.y + ')';
  }
}

class Roulette {
  /**
   * @param {Lottery[]} lotteries to draw
   */
  constructor(lotteries) {
    this.name = name;
    this.lotteries = lotteries;
    this.prob = 0;
    lotteries.forEach(v => {this.prob += v.prob});
  }

  // naive selection, for more sophisticate solutions please see http://www.keithschwarz.com/darts-dice-coins/
  draw() {
    let p = Math.random() * this.prob;
    for (let i in this.lotteries) {
      if (p < this.lotteries[i].prob) {
        return this.lotteries[i].draw();
      }
      p -= this.lotteries[i].prob;
    }
  }
}
