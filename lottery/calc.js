function init() {
  const lots = [
    new Lottery("非凡衣服", 6, 0.16),
    new Lottery("稀有衣服", 5, 0.4),
    new Lottery("非凡卡", 1, 0.027),
    new Lottery("稀有卡", 1, 0.0558)
  ];
  for (let i in lots) {
    $("#log").append(lots[i].name + ' ' + lots[i].expectation(lots[i].num) + "<br/>");
  }
  const x = new Lottery("稀有卡牌", 20, 1);
  $("#log").append(x.name + ' ' + x.expectation(x.num) + "<br/>");
  const p = x.percentile();
  for (let n = 0; n < p.length; n++) {
    $("#log").append(n + ' ' + p[n]+ "<br/>");
  }
}

$(document).ready(function () {
  init();
});
