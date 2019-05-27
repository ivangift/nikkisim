const _template = `// coins: 现有代币
// ask: 黛奥比索要代币数
// gives: 自从上次暴击后已经给过多少次
// potential: 剩余可获得代币
// quota: 剩余可自由支配代币，不收集衣服的时候没用
// return true|false，表示给或者不给
return false;
`;

const _preset = {
  'Template': _template,
  'IP不收集衣服': `if (coins * 3 > potential) return true;
if (gives < 2) {
  return ask < 30;
}
return ask >= 20;
  `,
  'IP收集衣服': `if (coins * 3 > potential && coins*1.3 < quota) return true;
if (gives < 2) {
  return ask < 25;
}
return ask >= 25;  
  `,
  '盲目': `return true;`,
}

const USER_SCRIPT = "userScript";

class NoopCollector {
  log(event) { }
  reset() { }
}

const env = new Environment("default", new NoopCollector());

function noop() {
  return false;
}

function genAgent() {
  return new Function("coins", "ask", "gives", "potential", "quota", $("#agentScript").val());
}

const numFormat = new Intl.NumberFormat("en-US", { useGrouping: false, maximumFractionDigits: 3 });

function stats(scores) {
  let total = 0;
  let max = 0;
  let min = 1e99;
  let square = 0;
  scores.forEach(e => {
    total += e;
    square += e * e;
    if (e > max) {
      max = e;
    }
    if (e < min) {
      min = e;
    }
  });
  const avg = total / scores.length;
  const stdev = Math.sqrt(square / scores.length - avg * avg);

  return `Average: ${numFormat.format(avg)}&#177;${numFormat.format(stdev)}<br/>
    'Max': ${max}<br/>
    'Min': ${min}<br/>`
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
  $("#stats").html(stats(scores));
}

function onRun() {
  $("#error").empty();
  try {
    const f = genAgent();
    doBenchmark(f);
  } catch (e) {
    $("#error").text(e);
  }
  if ($("#preset").val() == USER_SCRIPT || !localStorage.userScript) {
    localStorage.userScript = $("#agentScript").val();
  }
}

function onPreset() {
  const option = $("#preset").val();
  if (option == USER_SCRIPT) {
    $("#agentScript").val(localStorage.userScript);
  } else {
    $("#agentScript").val(_preset[option]);
  }
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
  if (localStorage.userScript) {
    $("#preset").append($('<option />')
      .text("用户自定义")
      .val(USER_SCRIPT)
      .attr('selected', 'selected'));
  }
  onPreset();
  $("#preset").change(onPreset);
}

$(document).ready(function () {
  init()
});
