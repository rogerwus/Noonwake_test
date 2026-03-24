(function () {
  "use strict";

  var DEV_PLAYER_ID_KEY = "lifeRpg.devPlayerId";
  var FONT_STACK = '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';
  var BASE_WIDTH = 1440;
  var BASE_HEIGHT = 900;
  var RANK_CHECK_EVENT = "phase3_rank_checked";
  var HUB_VIEW_EVENT = "phase3_hub_viewed";
  var PALETTE = {
    bg: 0x050816,
    panel: 0x0b1226,
    panelSoft: 0x101a31,
    stroke: 0x29446b,
    text: "#f4f7ff",
    textSoft: "#a9b8d3",
    gold: 0xf6c75a,
    cyan: 0x36d4ff,
    green: 0x56d38a,
    red: 0xff7d7d,
    purple: 0x8b5cf6
  };

  if (!window.Phaser) {
    showFallback("Phaser 3 未加载成功。请先在仓库根目录执行 `npm install`，再打开 `/phase3/`。");
    return;
  }

  window.addEventListener("load", function () {
    window.__lifeRpgPhase3Game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: "game-root",
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
      backgroundColor: "#050816",
      scene: [BootScene, HubScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: BASE_WIDTH,
        height: BASE_HEIGHT
      },
      render: {
        antialias: true,
        pixelArt: false
      }
    });
  });

  function BootScene() {
    Phaser.Scene.call(this, { key: "BootScene" });
  }

  BootScene.prototype = Object.create(Phaser.Scene.prototype);
  BootScene.prototype.constructor = BootScene;

  BootScene.prototype.preload = function () {
    ensureSharedTextures(this);
    this.cameras.main.setBackgroundColor("#050816");
    this.add.text(BASE_WIDTH / 2, 344, "人生副本 · 主城中枢", {
      fontFamily: FONT_STACK,
      fontSize: "44px",
      fontStyle: "700",
      color: "#f7fbff"
    }).setOrigin(0.5);
    this.add.text(BASE_WIDTH / 2, 402, "正在接入你的角色、资源和今日主线……", {
      fontFamily: FONT_STACK,
      fontSize: "22px",
      color: "#a9b8d3"
    }).setOrigin(0.5);
    this.loadingOrb = this.add.image(BASE_WIDTH / 2, 504, "phase3-orb").setTint(PALETTE.cyan).setAlpha(0.92).setScale(2.6);
    this.tweens.add({
      targets: this.loadingOrb,
      scale: 3.15,
      alpha: 0.52,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  };

  BootScene.prototype.create = function () {
    var scene = this;
    fetchPlayerState()
      .then(function (payload) {
        scene.scene.start("HubScene", {
          playerState: payload && payload.playerState ? payload.playerState : createFallbackPlayerState(),
          bootError: ""
        });
      })
      .catch(function (err) {
        scene.scene.start("HubScene", {
          playerState: createFallbackPlayerState(),
          bootError: err && err.message ? err.message : "主城情报加载失败"
        });
      });
  };

  function HubScene() {
    Phaser.Scene.call(this, { key: "HubScene" });
  }

  HubScene.prototype = Object.create(Phaser.Scene.prototype);
  HubScene.prototype.constructor = HubScene;

  HubScene.prototype.init = function (data) {
    this.playerState = normalizePlayerState(data && data.playerState);
    this.bootError = data && data.bootError ? data.bootError : "";
    this.lastTrackedStepId = "";
    this.root = null;
    this.toast = null;
  };

  HubScene.prototype.create = function () {
    ensureSharedTextures(this);
    hideFallback();
    this.drawBackdrop();
    this.root = this.add.container(0, 0);
    this.renderHub();
  };

  HubScene.prototype.drawBackdrop = function () {
    var graphics = this.add.graphics();
    graphics.fillStyle(PALETTE.bg, 1);
    graphics.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
    graphics.fillStyle(0x10234a, 0.42);
    graphics.fillCircle(1190, 122, 240);
    graphics.fillStyle(0x0c4d74, 0.16);
    graphics.fillCircle(210, 214, 180);
    graphics.fillStyle(0x4d2f81, 0.12);
    graphics.fillCircle(1010, 768, 220);
    graphics.lineStyle(1, 0x1f3355, 0.52);
    var i;
    for (i = 0; i < 9; i += 1) {
      graphics.lineBetween(0, 118 + i * 88, BASE_WIDTH, 118 + i * 88);
    }
    for (i = 0; i < 12; i += 1) {
      graphics.lineBetween(48 + i * 120, 0, 48 + i * 120, BASE_HEIGHT);
    }

    this.particles = this.add.particles(0, 0, "phase3-orb", {
      x: { min: 40, max: BASE_WIDTH - 40 },
      y: { min: 40, max: BASE_HEIGHT - 40 },
      speedY: { min: -18, max: -6 },
      speedX: { min: -6, max: 6 },
      scale: { start: 0.18, end: 0.02 },
      alpha: { start: 0.26, end: 0 },
      lifespan: 6200,
      frequency: 220,
      quantity: 1,
      tint: [0x36d4ff, 0xf6c75a, 0xa855f7],
      blendMode: Phaser.BlendModes.ADD
    });
  };

  HubScene.prototype.renderHub = function () {
    var guideModel = buildGuideModel(this.playerState);
    guideModel.scene = this;
    if (this.root) {
      this.root.removeAll(true);
    }
    drawTopBar(this, this.root, this.playerState, guideModel);
    drawHeroStage(this, this.root, this.playerState, guideModel);
    drawMissionRail(this, this.root, this.playerState, guideModel);
    trackHubExposure(this, guideModel);
  };

  HubScene.prototype.refreshState = function () {
    var scene = this;
    this.showToast("正在同步主城进度……", PALETTE.cyan);
    fetchPlayerState()
      .then(function (payload) {
        scene.playerState = normalizePlayerState(payload && payload.playerState);
        scene.bootError = "";
        scene.renderHub();
        scene.showToast("主城情报已刷新。", PALETTE.green);
      })
      .catch(function (err) {
        scene.showToast((err && err.message ? err.message : "刷新失败") + "，先继续本地试玩。", PALETTE.gold);
      });
  };

  HubScene.prototype.navigateTo = function (route, analyticsEvents) {
    var scene = this;
    recordAnalyticsEvents(analyticsEvents || [])
      .finally(function () {
        window.location.href = route;
      })
      .catch(function () {
        window.location.href = route;
      });
    scene.showToast("正在前往 " + route.replace(/^\//, "") + " ……", PALETTE.cyan);
  };

  HubScene.prototype.showToast = function (message, tint) {
    var bg;
    var text;
    var color = tint || PALETTE.cyan;

    if (this.toast) {
      this.toast.destroy(true);
    }
    this.toast = this.add.container(BASE_WIDTH / 2, BASE_HEIGHT - 54);
    bg = this.add.rectangle(0, 0, 540, 48, 0x07101f, 0.92).setStrokeStyle(1, color, 0.88);
    text = this.add.text(0, 0, message, {
      fontFamily: FONT_STACK,
      fontSize: "18px",
      color: "#f4f7ff"
    }).setOrigin(0.5);
    this.toast.add([bg, text]);
    this.toast.setDepth(20);
    this.toast.alpha = 0;
    this.tweens.add({
      targets: this.toast,
      alpha: 1,
      y: BASE_HEIGHT - 72,
      duration: 160,
      ease: "Sine.easeOut",
      yoyo: true,
      hold: 1700,
      onComplete: function () {
        if (bg && bg.scene) {
          bg.parentContainer.destroy(true);
        }
      }
    });
  };

  function drawTopBar(scene, root, playerState, guideModel) {
    var title;
    var subtitle;
    var current = guideModel.current;
    addPanel(scene, root, 36, 28, 1368, 84, 0x09101f, 0.94, 0x29446b, 0.9);
    title = scene.add.text(62, 46, "人生副本 · Phaser 主城", {
      fontFamily: FONT_STACK,
      fontSize: "30px",
      fontStyle: "700",
      color: "#f8fbff"
    });
    subtitle = scene.add.text(62, 80, "先跟主线走：看清你是谁、现在先去哪、做完后再去哪。", {
      fontFamily: FONT_STACK,
      fontSize: "15px",
      color: "#9fb0cf"
    });
    root.add([title, subtitle]);

    addResourcePill(scene, root, 742, 44, 136, 36, "灵石", numberText(playerState.walletState.spiritStone));
    addResourcePill(scene, root, 892, 44, 136, 36, "抽卡券", numberText(playerState.walletState.drawTickets));
    addResourcePill(scene, root, 1042, 44, 136, 36, "材料", numberText(playerState.walletState.materials));

    root.add(createButton(scene, 1192, 40, 90, 40, {
      label: "刷新",
      caption: "同步进度",
      fillColor: 0x10203c,
      strokeColor: PALETTE.cyan,
      titleSize: "18px",
      captionSize: "11px",
      onClick: function () {
        scene.refreshState();
      }
    }));

    root.add(createButton(scene, 1296, 40, 90, 40, {
      label: current ? current.shortLabel : "Phase2",
      caption: "现有流程",
      fillColor: 0x241a3d,
      strokeColor: PALETTE.gold,
      titleSize: "16px",
      captionSize: "11px",
      onClick: function () {
        var route = current ? current.route : "/phase2/";
        scene.navigateTo(route, buildNavigationEvents("phase3_quick_enter", current ? current.id : "phase2", "phase3_topbar", "从 Phaser 主城进入现有流程"));
      }
    }));
  }

  function drawHeroStage(scene, root, playerState, guideModel) {
    var profile = playerState.profile;
    var summary = playerState.equipmentState.summary;
    var dailyBoss = playerState.dailyBoss;
    var preflight = guideModel.preflight;
    var current = guideModel.current;
    var next = guideModel.next;
    var heroX = 36;
    var heroY = 128;
    var heroW = 860;
    var heroH = 736;
    var focusColor = elementColor(profile.dayMasterElement);
    var identityTitle = (profile.dayMasterElement || "未显化") + "命 · " + (profile.className || "命格待定");
    var identityName = profile.displayName && profile.displayName !== "未命名道友" ? profile.displayName : "未显化命格的旅者";
    var buildLine = summary.buildTag || "未配装";
    var powerLine = "战力 " + numberText(summary.totalPower || profile.powerScore) + " · 已穿戴 " + numberText(summary.equippedCount) + " 件";
    var stageTitle;
    var stageSub;
    var adviceText = playerState.adventureAdvice && playerState.adventureAdvice.reasonText
      ? playerState.adventureAdvice.reasonText
      : "先跟高亮主线跑一轮，别急着看所有系统。";

    addPanel(scene, root, heroX, heroY, heroW, heroH, 0x0a1223, 0.95, 0x29446b, 0.92);
    stageTitle = scene.add.text(heroX + 30, heroY + 28, "主城大殿 / MainHubScene", {
      fontFamily: FONT_STACK,
      fontSize: "28px",
      fontStyle: "700",
      color: "#f8fbff"
    });
    stageSub = scene.add.text(heroX + 30, heroY + 64, "不是文本卡片墙，而是告诉你“我是谁、现在做什么、做完去哪”的游戏舞台。", {
      fontFamily: FONT_STACK,
      fontSize: "16px",
      color: "#9fb0cf"
    });
    root.add([stageTitle, stageSub]);

    if (preflight.needsAwakening) {
      root.add(createButton(scene, heroX + 620, heroY + 28, 210, 54, {
        label: "先去命格开局",
        caption: "生成你的专属命格",
        fillColor: 0x152449,
        strokeColor: PALETTE.cyan,
        onClick: function () {
          scene.navigateTo("/phase1/?returnTo=" + encodeURIComponent("/phase3/"), buildNavigationEvents("phase3_awaken_click", "awakening", "phase3_stage", "从主城去命格开局"));
        }
      }));
    }

    drawHeroCore(scene, root, heroX + 294, heroY + 366, focusColor, profile.dayMasterElement || "命", profile.className || "待定");

    addInfoBlock(scene, root, heroX + 520, heroY + 126, 286, 126, "我是谁", [
      identityName,
      identityTitle,
      profile.recommendedBuild || "命格建议：先抽命器，再补套装。"
    ], focusColor);

    addInfoBlock(scene, root, heroX + 520, heroY + 270, 286, 154, "当前状态", [
      powerLine,
      buildLine + " · 强化总等级 " + numberText(summary.totalEnhancementLevel),
      dailyBoss ? ("今日 Boss：" + dailyBoss.bossName + " · 建议战力 " + numberText(dailyBoss.recommendedPower)) : "今日 Boss 情报待刷新"
    ], PALETTE.gold);

    addInfoBlock(scene, root, heroX + 520, heroY + 442, 286, 124, "下一拍别犹豫", [
      "现在先去：" + (current ? current.portalLabel : "主线已通关"),
      next ? ("做完后去：" + next.portalLabel) : "做完后去：回主城领奖 / 冲榜复盘",
      current ? current.summary : "这一轮已经跑通，可以直接继续日常循环。"
    ], PALETTE.cyan);

    addInfoBlock(scene, root, heroX + 42, heroY + 520, 778, 104, "今天为什么这么走", [
      adviceText,
      dailyBoss && dailyBoss.rewardFocus ? ("今日收益焦点：" + dailyBoss.rewardFocus) : "今日收益焦点：先把命器和强化做出体感。",
      guideModel.progressText + " · 做完后记得点右上角“刷新”同步主城。"
    ], 0x5b7cfa);

    drawPortalDeck(scene, root, heroX + 42, heroY + 642, 778, guideModel);

    if (scene.bootError) {
      addBanner(scene, root, heroX + 42, heroY + 90, 778, 42, "后端同步失败，先用默认状态起飞：" + scene.bootError, PALETTE.gold);
    }
  }

  function drawMissionRail(scene, root, playerState, guideModel) {
    var railX = 916;
    var railY = 128;
    var railW = 488;
    var railH = 736;
    var missions = guideModel.missions;
    var current = guideModel.current;
    var latestReward = playerState.rewardState.latest;
    var analyticsTip = hasAnalyticsEvent(playerState, RANK_CHECK_EVENT) || hasAnalyticsEvent(playerState, "playtest_leaderboard_viewed")
      ? "你已经有过看榜动作，后面就盯“差多少、该补什么”。"
      : "第四步不是读说明，而是亲自去榜单看差距。";
    var i;

    addPanel(scene, root, railX, railY, railW, railH, 0x0b1226, 0.95, 0x29446b, 0.92);
    root.add(scene.add.text(railX + 28, railY + 28, "新手主线 / Mission Rail", {
      fontFamily: FONT_STACK,
      fontSize: "28px",
      fontStyle: "700",
      color: "#f8fbff"
    }));
    root.add(scene.add.text(railX + 28, railY + 66, guideModel.progressText + " · 跟着高亮步骤走，就不会再像看后台页。", {
      fontFamily: FONT_STACK,
      fontSize: "15px",
      color: "#a9b8d3"
    }));

    for (i = 0; i < missions.length; i += 1) {
      root.add(createMissionCard(scene, railX + 24, railY + 102 + i * 118, 440, 102, missions[i], i + 1, guideModel.currentIndex));
    }

    addInfoBlock(scene, root, railX + 24, railY + 566, 440, 102, latestReward ? "别再迷路 / 最近到账" : "别再迷路", [
      "高亮任务就是你现在要做的唯一主线。",
      latestReward ? ((latestReward.title || "奖励到账") + " · " + (latestReward.summary || "")) : "还没拿到最近奖励？从第一步抽卡开始就行。",
      current ? ("当前高亮：" + current.title + " · 做完一步记得点右上角刷新。") : analyticsTip
    ], latestReward ? PALETTE.green : PALETTE.cyan);

    root.add(createButton(scene, railX + 24, railY + 680, 440, 54, {
      label: current ? ("去 " + current.shortLabel) : "继续循环",
      caption: current ? "执行当前主线；回来后记得刷新主城" : "打开现有流程继续刷图 / Boss / 榜单",
      fillColor: 0x1a2a4f,
      strokeColor: current ? current.accentColor : PALETTE.cyan,
      onClick: function () {
        var route = current ? current.route : "/phase2/";
        scene.navigateTo(route, buildStepEvents(current || { id: "loop", title: "继续循环" }, "phase3_sidebar_cta", "从右侧任务栏执行当前主线"));
      }
    }));
  }

  function drawHeroCore(scene, root, centerX, centerY, tint, dayMaster, className) {
    var floor = scene.add.ellipse(centerX, centerY + 158, 350, 84, 0x08101f, 0.78).setStrokeStyle(2, 0x244168, 0.64);
    var backOrb = scene.add.circle(centerX, centerY, 150, 0x0d1a35, 0.96).setStrokeStyle(3, tint, 0.88);
    var glow = scene.add.image(centerX, centerY, "phase3-orb").setTint(tint).setScale(10.8).setAlpha(0.24);
    var core = scene.add.image(centerX, centerY, "phase3-orb").setTint(tint).setScale(4.25).setAlpha(0.9);
    var ring = scene.add.circle(centerX, centerY, 118).setStrokeStyle(2, 0xf6c75a, 0.7);
    var tag = scene.add.text(centerX, centerY - 16, (dayMaster || "命") + "命", {
      fontFamily: FONT_STACK,
      fontSize: "44px",
      fontStyle: "700",
      color: "#f9fbff"
    }).setOrigin(0.5);
    var caption = scene.add.text(centerX, centerY + 40, className || "命格待定", {
      fontFamily: FONT_STACK,
      fontSize: "24px",
      color: "#d9e4ff"
    }).setOrigin(0.5);
    var glyphOrbit = scene.add.container(centerX, centerY);
    var glyphs = ["木", "火", "土", "金", "水"];
    var i;
    for (i = 0; i < glyphs.length; i += 1) {
      var angle = (Math.PI * 2 / glyphs.length) * i - Math.PI / 2;
      var glyph = scene.add.text(Math.cos(angle) * 154, Math.sin(angle) * 154, glyphs[i], {
        fontFamily: FONT_STACK,
        fontSize: "22px",
        fontStyle: "700",
        color: glyphs[i] === dayMaster ? "#f6c75a" : "#9fb0cf"
      }).setOrigin(0.5);
      glyphOrbit.add(glyph);
    }
    root.add([floor, backOrb, glow, core, ring, glyphOrbit, tag, caption]);
    scene.tweens.add({
      targets: glow,
      scale: { from: glow.scaleX, to: glow.scaleX + 1.2 },
      alpha: { from: 0.28, to: 0.12 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
    scene.tweens.add({
      targets: core,
      scale: { from: core.scaleX, to: core.scaleX + 0.28 },
      alpha: { from: 0.9, to: 0.7 },
      duration: 1320,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
    scene.tweens.add({
      targets: glyphOrbit,
      angle: 360,
      duration: 22000,
      repeat: -1,
      ease: "Linear"
    });
  }

  function drawPortalDeck(scene, root, x, y, width, guideModel) {
    var portals = buildPortalEntries(guideModel);
    var gap = 14;
    var buttonWidth = Math.floor((width - gap * 3) / 4);
    var i;
    for (i = 0; i < portals.length; i += 1) {
      root.add(createButton(scene, x + i * (buttonWidth + gap), y, buttonWidth, 84, {
        label: portals[i].label,
        caption: portals[i].caption,
        fillColor: portals[i].fillColor,
        strokeColor: portals[i].strokeColor,
        titleSize: "21px",
        captionSize: "12px",
        onClick: portals[i].onClick
      }));
    }
  }

  function buildPortalEntries(guideModel) {
    var scene = guideModel.scene;
    return [
      buildPortalEntry(scene, guideModel, "gacha", "抽卡阁", "先拿第一批命器", "/phase2/?tab=gacha", PALETTE.purple),
      buildPortalEntry(scene, guideModel, "gear", "炼器台", "换装 / 强化", "/phase2/?tab=gear", PALETTE.cyan),
      buildPortalEntry(scene, guideModel, guideModel.combatMission.id, guideModel.combatMission.portalLabel, "Adventure / Boss", guideModel.combatMission.route, PALETTE.red),
      buildPortalEntry(scene, guideModel, "rank", "天机榜", "看差距再决定下一轮", "/phase2/?tab=leaderboard", PALETTE.gold)
    ];
  }

  function buildPortalEntry(scene, guideModel, id, label, caption, route, strokeColor) {
    var active = guideModel.current && guideModel.current.id === id;
    return {
      label: active ? ("▶ " + label) : label,
      caption: active ? ("当前主线 · " + caption) : caption,
      fillColor: active ? 0x17284e : 0x111b33,
      strokeColor: strokeColor,
      onClick: function () {
        var mission = guideModel.missionById[id] || guideModel.current || { id: id, title: label, route: route, shortLabel: label };
        scene.navigateTo(route, buildStepEvents(mission, "phase3_portal", "从主城快捷入口进入"));
      }
    };
  }

  function createMissionCard(scene, x, y, width, height, mission, stepNo, currentIndex) {
    var container = scene.add.container(x, y);
    var isCurrent = mission.index === currentIndex && !mission.completed;
    var isDone = mission.completed;
    var fillColor = isDone ? 0x102a20 : (isCurrent ? 0x152449 : 0x111a2f);
    var strokeColor = isDone ? PALETTE.green : (isCurrent ? mission.accentColor : 0x385374);
    var shadow = scene.add.rectangle(width / 2 + 4, height / 2 + 6, width, height, 0x02060f, 0.34);
    var bg = scene.add.rectangle(width / 2, height / 2, width, height, fillColor, 0.98).setStrokeStyle(2, strokeColor, 0.94);
    var bubble = scene.add.circle(32, 28, 18, strokeColor, 0.9);
    var bubbleText = scene.add.text(32, 28, String(stepNo), {
      fontFamily: FONT_STACK,
      fontSize: "16px",
      fontStyle: "700",
      color: "#08111f"
    }).setOrigin(0.5);
    var statusText = isDone ? "已完成" : (isCurrent ? "现在就去" : "待开启");
    var statusColor = isDone ? "#8ef0bb" : (isCurrent ? "#ffd676" : "#8aa0c6");
    var title = scene.add.text(62, 16, mission.title, {
      fontFamily: FONT_STACK,
      fontSize: "21px",
      fontStyle: "700",
      color: "#f8fbff"
    });
    var summary = scene.add.text(62, 46, mission.summary, {
      fontFamily: FONT_STACK,
      fontSize: "13px",
      color: "#b1c0dd",
      wordWrap: { width: width - 148 }
    });
    var footer = scene.add.text(62, 78, isDone ? mission.doneLine : mission.footer, {
      fontFamily: FONT_STACK,
      fontSize: "12px",
      color: statusColor
    });
    var tag = scene.add.text(width - 18, 18, statusText, {
      fontFamily: FONT_STACK,
      fontSize: "13px",
      fontStyle: "700",
      color: statusColor,
      backgroundColor: "rgba(0,0,0,0)"
    }).setOrigin(1, 0);
    container.add([shadow, bg, bubble, bubbleText, title, summary, footer, tag]);

    if (isCurrent || isDone) {
      var hit = scene.add.zone(width / 2, height / 2, width, height).setInteractive({ useHandCursor: true });
      hit.on("pointerover", function () {
        bg.setFillStyle(isDone ? 0x123225 : 0x19305b, 1);
      });
      hit.on("pointerout", function () {
        bg.setFillStyle(fillColor, 0.98);
      });
      hit.on("pointerup", function () {
        scene.navigateTo(mission.route, buildStepEvents(mission, "phase3_mission_card", "从任务链卡片进入步骤"));
      });
      container.add(hit);
      if (isCurrent) {
        scene.tweens.add({
          targets: bg,
          alpha: 0.78,
          duration: 780,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut"
        });
      }
    }

    return container;
  }

  function addResourcePill(scene, root, x, y, width, height, label, value) {
    var shadow = scene.add.rectangle(x + width / 2 + 2, y + height / 2 + 4, width, height, 0x04070f, 0.28);
    var bg = scene.add.rectangle(x + width / 2, y + height / 2, width, height, 0x111b33, 0.96).setStrokeStyle(1, 0x385374, 0.88);
    var key = scene.add.text(x + 14, y + 8, label, {
      fontFamily: FONT_STACK,
      fontSize: "12px",
      color: "#8ea3c8"
    });
    var val = scene.add.text(x + 14, y + 18, value, {
      fontFamily: FONT_STACK,
      fontSize: "18px",
      fontStyle: "700",
      color: "#f8fbff"
    });
    root.add([shadow, bg, key, val]);
  }

  function addInfoBlock(scene, root, x, y, width, height, title, lines, accent) {
    var shadow = scene.add.rectangle(x + width / 2 + 4, y + height / 2 + 6, width, height, 0x02060f, 0.28);
    var bg = scene.add.rectangle(x + width / 2, y + height / 2, width, height, 0x0f182d, 0.97).setStrokeStyle(1, accent || 0x355176, 0.92);
    var bar = scene.add.rectangle(x + 14, y + 18, 6, height - 28, accent || 0x355176, 0.95).setOrigin(0, 0);
    var titleText = scene.add.text(x + 28, y + 14, title, {
      fontFamily: FONT_STACK,
      fontSize: "18px",
      fontStyle: "700",
      color: "#f8fbff"
    });
    root.add([shadow, bg, bar, titleText]);

    (lines || []).slice(0, 3).forEach(function (line, index) {
      var text = scene.add.text(x + 28, y + 46 + index * 28, line, {
        fontFamily: FONT_STACK,
        fontSize: index === 0 ? "16px" : "14px",
        color: index === 0 ? "#e8efff" : "#a9b8d3",
        wordWrap: { width: width - 46 }
      });
      root.add(text);
    });
  }

  function addBanner(scene, root, x, y, width, height, message, accent) {
    var bg = scene.add.rectangle(x + width / 2, y + height / 2, width, height, 0x231a0a, 0.92).setStrokeStyle(1, accent || PALETTE.gold, 0.96);
    var text = scene.add.text(x + 16, y + 10, message, {
      fontFamily: FONT_STACK,
      fontSize: "14px",
      color: "#f8df9c",
      wordWrap: { width: width - 30 }
    });
    root.add([bg, text]);
  }

  function addPanel(scene, root, x, y, width, height, fillColor, fillAlpha, strokeColor, strokeAlpha) {
    var shadow = scene.add.rectangle(x + width / 2 + 5, y + height / 2 + 8, width, height, 0x02060f, 0.36);
    var bg = scene.add.rectangle(x + width / 2, y + height / 2, width, height, fillColor, fillAlpha).setStrokeStyle(1, strokeColor, strokeAlpha);
    root.add([shadow, bg]);
    return bg;
  }

  function createButton(scene, x, y, width, height, options) {
    var container = scene.add.container(x, y);
    var shadow = scene.add.rectangle(width / 2 + 3, height / 2 + 5, width, height, 0x02060f, 0.34);
    var bg = scene.add.rectangle(width / 2, height / 2, width, height, options.fillColor || 0x14213b, 0.98).setStrokeStyle(2, options.strokeColor || PALETTE.cyan, 0.92);
    var title = scene.add.text(16, 10, options.label || "按钮", {
      fontFamily: FONT_STACK,
      fontSize: options.titleSize || "19px",
      fontStyle: "700",
      color: "#f8fbff"
    });
    var caption = scene.add.text(16, Math.max(28, height - 22), options.caption || "", {
      fontFamily: FONT_STACK,
      fontSize: options.captionSize || "12px",
      color: "#a9b8d3",
      wordWrap: { width: width - 28 }
    }).setOrigin(0, 1);
    container.add([shadow, bg, title, caption]);

    if (typeof options.onClick === "function") {
      var hit = scene.add.zone(width / 2, height / 2, width, height).setInteractive({ useHandCursor: true });
      hit.on("pointerover", function () {
        bg.setFillStyle(lightenColor(options.fillColor || 0x14213b, 18), 1);
      });
      hit.on("pointerout", function () {
        bg.setFillStyle(options.fillColor || 0x14213b, 0.98);
      });
      hit.on("pointerup", options.onClick);
      container.add(hit);
    }

    return container;
  }

  function buildGuideModel(playerState) {
    var combatMission = buildCombatMission(playerState);
    var missions = [
      {
        id: "gacha",
        index: 0,
        title: "第一步：去抽卡",
        shortLabel: "抽卡",
        portalLabel: "抽卡阁",
        summary: "先抽 1 次命器，马上得到“这是游戏”的第一件实物反馈。",
        footer: "抽完立刻去炼器台，别停在说明页。",
        doneLine: "已拿到第一批命器，可以继续扩 build。",
        route: "/phase2/?tab=gacha",
        accentColor: PALETTE.purple,
        completed: hasGachaProgress(playerState)
      },
      {
        id: "gear",
        index: 1,
        title: "第二步：去换装 / 强化",
        shortLabel: "炼器台",
        portalLabel: "炼器台",
        summary: "把抽到的命器穿上，顺手强化一次，立刻感受到战力变化。",
        footer: "看到战力涨了，再去试炼就有目标感。",
        doneLine: "已做出第一版 build，接下来去战斗兑现。",
        route: "/phase2/?tab=gear",
        accentColor: PALETTE.cyan,
        completed: hasGearProgress(playerState)
      },
      combatMission,
      {
        id: "rank",
        index: 3,
        title: "第四步：去 Rank 验收",
        shortLabel: "天机榜",
        portalLabel: "天机榜",
        summary: "去榜单看你和别人差多少，下一轮该补什么就一眼明白。",
        footer: "看完榜单，回主城继续循环。",
        doneLine: "已完成第一次验收，后续就盯差距与下一轮补强。",
        route: "/phase2/?tab=leaderboard",
        accentColor: PALETTE.gold,
        completed: hasRankProgress(playerState)
      }
    ];
    var currentIndex = missions.findIndex(function (mission) {
      return !mission.completed;
    });
    var completedCount = missions.filter(function (mission) {
      return mission.completed;
    }).length;
    var current;
    var next;
    var preflight = buildPreflight(playerState);
    var missionById = {};

    if (currentIndex === -1) {
      currentIndex = missions.length - 1;
    }
    current = completedCount === missions.length ? {
      id: "loop",
      title: "这一轮主线已通关",
      shortLabel: "继续循环",
      portalLabel: "Boss / 榜单循环",
      summary: "现在就回到主循环：刷图、补 build、Boss、看榜单。",
      route: "/phase2/?tab=home",
      accentColor: PALETTE.green
    } : missions[currentIndex];
    next = completedCount === missions.length ? null : missions[currentIndex + 1] || null;

    missions.forEach(function (mission) {
      missionById[mission.id] = mission;
    });

    return {
      missions: missions,
      combatMission: combatMission,
      currentIndex: currentIndex,
      current: current,
      next: next,
      missionById: missionById,
      completedCount: completedCount,
      progressText: "主线进度 " + completedCount + " / " + missions.length,
      preflight: preflight,
      scene: null
    };
  }

  function buildCombatMission(playerState) {
    var totalPower = Number(playerState.equipmentState.summary.totalPower || playerState.profile.powerScore || 0);
    var recommendedPower = Number(playerState.dailyBoss && playerState.dailyBoss.recommendedPower || 0);
    var pushBoss = recommendedPower > 0 && totalPower >= Math.max(240, recommendedPower * 0.82);
    return {
      id: "combat",
      index: 2,
      title: pushBoss ? "第三步：去 Boss 验伤" : "第三步：去 Adventure 试炼",
      shortLabel: pushBoss ? "Boss" : "Adventure",
      portalLabel: pushBoss ? "Boss 祭坛" : "Adventure 试炼门",
      summary: pushBoss
        ? "今天已经有资格碰一次 Boss。就算没打赢，也能明白机制和奖励焦点。"
        : "先打一局 Adventure，拿到材料和掉落，再回来挑战 Boss。",
      footer: pushBoss ? "Boss 打完就去榜单验收。" : "试炼后如果手感顺，再去 Boss。",
      doneLine: "已经打过第一轮战斗，马上去榜单看差距。",
      route: pushBoss ? "/phase2/?tab=boss" : "/phase2/?tab=adventure",
      accentColor: PALETTE.red,
      completed: hasCombatProgress(playerState)
    };
  }

  function buildPreflight(playerState) {
    var className = playerState.profile.className || "";
    var needsAwakening = !className || className === "未开局";
    return {
      needsAwakening: needsAwakening,
      title: needsAwakening ? "命格还没显化" : "命格已经就位",
      summary: needsAwakening
        ? "建议先去 Phase 1 做一次命格开局，再回来会更像“你自己的角色”；不想中断也能直接沿主线试玩。"
        : "你已经有了命格身份，这个主城会按当前角色状态推荐第一步。"
    };
  }

  function trackHubExposure(scene, guideModel) {
    var current = guideModel.current;
    if (!current || scene.lastTrackedStepId === current.id) {
      return;
    }
    scene.lastTrackedStepId = current.id;
    recordAnalyticsEvents([
      {
        name: "guide_step_viewed",
        category: "guide",
        funnelStep: "phase3_hub",
        status: "visible",
        source: "phase3",
        placementId: "phase3_hub",
        message: current.title,
        metadata: { stepId: current.id }
      },
      {
        name: HUB_VIEW_EVENT,
        category: "phase3",
        funnelStep: "hub_enter",
        status: "visible",
        source: "phase3",
        placementId: "phase3_hub",
        message: "Phaser 主城已打开",
        metadata: { currentStepId: current.id }
      }
    ]);
  }

  function buildStepEvents(step, placementId, message) {
    var events = [
      {
        name: "guide_cta_clicked",
        category: "guide",
        funnelStep: "phase3_cta",
        status: "clicked",
        source: "phase3",
        placementId: placementId,
        message: message || step.title,
        metadata: {
          stepId: step.id || "",
          route: step.route || ""
        }
      }
    ];
    if (step && step.id === "rank") {
      events.push({
        name: "playtest_leaderboard_viewed",
        category: "playtest",
        funnelStep: "playtest_leaderboard",
        status: "clicked",
        source: "phase3",
        placementId: placementId,
        message: "从 Phaser 主城去榜单验收",
        metadata: { stepId: step.id }
      });
      events.push({
        name: RANK_CHECK_EVENT,
        category: "phase3",
        funnelStep: "rank_check",
        status: "clicked",
        source: "phase3",
        placementId: placementId,
        message: "已从 Phaser 主城触发榜单验收",
        metadata: { stepId: step.id }
      });
    }
    return events;
  }

  function buildNavigationEvents(name, stepId, placementId, message) {
    return [{
      name: name,
      category: "phase3",
      funnelStep: "navigation",
      status: "clicked",
      source: "phase3",
      placementId: placementId,
      message: message,
      metadata: { stepId: stepId || "" }
    }];
  }

  function fetchPlayerState() {
    return requestJson("/player/state", { method: "GET" });
  }

  function requestJson(url, options) {
    var settings = options || {};
    var fetchOptions = {
      method: settings.method || "GET",
      headers: buildRequestHeaders(settings.headers)
    };
    if (settings.body != null) {
      fetchOptions.body = JSON.stringify(settings.body);
    }
    return window.fetch(url, fetchOptions).then(function (response) {
      if (!response.ok) {
        return response.json().catch(function () {
          return { message: response.statusText || ("HTTP " + response.status) };
        }).then(function (payload) {
          throw new Error(payload.message || response.statusText || ("HTTP " + response.status));
        });
      }
      return response.json();
    });
  }

  function recordAnalyticsEvents(events) {
    if (!Array.isArray(events) || !events.length || !window.fetch) {
      return Promise.resolve();
    }
    return requestJson("/analytics/track", {
      method: "POST",
      body: { events: events }
    }).catch(function () {
      return null;
    });
  }

  function buildRequestHeaders(extraHeaders) {
    var headers = clone(extraHeaders || {});
    headers["Content-Type"] = "application/json";
    headers["X-Player-Id"] = getOrCreatePlayerId();
    return headers;
  }

  function getOrCreatePlayerId() {
    var current;
    var next;
    try {
      current = window.localStorage.getItem(DEV_PLAYER_ID_KEY);
      if (current) {
        return current;
      }
      next = window.crypto && typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : "dev-" + Date.now() + "-" + Math.random().toString(16).slice(2, 10);
      window.localStorage.setItem(DEV_PLAYER_ID_KEY, next);
      return next;
    } catch (err) {
      return "guest-phase3";
    }
  }

  function normalizePlayerState(raw) {
    var state = raw || {};
    return {
      profile: state.profile || { displayName: "未命名道友", className: "未开局", dayMasterElement: "无", powerScore: 0, recommendedBuild: "" },
      walletState: state.walletState || { spiritStone: 1200, drawTickets: 4, materials: 36 },
      dailyState: state.dailyState || { progress: {}, specialClaims: {} },
      gachaState: state.gachaState || { history: [], inventory: [], lastResult: null },
      equipmentState: state.equipmentState || { summary: { totalPower: 0, buildTag: "未配装", equippedCount: 0, totalEnhancementLevel: 0 }, setBonus: {} },
      bossState: state.bossState || { lastProcessedBattleTimestamp: "", records: {} },
      analyticsState: state.analyticsState || { events: [], funnel: {}, monitoring: {}, recent: { keyEvents: [], orders: [], rewards: [] } },
      rewardState: state.rewardState || { latest: null, history: [] },
      dailyBoss: state.dailyBoss || null,
      adventureAdvice: state.adventureAdvice || null
    };
  }

  function createFallbackPlayerState() {
    return normalizePlayerState(null);
  }

  function hasGachaProgress(playerState) {
    return Number(playerState.dailyState && playerState.dailyState.progress && playerState.dailyState.progress.gacha || 0) > 0 ||
      (playerState.gachaState && Array.isArray(playerState.gachaState.history) && playerState.gachaState.history.length > 0);
  }

  function hasGearProgress(playerState) {
    var summary = playerState.equipmentState && playerState.equipmentState.summary ? playerState.equipmentState.summary : {};
    return Number(summary.equippedCount || 0) > 0 || Number(summary.totalEnhancementLevel || 0) > 0 || hasAnalyticsEvent(playerState, "playtest_gear_progressed");
  }

  function hasCombatProgress(playerState) {
    var progress = playerState.dailyState && playerState.dailyState.progress ? playerState.dailyState.progress : {};
    return Number(progress.adventure || 0) > 0 || Number(progress.boss || 0) > 0 || !!(playerState.bossState && playerState.bossState.lastProcessedBattleTimestamp);
  }

  function hasRankProgress(playerState) {
    return hasAnalyticsEvent(playerState, RANK_CHECK_EVENT) || hasAnalyticsEvent(playerState, "playtest_leaderboard_viewed");
  }

  function hasAnalyticsEvent(playerState, eventName) {
    var events = playerState.analyticsState && Array.isArray(playerState.analyticsState.events)
      ? playerState.analyticsState.events
      : [];
    return events.some(function (entry) {
      return entry && entry.name === eventName;
    });
  }

  function ensureSharedTextures(scene) {
    if (!scene.textures.exists("phase3-orb")) {
      var graphics = scene.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(16, 16, 16);
      graphics.generateTexture("phase3-orb", 32, 32);
      graphics.destroy();
    }
  }

  function showFallback(message) {
    var el = document.getElementById("fallback");
    if (!el) {
      return;
    }
    el.hidden = false;
    el.textContent = message;
  }

  function hideFallback() {
    var el = document.getElementById("fallback");
    if (!el) {
      return;
    }
    el.hidden = true;
    el.textContent = "";
  }

  function numberText(value) {
    return String(Math.max(0, Number(value || 0)));
  }

  function clone(obj) {
    if (obj == null) {
      return obj;
    }
    return JSON.parse(JSON.stringify(obj));
  }

  function lightenColor(color, amount) {
    var r = Math.min(255, ((color >> 16) & 255) + amount);
    var g = Math.min(255, ((color >> 8) & 255) + amount);
    var b = Math.min(255, (color & 255) + amount);
    return (r << 16) + (g << 8) + b;
  }

  function elementColor(element) {
    var map = {
      木: 0x4ade80,
      火: 0xfb7185,
      土: 0xf6c75a,
      金: 0xf8fafc,
      水: 0x36d4ff
    };
    return map[element] || PALETTE.cyan;
  }
})();
