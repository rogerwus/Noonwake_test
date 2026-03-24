(function () {
  "use strict";

  var MAX_RESOURCE = 120;
  var HOUR_OPTIONS = [
    { value: 23, label: "子时", range: "23:00-01:00" },
    { value: 1, label: "丑时", range: "01:00-03:00" },
    { value: 3, label: "寅时", range: "03:00-05:00" },
    { value: 5, label: "卯时", range: "05:00-07:00" },
    { value: 7, label: "辰时", range: "07:00-09:00" },
    { value: 9, label: "巳时", range: "09:00-11:00" },
    { value: 11, label: "午时", range: "11:00-13:00" },
    { value: 13, label: "未时", range: "13:00-15:00" },
    { value: 15, label: "申时", range: "15:00-17:00" },
    { value: 17, label: "酉时", range: "17:00-19:00" },
    { value: 19, label: "戌时", range: "19:00-21:00" },
    { value: 21, label: "亥时", range: "21:00-23:00" }
  ];
  var STEP_CONFIG = [
    { key: "year", title: "选择出生年", description: "年代越早，故事感越重；年代越近，节奏越锐。" },
    { key: "month", title: "选择出生月", description: "月份决定你的入局季节，也影响命盘气候。" },
    { key: "day", title: "选择出生日", description: "这一格决定日主，是整局副本的核心身份。" },
    { key: "hour", title: "选择出生时", description: "最后补全时柱，让命格真正落地。" }
  ];
  var ELEMENT_LABELS = {
    木: "木命势",
    火: "火命势",
    土: "土命势",
    金: "金命势",
    水: "水命势"
  };
  var ELEMENT_COLORS = {
    木: "#69df94",
    火: "#ff7870",
    土: "#f4c85b",
    金: "#e9f1ff",
    水: "#79c7ff"
  };
  var STAT_ORDER = ["HP", "ATK", "DEF", "INT", "CHA", "LUK"];
  var appState = {
    ritual: { year: null, month: null, day: null, hour: null },
    stepIndex: 0,
    result: null,
    run: null
  };

  var screens = {
    intro: document.getElementById("screen-intro"),
    ritual: document.getElementById("screen-ritual"),
    reveal: document.getElementById("screen-reveal"),
    run: document.getElementById("screen-run"),
    ending: document.getElementById("screen-ending")
  };
  var slotNodes = {
    year: document.getElementById("slot-year"),
    month: document.getElementById("slot-month"),
    day: document.getElementById("slot-day"),
    hour: document.getElementById("slot-hour")
  };
  var ritualOptions = document.getElementById("ritual-options");
  var stepCounter = document.getElementById("step-counter");
  var stepTitle = document.getElementById("step-title");
  var stepDescription = document.getElementById("step-description");
  var summonButton = document.getElementById("summon-button");
  var backButton = document.getElementById("back-button");
  var nextNodeButton = document.getElementById("next-node-button");
  var feedbackBox = document.getElementById("feedback-box");
  var floatingDelta = document.getElementById("floating-delta");
  var choiceList = document.getElementById("choice-list");

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function screenList() {
    return Object.keys(screens).map(function (key) {
      return screens[key];
    });
  }

  function setScreen(name) {
    screenList().forEach(function (screen) {
      var active = screen.id === "screen-" + name;
      screen.classList.toggle("screen-active", active);
      screen.setAttribute("aria-hidden", active ? "false" : "true");
    });
    document.getElementById("app").setAttribute("data-screen", name);
  }

  function formatSlotValue(slot) {
    if (!appState.ritual[slot]) {
      return "未定";
    }
    if (slot === "year") {
      return appState.ritual.year + "年";
    }
    if (slot === "month") {
      return appState.ritual.month + "月";
    }
    if (slot === "day") {
      return appState.ritual.day + "日";
    }
    return getHourOption(appState.ritual.hour).label;
  }

  function getHourOption(hourValue) {
    return HOUR_OPTIONS.filter(function (option) {
      return option.value === hourValue;
    })[0];
  }

  function validDayCount(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function updateSlots() {
    Object.keys(slotNodes).forEach(function (slot) {
      slotNodes[slot].textContent = formatSlotValue(slot);
    });
    document.querySelectorAll(".ritual-slot").forEach(function (button) {
      button.classList.toggle("active", button.getAttribute("data-slot") === STEP_CONFIG[appState.stepIndex].key);
    });
    summonButton.disabled = !appState.ritual.year || !appState.ritual.month || !appState.ritual.day || appState.ritual.hour === null;
    backButton.disabled = appState.stepIndex === 0;
  }

  function currentOptions() {
    var step = STEP_CONFIG[appState.stepIndex].key;
    var items = [];
    var year;
    var month;
    var dayCount;
    if (step === "year") {
      for (year = 2026; year >= 1950; year -= 1) {
        items.push({ value: year, label: String(year), sublabel: year < 1980 ? "旧世命格" : year < 2000 ? "转折世代" : "新潮命格" });
      }
    } else if (step === "month") {
      for (month = 1; month <= 12; month += 1) {
        items.push({ value: month, label: month + "月", sublabel: "第 " + month + " 月令" });
      }
    } else if (step === "day") {
      dayCount = validDayCount(appState.ritual.year || 2000, appState.ritual.month || 1);
      for (year = 1; year <= dayCount; year += 1) {
        items.push({ value: year, label: year + "日", sublabel: "命盘刻印" });
      }
    } else {
      items = HOUR_OPTIONS.map(function (option) {
        return { value: option.value, label: option.label, sublabel: option.range };
      });
    }
    return items;
  }

  function renderRitualOptions() {
    var config = STEP_CONFIG[appState.stepIndex];
    stepCounter.textContent = "第 " + (appState.stepIndex + 1) + " 步 / 4";
    stepTitle.textContent = config.title;
    stepDescription.textContent = config.description;
    ritualOptions.innerHTML = currentOptions().map(function (item) {
      var selected = appState.ritual[config.key] === item.value;
      return (
        '<button class="ritual-chip' + (selected ? " selected" : "") + '" type="button" data-value="' + item.value + '">' +
          "<strong>" + item.label + "</strong>" +
          "<small>" + item.sublabel + "</small>" +
        "</button>"
      );
    }).join("");
    updateSlots();
  }

  function resetRitual() {
    appState.ritual = { year: null, month: null, day: null, hour: null };
    appState.stepIndex = 0;
    renderRitualOptions();
  }

  function autoFixDay() {
    if (!appState.ritual.year || !appState.ritual.month || !appState.ritual.day) {
      return;
    }
    var maxDay = validDayCount(appState.ritual.year, appState.ritual.month);
    if (appState.ritual.day > maxDay) {
      appState.ritual.day = maxDay;
    }
  }

  function selectRitualValue(value) {
    var key = STEP_CONFIG[appState.stepIndex].key;
    appState.ritual[key] = value;
    if (key === "year" || key === "month") {
      autoFixDay();
    }
    if (appState.stepIndex < STEP_CONFIG.length - 1) {
      appState.stepIndex += 1;
    }
    renderRitualOptions();
  }

  function getUnlockedSkills(result) {
    return result.skillTree.filter(function (skill) {
      return skill.unlocked;
    });
  }

  function firstTrait(result) {
    var unlocked = getUnlockedSkills(result);
    return unlocked.length ? unlocked[0].meta.name : "谨慎求生";
  }

  function renderStatCards(targetId, stats) {
    document.getElementById(targetId).innerHTML = STAT_ORDER.map(function (key) {
      return '<div class="stat-card"><span>' + key + '</span><strong>' + stats[key] + "</strong></div>";
    }).join("");
  }

  function buildRevealCopy(result) {
    var strengthText = result.strength.status === "身强" ? "适合主动破局" : result.strength.status === "身弱" ? "适合借势发育" : "攻守转换灵活";
    return "日主为" + result.dayMaster.stem + result.dayMaster.element + "，" + result.classInfo.className + "已显形。喜用偏向" + result.usefulGods.join("、") + "，忌神为" + result.tabooGod + "，本局更适合" + strengthText + "。";
  }

  function showReveal(result) {
    var pillars = result.pillars.year.stem + result.pillars.year.branch + " · " + result.pillars.month.stem + result.pillars.month.branch + " · " + result.pillars.day.stem + result.pillars.day.branch + " · " + result.pillars.hour.stem + result.pillars.hour.branch;
    var unlocked = getUnlockedSkills(result);
    var primarySkill = unlocked.length ? unlocked[0].meta.name : "命数未显";
    document.getElementById("reveal-element").textContent = result.dayMaster.element;
    document.getElementById("reveal-element").style.color = ELEMENT_COLORS[result.dayMaster.element];
    document.getElementById("reveal-class").textContent = result.classInfo.className;
    document.getElementById("reveal-class").style.color = result.classInfo.color;
    document.getElementById("reveal-en").textContent = result.classInfo.classEn;
    document.getElementById("reveal-pillars").textContent = pillars;
    document.getElementById("reveal-summary").textContent = buildRevealCopy(result);
    document.getElementById("reveal-daymaster").textContent = result.dayMaster.stem + result.dayMaster.element + " · " + result.dayMaster.yinYang;
    document.getElementById("reveal-useful").textContent = result.usefulGods.join(" / ");
    document.getElementById("reveal-taboo").textContent = result.tabooGod;
    document.getElementById("reveal-skill").textContent = primarySkill;
    renderStatCards("reveal-stats", result.stats);
    setScreen("reveal");
  }

  function makeRunState(result) {
    return {
      nodeIndex: 0,
      selectedChoice: null,
      log: [],
      title: "",
      stats: {
        HP: result.stats.HP,
        ATK: result.stats.ATK,
        DEF: result.stats.DEF,
        INT: result.stats.INT,
        CHA: result.stats.CHA,
        LUK: result.stats.LUK
      },
      resources: {
        hp: clamp(result.resources.hp, 20, MAX_RESOURCE),
        mp: clamp(result.resources.mp, 10, MAX_RESOURCE),
        fortune: clamp(38 + Math.round(result.stats.LUK / 2) + result.usefulGods.length * 4, 0, MAX_RESOURCE)
      },
      traits: {
        className: result.classInfo.className,
        useful: result.usefulGods.slice(),
        taboo: result.tabooGod,
        primarySkill: firstTrait(result),
        strength: result.strength.status
      }
    };
  }

  function hasUseful(runState, element) {
    return runState.traits.useful.indexOf(element) >= 0;
  }

  function classMatches(runState, keyword) {
    return runState.traits.className.indexOf(keyword) >= 0;
  }

  function deltaPack(base, bonus, alt) {
    var output = {
      hp: base.hp || 0,
      mp: base.mp || 0,
      fortune: base.fortune || 0,
      ATK: base.ATK || 0,
      DEF: base.DEF || 0,
      INT: base.INT || 0,
      CHA: base.CHA || 0,
      LUK: base.LUK || 0,
      HP: base.HP || 0
    };
    if (bonus && bonus.test()) {
      Object.keys(bonus.delta).forEach(function (key) {
        output[key] = (output[key] || 0) + bonus.delta[key];
      });
      output._bonusText = bonus.text;
    } else if (alt) {
      Object.keys(alt.delta).forEach(function (key) {
        output[key] = (output[key] || 0) + alt.delta[key];
      });
      output._bonusText = alt.text;
    }
    return output;
  }

  function makeEvents(result) {
    var seedClass = result.classInfo.className;
    var dayElement = result.dayMaster.element;
    return [
      {
        stage: "启程",
        title: "家庭环境",
        text: "你的副本从最初的家庭底色开始。有人守成，有人放养，有人被迫很早学会自己作决定。",
        seedHint: "命格起点",
        choices: [
          {
            title: "守规矩，先稳住根基",
            text: "接受家中安排，优先积累稳定度。",
            effect: function (runState) {
              return {
                delta: deltaPack({ hp: 10, DEF: 8, CHA: -2 }, {
                  test: function () { return runState.traits.strength !== "身强"; },
                  delta: { fortune: 8, mp: 4 },
                  text: "身弱或中和命格更吃稳扎稳打。"
                }),
                feedback: "你先学会不乱挥刀，根基厚了，后面的风浪就没那么可怕。"
              };
            }
          },
          {
            title: "提前出走，自己闯",
            text: "更快接触世界，但代价是资源波动。",
            effect: function (runState) {
              return {
                delta: deltaPack({ ATK: 8, LUK: 6, hp: -8 }, {
                  test: function () { return classMatches(runState, "游侠") || classMatches(runState, "刺客"); },
                  delta: { fortune: 10, CHA: 4 },
                  text: seedClass + "天生更适合离开安全区。"
                }, {
                  delta: { mp: -4 },
                  text: "你的命格并不擅长孤身硬闯。"
                }),
                feedback: "你把门推开了。前路更乱，但视野也真正打开。"
              };
            }
          },
          {
            title: "在夹缝里读书自救",
            text: "把情绪压进纸页里，慢慢攒出第二条路。",
            effect: function (runState) {
              return {
                delta: deltaPack({ INT: 10, mp: 8, hp: -4 }, {
                  test: function () { return hasUseful(runState, "水") || classMatches(runState, "谋士"); },
                  delta: { fortune: 8, CHA: 3 },
                  text: "水势与谋略命格对学习路线有额外收益。"
                }),
                feedback: "你没有立刻反抗，而是用知识偷偷改写了起跑线。"
              };
            }
          }
        ]
      },
      {
        stage: "学业分岔",
        title: "学业分岔",
        text: "少年阶段的第一道真正岔路出现了。你是卷到底，偏科突刺，还是早早去接触现实？",
        seedHint: "看 INT / MP / 喜用",
        choices: [
          {
            title: "闭关苦读",
            text: "牺牲社交，换取稳定成长。",
            effect: function (runState) {
              return {
                delta: deltaPack({ INT: 12, mp: 10, CHA: -5 }, {
                  test: function () { return runState.stats.INT >= 70; },
                  delta: { fortune: 8, LUK: 4 },
                  text: "高悟性让你读书不是内耗，而是滚雪球。"
                }),
                feedback: "你把时间压成墨色，成绩成为最早能看见的护城河。"
              };
            }
          },
          {
            title: "参加竞赛与社团",
            text: "多线并进，搏一个破圈机会。",
            effect: function (runState) {
              return {
                delta: deltaPack({ CHA: 8, INT: 6, fortune: 6 }, {
                  test: function () { return runState.stats.CHA >= 65; },
                  delta: { mp: 6, LUK: 4 },
                  text: "高魅力角色在复杂场域里更容易被记住。"
                }),
                feedback: "你开始被更多人看见，履历不再只是分数。"
              };
            }
          },
          {
            title: "先去社会打工",
            text: "少一点理论，多一点生存经验。",
            effect: function (runState) {
              return {
                delta: deltaPack({ ATK: 7, DEF: 6, hp: -6, fortune: 10 }, {
                  test: function () { return hasUseful(runState, "土") || hasUseful(runState, "金"); },
                  delta: { CHA: 4, LUK: 4 },
                  text: "土金命格进入现实世界后更快形成秩序感。"
                }),
                feedback: "你很早就碰到了真实世界的硬边角，但也更早知道钱从哪里来。"
              };
            }
          }
        ]
      },
      {
        stage: "社交试炼",
        title: "社交试炼",
        text: "一群人围上来。有人要结盟，有人要竞争，有人只想看看你会不会慌。",
        seedHint: "看 CHA / DEF / 命格职业",
        choices: [
          {
            title: "主动结盟",
            text: "先给出善意，换一个关系网络。",
            effect: function (runState) {
              return {
                delta: deltaPack({ CHA: 10, fortune: 8 }, {
                  test: function () { return runState.stats.CHA >= 68 || classMatches(runState, "战法"); },
                  delta: { hp: 6, mp: 4 },
                  text: "你的气场适合在众人之间发光。"
                }),
                feedback: "你学会了不是所有胜利都要靠单挑，有些局需要朋友。"
              };
            }
          },
          {
            title: "只和强者来往",
            text: "精准投资人脉，也更容易承受压力。",
            effect: function (runState) {
              return {
                delta: deltaPack({ LUK: 8, ATK: 6, hp: -5 }, {
                  test: function () { return runState.stats.DEF >= 60; },
                  delta: { fortune: 10, CHA: 3 },
                  text: "防线足够厚时，你能扛住高质量圈层的筛选。"
                }),
                feedback: "你把社交当成资源配置，回报更大，代价也更直接。"
              };
            }
          },
          {
            title: "先沉默观察",
            text: "用信息差替代热场能力。",
            effect: function (runState) {
              return {
                delta: deltaPack({ INT: 8, mp: 6 }, {
                  test: function () { return classMatches(runState, "谋士") || hasUseful(runState, "水"); },
                  delta: { fortune: 8, DEF: 5 },
                  text: "静观其变本来就是你的天赋位。"
                }),
                feedback: "你没有立刻发声，却在别人暴露底牌时先拿到了地图。"
              };
            }
          }
        ]
      },
      {
        stage: "天赋觉醒",
        title: "天赋觉醒",
        text: "某个关键时刻，你第一次意识到自己真正擅长的，不是别人为你写好的剧本。",
        seedHint: "绑定已解锁技能",
        choices: [
          {
            title: "沿着命格天赋深挖",
            text: "把先天气质直接做成主职业。",
            effect: function (runState) {
              return {
                delta: deltaPack({ mp: 8, fortune: 8 }, {
                  test: function () { return getUnlockedSkills(result).length >= 4; },
                  delta: { INT: 8, CHA: 6, LUK: 4 },
                  text: "技能树解锁多，专精路线的收益更高。"
                }, {
                  delta: { ATK: 5, DEF: 5 },
                  text: "技能未成体系，只能先补基础盘。"
                }),
                feedback: "你终于不再只问该做什么，而开始问什么最像自己。"
              };
            }
          },
          {
            title: "补短板，逆天改命",
            text: "专门练你最缺的那一项。",
            effect: function (runState) {
              var lowStat = STAT_ORDER.reduce(function (best, key) {
                return runState.stats[key] < runState.stats[best] ? key : best;
              }, "HP");
              var base = { hp: 4, mp: 4, fortune: 6 };
              base[lowStat] = 12;
              return {
                delta: base,
                feedback: "你没有继续放大长板，而是把最短的那块木板狠狠补了一截。"
              };
            }
          },
          {
            title: "把天赋变现",
            text: "不追纯粹，先换现实收益。",
            effect: function (runState) {
              return {
                delta: deltaPack({ fortune: 14, CHA: 6, mp: -4 }, {
                  test: function () { return hasUseful(runState, "火") || hasUseful(runState, "金"); },
                  delta: { ATK: 6, LUK: 4 },
                  text: "火金路线更容易把天赋打磨成可交易价值。"
                }),
                feedback: "你第一次用自己的长处换到真金白银，也从此更难装作不在乎结果。"
              };
            }
          }
        ]
      },
      {
        stage: "感情诱因",
        title: "感情诱因",
        text: "有人闯进你的节奏里。是并肩、试探，还是彻底回避？",
        seedHint: "看 CHA / LUK / 身强身弱",
        choices: [
          {
            title: "认真投入一段关系",
            text: "把情感当成共同成长。",
            effect: function (runState) {
              return {
                delta: deltaPack({ hp: 10, CHA: 8 }, {
                  test: function () { return runState.stats.CHA >= 65 && runState.resources.hp >= 55; },
                  delta: { fortune: 12, mp: 4 },
                  text: "当你有余力付出时，关系会成为增幅器。"
                }, {
                  delta: { hp: -6 },
                  text: "状态不稳时，投入会先拉扯你的体力。"
                }),
                feedback: "你选择相信陪伴的价值，这让你更柔软，也更容易受伤。"
              };
            }
          },
          {
            title: "保持暧昧，不给承诺",
            text: "享受情绪流动，但不被绑定。",
            effect: function (runState) {
              return {
                delta: deltaPack({ LUK: 8, CHA: 6, fortune: 6 }, {
                  test: function () { return runState.stats.LUK >= 70; },
                  delta: { hp: 6, ATK: 4 },
                  text: "运势高时，你总能踩在风险边缘却不掉下去。"
                }, {
                  delta: { hp: -8, mp: -4 },
                  text: "运势不够，拖延会转化成内耗。"
                }),
                feedback: "你把关系保持在摇摆态，短期轻盈，长期则全靠命势撑着。"
              };
            }
          },
          {
            title: "暂时封印情感线",
            text: "把精力继续投给主线成长。",
            effect: function (runState) {
              return {
                delta: deltaPack({ INT: 8, DEF: 6, mp: 8 }, {
                  test: function () { return classMatches(runState, "守护") || classMatches(runState, "谋士"); },
                  delta: { fortune: 8, hp: 4 },
                  text: "你的命格对延迟满足有天然加成。"
                }),
                feedback: "你没有立刻回应心动，而是把感情线压后，换来主线更稳定的推进。"
              };
            }
          }
        ]
      },
      {
        stage: "财富机会",
        title: "财富机会",
        text: "一个看上去真的能改变生活的钱机会来了。赌一把，慢慢做，还是直接避开？",
        seedHint: "看 LUK / INT / 喜用与忌神",
        choices: [
          {
            title: "稳健经营",
            text: "走长线，小利滚成厚利。",
            effect: function (runState) {
              return {
                delta: deltaPack({ fortune: 12, DEF: 6, hp: 4 }, {
                  test: function () { return hasUseful(runState, "土") || runState.traits.taboo !== "土"; },
                  delta: { LUK: 4, mp: 4 },
                  text: "土势稳定时，慢钱也会越滚越厚。"
                }),
                feedback: "你拒绝暴富幻觉，结果反而第一个把仓库填满。"
              };
            }
          },
          {
            title: "押注高风险风口",
            text: "一旦成了，人生直接翻页。",
            effect: function (runState) {
              return {
                delta: deltaPack({ fortune: 18, LUK: 10, hp: -10 }, {
                  test: function () { return runState.stats.LUK >= 72 && runState.traits.taboo !== dayElement; },
                  delta: { ATK: 8, CHA: 4 },
                  text: "命势与日主同频时，搏命会更像乘风。"
                }, {
                  delta: { fortune: -10, mp: -8 },
                  text: "你抓住的是噪音，不是趋势。"
                }),
                feedback: "你把筹码推向风口。无论输赢，这都成了别人记住你的方式。"
              };
            }
          },
          {
            title: "先学财务规则",
            text: "用认知减少犯错率。",
            effect: function (runState) {
              return {
                delta: deltaPack({ INT: 10, mp: 8, fortune: 8 }, {
                  test: function () { return runState.stats.INT >= 68; },
                  delta: { DEF: 6, LUK: 4 },
                  text: "高智角色能更快把规则变成护甲。"
                }),
                feedback: "你先把算盘打明白，财富不再只是运气题。"
              };
            }
          }
        ]
      },
      {
        stage: "危机冲击",
        title: "危机冲击",
        text: "副本不会一直顺。健康、关系、资源或信念，至少有一项开始剧烈晃动。",
        seedHint: "看当前 HP / DEF / MP",
        choices: [
          {
            title: "硬抗到底",
            text: "我先扛住，别的之后再说。",
            effect: function (runState) {
              return {
                delta: deltaPack({ hp: -12, ATK: 10 }, {
                  test: function () { return runState.resources.hp >= 70 || runState.stats.DEF >= 70; },
                  delta: { fortune: 12, DEF: 6 },
                  text: "底盘厚的人，硬扛有机会扛成逆转。"
                }, {
                  delta: { hp: -8, mp: -6 },
                  text: "你现在的状态不太支持正面硬接。"
                }),
                feedback: "你没有后撤。代价很大，但这个决定会让你之后看起来更像一个主角。"
              };
            }
          },
          {
            title: "断尾求生，及时止损",
            text: "承认损失，把局面收回来。",
            effect: function (runState) {
              return {
                delta: deltaPack({ hp: 6, DEF: 8, fortune: -8 }, {
                  test: function () { return runState.stats.INT >= 66; },
                  delta: { mp: 6, LUK: 4 },
                  text: "看清局势的人，止损就是另一种赚钱。"
                }),
                feedback: "你没逞强，但也没认输。你只是把战线缩回自己守得住的地方。"
              };
            }
          },
          {
            title: "寻找贵人求援",
            text: "把脸面先放下，争取一线援手。",
            effect: function (runState) {
              return {
                delta: deltaPack({ CHA: 8, hp: 4, mp: 4 }, {
                  test: function () { return runState.stats.CHA >= 64 || hasUseful(runState, "木"); },
                  delta: { fortune: 14, DEF: 5 },
                  text: "能建立连接的人，很少真的被困死。"
                }, {
                  delta: { fortune: -6 },
                  text: "你发出求援，但暂时还没等来回应。"
                }),
                feedback: "你终于承认一个人扛不住所有事，而这本身就是成熟的开始。"
              };
            }
          }
        ]
      },
      {
        stage: "贵人相助",
        title: "贵人相助",
        text: "一个真正懂你的人出现了。他可能是师长、搭档，也可能是某个关键时刻给你路的人。",
        seedHint: "看前期路线与主属性",
        choices: [
          {
            title: "拜师深造",
            text: "以更慢的速度，换更高的上限。",
            effect: function (runState) {
              return {
                delta: deltaPack({ INT: 10, mp: 10, fortune: 8 }, {
                  test: function () { return runState.resources.mp >= 55; },
                  delta: { DEF: 6, hp: 6 },
                  text: "精神资源够厚时，传承会被你真正吃透。"
                }),
                feedback: "你遇到的不只是帮助，而是看懂你路线的人。"
              };
            }
          },
          {
            title: "结成合伙人",
            text: "各出一半力，一起把盘子做大。",
            effect: function (runState) {
              return {
                delta: deltaPack({ CHA: 10, fortune: 12 }, {
                  test: function () { return runState.stats.CHA >= 70 || classMatches(runState, "战法"); },
                  delta: { ATK: 6, LUK: 6 },
                  text: "你在团队中的放大器效应开始成形。"
                }),
                feedback: "你不是被拯救，而是终于找到能并肩的人。"
              };
            }
          },
          {
            title: "保持独行，只借一次力",
            text: "拿资源，不交主动权。",
            effect: function (runState) {
              return {
                delta: deltaPack({ ATK: 8, LUK: 8, hp: -4 }, {
                  test: function () { return classMatches(runState, "刺客") || classMatches(runState, "游侠"); },
                  delta: { fortune: 10, DEF: 4 },
                  text: "高机动命格独行时反而更清醒。"
                }),
                feedback: "你接受援手，但没有交出方向盘。之后的路，仍按你自己的方式走。"
              };
            }
          }
        ]
      },
      {
        stage: "最终命运审判",
        title: "最终命运审判",
        text: "最后一扇门前，没有人能替你选。你会把前面积攒的一切押成什么样的人生结尾？",
        seedHint: "看总资源与命势收束",
        choices: [
          {
            title: "以力破局",
            text: "把所有积累转成一次强攻。",
            effect: function (runState) {
              return {
                delta: deltaPack({ ATK: 12, hp: -8, fortune: 10 }, {
                  test: function () { return runState.stats.ATK + runState.stats.DEF >= 140; },
                  delta: { LUK: 6, CHA: 4 },
                  text: "你的底盘足够支撑一次漂亮的正面收官。"
                }),
                feedback: "你没有求稳，而是选择用锋芒给自己的副本收尾。"
              };
            }
          },
          {
            title: "以智封盘",
            text: "算清胜率，再让自己赢。",
            effect: function (runState) {
              return {
                delta: deltaPack({ INT: 12, mp: 10, fortune: 10 }, {
                  test: function () { return runState.stats.INT + runState.resources.mp >= 145; },
                  delta: { DEF: 6, hp: 6 },
                  text: "你已经拥有把局势收成自己想要形状的能力。"
                }),
                feedback: "你把命运看成一个系统题，而你最终写出了最优解。"
              };
            }
          },
          {
            title: "以人心定局",
            text: "让选择你的人也成为你的力量。",
            effect: function (runState) {
              return {
                delta: deltaPack({ CHA: 12, fortune: 12, hp: 4 }, {
                  test: function () { return runState.stats.CHA + runState.resources.fortune >= 150; },
                  delta: { LUK: 6, mp: 6 },
                  text: "你已经不是孤身作战，局面会向你倾斜。"
                }),
                feedback: "你不是一个人走到终点的。你把自己活成了别人愿意下注的那种人。"
              };
            }
          }
        ]
      }
    ];
  }

  function renderHud() {
    var result = appState.result;
    var runState = appState.run;
    document.getElementById("hud-class").textContent = result.classInfo.className + " · " + result.dayMaster.stem + result.dayMaster.element;
    document.getElementById("hud-traits").textContent = "主天赋：" + runState.traits.primarySkill + " · " + runState.traits.strength;
    document.getElementById("hud-useful").textContent = "喜用 " + runState.traits.useful.join(" / ");
    document.getElementById("hud-taboo").textContent = "忌 " + runState.traits.taboo;
    document.getElementById("resource-hp").textContent = runState.resources.hp;
    document.getElementById("resource-mp").textContent = runState.resources.mp;
    document.getElementById("resource-fortune").textContent = runState.resources.fortune;
    document.getElementById("resource-hp-fill").style.width = clamp(runState.resources.hp, 0, MAX_RESOURCE) / MAX_RESOURCE * 100 + "%";
    document.getElementById("resource-mp-fill").style.width = clamp(runState.resources.mp, 0, MAX_RESOURCE) / MAX_RESOURCE * 100 + "%";
    document.getElementById("resource-fortune-fill").style.width = clamp(runState.resources.fortune, 0, MAX_RESOURCE) / MAX_RESOURCE * 100 + "%";
    renderStatCards("hud-stats", runState.stats);
  }

  function eventList() {
    if (!appState.result) {
      return [];
    }
    return makeEvents(appState.result);
  }

  function currentEvent() {
    return eventList()[appState.run.nodeIndex];
  }

  function renderEvent() {
    var runState = appState.run;
    var event = currentEvent();
    var total = eventList().length;
    document.getElementById("node-counter").textContent = (runState.nodeIndex + 1) + " / " + total;
    document.getElementById("progress-fill").style.width = ((runState.nodeIndex) / total) * 100 + "%";
    document.getElementById("event-stage").textContent = event.stage;
    document.getElementById("event-seed").textContent = event.seedHint;
    document.getElementById("event-title").textContent = event.title;
    document.getElementById("event-text").textContent = event.text;
    feedbackBox.textContent = "选择会立即结算。某些路线会根据你的命格与当前状态获得额外收益或惩罚。";
    floatingDelta.innerHTML = "";
    nextNodeButton.hidden = true;
    choiceList.innerHTML = event.choices.map(function (choice, index) {
      return (
        '<button class="choice-button" type="button" data-choice="' + index + '">' +
          "<strong>" + choice.title + "</strong>" +
          "<p>" + choice.text + "</p>" +
        "</button>"
      );
    }).join("");
    renderHud();
  }

  function applyChoice(choiceIndex) {
    var runState = appState.run;
    var event = currentEvent();
    var outcome = event.choices[choiceIndex].effect(runState);
    var delta = outcome.delta;
    var deltaEntries = [];

    Object.keys(delta).forEach(function (key) {
      if (key === "_bonusText" || !delta[key]) {
        return;
      }
      if (key === "hp" || key === "mp" || key === "fortune") {
        runState.resources[key] = clamp(runState.resources[key] + delta[key], 0, MAX_RESOURCE);
      } else {
        runState.stats[key] = clamp(runState.stats[key] + delta[key], 0, 100);
      }
      deltaEntries.push({ key: key, value: delta[key] });
    });

    runState.selectedChoice = choiceIndex;
    runState.log.push({
      title: event.title,
      choice: event.choices[choiceIndex].title,
      feedback: outcome.feedback
    });

    feedbackBox.textContent = outcome.feedback + (delta._bonusText ? " " + delta._bonusText : "");
    floatingDelta.innerHTML = deltaEntries.map(function (item) {
      var label = item.key === "hp" || item.key === "mp" || item.key === "fortune" ? item.key.toUpperCase() : item.key;
      return '<span class="delta-chip ' + (item.value > 0 ? "positive" : "negative") + '">' + label + (item.value > 0 ? "+" : "") + item.value + "</span>";
    }).join("");
    document.querySelectorAll(".choice-button").forEach(function (node, index) {
      node.disabled = true;
      node.classList.toggle("used", index === choiceIndex);
      node.classList.toggle("locked", index !== choiceIndex);
    });
    nextNodeButton.hidden = false;
    renderHud();
  }

  function buildEnding(runState) {
    var score = runState.resources.hp + runState.resources.mp + runState.resources.fortune +
      runState.stats.ATK + runState.stats.DEF + runState.stats.INT + runState.stats.CHA + runState.stats.LUK;
    if (runState.resources.hp <= 18) {
      return {
        title: "残火续命者",
        text: "你几乎是拖着血线走到终点的，但仍然把这一局活完了。命没让你轻松，你也没让命好过。",
        notes: ["高压生存：低 HP 通关。", "你的故事更像一部硬扛到最后的求生传。"] 
      };
    }
    if (runState.resources.fortune >= 95 && runState.stats.CHA >= 78) {
      return {
        title: "众望所归之人",
        text: "你不只赢了自己的副本，还让别人愿意把机会、信任与筹码压在你身上。",
        notes: ["高命势与高魅力触发主导型结局。", "这是最适合再次挑战高风险路线的命格。"] 
      };
    }
    if (runState.stats.INT >= 82 && runState.resources.mp >= 72) {
      return {
        title: "天机执笔者",
        text: "你没有把命运当作洪流，而是把它拆开、理解，然后一点点写成了自己的版本。",
        notes: ["智慧收官：INT 与 MP 双高。", "再开一局时，试试把资源押向财富线。"] 
      };
    }
    if (runState.stats.ATK >= 82 && runState.stats.DEF >= 75) {
      return {
        title: "逆浪开疆者",
        text: "你靠的不是侥幸，而是一次次把冲撞和防线都练到了极限。你是那种能硬生生杀出路的人。",
        notes: ["武路线成型：ATK 与 DEF 双高。", "这种命格适合在前中期主动拿风险收益。"] 
      };
    }
    if (score >= 470) {
      return {
        title: "均衡破局者",
        text: "你没有极端偏科，却在每一段关卡里都做出足够正确的选择，最后稳稳把整局打穿。",
        notes: ["整体面板优秀。", "如果想冲更高评级，需要更大胆地利用命格特长。"] 
      };
    }
    return {
      title: "凡途自成者",
      text: "你没有神迹式逆天改命，但你一步步把平凡走成了自己的样子。副本结束，人生还会继续。",
      notes: ["标准通关结局。", "不同命格在这条固定事件线上仍会打出不同结尾。"] 
    };
  }

  function showEnding() {
    var ending = buildEnding(appState.run);
    appState.run.title = ending.title;
    document.getElementById("ending-title").textContent = ending.title;
    document.getElementById("ending-text").textContent = ending.text;
    document.getElementById("ending-hp").textContent = appState.run.resources.hp;
    document.getElementById("ending-mp").textContent = appState.run.resources.mp;
    document.getElementById("ending-fortune").textContent = appState.run.resources.fortune;
    document.getElementById("ending-class").textContent = appState.result.classInfo.className;
    document.getElementById("ending-summary").innerHTML = [
      '<div class="ending-note">你在本局中最稳定的特质：' + bestStatLabel(appState.run) + "</div>",
      '<div class="ending-note">关键天赋：' + appState.run.traits.primarySkill + " · 喜用 " + appState.run.traits.useful.join(" / ") + "</div>",
      '<div class="ending-note">' + ending.notes.join(" ") + "</div>"
    ].join("");
    setScreen("ending");
  }

  function bestStatLabel(runState) {
    var bestKey = STAT_ORDER.reduce(function (best, key) {
      return runState.stats[key] > runState.stats[best] ? key : best;
    }, "HP");
    return bestKey + " " + runState.stats[bestKey];
  }

  function startRun() {
    appState.run = makeRunState(appState.result);
    setScreen("run");
    renderEvent();
  }

  function buildPayload() {
    return {
      year: appState.ritual.year,
      month: appState.ritual.month,
      day: appState.ritual.day,
      hourValue: appState.ritual.hour
    };
  }

  function summonCharacter() {
    try {
      appState.result = BaziEngine.buildResult(buildPayload());
    } catch (error) {
      window.alert(error.message);
      return;
    }
    showReveal(appState.result);
  }

  function bindEvents() {
    document.getElementById("start-button").addEventListener("click", function () {
      setScreen("ritual");
      renderRitualOptions();
    });

    ritualOptions.addEventListener("click", function (event) {
      var button = event.target.closest(".ritual-chip");
      if (!button) {
        return;
      }
      selectRitualValue(Number(button.getAttribute("data-value")));
    });

    document.querySelectorAll(".ritual-slot").forEach(function (button, index) {
      button.addEventListener("click", function () {
        appState.stepIndex = index;
        renderRitualOptions();
      });
    });

    backButton.addEventListener("click", function () {
      if (appState.stepIndex > 0) {
        appState.stepIndex -= 1;
        renderRitualOptions();
      }
    });

    document.getElementById("ritual-reset").addEventListener("click", function () {
      resetRitual();
    });

    summonButton.addEventListener("click", function () {
      summonCharacter();
    });

    document.getElementById("reveal-retry").addEventListener("click", function () {
      setScreen("ritual");
      renderRitualOptions();
    });

    document.getElementById("enter-run-button").addEventListener("click", function () {
      startRun();
    });

    choiceList.addEventListener("click", function (event) {
      var button = event.target.closest(".choice-button");
      if (!button || appState.run.selectedChoice !== null) {
        return;
      }
      applyChoice(Number(button.getAttribute("data-choice")));
    });

    nextNodeButton.addEventListener("click", function () {
      appState.run.selectedChoice = null;
      appState.run.nodeIndex += 1;
      if (appState.run.nodeIndex >= eventList().length) {
        showEnding();
        return;
      }
      renderEvent();
    });

    document.getElementById("replay-button").addEventListener("click", function () {
      startRun();
    });

    document.getElementById("resummon-button").addEventListener("click", function () {
      resetRitual();
      setScreen("ritual");
    });
  }

  function init() {
    bindEvents();
    resetRitual();
    setScreen("intro");
  }

  init();
})();
