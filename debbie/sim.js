class Roulette {
  // both min and max are inclusive
  constructor(min, max, prob) {
    this.min = min;
    this.max = max;
    this.prob = prob;
  }

  roll() {
    return Math.floor(Math.random() * Math.floor(this.max-this.min+1)) + this.min;
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
  constructor(name, logger) {
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
  }

  reset() {
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
    this.logger.log(`After ${moved} steps, earned ${newCoin} coins and encountered Debbie<br/>`);
  }

  canGive() {
    return this.ask <= this.coin;
  }

  decide(give) {
    if (this.step > 0) {
      // forward first
      return;
    }
    if (give && this.canGive()) {
      this.coin -= this.ask;
      if (this.critical()) {
        this.criticalCoin += this.ask;
        this.logger.log(`Give ${this.ask} coins to Debbie and get critical hit in return!<br/>`);
      } else {
        this.logger.log(`Give ${this.ask} coins to Debbie<br/>`);
      }
    } else {
      // should do nothing
      this.logger.log(`Didn't give coins to Debbie<br/>`);
    }
    this.step = this.nextStep.roll();
    this.forward();
  }

  critical() {
    this.criticalCounter ++;
    if (this.criticalCounter < 3) {
      return false;
    }
    if (Math.random() < this.criticalProb) {
      this.criticalCounter = 0;
      return true;
    }
    return false;
  }

  stats() {
    return `total coins: ${this.totalCoin}, critical coins: ${this.criticalCoin}, 
    critical rate for given coins: ${this.totalCoin - this.coin == 0 ? 0 : this.criticalCoin/(this.totalCoin - this.coin)},
    overall critical rate: ${this.criticalCoin/this.totalCoin}`;
  }

  toString() {
    return `Current coins: ${this.coin}, Debbie asks: ${this.ask}, ${this.criticalCounter} gives since last critical`;
  }
}

class Collector {
  constructor() {
    this.idx = 0;
  }

  log(stats) {
    $("#history").prepend((++this.idx) + " " + stats);
  }
}

const env = new Environment("default", new Collector());

function onGive() {
  env.decide(true);
  refresh();
}

function onNoGive() {
  env.decide(false);
  refresh();
}

function refresh() {
  $("#rule").text(env);
  $("#give").attr("disabled", !env.canGive());
  $("#stats").text(env.stats());
}

function init() {
  $("#give").click(onGive);
  $("#no").click(onNoGive);
  env.reset();
  refresh();
}

$(document).ready(function() {
  init()
});
  