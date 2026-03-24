(function (global) {
  "use strict";

  var STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  var BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  var ELEMENTS = ["木", "火", "土", "金", "水"];
  var STEM_ELEMENTS = {
    甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
    己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水"
  };
  var STEM_YIN_YANG = {
    甲: "阳", 乙: "阴", 丙: "阳", 丁: "阴", 戊: "阳",
    己: "阴", 庚: "阳", 辛: "阴", 壬: "阳", 癸: "阴"
  };
  var BRANCH_HIDDEN_STEMS = {
    子: ["癸"],
    丑: ["己", "癸", "辛"],
    寅: ["甲", "丙", "戊"],
    卯: ["乙"],
    辰: ["戊", "乙", "癸"],
    巳: ["丙", "庚", "戊"],
    午: ["丁", "己"],
    未: ["己", "丁", "乙"],
    申: ["庚", "壬", "戊"],
    酉: ["辛"],
    戌: ["戊", "辛", "丁"],
    亥: ["壬", "甲"]
  };
  var HIDDEN_SCORES = [3, 1, 1];
  var ELEMENT_TO_INDEX = { 木: 0, 火: 1, 土: 2, 金: 3, 水: 4 };
  var GENERATES = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
  var CONTROLS = { 木: "土", 火: "金", 土: "水", 金: "木", 水: "火" };
  var CONTROLLED_BY = { 木: "金", 火: "水", 土: "木", 金: "火", 水: "土" };
  var ELEMENT_INFO = {
    木: {
      color: "#59d782",
      direction: "东方",
      luckyItems: ["绿幽灵", "竹制饰品", "青色笔记本"],
      className: "青龙游侠",
      classEn: "Verdant Ranger",
      icon: "青",
      teammate: "朱雀战法"
    },
    火: {
      color: "#ff6b63",
      direction: "南方",
      luckyItems: ["红绳", "朱砂饰物", "暖色披风"],
      className: "朱雀战法",
      classEn: "Phoenix Mage",
      icon: "炎",
      teammate: "麒麟守护"
    },
    土: {
      color: "#f4c85b",
      direction: "中央",
      luckyItems: ["黄水晶", "陶土摆件", "守护符袋"],
      className: "麒麟守护",
      classEn: "Terra Guardian",
      icon: "岳",
      teammate: "白虎刺客"
    },
    金: {
      color: "#dce6f2",
      direction: "西方",
      luckyItems: ["银饰", "金属护符", "白曜石"],
      className: "白虎刺客",
      classEn: "Steel Assassin",
      icon: "刃",
      teammate: "玄武谋士"
    },
    水: {
      color: "#62a8ff",
      direction: "北方",
      luckyItems: ["黑曜石", "海纹石", "深色水杯"],
      className: "玄武谋士",
      classEn: "Abyss Strategist",
      icon: "渊",
      teammate: "青龙游侠"
    }
  };
  var TEN_GODS = {
    比肩: { name: "战友之盟", type: "被动", effect: "团队协作增益", icon: "盟" },
    劫财: { name: "夺命一击", type: "主动", effect: "高风险高回报", icon: "袭" },
    食神: { name: "灵感涌现", type: "被动", effect: "创造力 + 恢复", icon: "灵" },
    伤官: { name: "破界之刃", type: "主动", effect: "打破常规，高伤害", icon: "破" },
    正财: { name: "稳健经营", type: "被动", effect: "持续收益", icon: "财" },
    偏财: { name: "天降横财", type: "主动", effect: "随机大奖", icon: "运" },
    正官: { name: "铁壁纪律", type: "被动", effect: "防御 + 领导光环", icon: "律" },
    七杀: { name: "背水一战", type: "主动", effect: "绝境爆发", icon: "杀" },
    正印: { name: "智者之眼", type: "被动", effect: "学习速度 + 精神力", icon: "智" },
    偏印: { name: "暗影直觉", type: "被动", effect: "直觉 + 闪避", icon: "影" }
  };
  var MONTH_BRANCH_ORDER = [11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var SOLAR_TERM_NAMES = ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"];
  var SOLAR_TERM_C20 = [6.11, 20.84, 4.6295, 19.4599, 6.3826, 21.4155, 4.84, 20.1, 5.52, 21.04, 5.678, 21.37, 7.108, 22.83, 7.5, 23.13, 7.646, 23.042, 8.318, 23.438, 7.438, 22.36, 7.18, 21.94];
  var SOLAR_TERM_C21 = [5.4055, 20.12, 3.87, 18.73, 5.63, 20.646, 4.81, 20.1, 5.52, 21.04, 5.678, 21.37, 7.108, 22.83, 7.5, 23.13, 7.646, 23.042, 8.318, 23.438, 7.438, 22.36, 7.18, 21.94];
  var ROOT_BRANCHES = {
    木: ["寅", "卯"],
    火: ["巳", "午"],
    土: ["辰", "戌", "丑", "未"],
    金: ["申", "酉"],
    水: ["亥", "子"]
  };
  var SEASON_ELEMENT_BY_BRANCH = {
    寅: "木", 卯: "木", 巳: "火", 午: "火", 申: "金", 酉: "金", 亥: "水", 子: "水",
    辰: "土", 戌: "土", 丑: "土", 未: "土"
  };

  function mod(value, base) {
    return ((value % base) + base) % base;
  }

  function jdn(year, month, day) {
    var a = Math.floor((14 - month) / 12);
    var y = year + 4800 - a;
    var m = month + 12 * a - 3;
    return day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }

  function solarTermDay(year, termIndex) {
    var y = year % 100;
    var c = year >= 2001 ? SOLAR_TERM_C21[termIndex] : SOLAR_TERM_C20[termIndex];
    return Math.floor(y * 0.2422 + c) - Math.floor((y - 1) / 4);
  }

  function dateValue(year, month, day) {
    return year * 10000 + month * 100 + day;
  }

  function getLiChunDate(year) {
    return { month: 2, day: solarTermDay(year, 2), name: SOLAR_TERM_NAMES[2] };
  }

  function getYearPillar(year, month, day) {
    var liChun = getLiChunDate(year);
    var effectiveYear = dateValue(year, month, day) < dateValue(year, liChun.month, liChun.day) ? year - 1 : year;
    var stemIndex = mod(effectiveYear - 4, 10);
    var branchIndex = mod(effectiveYear - 4, 12);
    return {
      stem: STEMS[stemIndex],
      branch: BRANCHES[branchIndex],
      stemIndex: stemIndex,
      branchIndex: branchIndex,
      effectiveYear: effectiveYear
    };
  }

  function getSolarMonthNumber(year, month, day) {
    var current = dateValue(year, month, day);
    var checkpoints = [
      { monthNo: 12, date: dateValue(year, 1, solarTermDay(year, 0)) },
      { monthNo: 1, date: dateValue(year, 2, solarTermDay(year, 2)) },
      { monthNo: 2, date: dateValue(year, 3, solarTermDay(year, 4)) },
      { monthNo: 3, date: dateValue(year, 4, solarTermDay(year, 6)) },
      { monthNo: 4, date: dateValue(year, 5, solarTermDay(year, 8)) },
      { monthNo: 5, date: dateValue(year, 6, solarTermDay(year, 10)) },
      { monthNo: 6, date: dateValue(year, 7, solarTermDay(year, 12)) },
      { monthNo: 7, date: dateValue(year, 8, solarTermDay(year, 14)) },
      { monthNo: 8, date: dateValue(year, 9, solarTermDay(year, 16)) },
      { monthNo: 9, date: dateValue(year, 10, solarTermDay(year, 18)) },
      { monthNo: 10, date: dateValue(year, 11, solarTermDay(year, 20)) },
      { monthNo: 11, date: dateValue(year, 12, solarTermDay(year, 22)) }
    ];
    var monthNo = 11;
    for (var i = 0; i < checkpoints.length; i += 1) {
      if (current >= checkpoints[i].date) {
        monthNo = checkpoints[i].monthNo;
      }
    }
    return monthNo;
  }

  function getMonthPillar(yearPillar, year, month, day) {
    var solarMonthNo = getSolarMonthNumber(year, month, day);
    var branchIndex = mod(solarMonthNo + 1, 12);
    var startStemIndexByYearStem = {
      甲: 2, 己: 2,
      乙: 4, 庚: 4,
      丙: 6, 辛: 6,
      丁: 8, 壬: 8,
      戊: 0, 癸: 0
    };
    var stemIndex = mod(startStemIndexByYearStem[yearPillar.stem] + solarMonthNo - 1, 10);
    return {
      stem: STEMS[stemIndex],
      branch: BRANCHES[branchIndex],
      stemIndex: stemIndex,
      branchIndex: branchIndex,
      solarMonthNo: solarMonthNo
    };
  }

  function getDayPillar(year, month, day) {
    var baseJdn = 2445733;
    var offset = mod(jdn(year, month, day) - baseJdn, 60);
    return {
      stem: STEMS[offset % 10],
      branch: BRANCHES[offset % 12],
      stemIndex: offset % 10,
      branchIndex: offset % 12,
      cycleIndex: offset
    };
  }

  function getHourBranchIndex(hourValue) {
    return Math.floor(mod(hourValue + 1, 24) / 2);
  }

  function getHourPillar(dayStem, hourValue) {
    var branchIndex = getHourBranchIndex(hourValue);
    var startStemIndexByDayStem = {
      甲: 0, 己: 0,
      乙: 2, 庚: 2,
      丙: 4, 辛: 4,
      丁: 6, 壬: 6,
      戊: 8, 癸: 8
    };
    var stemIndex = mod(startStemIndexByDayStem[dayStem] + branchIndex, 10);
    return {
      stem: STEMS[stemIndex],
      branch: BRANCHES[branchIndex],
      stemIndex: stemIndex,
      branchIndex: branchIndex,
      hourValue: hourValue
    };
  }

  function calculateWuXingScores(pillars) {
    var scores = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    Object.keys(pillars).forEach(function (key) {
      var pillar = pillars[key];
      scores[STEM_ELEMENTS[pillar.stem]] += 5;
      BRANCH_HIDDEN_STEMS[pillar.branch].forEach(function (hiddenStem, index) {
        scores[STEM_ELEMENTS[hiddenStem]] += HIDDEN_SCORES[index] || 1;
      });
    });
    return scores;
  }

  function calculateStrength(dayElement, pillars) {
    var monthSeason = SEASON_ELEMENT_BY_BRANCH[pillars.month.branch];
    var supportElement = GENERATES[CONTROLLED_BY[dayElement]];
    var monthScore = 0;
    if (monthSeason === dayElement) {
      monthScore = 3;
    } else if (monthSeason === supportElement) {
      monthScore = 1;
    } else if (monthSeason === CONTROLLED_BY[dayElement]) {
      monthScore = -1;
    }

    var rootCount = Object.keys(pillars).reduce(function (count, key) {
      return count + (ROOT_BRANCHES[dayElement].indexOf(pillars[key].branch) >= 0 ? 1 : 0);
    }, 0);
    var rootScore = rootCount >= 2 ? 2 : rootCount === 1 ? 1 : 0;
    var score = monthScore + rootScore;
    var status = "中和";
    if (score >= 4) {
      status = "身强";
    } else if (score <= 1) {
      status = "身弱";
    }
    return {
      score: score,
      status: status,
      monthScore: monthScore,
      rootScore: rootScore,
      rootCount: rootCount
    };
  }

  function tenGodFor(dayStem, targetStem) {
    var dayElement = STEM_ELEMENTS[dayStem];
    var targetElement = STEM_ELEMENTS[targetStem];
    var samePolarity = STEM_YIN_YANG[dayStem] === STEM_YIN_YANG[targetStem];
    if (targetElement === dayElement) {
      return samePolarity ? "比肩" : "劫财";
    }
    if (GENERATES[dayElement] === targetElement) {
      return samePolarity ? "食神" : "伤官";
    }
    if (CONTROLS[dayElement] === targetElement) {
      return samePolarity ? "偏财" : "正财";
    }
    if (CONTROLLED_BY[dayElement] === targetElement) {
      return samePolarity ? "七杀" : "正官";
    }
    return samePolarity ? "偏印" : "正印";
  }

  function calculateTenGods(dayStem, pillars) {
    var positions = [
      { key: "yearStem", label: "年干", stem: pillars.year.stem },
      { key: "yearBranch", label: "年支", stem: BRANCH_HIDDEN_STEMS[pillars.year.branch][0] },
      { key: "monthStem", label: "月干", stem: pillars.month.stem },
      { key: "monthBranch", label: "月支", stem: BRANCH_HIDDEN_STEMS[pillars.month.branch][0] },
      { key: "dayBranch", label: "日支", stem: BRANCH_HIDDEN_STEMS[pillars.day.branch][0] },
      { key: "hourStem", label: "时干", stem: pillars.hour.stem },
      { key: "hourBranch", label: "时支", stem: BRANCH_HIDDEN_STEMS[pillars.hour.branch][0] }
    ];
    var mapped = positions.map(function (position) {
      return {
        key: position.key,
        label: position.label,
        refStem: position.stem,
        tenGod: tenGodFor(dayStem, position.stem)
      };
    });
    var present = {};
    Object.keys(pillars).forEach(function (key) {
      present[tenGodFor(dayStem, pillars[key].stem)] = true;
      BRANCH_HIDDEN_STEMS[pillars[key].branch].forEach(function (stem) {
        present[tenGodFor(dayStem, stem)] = true;
      });
    });
    delete present["比肩"];
    return {
      positions: mapped,
      present: Object.keys(present)
    };
  }

  function getUsefulGods(scores) {
    var entries = ELEMENTS.map(function (element) {
      return { element: element, score: scores[element] };
    }).sort(function (a, b) {
      return a.score - b.score;
    });
    var minScore = entries[0].score;
    var secondScore = entries[1].score;
    var useful = entries.filter(function (item) {
      return item.score === minScore || item.score === secondScore;
    }).slice(0, 2);
    var taboo = entries[entries.length - 1];
    return {
      useful: useful.map(function (item) { return item.element; }),
      taboo: taboo.element
    };
  }

  function calculateBalance(scores) {
    var values = ELEMENTS.map(function (element) { return scores[element]; });
    var average = values.reduce(function (sum, value) { return sum + value; }, 0) / values.length;
    var deviation = values.reduce(function (sum, value) {
      return sum + Math.abs(value - average);
    }, 0);
    return Math.max(0, Math.round(100 - deviation * 3.2));
  }

  function mapStats(scores, usefulElements, dayElement) {
    var min = Math.min.apply(null, ELEMENTS.map(function (element) { return scores[element]; }));
    var max = Math.max.apply(null, ELEMENTS.map(function (element) { return scores[element]; }));
    var range = max - min || 1;
    function scale(element, base) {
      return Math.round(35 + ((scores[element] - min) / range) * 55 + base);
    }
    var luckBoost = usefulElements.reduce(function (sum, element) {
      return sum + scores[element];
    }, 0);
    return {
      ATK: Math.min(100, scale("金", 8)),
      DEF: Math.min(100, scale("土", 8)),
      INT: Math.min(100, scale("水", 8)),
      CHA: Math.min(100, scale("火", 8)),
      HP: Math.min(100, scale("木", 8)),
      LUK: Math.min(100, Math.round(45 + luckBoost * 3 + (dayElement === usefulElements[0] ? 4 : 0)))
    };
  }

  function getAge(year, month, day) {
    var now = new Date();
    var age = now.getFullYear() - year;
    var hasBirthdayPassed = (now.getMonth() + 1) > month || ((now.getMonth() + 1) === month && now.getDate() >= day);
    return hasBirthdayPassed ? age : age - 1;
  }

  function buildResult(input) {
    if (!input || !input.year || !input.month || !input.day || typeof input.hourValue !== "number") {
      throw new Error("缺少必要出生信息");
    }
    var dateCheck = new Date(input.year, input.month - 1, input.day);
    if (
      dateCheck.getFullYear() !== input.year ||
      dateCheck.getMonth() !== input.month - 1 ||
      dateCheck.getDate() !== input.day
    ) {
      throw new Error("日期无效，请重新选择真实存在的公历日期");
    }
    var yearPillar = getYearPillar(input.year, input.month, input.day);
    var monthPillar = getMonthPillar(yearPillar, input.year, input.month, input.day);
    var dayPillar = getDayPillar(input.year, input.month, input.day);
    var hourPillar = getHourPillar(dayPillar.stem, input.hourValue);
    var pillars = {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar
    };
    var dayElement = STEM_ELEMENTS[dayPillar.stem];
    var scores = calculateWuXingScores(pillars);
    var strength = calculateStrength(dayElement, pillars);
    var gods = getUsefulGods(scores);
    var tenGods = calculateTenGods(dayPillar.stem, pillars);
    var classInfo = ELEMENT_INFO[dayElement];
    var hp = calculateBalance(scores);
    var mp = Math.min(100, ((scores[GENERATES[CONTROLLED_BY[dayElement]]] || 0) * 4) + (tenGods.present.indexOf("正印") >= 0 ? 12 : 0) + (tenGods.present.indexOf("偏印") >= 0 ? 8 : 0));
    return {
      input: input,
      pillars: pillars,
      dayMaster: {
        stem: dayPillar.stem,
        element: dayElement,
        yinYang: STEM_YIN_YANG[dayPillar.stem]
      },
      scores: scores,
      strength: strength,
      usefulGods: gods.useful,
      tabooGod: gods.taboo,
      tenGods: tenGods,
      classInfo: classInfo,
      stats: mapStats(scores, gods.useful, dayElement),
      resources: {
        hp: hp,
        mp: mp
      },
      age: Math.max(0, getAge(input.year, input.month, input.day)),
      inventory: gods.useful.map(function (element) {
        return {
          element: element,
          color: element === "水" ? "黑色 / 蓝色" : element === "金" ? "白色 / 银色" : element === "木" ? "青色 / 绿色" : element === "火" ? "红色" : "黄色",
          direction: ELEMENT_INFO[element].direction,
          items: ELEMENT_INFO[element].luckyItems
        };
      }),
      teammate: ELEMENT_INFO[GENERATES[dayElement]],
      skillTree: Object.keys(TEN_GODS).map(function (godName) {
        return {
          tenGod: godName,
          unlocked: tenGods.present.indexOf(godName) >= 0,
          meta: TEN_GODS[godName]
        };
      }),
      solarContext: {
        liChun: getLiChunDate(input.year),
        solarMonthNo: monthPillar.solarMonthNo
      }
    };
  }

  var api = {
    STEMS: STEMS,
    BRANCHES: BRANCHES,
    ELEMENTS: ELEMENTS,
    STEM_ELEMENTS: STEM_ELEMENTS,
    BRANCH_HIDDEN_STEMS: BRANCH_HIDDEN_STEMS,
    SOLAR_TERM_NAMES: SOLAR_TERM_NAMES,
    jdn: jdn,
    solarTermDay: solarTermDay,
    getYearPillar: getYearPillar,
    getMonthPillar: getMonthPillar,
    getDayPillar: getDayPillar,
    getHourPillar: getHourPillar,
    buildResult: buildResult
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  global.BaziEngine = api;
})(typeof window !== "undefined" ? window : globalThis);
