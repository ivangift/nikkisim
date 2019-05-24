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
      return this.totalCoin >= 2500;
    } else if (this.challenge == "CLOTHES") {
      const spent = this.totalCoin - this.coin;
      return 2500 - 1240 - spent <= 0;
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
    const spent = this.totalCoin - this.coin;
    const reward = spent + this.criticalCoin;
    return `累计代币: ${this.totalCoin}, 触发暴击的代币: ${this.criticalCoin}, 得分: ${reward} `
     + (this.finished() ? `<font color='red'>游戏结束</font>` : ``);
  }

  toString() {
    return `目前代币: ${this.coin}, 黛奥比索要: ${this.ask}, 自上次暴击后给了 ${this.criticalCounter} 次`;
  }
}

class Collector {
  constructor() {
    this.idx = 0;
  }

  log(event) {
    $("#history").prepend((++this.idx) + " " + event);
  }

  reset() {
    this.idx = 0;
    $("#history").empty();
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

function onChallenge() {
  env.reset($("#challenge").val());
  refresh();
}

function onReset() {
  env.reset($("#challenge").val());
  refresh();
}

function refresh() {
  $("#rule").text(env);
  $("#give").attr("disabled", !env.canGive());
  $("#no").attr("disabled", env.finished());
  $("#reset").attr("hidden", !env.finished());
  $("#stats").html(env.stats());
  if (env.challenge == "NONE") {
    $("#progress").text("不挑战");
  } else if (env.challenge == "GREEDY") {
    $("#progress").text(`剩余可获得代币 ${2500 - env.totalCoin}`);
  } else if (env.challenge == "CLOTHES") {
    const spent = env.totalCoin - env.coin;
    $("#progress").text(`剩余可自由支配代币 ${2500 - 1240 - spent}，用完自动结束，剩余代币用于购买衣服`);
  }
}

function init() {
  $("#give").click(onGive);
  $("#no").click(onNoGive);
  $("#reset").click(onReset);
  $("#challenge").change(onChallenge);
  env.reset();
  refresh();
}

$(document).ready(function() {
  init()
});
  