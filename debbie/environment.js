class Roulette {
  // both min and max are inclusive
  constructor(min, max, prob) {
    this.min = min;
    this.max = max;
    this.prob = prob;
  }

  roll() {
    return Math.floor(Math.random() * Math.floor(this.max - this.min + 1)) + this.min;
  }
}

class RoundRobin {
  constructor(roulettes) {
    this.roulettes = roulettes;
    this.sum = 0;
    roulettes.forEach(r => {
      this.sum += r.prob;
    });
  }

  roll() {
    let result = Math.floor(Math.random() * this.sum);
    for (let i in this.roulettes) {
      if (this.roulettes[i].prob > result) {
        return this.roulettes[i].roll();
      }
      result -= this.roulettes[i].prob;
    }
  }
}

class Environment {
  constructor(name, logger, coinCap, clothesPrice) {
    this.name = name;
    this.logger = logger;
    this.nextAsk = new RoundRobin(
      [
        new Roulette(6, 20, 50),
        new Roulette(21, 30, 40),
        new Roulette(31, 50, 10),
      ]
    );
    this.nextStep = new Roulette(5, 10, 1);
    this.criticalProb = 0.45;
    this.coinPerStep = 2; // average case
    this.coinCap = coinCap || 2500;
    this.clothesPrice = clothesPrice || 1240;
  }

  reset(challenge) {
    this.logger.reset();
    this.challenge = challenge;
    this.step = this.nextStep.roll();
    this.coin = 0;
    this.reward = 0;
    this.criticalCounter = 0;
    this.totalCoin = 0;
    this.criticalCoin = 0;
    this.forward();
  }

  forward() {
    const newCoin = this.step * this.coinPerStep;
    const moved = this.step;
    this.coin += newCoin;
    this.totalCoin += newCoin;
    this.step = 0;
    this.ask = this.nextAsk.roll();
    this.logger.log(`<font color='grey'>过了 ${moved} 关, 得到 ${newCoin} 个代币后遇到了黛奥比</font><br/>`);
  }

  canGive() {
    return !this.finished() && this.ask <= this.coin;
  }

  finished() {
    if (this.challenge == "NONE") {
      return false;
    } else if (this.challenge == "GREEDY") {
      return this.potential() < 0;
    } else if (this.challenge == "CLOTHES") {
      const spent = this.totalCoin - this.coin;
      return this.potential() < 0 || (this.quota() <= 0);
    }
  }

  decide(give) {
    if (this.step > 0) {
      // forward first
      return;
    }
    if (give && this.canGive()) {
      this.coin -= this.ask;
      const gives = this.criticalCounter + 1;
      if (this.critical()) {
        this.criticalCoin += this.ask;
        this.logger.log(`<b>给了 ${this.ask} 代币 (自上次暴击后共 ${gives} 次) 得到了 <font color='red'>暴击</font> 收益!<b><br/>`);
      } else {
        this.logger.log(`给了 ${this.ask} 代币<br/>`);
      }
    } else {
      // should do nothing
      this.logger.log(`没给<br/>`);
    }
    this.step = this.nextStep.roll();
    this.forward();
  }

  critical() {
    this.criticalCounter++;
    if (this.criticalCounter < 3) {
      return false;
    }
    if (Math.random() < this.criticalProb) {
      this.criticalCounter = 0;
      return true;
    }
    return false;
  }

  score() {
    const spent = this.totalCoin - this.coin;
    return spent + this.criticalCoin;
  }

  potential() {
    return this.coinCap - this.totalCoin;
  }

  quota() {
    const spent = this.totalCoin - this.coin;
    return this.coinCap - this.clothesPrice - spent;
  }

  stats() {
    const reward = this.score();
    return `累计代币: ${this.totalCoin}, 触发暴击的代币: ${this.criticalCoin}, 得分: ${reward} `
      + (this.finished() ? `<font color='red'>游戏结束</font>` : ``);
  }

  toString() {
    return `目前代币: ${this.coin}, 黛奥比索要: ${this.ask}, 自上次暴击后给了 ${this.criticalCounter} 次`;
  }
}
