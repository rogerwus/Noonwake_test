(function () {
  "use strict";

  var HOUR_OPTIONS = [
    { value: 23, label: "子时" }, { value: 1, label: "丑时" }, { value: 3, label: "寅时" },
    { value: 5, label: "卯时" }, { value: 7, label: "辰时" }, { value: 9, label: "巳时" },
    { value: 11, label: "午时" }, { value: 13, label: "未时" }, { value: 15, label: "申时" },
    { value: 17, label: "酉时" }, { value: 19, label: "戌时" }, { value: 21, label: "亥时" }
  ];

  var CLASS_TEMPLATES = {
    木: { classId: "ranger", className: "青龙游侠", growthTags: ["续航", "成长"], hpMul: 1.15, atkMul: 1.0, defMul: 1.0, intMul: 1.0 },
    火: { classId: "mage", className: "朱雀战法", growthTags: ["爆发", "AOE"], hpMul: 1.0, atkMul: 1.12, defMul: 0.95, intMul: 1.05 },
    土: { classId: "guardian", className: "麒麟守护", growthTags: ["减伤", "反伤"], hpMul: 1.18, atkMul: 0.95, defMul: 1.15, intMul: 0.95 },
    金: { classId: "assassin", className: "白虎刺客", growthTags: ["暴击", "穿透"], hpMul: 0.95, atkMul: 1.15, defMul: 1.0, intMul: 0.95 },
    水: { classId: "strategist", className: "玄武谋士", growthTags: ["控制", "技能"], hpMul: 1.0, atkMul: 0.95, defMul: 1.0, intMul: 1.18 }
  };

  var SKILL_TEMPLATES = {
    ranger: { name: "青藤复苏", triggerEvery: 4, damageMul: 1.2, healMul: 0.1 },
    mage: { name: "朱焰轰击", triggerEvery: 3, damageMul: 1.55, healMul: 0 },
    guardian: { name: "麒麟壁垒", triggerEvery: 4, damageMul: 1.1, healMul: 0.12 },
    assassin: { name: "白虎瞬斩", triggerEvery: 3, damageMul: 1.65, healMul: 0 },
    strategist: { name: "玄水咒缚", triggerEvery: 3, damageMul: 1.45, healMul: 0.06 }
  };

  var GAME_CONFIG = window.LifeRpgConfig || {};
  var MAPS = indexById(GAME_CONFIG.maps || []);
  var MAP_ORDER = GAME_CONFIG.mapOrder || Object.keys(MAPS);
  var BOSSES = GAME_CONFIG.bosses || {};
  var STORAGE_KEYS = {
    latestBattle: "lifeRpg.phase1.latestBattleResult",
    profileSnapshot: "lifeRpg.phase1.profileSnapshot"
  };

  var EQUIPMENT_POOL = [
    gear("weapon", "青藤短刃", "R", "木", { ATK: 20, LUK: 3 }, 28),
    gear("weapon", "赤焰法杖", "SR", "火", { ATK: 34, INT: 10 }, 62),
    gear("armor", "麒麟皮甲", "R", "土", { HP: 120, DEF: 10 }, 30),
    gear("armor", "镇岳重铠", "SR", "土", { HP: 180, DEF: 16 }, 66),
    gear("talisman", "玄水护符", "SR", "水", { INT: 12, LUK: 6 }, 58),
    gear("accessory", "白虎机巧环", "SR", "金", { ATK: 18, LUK: 8 }, 56),
    gear("talisman", "青龙归元符", "SR", "木", { HP: 82, INT: 10, LUK: 8 }, 66),
    gear("core", "命盘核心·初", "SR", "木", { HP: 90, ATK: 12, DEF: 8, INT: 8 }, 72),
    gear("armor", "坤元护心甲", "SR", "土", { HP: 160, DEF: 18 }, 64),
    gear("talisman", "青木续命符", "SR", "木", { HP: 70, INT: 8, LUK: 6 }, 60),
    gear("armor", "青萝护命衣", "SR", "木", { HP: 128, DEF: 12, INT: 6 }, 63),
    gear("accessory", "青木回生佩", "SR", "木", { HP: 64, CHA: 8, LUK: 8 }, 59),
    gear("core", "厚土镇脉核", "SR", "土", { HP: 120, DEF: 14, ATK: 10 }, 78),
    gear("weapon", "金羽裂锋", "SR", "金", { ATK: 32, LUK: 10 }, 68),
    gear("accessory", "离火追猎戒", "SR", "火", { ATK: 16, INT: 8, LUK: 10 }, 64),
    gear("accessory", "离火照命佩", "SR", "火", { ATK: 14, INT: 10, LUK: 10 }, 62),
    gear("weapon", "焚锋长刃", "SSR", "火", { ATK: 46, INT: 16 }, 112),
    gear("talisman", "朱雀焚心符", "SSR", "火", { ATK: 20, INT: 18, LUK: 12 }, 108),
    gear("accessory", "麒麟镇岳佩", "SSR", "土", { HP: 96, DEF: 18, CHA: 8 }, 102),
    gear("armor", "白虎裂甲衣", "SSR", "金", { HP: 142, DEF: 18, ATK: 16 }, 106),
    gear("accessory", "锐金破军珏", "SSR", "金", { ATK: 22, LUK: 14 }, 104),
    gear("armor", "玄武覆潮甲", "SSR", "水", { HP: 136, DEF: 20, INT: 16 }, 110),
    gear("weapon", "玄冥断潮刃", "SSR", "水", { ATK: 48, INT: 18 }, 116),
    gear("talisman", "七杀号令", "SSR", "金", { ATK: 24, INT: 10, LUK: 12 }, 110),
    gear("weapon", "太岁断章", "SSR", "金", { ATK: 52, INT: 12, LUK: 12 }, 118),
    gear("core", "太岁镇印", "SSR", "土", { HP: 220, DEF: 24, ATK: 18 }, 126),
    gear("core", "北渊镇煞核", "SSR", "水", { ATK: 20, INT: 18, DEF: 12 }, 118),
    gear("core", "劫星命盘", "UR", "水", { HP: 180, ATK: 28, INT: 24, DEF: 16 }, 148)
  ];

  var SLOT_NAMES = {
    weapon: "武器",
    armor: "防具",
    talisman: "护符",
    accessory: "饰品",
    core: "命盘核心"
  };

  var ELEMENT_COUNTER = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

  var state = {
    player: null,
    inventory: [],
    drops: []
  };

  var el = {
    hour: document.getElementById("birth-hour"),
    btnGenerate: document.getElementById("btn-generate"),
    btnFight: document.getElementById("btn-fight"),
    fateOutput: document.getElementById("fate-output"),
    playerCore: document.getElementById("player-core"),
    slots: document.getElementById("equipment-slots"),
    inv: document.getElementById("inventory-list"),
    maps: document.getElementById("map-select"),
    returnEntry: document.getElementById("return-entry"),
    summary: document.getElementById("battle-summary"),
    log: document.getElementById("battle-log"),
    drops: document.getElementById("drop-list")
  };

  init();

  function init() {
    HOUR_OPTIONS.forEach(function (o) {
      var option = document.createElement("option");
      option.value = String(o.value);
      option.textContent = o.label + " (" + o.value + ")";
      el.hour.appendChild(option);
    });
    MAP_ORDER.forEach(function (id) {
      var m = MAPS[id];
      if (!m) {
        return;
      }
      var option = document.createElement("option");
      option.value = m.id;
      option.textContent = m.name + " · 推荐战力 " + m.recommendedPower;
      el.maps.appendChild(option);
    });
    applyInitialMapSelection();
    renderReturnEntry();

    el.btnGenerate.addEventListener("click", generateFate);
    el.btnFight.addEventListener("click", runBattle);

    renderInventory();
    renderDrops();
  }

  function gear(slot, name, rarity, element, stats, gearScore) {
    return { slot: slot, name: name, rarity: rarity, element: element, stats: stats, gearScore: gearScore };
  }

  function readBirthInput() {
    return {
      year: toInt("birth-year"),
      month: toInt("birth-month"),
      day: toInt("birth-day"),
      hourValue: toInt("birth-hour")
    };
  }

  function toInt(id) {
    return parseInt(document.getElementById(id).value, 10);
  }

  function generateFate() {
    var input = readBirthInput();
    var result;
    try {
      result = BaziEngine.buildResult(input);
    } catch (err) {
      el.fateOutput.textContent = "命格生成失败: " + err.message;
      return;
    }

    state.player = buildPlayerFromBazi(result);
    state.inventory = createStarterGear(state.player.dayMasterElement);
    autoEquipBest();
    updateDerivedStats();

    el.fateOutput.textContent = [
      "职业: " + state.player.className + " (" + state.player.dayMasterElement + ")",
      "身强弱: " + state.player.strength,
      "喜用: " + state.player.usefulGods.join("/") + " | 忌神: " + state.player.tabooGod,
      "推荐流派: " + state.player.recommendedBuild,
      "四柱: " + formatPillars(result.pillars)
    ].join("\n");

    el.btnFight.disabled = false;
    renderPlayer();
    renderEquipment();
    renderInventory();
    el.summary.textContent = "已开局，可直接挑战 3 张地图（新手 / farm / Boss 图）。";
    el.log.textContent = "";
    state.drops = [];
    renderDrops();
    persistProfileSnapshot("generate");
  }

  function buildPlayerFromBazi(result) {
    var dayElement = result.dayMaster.element;
    var cls = CLASS_TEMPLATES[dayElement];
    var base = {
      HP: Math.round((320 + result.stats.HP * 2.3) * cls.hpMul),
      ATK: Math.round((50 + result.stats.ATK * 0.85) * cls.atkMul),
      DEF: Math.round((30 + result.stats.DEF * 0.7) * cls.defMul),
      INT: Math.round((38 + result.stats.INT * 0.75) * cls.intMul),
      CHA: Math.round(20 + result.stats.CHA * 0.5),
      LUK: Math.round(15 + result.stats.LUK * 0.4)
    };
    applyStrengthBonus(base, result.strength.status);

    return {
      classId: cls.classId,
      className: cls.className,
      growthTags: cls.growthTags,
      dayMasterElement: dayElement,
      usefulGods: result.usefulGods,
      tabooGod: result.tabooGod,
      strength: result.strength.status,
      baseStats: base,
      currentStats: clone(base),
      hpNow: base.HP,
      equipment: {
        weapon: null,
        armor: null,
        talisman: null,
        accessory: null,
        core: null
      },
      powerScore: 0,
      recommendedBuild: cls.growthTags.join("/") + "，优先 " + result.usefulGods[0] + " 系装备"
    };
  }

  function applyStrengthBonus(stats, strength) {
    if (strength === "身强") {
      stats.ATK = Math.round(stats.ATK * 1.08);
      stats.LUK = Math.round(stats.LUK * 1.08);
      return;
    }
    if (strength === "身弱") {
      stats.HP = Math.round(stats.HP * 1.08);
      stats.DEF = Math.round(stats.DEF * 1.08);
      return;
    }
    ["HP", "ATK", "DEF", "INT", "CHA", "LUK"].forEach(function (k) {
      stats[k] = Math.round(stats[k] * 1.04);
    });
  }

  function createStarterGear(preferredElement) {
    var baseSet = EQUIPMENT_POOL.filter(function (g) {
      return g.rarity === "R" || (g.rarity === "SR" && g.element === preferredElement);
    }).slice(0, 5);
    return baseSet.map(function (g) { return clone(g); });
  }

  function updateDerivedStats() {
    if (!state.player) {
      return;
    }
    var p = state.player;
    p.currentStats = clone(p.baseStats);
    Object.keys(p.equipment).forEach(function (slot) {
      var item = p.equipment[slot];
      if (!item) {
        return;
      }
      Object.keys(item.stats).forEach(function (k) {
        p.currentStats[k] = (p.currentStats[k] || 0) + item.stats[k];
      });
    });

    p.powerScore = computePowerScore(p);
    if (p.hpNow > p.currentStats.HP) {
      p.hpNow = p.currentStats.HP;
    }
  }

  function computePowerScore(player) {
    var s = player.currentStats;
    var gearScore = Object.keys(player.equipment).reduce(function (sum, slot) {
      return sum + (player.equipment[slot] ? player.equipment[slot].gearScore : 0);
    }, 0);
    var skill = SKILL_TEMPLATES[player.classId];
    var skillScore = Math.round(skill.damageMul * 30 + skill.healMul * 40);
    return Math.round(
      s.HP * 0.2 + s.ATK * 1 + s.DEF * 0.75 + s.INT * 0.9 + s.CHA * 0.55 + s.LUK * 0.45 + gearScore + skillScore
    );
  }

  function runBattle() {
    if (!state.player) {
      return;
    }
    var map = MAPS[el.maps.value];
    if (!map) {
      el.summary.textContent = "地图配置缺失，请检查 game-config.js。";
      return;
    }
    if (!BOSSES[map.bossId]) {
      el.summary.textContent = "Boss 配置缺失: " + map.bossId;
      return;
    }
    var p = state.player;
    p.hpNow = p.currentStats.HP;

    var logs = [];
    var totalDamage = 0;
    var defeated = true;
    var waveNo = 0;
    var boss = clone(BOSSES[map.bossId]);
    var fateImpact = buildMapFateImpact(p, map, boss);

    logs.push("命格判定: " + formatFateImpactSummary(fateImpact));

    map.waves.forEach(function (wave) {
      if (!defeated) {
        return;
      }
      waveNo += 1;
      logs.push("-- Wave " + waveNo + " --");
      wave.forEach(function (foe) {
        if (!defeated) {
          return;
        }
        var res = duel(p, foe, false, fateImpact);
        totalDamage += res.damageDone;
        logs = logs.concat(res.logs);
        if (!res.win) {
          defeated = false;
        }
      });
    });
    var bossResult = null;
    var mechanicLine = "";
    var bossRewardLine = "";
    if (defeated) {
      logs.push("-- Boss: " + boss.name + "(" + boss.element + "/" + boss.viceElement + ") --");
      logs.push("机制: " + boss.mechanics.join("; "));
      bossResult = duel(p, boss, true, fateImpact);
      totalDamage += bossResult.damageDone;
      logs = logs.concat(bossResult.logs);
      defeated = bossResult.win;
      if (bossResult.mechanicSummary) {
        mechanicLine = "机制应对: " + formatBossMechanicSummary(bossResult.mechanicSummary);
        if (bossResult.mechanicSummary.rewardShiftText) {
          bossRewardLine = "Boss 奖励判定: " + bossResult.mechanicSummary.rewardShiftText;
        }
      }
    }

    var drops = rollDrops(map, defeated, bossResult && bossResult.win, p.currentStats.LUK, p, fateImpact, bossResult ? bossResult.mechanicSummary : null);
    state.drops = drops;
    state.inventory = state.inventory.concat(drops);

    var recommendation = defeated
      ? fateImpact.nextStepOnWin
      : fateImpact.nextStepOnLoss;

    el.summary.textContent = [
      (defeated ? "胜利" : "失败") + " | 地图: " + map.name,
      "造成总伤害: " + Math.round(totalDamage),
      "剩余HP: " + p.hpNow + "/" + p.currentStats.HP,
      "当前战力: " + p.powerScore,
      "命格判断: " + formatFateImpactSummary(fateImpact),
      "地图价值: " + (map.purpose || map.description || "-"),
      "掉落焦点: " + (map.dropFocus || "装备") + " | " + fateImpact.rewardText,
      "承压反馈: " + fateImpact.pressureText,
      (mechanicLine || "机制应对: 本场无额外机制反馈"),
      (bossRewardLine || "Boss 奖励判定: 按基础档位结算"),
      "提示: " + recommendation
    ].join("\n");

    el.log.textContent = logs.join("\n");
    renderDrops();
    renderInventory();
    renderEquipment();
    renderPlayer();
    persistBattleResult(map.id, defeated, p, drops, bossResult ? bossResult.mechanicSummary : null, map, fateImpact);
    persistProfileSnapshot("battle_end");
  }

  function duel(player, foe, isBoss, fateImpact) {
    var enemyHp = foe.hp;
    var turn = 0;
    var logs = [];
    var damageDone = 0;
    var skill = SKILL_TEMPLATES[player.classId];
    var mechanicSummary = isBoss ? createBossMechanicSummary(foe) : null;

    while (enemyHp > 0 && player.hpNow > 0 && turn < 60) {
      turn += 1;
      var skillActive = turn % skill.triggerEvery === 0;
      var outgoingMul = skillActive ? skill.damageMul : 1;
      var incomingMul = 1;
      var fateMul = buildCombatFateModifiers(fateImpact, isBoss);
      outgoingMul *= fateMul.outgoingMul;
      incomingMul *= fateMul.incomingMul;
      if (isBoss && mechanicSummary) {
        applyBossMechanicTurn(player, foe, turn, mechanicSummary, logs);
        outgoingMul *= mechanicSummary.turnOutgoingMul || 1;
        incomingMul *= mechanicSummary.turnIncomingMul || 1;
      }

      var elementBonus = elementModifier(player.dayMasterElement, foe.element);
      var buildBonus = buildModifier(player, foe.element);
      var crit = Math.random() < Math.min(0.35, 0.08 + player.currentStats.LUK / 500) ? 1.5 : 1;
      var dmg = Math.max(
        1,
        Math.round(
          player.currentStats.ATK * outgoingMul * elementBonus * buildBonus * crit * randomBetween(0.95, 1.05) * (100 / (100 + foe.def))
        )
      );
      enemyHp -= dmg;
      damageDone += dmg;

      var heal = 0;
      if (skillActive && skill.healMul > 0) {
        heal = Math.round(player.currentStats.HP * skill.healMul);
        player.hpNow = Math.min(player.currentStats.HP, player.hpNow + heal);
      }

      logs.push(
        "T" + turn + " 你对" + foe.name + "造成 " + dmg + " 伤害" +
          (skillActive ? " [" + skill.name + (heal > 0 ? ", 回复" + heal : "") + "]" : "") +
          " | 敌HP:" + Math.max(0, enemyHp)
      );

      if (enemyHp <= 0) {
        break;
      }

      var enemyDmg = Math.max(
        1,
        Math.round(
          foe.atk * incomingMul * (100 / (100 + player.currentStats.DEF)) * randomBetween(0.95, 1.05)
        )
      );
      player.hpNow -= enemyDmg;
      logs.push("T" + turn + " " + foe.name + "反击 " + enemyDmg + " | 你HP:" + Math.max(0, player.hpNow));
    }

    return {
      win: enemyHp <= 0 && player.hpNow > 0,
      damageDone: damageDone,
      logs: logs,
      mechanicSummary: mechanicSummary ? finalizeBossMechanicSummary(mechanicSummary) : null
    };
  }

  function createBossMechanicSummary(foe) {
    var mechanics = [];
    if (foe && foe.mechanic01) {
      mechanics.push(buildBossMechanicEntry(foe.mechanic01));
    }
    if (foe && foe.mechanic02) {
      mechanics.push(buildBossMechanicEntry(foe.mechanic02));
    }
    if (foe && foe.mechanic03) {
      mechanics.push(buildBossMechanicEntry(foe.mechanic03));
    }
    if (foe && foe.mechanic04) {
      mechanics.push(buildBossMechanicEntry(foe.mechanic04));
    }
    if (!mechanics.length) {
      return null;
    }
    return {
      mechanics: mechanics,
      name: mechanics.map(function (entry) { return entry.name; }).join(" + "),
      summary: mechanics.map(function (entry) { return entry.summary; }).join("；"),
      triggers: 0,
      successfulBreaks: 0,
      penaltyTurns: 0,
      bonusTurns: 0,
      rewardBonusRate: 0,
      rewardPenaltyRate: 0,
      turnOutgoingMul: 1,
      turnIncomingMul: 1
    };
  }

  function buildBossMechanicEntry(mechanic) {
    return {
      id: mechanic.id,
      name: mechanic.name,
      triggerEvery: mechanic.triggerEvery,
      breakElement: mechanic.breakElement || "",
      favoredElements: clone(mechanic.favoredElements || []),
      alignedBonus: Number(mechanic.alignedBonus || 0),
      penaltyOutgoing: Number(mechanic.penaltyOutgoing || 0),
      penaltyIncoming: Number(mechanic.penaltyIncoming || 0),
      damagePenalty: Number(mechanic.damagePenalty || 0),
      breakBonus: Number(mechanic.breakBonus || 0),
      bossAtkBonus: Number(mechanic.bossAtkBonus || 0),
      rewardBonusRate: Number(mechanic.rewardBonusRate || 0),
      rewardPenaltyRate: Number(mechanic.rewardPenaltyRate || 0),
      bonusBossDropChance: Number(mechanic.bonusBossDropChance || 0),
      summary: mechanic.summary || "",
      triggers: 0,
      successfulBreaks: 0,
      penaltyTurns: 0,
      bonusTurns: 0,
      rewardBonusAccumulated: 0,
      rewardPenaltyAccumulated: 0,
      bonusBossDropChanceAccumulated: 0
    };
  }

  function applyBossMechanicTurn(player, foe, turn, mechanicSummary, logs) {
    mechanicSummary.turnOutgoingMul = 1;
    mechanicSummary.turnIncomingMul = 1;
    (mechanicSummary.mechanics || []).forEach(function (entry) {
      if (entry.id === "guard_cycle") {
        applyGuardCycleMechanic(player, foe, turn, mechanicSummary, entry, logs);
      } else if (entry.id === "fate_pressure") {
        applyFatePressureMechanic(player, foe, turn, mechanicSummary, entry, logs);
      } else if (entry.id === "reward_window") {
        applyRewardWindowMechanic(player, foe, turn, mechanicSummary, entry, logs);
      } else if (entry.id === "spoils_window") {
        applySpoilsWindowMechanic(player, foe, turn, mechanicSummary, entry, logs);
      }
    });
  }

  function applyGuardCycleMechanic(player, foe, turn, mechanicSummary, entry, logs) {
    var counterReady;
    if (!entry || turn % Number(entry.triggerEvery || 0) !== 0) {
      return;
    }
    entry.triggers += 1;
    counterReady = hasCounterBuild(player, entry.breakElement);
    if (counterReady) {
      entry.successfulBreaks += 1;
      entry.bonusTurns += 1;
      mechanicSummary.turnOutgoingMul *= 1 + Number(entry.breakBonus || 0);
      logs.push("T" + turn + " " + foe.name + "发动【" + entry.name + "】，你以" + entry.breakElement + "势破甲，输出回正并反打。");
      return;
    }

    entry.penaltyTurns += 1;
    mechanicSummary.turnOutgoingMul *= Math.max(0.1, 1 - Number(entry.damagePenalty || 0));
    mechanicSummary.turnIncomingMul *= 1 + Number(entry.bossAtkBonus || 0);
    logs.push("T" + turn + " " + foe.name + "发动【" + entry.name + "】，非" + entry.breakElement + "向 build 被压制，输出下降。");
  }

  function applyFatePressureMechanic(player, foe, turn, mechanicSummary, entry, logs) {
    var aligned;
    var tabooHit;
    if (!entry || turn % Number(entry.triggerEvery || 0) !== 0) {
      return;
    }
    entry.triggers += 1;
    aligned = hasFateAffinity(player, entry.favoredElements);
    tabooHit = !!(player.tabooGod && (entry.favoredElements || []).indexOf(player.tabooGod) >= 0);
    if (aligned && !tabooHit) {
      entry.successfulBreaks += 1;
      entry.bonusTurns += 1;
      mechanicSummary.turnOutgoingMul *= 1 + Number(entry.alignedBonus || 0);
      logs.push("T" + turn + " " + foe.name + "发动【" + entry.name + "】，你的日主/喜用贴合命势，顺势稳住输出。");
      return;
    }

    entry.penaltyTurns += 1;
    mechanicSummary.turnOutgoingMul *= Math.max(0.1, 1 - Number(entry.penaltyOutgoing || 0));
    mechanicSummary.turnIncomingMul *= 1 + Number(entry.penaltyIncoming || 0);
    logs.push("T" + turn + " " + foe.name + "发动【" + entry.name + "】，命格贴合不足" + (tabooHit ? "且撞上忌神" : "") + "，承压上升。");
  }

  function applyRewardWindowMechanic(player, foe, turn, mechanicSummary, entry, logs) {
    var aligned;
    if (!entry || turn % Number(entry.triggerEvery || 0) !== 0) {
      return;
    }
    entry.triggers += 1;
    aligned = hasFateAffinity(player, entry.favoredElements);
    if (aligned) {
      entry.successfulBreaks += 1;
      entry.bonusTurns += 1;
      entry.rewardBonusAccumulated += Number(entry.rewardBonusRate || 0);
      logs.push("T" + turn + " " + foe.name + "发动【" + entry.name + "】，你踩中水/金命势，Boss 奖励档位抬升。");
      return;
    }

    entry.penaltyTurns += 1;
    entry.rewardPenaltyAccumulated += Number(entry.rewardPenaltyRate || 0);
    logs.push("T" + turn + " " + foe.name + "发动【" + entry.name + "】，未踩中奖励窗口，Boss 奖励更保守。");
  }

  function applySpoilsWindowMechanic(player, foe, turn, mechanicSummary, entry, logs) {
    var aligned;
    if (!entry || turn % Number(entry.triggerEvery || 0) !== 0) {
      return;
    }
    entry.triggers += 1;
    aligned = hasFateAffinity(player, entry.favoredElements);
    if (aligned) {
      entry.successfulBreaks += 1;
      entry.bonusTurns += 1;
      entry.rewardBonusAccumulated += Number(entry.rewardBonusRate || 0);
      entry.bonusBossDropChanceAccumulated += Number(entry.bonusBossDropChance || 0);
      logs.push("T" + turn + " " + foe.name + "发动【" + entry.name + "】，你的 build 踩中追匣窗口，额外 Boss 奖励机会提升。");
      return;
    }

    entry.penaltyTurns += 1;
    logs.push("T" + turn + " " + foe.name + "发动【" + entry.name + "】，这轮没踩中追匣窗口，额外 Boss 奖励机会未打开。");
  }

  function hasCounterBuild(player, element) {
    return !!(
      player.dayMasterElement === element ||
      player.usefulGods.indexOf(element) >= 0 ||
      countEquippedElement(player, element) >= 2
    );
  }

  function hasFateAffinity(player, elements) {
    return uniqueElements(elements).some(function (element) {
      return hasCounterBuild(player, element);
    });
  }

  function countEquippedElement(player, element) {
    return Object.keys(player.equipment || {}).reduce(function (count, slot) {
      var item = player.equipment[slot];
      return count + (item && item.element === element ? 1 : 0);
    }, 0);
  }

  function finalizeBossMechanicSummary(summary) {
    var entries;
    if (!summary) {
      return null;
    }
    entries = summary.mechanics || [];
    summary.triggers = entries.reduce(function (total, entry) {
      return total + Number(entry.triggers || 0);
    }, 0);
    summary.successfulBreaks = entries.reduce(function (total, entry) {
      return total + Number(entry.successfulBreaks || 0);
    }, 0);
    summary.penaltyTurns = entries.reduce(function (total, entry) {
      return total + Number(entry.penaltyTurns || 0);
    }, 0);
    summary.bonusTurns = entries.reduce(function (total, entry) {
      return total + Number(entry.bonusTurns || 0);
    }, 0);
    summary.rewardBonusRate = entries.reduce(function (total, entry) {
      return total + Number(entry.rewardBonusAccumulated || 0);
    }, 0);
    summary.rewardPenaltyRate = entries.reduce(function (total, entry) {
      return total + Number(entry.rewardPenaltyAccumulated || 0);
    }, 0);
    summary.extraBossDropChance = entries.reduce(function (total, entry) {
      return total + Number(entry.bonusBossDropChanceAccumulated || 0);
    }, 0);
    delete summary.turnOutgoingMul;
    delete summary.turnIncomingMul;
    summary.rewardShiftText = formatBossRewardShift(summary);
    summary.masteryText = formatBossMechanicSummary(summary);
    return summary;
  }

  function formatBossMechanicSummary(summary) {
    var entries;
    var text;
    if (!summary) {
      return "未触发";
    }
    entries = summary.mechanics || [];
    if (entries.length) {
      text = entries.map(function (entry) {
        return entry.name + " · 触发" + entry.triggers + "次 / 顺势" + entry.successfulBreaks + "次 / 受压" + entry.penaltyTurns + "次";
      }).join("；");
    } else {
      text = summary.name + " · 触发" + summary.triggers + "次 / 破势" + summary.successfulBreaks + "次 / 受压" + summary.penaltyTurns + "次";
    }
    return summary.rewardShiftText ? text + " / " + summary.rewardShiftText : text;
  }

  function formatBossRewardShift(summary) {
    var bonus = Math.round(Number(summary && summary.rewardBonusRate || 0) * 100);
    var penalty = Math.round(Number(summary && summary.rewardPenaltyRate || 0) * 100);
    var extra = Math.round(Number(summary && summary.extraBossDropChance || 0) * 100);
    var parts = [];
    if (bonus > penalty) {
      parts.push("奖励升档 +" + (bonus - penalty) + "%");
    } else if (penalty > bonus) {
      parts.push("奖励保守 +" + (penalty - bonus) + "%");
    } else if (bonus > 0 || penalty > 0) {
      parts.push("奖励档位保持平衡");
    }
    if (extra > 0) {
      parts.push("额外追匣 +" + extra + "%");
    }
    return parts.join(" · ");
  }

  function buildMapFateImpact(player, map, boss) {
    var usefulGods = uniqueElements(player.usefulGods || []);
    var alignedElements = uniqueElements(usefulGods.concat(player.dayMasterElement ? [player.dayMasterElement] : []));
    var dropElements = map && map.dropTable && Array.isArray(map.dropTable.preferredElements) ? map.dropTable.preferredElements : [];
    var rewardElements = dropElements.filter(function (element) {
      return alignedElements.indexOf(element) >= 0;
    });
    var positive = [];
    var risky = [];
    var score = 0;
    var powerGap = Number(map.recommendedPower || 0) - Number(player.powerScore || 0);
    var rewardBonusRate;
    var difficultyPressure;
    var outgoingBonus;
    var tier;

    if (player.dayMasterElement === map.element) {
      score += 2;
      positive.push("日主" + player.dayMasterElement + "贴合地图主五行");
    }
    if (usefulGods.indexOf(map.element) >= 0) {
      score += 3;
      positive.push("喜用" + map.element + "命中地图主五行");
    }
    if (boss && usefulGods.indexOf(boss.element) >= 0) {
      score += 2;
      positive.push("喜用" + boss.element + "可接 Boss 主压力");
    }
    if (boss && player.dayMasterElement && player.dayMasterElement === boss.viceElement) {
      score += 1;
      positive.push("日主贴合 Boss 副五行");
    }
    if (rewardElements.length) {
      score += 3 + rewardElements.length;
      positive.push("掉落偏向" + rewardElements.join("/") + "，更容易刷到贴命格的件");
    }
    if (player.tabooGod) {
      if (player.tabooGod === map.element) {
        score -= 4;
        risky.push("地图主五行撞忌神" + player.tabooGod);
      }
      if (boss && (player.tabooGod === boss.element || player.tabooGod === boss.viceElement)) {
        score -= 3;
        risky.push("Boss 五行压到忌神" + player.tabooGod);
      }
      if (dropElements.indexOf(player.tabooGod) >= 0) {
        score -= 2;
        risky.push("掉落偏向包含忌神" + player.tabooGod);
      }
    }
    if (player.strength === "身强" && map.type === "boss") {
      score += 2;
      positive.push("身强更适合顶 Boss 压力");
    }
    if (player.strength === "身弱" && map.type === "trial") {
      score += 2;
      positive.push("身弱更适合先补生存与核心");
    }
    if (player.strength === "身弱" && map.type === "boss") {
      score -= 2;
      risky.push("身弱直冲 Boss 更容易吃压制");
    }
    if (powerGap <= 0) {
      score += 2;
      positive.push("当前战力已达该图推荐值");
    } else if (powerGap <= 180) {
      score += 1;
    } else if (powerGap > 360) {
      score -= 2;
      risky.push("当前战力低于推荐约 " + powerGap);
    }

    if (score >= 6) {
      tier = "favored";
      rewardBonusRate = 0.12;
      difficultyPressure = -0.08;
      outgoingBonus = 0.08;
    } else if (score <= 1) {
      tier = "risky";
      rewardBonusRate = -0.06;
      difficultyPressure = 0.12;
      outgoingBonus = -0.05;
    } else {
      tier = "neutral";
      rewardBonusRate = rewardElements.length ? 0.04 : 0;
      difficultyPressure = 0.02;
      outgoingBonus = 0.02;
    }

    return {
      tier: tier,
      score: score,
      verdict: tier === "favored" ? "顺命收益高" : (tier === "risky" ? "逆势承压" : "可打但收益一般"),
      rewardElements: rewardElements,
      rewardBonusRate: rewardBonusRate,
      difficultyPressure: difficultyPressure,
      outgoingBonus: outgoingBonus,
      reasonText: positive.concat(risky).join("；") || "当前仅按推荐战力与地图五行处理",
      rewardText: rewardElements.length
        ? "掉落更偏向 " + rewardElements.join("/") + " 系收益，顺势收益 " + formatSignedPercent(rewardBonusRate)
        : "按地图基础掉落结算，收益修正 " + formatSignedPercent(rewardBonusRate),
      pressureText: difficultyPressure <= 0
        ? "顺势减压 " + formatSignedPercent(difficultyPressure)
        : "逆势承压 +" + Math.round(difficultyPressure * 100) + "%",
      nextStepOnWin: tier === "favored"
        ? "顺命通关，优先保留 " + (rewardElements.join("/") || map.element) + " 向掉落，再回 Gear 页补同元素共鸣。"
        : "通关成功，建议优先替换同槽高 GearScore 装备后再战。",
      nextStepOnLoss: tier === "risky"
        ? "该图当前逆势，建议先补 " + (rewardElements[0] || counterElement(map.element)) + " 向装备或回开荒图抬战力。"
        : "挑战失败，建议强化防具/核心，或切换对" + map.element + "克制更强的" + counterElement(map.element) + "系装备。"
    };
  }

  function buildCombatFateModifiers(fateImpact, isBoss) {
    var scale = isBoss ? 1 : 0.5;
    if (!fateImpact) {
      return { outgoingMul: 1, incomingMul: 1 };
    }
    return {
      outgoingMul: 1 + Number(fateImpact.outgoingBonus || 0) * scale,
      incomingMul: 1 + Number(fateImpact.difficultyPressure || 0) * scale
    };
  }

  function formatFateImpactSummary(fateImpact) {
    if (!fateImpact) {
      return "命格未命中地图修正";
    }
    return fateImpact.verdict + " · " + fateImpact.rewardText + " · " + fateImpact.pressureText;
  }

  function formatSignedPercent(value) {
    var rate = Math.round(Number(value || 0) * 100);
    return (rate > 0 ? "+" : "") + rate + "%";
  }

  function elementModifier(attacker, target) {
    if (ELEMENT_COUNTER[attacker] === target) {
      return 1.18;
    }
    if (ELEMENT_COUNTER[target] === attacker) {
      return 0.88;
    }
    return 1;
  }

  function buildModifier(player, targetElement) {
    var bonus = 1;
    if (player.usefulGods.indexOf(player.dayMasterElement) >= 0) {
      bonus *= 1.06;
    }
    if (player.usefulGods.indexOf(targetElement) >= 0) {
      bonus *= 1.12;
    }
    if (player.tabooGod === targetElement) {
      bonus *= 0.9;
    }
    return bonus;
  }

  function applyInitialMapSelection() {
    var params = new URLSearchParams(window.location.search);
    var mapId = params.get("map");
    if (mapId && MAPS[mapId]) {
      el.maps.value = mapId;
    } else if (MAP_ORDER.length > 0) {
      el.maps.value = MAP_ORDER[0];
    }
  }

  function renderReturnEntry() {
    if (!el.returnEntry) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var returnTo = params.get("returnTo");
    var safeReturnTo = normalizeReturnTo(returnTo);
    if (!safeReturnTo) {
      el.returnEntry.textContent = "";
      return;
    }
    el.returnEntry.innerHTML = "<a class='button-like' href='" + safeHref(safeReturnTo) + "'>返回 Phase 2 主城</a>";
  }

  function indexById(list) {
    return list.reduce(function (acc, item) {
      acc[item.id] = item;
      return acc;
    }, {});
  }

  function counterElement(targetElement) {
    var keys = Object.keys(ELEMENT_COUNTER);
    var i;
    for (i = 0; i < keys.length; i += 1) {
      if (ELEMENT_COUNTER[keys[i]] === targetElement) {
        return keys[i];
      }
    }
    return "木";
  }

  function persistBattleResult(mapId, victory, player, drops, bossMechanicSummary, map, fateImpact) {
    var payload = {
      mapId: mapId,
      result: victory ? "victory" : "defeat",
      remainingHp: player.hpNow,
      hpRatio: player.currentStats.HP > 0 ? roundTo(player.hpNow / player.currentStats.HP, 4) : 0,
      lootSummary: buildLootSummary(drops),
      bossMechanicSummary: bossMechanicSummary || null,
      fateImpact: fateImpact ? {
        tier: fateImpact.tier,
        score: fateImpact.score,
        verdict: fateImpact.verdict,
        rewardBonusRate: fateImpact.rewardBonusRate,
        difficultyPressure: fateImpact.difficultyPressure,
        rewardElements: clone(fateImpact.rewardElements || []),
        reasonText: fateImpact.reasonText,
        rewardText: fateImpact.rewardText,
        pressureText: fateImpact.pressureText,
        nextStep: victory ? fateImpact.nextStepOnWin : fateImpact.nextStepOnLoss
      } : null,
      mapRewardFocus: map && map.dropFocus ? map.dropFocus : "",
      mapPurpose: map && map.purpose ? map.purpose : "",
      recommendedPower: map && map.recommendedPower ? map.recommendedPower : 0,
      timestamp: new Date().toISOString()
    };
    writeStorage(STORAGE_KEYS.latestBattle, payload);
  }

  function persistProfileSnapshot(source) {
    if (!state.player) {
      return;
    }
    var player = state.player;
    var snapshot = {
      source: source,
      timestamp: new Date().toISOString(),
      className: player.className,
      dayMasterElement: player.dayMasterElement,
      strength: player.strength,
      usefulGods: clone(player.usefulGods),
      tabooGod: player.tabooGod,
      recommendedBuild: player.recommendedBuild,
      powerScore: player.powerScore,
      baseStats: clone(player.baseStats),
      currentStats: clone(player.currentStats),
      equipped: clone(player.equipment),
      inventorySummary: summarizeInventory(state.inventory),
      inventoryItems: state.inventory.map(function (item) {
        return {
          slot: item.slot,
          name: item.name,
          rarity: item.rarity,
          element: item.element,
          gearScore: item.gearScore
        };
      })
    };
    writeStorage(STORAGE_KEYS.profileSnapshot, snapshot);
  }

  function summarizeInventory(inventory) {
    return inventory.reduce(function (acc, item) {
      acc.total += 1;
      acc.byRarity[item.rarity] = (acc.byRarity[item.rarity] || 0) + 1;
      acc.bySlot[item.slot] = (acc.bySlot[item.slot] || 0) + 1;
      return acc;
    }, { total: 0, byRarity: {}, bySlot: {} });
  }

  function buildLootSummary(drops) {
    var byRarity = {};
    drops.forEach(function (item) {
      byRarity[item.rarity] = (byRarity[item.rarity] || 0) + 1;
    });
    return {
      total: drops.length,
      byRarity: byRarity,
      items: drops.map(function (item) {
        return {
          name: item.name,
          rarity: item.rarity,
          slot: item.slot,
          gearScore: item.gearScore
        };
      })
    };
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // Ignore storage errors in prototype mode.
    }
  }

  function rollDrops(map, mapWin, bossWin, luk, player, fateImpact, bossMechanicSummary) {
    var drops = [];
    var dropTable = map && map.dropTable ? map.dropTable : {};
    var lossDropChance = Number(dropTable.lossDropChance != null ? dropTable.lossDropChance : 0.4);
    var clearMobDropCount = Math.max(0, Math.floor(Number(dropTable.clearMobDropCount != null ? dropTable.clearMobDropCount : 2)));
    var bossDropCount = Math.max(0, Math.floor(Number(dropTable.bossDropCount != null ? dropTable.bossDropCount : 1)));
    var index;
    if (!mapWin) {
      if (Math.random() < lossDropChance) {
        drops.push(randomGearByRarity(weightedRarity("mob", map, luk, fateImpact, bossMechanicSummary), map, player, fateImpact, "mob"));
      }
      return drops;
    }

    for (index = 0; index < clearMobDropCount; index += 1) {
      drops.push(randomGearByRarity(weightedRarity("mob", map, luk, fateImpact, bossMechanicSummary), map, player, fateImpact, "mob"));
    }
    if (bossWin) {
      for (index = 0; index < bossDropCount; index += 1) {
        drops.push(randomGearByRarity(weightedRarity("boss", map, luk, fateImpact, bossMechanicSummary), map, player, fateImpact, "boss"));
      }
      if (Math.random() < Math.min(0.75, Math.max(0, Number(bossMechanicSummary && bossMechanicSummary.extraBossDropChance || 0)))) {
        drops.push(randomGearByRarity(weightedRarity("boss", map, luk, fateImpact, bossMechanicSummary), map, player, fateImpact, "boss"));
      }
    }

    return drops;
  }

  function weightedRarity(type, map, luk, fateImpact, bossMechanicSummary) {
    var luckBoost = Math.floor(luk / 10) * 0.02;
    var fateBoost = Number(fateImpact && fateImpact.rewardBonusRate || 0);
    var bossRewardShift = Number(bossMechanicSummary && bossMechanicSummary.rewardBonusRate || 0) - Number(bossMechanicSummary && bossMechanicSummary.rewardPenaltyRate || 0);
    var dropTable = map && map.dropTable ? map.dropTable : null;
    var baseWeights = type === "boss"
      ? (dropTable && dropTable.bossRarityWeights ? dropTable.bossRarityWeights : { SR: 0.55, SSR: 0.32, UR: 0.13 })
      : (dropTable && dropTable.mobRarityWeights ? dropTable.mobRarityWeights : { R: 0.60, SR: 0.28, SSR: 0.10, UR: 0.02 });

    return pickByWeight(Object.keys(baseWeights).map(function (rarity) {
      var weight = Number(baseWeights[rarity] || 0);
      if (rarity === "UR") {
        weight += luckBoost * (type === "boss" ? 0.9 : 0.2);
        weight += fateBoost * (type === "boss" ? 0.9 : 0.25);
      } else if (rarity === "SSR") {
        weight += luckBoost * (type === "boss" ? 1.2 : 0.5);
        weight += fateBoost * (type === "boss" ? 1.2 : 0.55);
      } else if (rarity === "SR") {
        weight += luckBoost * 0.4;
        weight += fateBoost * 0.8;
      } else if (rarity === "R") {
        weight -= luckBoost * 0.8;
        weight -= fateBoost * 1.4;
      }
      if (type === "boss" && bossRewardShift !== 0) {
        if (rarity === "UR") {
          weight += bossRewardShift * 1.3;
        } else if (rarity === "SSR") {
          weight += bossRewardShift * 1.5;
        } else if (rarity === "SR") {
          weight += bossRewardShift * 0.6;
        } else if (rarity === "R") {
          weight -= bossRewardShift * 1.2;
        }
      }
      return [rarity, Math.max(0.001, weight)];
    }));
  }

  function buildDropWeight(item, map, player, fateImpact, sourceType) {
    var dropTable = map && map.dropTable ? map.dropTable : null;
    var weight = 1;
    var isBossDrop = sourceType === "boss";
    if (!dropTable) {
      return weight;
    }
    if (Array.isArray(dropTable.preferredElements) && dropTable.preferredElements.indexOf(item.element) >= 0) {
      weight += 2.4;
    }
    if (Array.isArray(dropTable.preferredSlots) && dropTable.preferredSlots.indexOf(item.slot) >= 0) {
      weight += 2.1;
    }
    if (Array.isArray(dropTable.featuredLoot) && dropTable.featuredLoot.indexOf(item.name) >= 0) {
      weight += isBossDrop ? 1.4 : 0.9;
    }
    if (isBossDrop && Array.isArray(dropTable.bossSignatureLoot) && dropTable.bossSignatureLoot.indexOf(item.name) >= 0) {
      weight += 2.8;
    }
    if (player) {
      if (player.dayMasterElement === item.element) {
        weight += 0.8;
      }
      if ((player.usefulGods || []).indexOf(item.element) >= 0) {
        weight += 1.2;
      }
      if (player.tabooGod === item.element) {
        weight -= 0.6;
      }
    }
    if (fateImpact && (fateImpact.rewardElements || []).indexOf(item.element) >= 0) {
      weight += 1.4;
      if (isBossDrop && Array.isArray(dropTable.bossSignatureLoot) && dropTable.bossSignatureLoot.indexOf(item.name) >= 0) {
        weight += 0.8;
      }
    }
    return weight;
  }

  function pickByWeight(entries) {
    var normalized = entries.map(function (e) { return [e[0], Math.max(0.001, e[1])]; });
    var total = normalized.reduce(function (sum, e) { return sum + e[1]; }, 0);
    var roll = Math.random() * total;
    var acc = 0;
    var i;
    for (i = 0; i < normalized.length; i += 1) {
      acc += normalized[i][1];
      if (roll <= acc) {
        return normalized[i][0];
      }
    }
    return normalized[normalized.length - 1][0];
  }

  function randomGearByRarity(rarity, map, player, fateImpact, sourceType) {
    var candidates = EQUIPMENT_POOL.filter(function (g) { return g.rarity === rarity; });
    if (candidates.length === 0) {
      candidates = EQUIPMENT_POOL.filter(function (g) { return g.rarity === "R"; });
    }
    return clone(pickByWeight(candidates.map(function (item) {
      return [item, buildDropWeight(item, map, player, fateImpact, sourceType)];
    })));
  }

  function renderPlayer() {
    if (!state.player) {
      el.playerCore.innerHTML = "<span class='muted'>未生成角色</span>";
      return;
    }
    var p = state.player;
    el.playerCore.innerHTML = [
      row("职业", p.className + "(" + p.dayMasterElement + ")"),
      row("身强弱", p.strength),
      row("喜用/忌神", p.usefulGods.join("/") + " / " + p.tabooGod),
      row("当前战力", String(p.powerScore)),
      row("HP", p.hpNow + " / " + p.currentStats.HP),
      row("ATK/DEF/INT", p.currentStats.ATK + " / " + p.currentStats.DEF + " / " + p.currentStats.INT),
      row("CHA/LUK", p.currentStats.CHA + " / " + p.currentStats.LUK)
    ].join("");
  }

  function renderEquipment() {
    if (!state.player) {
      el.slots.innerHTML = "<span class='muted'>未生成角色</span>";
      return;
    }
    el.slots.innerHTML = Object.keys(state.player.equipment).map(function (slot) {
      var item = state.player.equipment[slot];
      if (!item) {
        return "<div class='item'>" + SLOT_NAMES[slot] + ": <span class='muted'>空</span></div>";
      }
      return "<div class='item'>" + SLOT_NAMES[slot] + ": <strong>" + item.name + "</strong> [" + item.rarity + "] " +
        item.element + " · GearScore " + item.gearScore + "</div>";
    }).join("");
  }

  function renderInventory() {
    if (state.inventory.length === 0) {
      el.inv.innerHTML = "<span class='muted'>背包为空</span>";
      return;
    }
    el.inv.innerHTML = state.inventory.map(function (item, idx) {
      var id = "equip-" + idx;
      return "<div class='item'><div><strong>" + item.name + "</strong> [" + item.rarity + "] · " + SLOT_NAMES[item.slot] +
        " · " + item.element + " · GS " + item.gearScore + "</div><button data-equip='" + id + "'>替换到" + SLOT_NAMES[item.slot] + "</button></div>";
    }).join("");

    el.inv.querySelectorAll("button[data-equip]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(btn.getAttribute("data-equip").split("-")[1], 10);
        equipFromInventory(idx);
      });
    });
  }

  function renderDrops() {
    if (state.drops.length === 0) {
      el.drops.innerHTML = "<span class='muted'>暂无掉落</span>";
      return;
    }
    el.drops.innerHTML = state.drops.map(function (item) {
      return "<div class='item'><strong>" + item.name + "</strong> [" + item.rarity + "] · " + SLOT_NAMES[item.slot] + " · " + item.element + " · GS " + item.gearScore + "</div>";
    }).join("");
  }

  function equipFromInventory(index) {
    if (!state.player || !state.inventory[index]) {
      return;
    }
    var item = state.inventory[index];
    var old = state.player.equipment[item.slot];
    state.player.equipment[item.slot] = item;
    if (old) {
      state.inventory.push(old);
    }
    state.inventory.splice(index, 1);
    updateDerivedStats();
    renderEquipment();
    renderInventory();
    renderPlayer();
    persistProfileSnapshot("gear_change");
  }

  function autoEquipBest() {
    if (!state.player) {
      return;
    }
    Object.keys(state.player.equipment).forEach(function (slot) {
      var candidates = state.inventory.filter(function (item) { return item.slot === slot; });
      if (candidates.length === 0) {
        return;
      }
      candidates.sort(function (a, b) { return effectiveGearScore(b, state.player) - effectiveGearScore(a, state.player); });
      var best = candidates[0];
      var i = state.inventory.indexOf(best);
      if (i >= 0) {
        state.inventory.splice(i, 1);
      }
      state.player.equipment[slot] = best;
    });
  }

  function effectiveGearScore(item, player) {
    var score = item.gearScore;
    if (player.usefulGods.indexOf(item.element) >= 0) {
      score *= 1.12;
    }
    if (player.tabooGod === item.element) {
      score *= 0.9;
    }
    return score;
  }

  function row(k, v) {
    return "<div><span class='muted'>" + k + "</span>: " + v + "</div>";
  }

  function formatPillars(pillars) {
    return [pillars.year, pillars.month, pillars.day, pillars.hour].map(function (p) {
      return p.stem + p.branch;
    }).join("-");
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function roundTo(value, digits) {
    var pow = Math.pow(10, digits);
    return Math.round(value * pow) / pow;
  }

  function uniqueElements(list) {
    var seen = {};
    return (list || []).filter(function (item) {
      if (!item || seen[item]) {
        return false;
      }
      seen[item] = true;
      return true;
    });
  }

  function safeHref(value) {
    return String(value).replace(/"/g, "&quot;");
  }

  function normalizeReturnTo(value) {
    if (!value) {
      return "";
    }
    if (value.indexOf("../phase2/") === 0) {
      return value;
    }
    return "";
  }
})();
