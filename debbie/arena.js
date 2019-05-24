const _template = `// coins: 现有代币
// ask: 黛奥比索要代币数
// gives: 自从上次暴击后已经给过多少次
// potential: 剩余可获得代币
// quota: 剩余可自由支配代币
return false;
`;

const _preset = {
  'Template': _template,
  'Test1': `if (coins > 40) return true;
if (gives <= 20) {
  return ask < 20;
}
return true;
  `,
  'Test2': `return true;`,
}

class NoopCollector {
  log(event) {}
  reset() {}
}

const env = new Environment("default", new NoopCollector());

function noop() {
  return false;
}

function genAgent() {
  return new Function("coins", "ask", "gives", "potential", "quota", $("#agentScript").val());
}

function stats(scores) {
  let total = 0;
  let max = 0;
  let min = 1e99;
  scores.forEach(e => {
    total += e;
    if (e > max) {
      max = e;
    }
    if (e < min) {
      min = e;
    }
  });
  const avg = total / scores.length;
  let std = 0;
  scores.forEach(e => {
    std += (e - avg) * (e - avg);
  });
  std /= scores.length;
  std = Math.sqrt(std);
  return {
    'Average': avg,
    'Max': max,
    'Min': min,
    'Std dev': std
  };
}

function doBenchmark(f) {
  let scores = [];
  for (let i = 0; i < 1000; i++) {
    env.reset($("#challenge").val());
    while (!env.finished()) {
      if (!env.canGive()) {
        env.decide(false);
      } else {
        env.decide(f(env.coin, env.ask, env.criticalCounter, env.potential(), env.quota()));
      }
    }
    scores.push(env.score());
  }
  $("#stats").text(JSON.stringify(stats(scores)));
}

function onRun() {
  $("#error").empty();
  try {
    const f = genAgent();
    doBenchmark(f);
  } catch (e) {
    $("#error").text(e);
  }
}

function onPreset() {
  $("#agentScript").val(_preset[$("#preset").val()]);
}

function init() {
  $("#agentScript").text(_template);
  $("#run").click(onRun);
  for (let key in _preset) {
    $("#preset").append($('<option />')
      .text(key)
      .val(key)
    )
  }
  $("#preset").change(onPreset);
}

$(document).ready(function () {
  init()
});
