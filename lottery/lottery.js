class Lottery {
  /**
   * @param {string} name of the pool
   * @param {number} num of items in the pool
   * @param {number} prob that the pool to be drawn
   */
  constructor(name, num, prob) {
    this.name = name;
    this.num = num;
    this.prob = prob;
  }

  /**
   * Randomly draw an item from pool
   * @return the index of drawn item, starting from 0 
   */
  draw() {
    return Math.floor(Math.random() * this.num);
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

  // returns the probabilty to draw a new item given i already collected ones
  newProb(i) {
    return this.prob * (1 - 1.0 * i / this.num);
  }

  toString() {
    return '(' + this.name + ', ' + this.y + ')';
  }
}

class Simulator {
  /**
   * @param {List} lotteries the list of Lottery
   */
  constructor(lotteries) {
    this.lotteries = lotteries;
  }
}