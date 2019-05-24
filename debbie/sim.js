
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
    $("#progress").text(`剩余可获得代币 ${env.potential()}`);
  } else if (env.challenge == "CLOTHES") {
    const spent = env.totalCoin - env.coin;
    $("#progress").text(`剩余可自由支配代币 ${env.quota()}，用完自动结束，剩余代币用于购买衣服`);
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
  