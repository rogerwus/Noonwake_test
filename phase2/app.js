(function () {
  "use strict";

  var STORAGE_KEYS = {
    latestBattle: "lifeRpg.phase1.latestBattleResult",
    profileSnapshot: "lifeRpg.phase1.profileSnapshot",
    gachaState: "lifeRpg.phase2.gachaState",
    dailyState: "lifeRpg.phase2.dailyState",
    equipmentState: "lifeRpg.phase2.equipmentState",
    walletState: "lifeRpg.phase2.walletState",
    bossState: "lifeRpg.phase2.bossState",
    opsState: "lifeRpg.phase2.opsState",
    signInState: "lifeRpg.phase2.signInState",
    activityState: "lifeRpg.phase2.activityState",
    rewardState: "lifeRpg.phase2.rewardState",
    analyticsState: "lifeRpg.phase2.analyticsState",
    analyticsExposureLog: "lifeRpg.phase2.analyticsExposureLog",
    guideState: "lifeRpg.phase2.guideState",
    commerceState: "lifeRpg.phase2.commerceState"
  };
  var DEV_PLAYER_ID_KEY = "lifeRpg.devPlayerId";
  var SPECIAL_DAILY_TASK_ID = "daily_boss_first_clear";
  var SLOT_LABELS = {
    weapon: "武器",
    armor: "防具",
    talisman: "护符",
    accessory: "饰品",
    core: "命盘核心"
  };
  var GEAR_SLOT_KEYS = Object.keys(SLOT_LABELS);
  var REWARD_LABELS = {
    spiritStone: "灵石",
    drawTickets: "抽卡券",
    materials: "材料"
  };
  var ELEMENT_ORDER = ["木", "火", "土", "金", "水"];
  var ELEMENT_COUNTER_TO = {
    木: "金",
    火: "水",
    土: "木",
    金: "火",
    水: "土"
  };
  var DEFAULT_WALLET = {
    spiritStone: 1200,
    drawTickets: 4,
    materials: 36
  };
  var DAILY_TASKS = [
    {
      id: "adventure",
      label: "刷图 1 次",
      target: 1,
      reward: { spiritStone: 80, materials: 8 }
    },
    {
      id: "boss",
      label: "打 Boss 1 次",
      target: 1,
      reward: { spiritStone: 80, drawTickets: 1, materials: 5 }
    },
    {
      id: "gacha",
      label: "抽卡 1 次",
      target: 1,
      reward: { spiritStone: 120, materials: 3 }
    }
  ];
  var DAILY_LOGIN_REWARD = {
    spiritStone: 70,
    materials: 5
  };
  var DAILY_BOSS_FIRST_CLEAR_REWARD = {
    spiritStone: 260,
    drawTickets: 2,
    materials: 12
  };
  var FIRST_PURCHASE_REWARD = {
    spiritStone: 360,
    drawTickets: 2,
    materials: 8
  };
  var MONTHLY_CARD_CONFIG = {
    activationReward: { drawTickets: 1, materials: 6 },
    dailyReward: { spiritStone: 100, materials: 4 },
    durationDays: 30
  };
  var EVENT_BUNDLE_REWARD = {
    spiritStone: 220,
    drawTickets: 2,
    materials: 10
  };
  var CONSUMABLE_SUPPLY_REWARD = {
    spiritStone: 180,
    drawTickets: 1,
    materials: 18
  };
  var BOSS_RUSH_REWARD = {
    spiritStone: 260,
    drawTickets: 2,
    materials: 12
  };
  var GACHA_PITY_SSR_THRESHOLD = 50;
  var SET_DEFINITIONS = {
    木: { id: "qinglong", name: "青龙套", element: "木", focus: "恢复 / 成长 / 续航" },
    火: { id: "zhuque", name: "朱雀套", element: "火", focus: "爆发 / 燃烧 / AOE" },
    土: { id: "qilin", name: "麒麟套", element: "土", focus: "护盾 / 减伤 / 反伤" },
    金: { id: "baihu", name: "白虎套", element: "金", focus: "暴击 / 穿透 / 斩杀" },
    水: { id: "xuanwu", name: "玄武套", element: "水", focus: "控制 / 回能 / 连携" }
  };
  var SIGN_IN_REWARDS = [
    {
      day: 1,
      title: "启程补给",
      reward: { spiritStone: 80, materials: 6 },
      rewardHint: "先把第一件命器抬到 +1~+2"
    },
    {
      day: 2,
      title: "命器润养",
      reward: { spiritStone: 100, materials: 8 },
      rewardHint: "把第一轮强化材料提前补齐"
    },
    {
      day: 3,
      title: "天机抽卡令",
      reward: { drawTickets: 1, materials: 5 },
      rewardHint: "抽到新件后更容易接换装"
    },
    {
      day: 4,
      title: "太岁讨伐资粮",
      reward: { spiritStone: 160, materials: 8 },
      rewardHint: "给第一次 Boss 冲榜准备战备"
    },
    {
      day: 5,
      title: "流年灵石雨",
      reward: { spiritStone: 200, materials: 10 },
      rewardHint: "中段重点补强化与 farm 节奏"
    },
    {
      day: 6,
      title: "命纹双券礼",
      reward: { drawTickets: 2, materials: 10 },
      rewardHint: "为一次集中追卡与补件蓄力"
    },
    {
      day: 7,
      title: "命盘觉醒礼",
      reward: { spiritStone: 420, drawTickets: 3, materials: 14 },
      rewardHint: "周目高峰，给冲榜前的最后一轮追件窗口"
    }
  ];
  var GUIDE_STEPS = [
    {
      id: "free_draw",
      shortLabel: "免费抽",
      label: "先领一次免费抽",
      description: "先把免费命器单抽拿掉，立刻进入第一波成长，并为第一次换装做准备。",
      primaryTab: "gacha",
      primaryLabel: "去免费抽"
    },
    {
      id: "first_equip",
      shortLabel: "换装",
      label: "把第一件命器穿上",
      description: "抽到命器后直接去 Gear 换上，让战力和套装进度开始变化。",
      primaryTab: "gear",
      primaryLabel: "去换装"
    },
    {
      id: "first_enhance",
      shortLabel: "强化",
      label: "做第一次强化",
      description: "优先抬主武器或命盘核心到 +1~+3，让第一次换装后的战力跳升更明显。",
      primaryTab: "gear",
      primaryLabel: "去强化"
    },
    {
      id: "first_farm",
      shortLabel: "刷图",
      label: "去打一把推荐图",
      description: "刷图负责补材料和掉落：命宫试炼补底子，五行秘境补输出，为 Boss 和排行榜准备下一轮 build。",
      primaryTab: "adventure",
      primaryLabel: "去刷图"
    },
    {
      id: "first_boss",
      shortLabel: "Boss",
      label: "挑战第一次 Boss",
      description: "先完成一次 Boss，拿到首通、记分和更明确的 build 反馈，再决定要不要继续冲榜。",
      primaryTab: "boss",
      primaryLabel: "去 Boss"
    },
    {
      id: "leaderboard_check",
      shortLabel: "看榜",
      label: "去榜单确认差距",
      description: "看清你为什么排在这里，再决定补抽、强化，还是继续冲 Boss 分。",
      primaryTab: "leaderboard",
      primaryLabel: "去看榜"
    }
  ];
  var FREE_DAILY_DRAW = {
    poolId: "artifact",
    label: "每日免费单抽",
    note: "每日免费"
  };
  var OPS_ENTRIES = [
    {
      id: "first_purchase",
      tag: "首购",
      name: "首购礼包",
      summary: "完成首战后露出，验证低门槛首购转化链路是否顺手。",
      items: ["灵石 x360", "抽卡券 x2", "材料 x8", "SR 命器箱（占位）"],
      reward: { spiritStone: 360, drawTickets: 2, materials: 8 },
      placement: "主城运营位 / 首战后",
      note: "当前不接真实支付，但会先创建订单，再模拟支付成功 / 失败 / 取消，并按订单结果决定是否到账。"
    },
    {
      id: "ten_draw_offer",
      tag: "十连",
      name: "十连特惠",
      summary: "把抽卡爽点做成主动点击入口，不打断主循环。",
      items: ["十连折扣位（占位）", "新手十连说明位", "抽卡页联动跳转"],
      placement: "主城运营位 / 抽卡页",
      note: "当前只保留入口说明、查看次数和页面跳转。",
      jumpTab: "gacha",
      jumpLabel: "去抽卡"
    },
    {
      id: "monthly_card",
      tag: "月卡",
      name: "月卡",
      summary: "验证长期留存型轻付费入口，不做重商城但补齐订单与权益状态。",
      items: ["每日灵石 x100", "每日材料 x4", "首开抽卡券 x1", "开通材料 x6"],
      activationReward: { drawTickets: 1, materials: 6 },
      dailyReward: { spiritStone: 100, materials: 4 },
      durationDays: 30,
      placement: "主城运营位",
      note: "当前会先创建订单，再模拟支付；只有订单 paid / fulfilled 后才会开通月卡权益。"
    },
    {
      id: "event_bundle",
      tag: "活动",
      name: "太岁讨伐补给包",
      summary: "活动期一次性礼包，重点补 Boss 周期的追榜与兑换资源。",
      items: ["灵石 x220", "抽卡券 x2", "材料 x10"],
      reward: { spiritStone: 220, drawTickets: 2, materials: 10 },
      placement: "Boss / 活动卡片",
      note: "仅在活动进行中可创建订单，本期到账后会明确显示“已履约”。"
    },
    {
      id: "combat_supply_bundle",
      tag: "消耗",
      name: "战备补给箱",
      summary: "可重复购买的消耗型礼包，专门补抽卡 / 强化缺口。",
      items: ["灵石 x180", "抽卡券 x1", "材料 x18"],
      reward: { spiritStone: 180, drawTickets: 1, materials: 18 },
      placement: "Home / 资源缺口提示",
      note: "每笔订单支付成功后都会立即到账，并保留累计到账次数。"
    },
    {
      id: "boss_rush_bundle",
      tag: "一次性",
      name: "Boss 冲刺礼包",
      summary: "在首次 Boss / 榜单受挫后承接的一次性冲刺包。",
      items: ["灵石 x260", "抽卡券 x2", "材料 x12"],
      reward: { spiritStone: 260, drawTickets: 2, materials: 12 },
      placement: "Boss / 排行榜回流位",
      note: "完成一次 Boss 尝试后解锁，只能到账一次。"
    }
  ];
  var PRODUCT_CATALOG = [
    {
      id: "prod_first_purchase_launch_v1",
      sku: "sku.first_purchase.launch_v1",
      offerId: "first_purchase",
      title: "首购礼包",
      productType: "first_purchase",
      kind: "one_time",
      purchaseType: "non-consumable",
      entitlementType: "first_purchase_grant",
      priceLabel: "￥6 首购占位",
      priceValue: 6,
      currency: "CNY",
      price: { amount: 600, currency: "CNY", label: "￥6" },
      entitlementId: "ent_first_purchase",
      orderTemplate: "mock.first_purchase.v2",
      duration: { count: 0, unit: "instant" },
      unlockCondition: "first_battle_complete",
      placement: "主城运营位 / 首战后",
      valueSummary: "首战后直接补一轮抽卡、换装和 +3 前强化预算，首刀价值更清楚。",
      whyToday: "现在免费线已经能顺跑，首购位要更像一次明确的加速包，而不是只补一点零钱。",
      benefits: ["灵石 x360", "抽卡券 x2", "材料 x8", "SR 命器箱（占位）"],
      benefitHighlights: ["立刻补一轮追卡预算", "直接接 +1~+3 强化窗口", "首战后到账反馈更明显"],
      entryHooks: ["首战后露出", "Home 今日推荐", "到账后回看奖励账本"],
      grantPreview: [
        { stage: "fulfilled", summary: "支付成功后立即到账：灵石 x360 / 抽卡券 x2 / 材料 x8" }
      ],
      orderStage: "created"
    },
    {
      id: "prod_monthly_card_launch_v1",
      sku: "sku.monthly_card.launch_v1",
      offerId: "monthly_card",
      title: "月卡",
      productType: "monthly_card",
      kind: "subscription",
      purchaseType: "subscription-like",
      entitlementType: "monthly_card_access",
      priceLabel: "￥30 / 30天 占位",
      priceValue: 30,
      currency: "CNY",
      price: { amount: 3000, currency: "CNY", label: "￥30" },
      entitlementId: "ent_monthly_card",
      orderTemplate: "mock.monthly_card.v2",
      duration: { count: 30, unit: "day" },
      unlockCondition: "always",
      placement: "主城运营位",
      valueSummary: "把每日回流收益、抽卡前准备和长期留存入口收成一笔更像真月卡的稳定加速。",
      whyToday: "已经形成主循环后，月卡要能明显承接“回来先收一笔，再去冲 Boss / 榜单”的节奏。",
      benefits: ["开通材料 x6", "每日灵石 x100", "每日材料 x4", "首开抽卡券 x1"],
      benefitHighlights: ["开通当天就能接第一次强化补给", "每天回来先收一笔更明确的资源", "Boss / 榜单前更容易补一轮 build"],
      entryHooks: ["主城运营位", "登录福利联动", "Boss / Rank 回流后再看一眼"],
      grantPreview: [
        { stage: "fulfilled", summary: "支付成功后立即发放开通奖励，并激活 30 天月卡权益" },
        { stage: "active", summary: "月卡生效后每日可领灵石 x100 / 材料 x4" }
      ],
      orderStage: "created"
    },
    {
      id: "prod_taisui_event_bundle_v1",
      sku: "sku.taisui_event_bundle.v1",
      offerId: "event_bundle",
      title: "太岁讨伐补给包",
      productType: "event_bundle",
      kind: "one_time",
      purchaseType: "non-consumable",
      entitlementType: "event_bundle_reward",
      priceLabel: "￥18 活动礼包占位",
      priceValue: 18,
      currency: "CNY",
      price: { amount: 1800, currency: "CNY", label: "￥18" },
      entitlementId: "ent_event_bundle",
      orderTemplate: "mock.event_bundle.v1",
      duration: { count: 7, unit: "day" },
      unlockCondition: "event_active",
      eventId: "tai_sui_week",
      placement: "Boss / 活动卡片",
      valueSummary: "把活动周的 Boss 首通、兑换和追榜材料打成一包，给活动期更明确的付费承接。",
      whyToday: "当前就是 Boss 轮值活动周期，活动礼包要能补足今天追榜与兑换的资源缺口。",
      benefits: ["灵石 x220", "抽卡券 x2", "材料 x10"],
      benefitHighlights: ["Boss 周期间更快补一轮 build", "给活动兑换前补足材料", "一次性完成活动期价值表达"],
      entryHooks: ["Boss Tab", "活动卡片", "轮值 Boss 榜单"],
      grantPreview: [
        { stage: "fulfilled", summary: "支付成功后活动礼包立即到账，本期活动仅可购买一次" }
      ],
      orderStage: "created"
    },
    {
      id: "prod_combat_supply_bundle_v1",
      sku: "sku.combat_supply_bundle.v1",
      offerId: "combat_supply_bundle",
      title: "战备补给箱",
      productType: "consumable_bundle",
      kind: "consumable",
      purchaseType: "consumable",
      entitlementType: "consumable_delivery",
      priceLabel: "￥12 战备补给占位",
      priceValue: 12,
      currency: "CNY",
      price: { amount: 1200, currency: "CNY", label: "￥12" },
      entitlementId: "ent_combat_supply_bundle",
      orderTemplate: "mock.combat_supply_bundle.v1",
      duration: { count: 0, unit: "instant" },
      unlockCondition: "always",
      placement: "Home / 资源缺口提示",
      valueSummary: "把灵石、材料和一张抽卡券做成可重复购买的即时补给，方便在卡资源时补一笔。",
      whyToday: "如果今天差一口气就能再抽或再强化，消耗型补给最适合作为即时补洞位。",
      benefits: ["灵石 x180", "抽卡券 x1", "材料 x18"],
      benefitHighlights: ["资源不够时能立刻续一口", "可重复购买，不和一次性礼包冲突", "更接近真实消耗型商品骨架"],
      entryHooks: ["Home 今日目标", "Gear 强化后", "Gacha 资源不足时"],
      grantPreview: [
        { stage: "fulfilled", summary: "每次支付成功后立即到账，可重复购买" }
      ],
      orderStage: "created"
    },
    {
      id: "prod_boss_rush_bundle_v1",
      sku: "sku.boss_rush_bundle.v1",
      offerId: "boss_rush_bundle",
      title: "Boss 冲刺礼包",
      productType: "one_time_bundle",
      kind: "one_time",
      purchaseType: "non-consumable",
      entitlementType: "one_time_bundle_reward",
      priceLabel: "￥25 冲刺礼包占位",
      priceValue: 25,
      currency: "CNY",
      price: { amount: 2500, currency: "CNY", label: "￥25" },
      entitlementId: "ent_boss_rush_bundle",
      orderTemplate: "mock.boss_rush_bundle.v1",
      duration: { count: 0, unit: "instant" },
      unlockCondition: "boss_attempted",
      placement: "Boss / 排行榜回流位",
      valueSummary: "在第一次 Boss / 排行榜受挫后给一次更明确的冲刺包，帮助完成当天验证回合。",
      whyToday: "当你已经知道差距在哪时，一次性冲刺包应该清楚说明“买完马上能补什么”。",
      benefits: ["灵石 x260", "抽卡券 x2", "材料 x12"],
      benefitHighlights: ["更适合 Boss / 榜单回流时承接", "一次到账，避免和月卡混淆", "把一次性加速位讲清楚"],
      entryHooks: ["Boss 失败后", "排行榜差距提示", "Home 今日推荐"],
      grantPreview: [
        { stage: "fulfilled", summary: "支付成功后立即到账，仅首轮 Boss 冲刺阶段可买一次" }
      ],
      orderStage: "created"
    }
  ];
  var LAUNCH_PREP_CONFIG = {
    version: "launch-prep-v5",
    payment: {
      defaultProviderId: "mockpay_web",
      callbackPath: "/commerce/payment/callback",
      checkoutSessionTtlMinutes: 20
    },
    analytics: {
      eventLimit: 120,
      recentLimit: {
        keyEvents: 6,
        orders: 4,
        rewards: 4
      }
    },
    surfaces: {
      home: {
        modules: {
          offerOverview: true,
          eventOverview: true,
          commerceOps: true,
          analyticsOps: true
        },
        slots: {
          spotlight: "home_spotlight",
          opsGrid: "home_ops_grid",
          activityEntry: "home_activity_entry",
          bossReturn: "boss_return"
        }
      }
    },
    home: {
      todayGoalsLimit: 5,
      goalScores: {
        freeDraw: 124,
        guideStep: 121,
        signIn: 120,
        loginReward: 116,
        taskClaim: 108,
        bossReward: 118,
        bossFirstClear: 114,
        bossPush: 98,
        leaderboard: 104,
        eventClaimable: 112,
        eventActive: 94,
        offer: 90
      }
    },
    offers: {
      spotlightScores: {
        firstPurchaseUnlocked: 120,
        eventBundleActive: 118,
        monthlyClaim: 112,
        monthlyUpsell: 98,
        bossRushActive: 104,
        consumableSupplyReady: 84,
        tenDrawActive: 88,
        tenDrawWarm: 72,
        firstPurchaseLocked: 40,
        fallback: 60
      },
      entries: {
        first_purchase: {
          enabled: true,
          sortWeight: 110,
          recommendedWeight: 120,
          entrySlot: "home_spotlight",
          exposureSlots: ["home_spotlight", "home_ops_grid"],
          placementLabel: "主城运营位 / 首战后",
          campaignId: "launch-first-purchase",
          rollout: { bucketKey: "launch_ops_v1", bucketPercent: 100, cohort: "all" }
        },
        ten_draw_offer: {
          enabled: true,
          sortWeight: 72,
          recommendedWeight: 88,
          entrySlot: "home_ops_grid",
          exposureSlots: ["home_ops_grid"],
          placementLabel: "主城运营位 / 抽卡页",
          campaignId: "launch-ten-draw",
          rollout: { bucketKey: "launch_ops_v1", bucketPercent: 100, cohort: "all" }
        },
        monthly_card: {
          enabled: true,
          sortWeight: 102,
          recommendedWeight: 112,
          entrySlot: "home_spotlight",
          exposureSlots: ["home_spotlight", "home_ops_grid", "boss_return"],
          placementLabel: "主城运营位",
          campaignId: "launch-monthly-card",
          rollout: { bucketKey: "launch_ops_v1", bucketPercent: 100, cohort: "returning" }
        },
        event_bundle: {
          enabled: true,
          sortWeight: 98,
          recommendedWeight: 118,
          entrySlot: "home_activity_entry",
          exposureSlots: ["home_ops_grid", "home_activity_entry", "boss_return"],
          placementLabel: "Boss / 活动卡片",
          campaignId: "launch-event-bundle",
          rollout: { bucketKey: "launch_ops_v1", bucketPercent: 100, cohort: "event_active" }
        },
        combat_supply_bundle: {
          enabled: true,
          sortWeight: 84,
          recommendedWeight: 84,
          entrySlot: "home_ops_grid",
          exposureSlots: ["home_ops_grid", "boss_return"],
          placementLabel: "Home / 资源缺口提示",
          campaignId: "launch-supply-bundle",
          rollout: { bucketKey: "launch_ops_v1", bucketPercent: 100, cohort: "resource_gap" }
        },
        boss_rush_bundle: {
          enabled: true,
          sortWeight: 96,
          recommendedWeight: 104,
          entrySlot: "boss_return",
          exposureSlots: ["home_ops_grid", "boss_return"],
          placementLabel: "Boss / 排行榜回流位",
          campaignId: "launch-boss-rush",
          rollout: { bucketKey: "launch_ops_v1", bucketPercent: 100, cohort: "boss_attempted" }
        }
      }
    },
    events: {
      entries: {
        tai_sui_week: {
          enabled: true,
          sortWeight: 120,
          entrySlot: "home_activity_entry",
          campaignId: "launch-tai-sui-week",
          rollout: { bucketKey: "launch_activity_v1", bucketPercent: 100, cohort: "all" }
        },
        wuxing_supply: {
          enabled: true,
          sortWeight: 80,
          entrySlot: "home_activity_entry",
          campaignId: "launch-wuxing-supply",
          rollout: { bucketKey: "launch_activity_v1", bucketPercent: 100, cohort: "all" }
        }
      }
    },
    returnLoop: {
      surfaceHints: {
        home: "先收奖励，再补 build，最后去 Boss / 榜单验收今天的提升。",
        boss: "先领首通奖，再回榜看差距；如果还差一口气，就回 Gear / Adventure 补强。",
        leaderboard: "先看差距，再回 Gear / Adventure / Boss 兑现今天还能涨的那一段。"
      }
    }
  };
  var EVENT_CONFIGS = [
    {
      id: "tai_sui_week",
      title: "轮值 Boss 讨伐周",
      summary: "围绕今日 Boss 的首通、兑换和榜单做短周期留存验证。",
      rewardFocus: "Boss 首通 / 活动兑换 / 今日 Boss 榜",
      todayReason: "今天打掉首通后，会同时撬动首通奖励、活动兑换和今日 Boss 榜，回报最集中。",
      activeFrom: "2026-03-12",
      activeTo: "2026-03-25",
      ctaTab: "boss",
      ctaLabel: "去今日 Boss",
      mapId: "",
      redeem: {
        title: "讨伐周补给",
        trigger: "daily_boss_first_clear",
        progressLabel: "今日 Boss 首通",
        tokenLabel: "讨伐令",
        tokenGrant: 1,
        tokenCap: 1,
        cost: 1,
        reward: { spiritStone: 220, drawTickets: 1, materials: 6 },
        note: "首通今日 Boss 后获得 1 枚讨伐令，可兑换一次活动补给。",
        oncePerEvent: true
      }
    },
    {
      id: "wuxing_supply",
      title: "五行补给试炼",
      summary: "为后续材料周和轮换加成周预留配置位。",
      rewardFocus: "材料 / 抽卡券",
      todayReason: "先保留一个可调活动入口，后续只需要改配置就能切到材料周 / 加成周。",
      activeFrom: "2026-03-19",
      activeTo: "2026-03-25",
      ctaTab: "adventure",
      ctaLabel: "去刷图",
      mapId: "wuxing_realm",
      redeem: {
        title: "五行补给箱",
        trigger: "manual_preview",
        progressLabel: "后续接活动任务",
        tokenLabel: "五行印记",
        tokenGrant: 1,
        tokenCap: 1,
        cost: 1,
        reward: { spiritStone: 120, materials: 8 },
        note: "当前先保留未来活动兑换位。",
        oncePerEvent: true
      }
    }
  ];
  var GACHA_POOLS = [
    {
      id: "artifact",
      name: "命器池",
      description: "偏装备成长，适合补槽位并接第一次强化。",
      ssrThreshold: 36,
      chaseHint: "轻度追件修正：缺槽位、当前套装路线、主武器/核心与喜用五行会被轻微抬权。",
      rarityWeights: { R: 0.54, SR: 0.31, SSR: 0.12, UR: 0.03 },
      entries: [
        { name: "青藤短刃", rarity: "R", type: "命器", element: "木", slot: "weapon", gearScore: 48, stats: { ATK: 14, LUK: 6 } },
        { name: "麒麟皮甲", rarity: "R", type: "命器", element: "土", slot: "armor", gearScore: 52, stats: { HP: 52, DEF: 14 } },
        { name: "青龙符骨", rarity: "R", type: "命器", element: "木", slot: "talisman", gearScore: 46, stats: { INT: 10, CHA: 6 } },
        { name: "命盘核心·初", rarity: "SR", type: "命器", element: "木", slot: "core", gearScore: 72, stats: { HP: 68, ATK: 10, DEF: 8, INT: 8 } },
        { name: "青萝护命衣", rarity: "SR", type: "命器", element: "木", slot: "armor", gearScore: 68, stats: { HP: 72, DEF: 16, INT: 8 } },
        { name: "青木回生佩", rarity: "SR", type: "命器", element: "木", slot: "accessory", gearScore: 70, stats: { HP: 58, CHA: 10, LUK: 10 } },
        { name: "青龙归元符", rarity: "SR", type: "命器", element: "木", slot: "talisman", gearScore: 76, stats: { HP: 42, INT: 12, LUK: 8 } },
        { name: "厚土镇脉核", rarity: "SR", type: "命器", element: "土", slot: "core", gearScore: 78, stats: { HP: 96, DEF: 18, ATK: 10 } },
        { name: "赤焰法杖", rarity: "SR", type: "命器", element: "火", slot: "weapon", gearScore: 78, stats: { ATK: 24, INT: 16 } },
        { name: "玄水护符", rarity: "SR", type: "命器", element: "水", slot: "talisman", gearScore: 74, stats: { INT: 18, LUK: 12 } },
        { name: "朱雀羽衣", rarity: "SR", type: "命器", element: "火", slot: "armor", gearScore: 76, stats: { HP: 78, DEF: 18, CHA: 6 } },
        { name: "玄水灵佩", rarity: "SR", type: "命器", element: "水", slot: "accessory", gearScore: 72, stats: { INT: 12, CHA: 10, LUK: 10 } },
        { name: "离火照命佩", rarity: "SR", type: "命器", element: "火", slot: "accessory", gearScore: 80, stats: { ATK: 18, INT: 14, LUK: 8 } },
        { name: "金羽裂锋", rarity: "SR", type: "命器", element: "金", slot: "weapon", gearScore: 84, stats: { ATK: 28, LUK: 12 } },
        { name: "朱雀焚心符", rarity: "SSR", type: "命器", element: "火", slot: "talisman", gearScore: 106, stats: { ATK: 24, INT: 18, LUK: 10 } },
        { name: "麒麟镇岳佩", rarity: "SSR", type: "命器", element: "土", slot: "accessory", gearScore: 100, stats: { HP: 88, DEF: 18, CHA: 10 } },
        { name: "白虎裂甲衣", rarity: "SSR", type: "命器", element: "金", slot: "armor", gearScore: 104, stats: { HP: 82, DEF: 18, ATK: 16 } },
        { name: "玄武覆潮甲", rarity: "SSR", type: "命器", element: "水", slot: "armor", gearScore: 108, stats: { HP: 86, DEF: 20, INT: 16 } },
        { name: "玄冥断潮刃", rarity: "SSR", type: "命器", element: "水", slot: "weapon", gearScore: 100, stats: { ATK: 30, INT: 18, LUK: 8 } },
        { name: "北渊镇煞核", rarity: "SSR", type: "命器", element: "水", slot: "core", gearScore: 106, stats: { HP: 92, ATK: 18, INT: 18, DEF: 12 } },
        { name: "锐金破军珏", rarity: "SSR", type: "命器", element: "金", slot: "accessory", gearScore: 108, stats: { ATK: 24, LUK: 16, CHA: 8 } },
        { name: "七杀号令", rarity: "SSR", type: "命器", element: "金", slot: "talisman", gearScore: 104, stats: { ATK: 22, INT: 12, LUK: 14 } },
        { name: "太岁断章", rarity: "SSR", type: "命器", element: "金", slot: "accessory", gearScore: 96, stats: { ATK: 22, CHA: 16, LUK: 18 } },
        { name: "太岁镇印", rarity: "SSR", type: "命器", element: "土", slot: "core", gearScore: 102, stats: { HP: 110, DEF: 22, INT: 18 } },
        { name: "白虎机簧刃", rarity: "SSR", type: "命器", element: "金", slot: "weapon", gearScore: 98, stats: { ATK: 32, LUK: 14 } },
        { name: "流年天符", rarity: "UR", type: "命器", element: "火", slot: "core", gearScore: 124, stats: { ATK: 28, INT: 26, CHA: 14 } },
        { name: "劫星命盘", rarity: "UR", type: "命器", element: "水", slot: "core", gearScore: 132, stats: { HP: 112, ATK: 24, INT: 28, DEF: 14 } }
      ]
    },
    {
      id: "skill",
      name: "神通池",
      description: "偏战斗机制，适合把 build 兑现到 Boss 与榜单。",
      ssrThreshold: 42,
      chaseHint: "保底节奏略慢，作为 Boss / 榜单向长期追求。",
      rarityWeights: { R: 0.57, SR: 0.28, SSR: 0.12, UR: 0.03 },
      entries: [
        { name: "青藤复苏", rarity: "R", type: "神通" },
        { name: "麒麟壁垒", rarity: "R", type: "神通" },
        { name: "朱焰轰击", rarity: "SR", type: "神通" },
        { name: "玄水咒缚", rarity: "SR", type: "神通" },
        { name: "白虎瞬斩", rarity: "SSR", type: "神通" },
        { name: "七杀震魄", rarity: "SSR", type: "神通" },
        { name: "太虚命演", rarity: "UR", type: "神通" }
      ]
    }
  ];
  var BOARD_TYPES = [
    { id: "total", name: "总战力榜" },
    { id: "same_day_master", name: "同日主榜" },
    { id: "today_boss", name: "今日 Boss 榜" }
  ];

  var config = window.LifeRpgConfig || { maps: [], bosses: {} };
  var mapById = toMap(config.maps || []);
  var bossCandidates = buildBossCandidates();
  var activeMapId = (config.maps && config.maps[0] && config.maps[0].id) || "";
  var activeTab = "home";
  var activeBoardType = "total";
  var activeBossDateKey = todayKey();
  var serverCache = {
    available: false,
    loading: false,
    playerState: null,
    powerBoards: { totalRows: [], sameDayMasterRows: [], dayMaster: "无" },
    dailyBossBoard: { rows: [] },
    lastError: ""
  };
  var motionState = {
    tabMoments: {},
    resourceTimers: {}
  };

  var el = {
    tabs: document.querySelectorAll(".tab-btn"),
    home: document.getElementById("tab-home"),
    gacha: document.getElementById("tab-gacha"),
    adventure: document.getElementById("tab-adventure"),
    gear: document.getElementById("tab-gear"),
    boss: document.getElementById("tab-boss"),
    leaderboard: document.getElementById("tab-leaderboard"),
    resourceSpiritStone: document.getElementById("resource-spiritStone"),
    resourceDrawTickets: document.getElementById("resource-drawTickets"),
    resourceMaterials: document.getElementById("resource-materials"),
    opsModal: document.getElementById("ops-modal"),
    opsModalTitle: document.getElementById("ops-modal-title"),
    opsModalSub: document.getElementById("ops-modal-sub"),
    opsModalContent: document.getElementById("ops-modal-content"),
    opsModalClose: document.getElementById("ops-modal-close"),
    feedbackLayer: document.getElementById("feedback-layer")
  };

  init();

  function init() {
    var params = new URLSearchParams(window.location.search);
    var mapFromQuery = params.get("map");
    var tabFromQuery = params.get("tab");
    var bossDateFromQuery = normalizeDateKey(params.get("bossDate"));

    if (mapFromQuery && mapById[mapFromQuery]) {
      activeMapId = mapFromQuery;
    }
    if (isValidTab(tabFromQuery)) {
      activeTab = tabFromQuery;
    }
    if (bossDateFromQuery) {
      activeBossDateKey = bossDateFromQuery;
    }

    bindTabs();
    bindModalShell();
    renderAll();
    bootstrapServerState();
  }

  function isValidTab(tabName) {
    return tabName === "home" || tabName === "gacha" || tabName === "adventure" ||
      tabName === "gear" || tabName === "boss" || tabName === "leaderboard";
  }

  function bindTabs() {
    el.tabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (activeTab === btn.getAttribute("data-tab")) {
          return;
        }
        activeTab = btn.getAttribute("data-tab");
        refreshTabUI();
        renderAll();
      });
    });
  }

  function bindModalShell() {
    if (!el.opsModal) {
      return;
    }
    if (el.opsModalClose) {
      el.opsModalClose.addEventListener("click", closeOfferModal);
    }
    el.opsModal.addEventListener("click", function (event) {
      if (event.target === el.opsModal) {
        closeOfferModal();
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeOfferModal();
      }
    });
  }

  function refreshTabUI() {
    el.tabs.forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === activeTab);
    });
    [el.home, el.gacha, el.adventure, el.gear, el.boss, el.leaderboard].forEach(function (panel) {
      panel.classList.remove("active");
    });
    if (activeTab === "home") {
      el.home.classList.add("active");
      return;
    }
    if (activeTab === "gacha") {
      el.gacha.classList.add("active");
      return;
    }
    if (activeTab === "adventure") {
      el.adventure.classList.add("active");
      return;
    }
    if (activeTab === "gear") {
      el.gear.classList.add("active");
      return;
    }
    if (activeTab === "boss") {
      el.boss.classList.add("active");
      return;
    }
    el.leaderboard.classList.add("active");
  }

  function safeClassName(value) {
    return String(value || "").replace(/[^a-zA-Z0-9_\- ]/g, "").trim();
  }

  function setTabMoment(tab, payload) {
    if (!tab || !payload) {
      return;
    }
    motionState.tabMoments[tab] = Object.assign({
      timestamp: Date.now(),
      id: tab + "-" + Date.now()
    }, payload);
  }

  function getRecentTabMoment(tab, maxAgeMs) {
    var moment = motionState.tabMoments[tab];
    if (!moment) {
      return null;
    }
    if (Date.now() - normalizeNumber(moment.timestamp, 0) > normalizeNumber(maxAgeMs, 4600)) {
      return null;
    }
    return moment;
  }

  function resolveContextTone(context) {
    if (context === "gacha" || context === "free_draw") {
      return "tone-gacha";
    }
    if (context === "enhancement") {
      return "tone-enhancement";
    }
    if (context === "daily_boss" || context === "boss_challenge") {
      return "tone-boss";
    }
    if (context === "event") {
      return "tone-event";
    }
    return "tone-reward";
  }

  function resolveContextLabel(context) {
    if (context === "gacha" || context === "free_draw") {
      return "抽卡回响";
    }
    if (context === "enhancement") {
      return "强化成功";
    }
    if (context === "daily_boss") {
      return "首通到账";
    }
    if (context === "boss_challenge") {
      return "Boss 结算";
    }
    if (context === "event") {
      return "活动到账";
    }
    return "奖励到账";
  }

  function renderMomentPills(items, extraClass) {
    var rows = (items || []).filter(function (item) {
      return !!(item && item.label);
    }).map(function (item) {
      return "<span class='status-pill " + safeClassName(item.tone || "") + "'>" + safe(item.label) + "</span>";
    }).join("");

    if (!rows) {
      return "";
    }

    return "<div class='status-row " + safeClassName(extraClass || "") + "'>" + rows + "</div>";
  }

  function getRarityToneClass(rarity) {
    if (rarity === "UR") {
      return "is-ur";
    }
    if (rarity === "SSR") {
      return "is-ssr";
    }
    if (rarity === "SR") {
      return "is-sr";
    }
    return "is-r";
  }

  function buildRewardChips(reward) {
    return Object.keys(REWARD_LABELS).filter(function (key) {
      return normalizeNumber(reward && reward[key], 0) > 0;
    }).map(function (key) {
      return REWARD_LABELS[key] + " +" + normalizeNumber(reward[key], 0);
    }).slice(0, 3);
  }

  function pulseResourceBars(reward) {
    var resourceMap = {
      spiritStone: el.resourceSpiritStone,
      drawTickets: el.resourceDrawTickets,
      materials: el.resourceMaterials
    };

    Object.keys(resourceMap).forEach(function (key) {
      var target = resourceMap[key];
      var box = target && target.parentNode ? target.parentNode : null;

      if (normalizeNumber(reward && reward[key], 0) <= 0 || !box) {
        return;
      }

      if (motionState.resourceTimers[key]) {
        window.clearTimeout(motionState.resourceTimers[key]);
      }
      box.classList.remove("is-pulsing");
      window.requestAnimationFrame(function () {
        box.classList.add("is-pulsing");
      });
      motionState.resourceTimers[key] = window.setTimeout(function () {
        box.classList.remove("is-pulsing");
      }, 900);
    });
  }

  function showFeedbackToast(config) {
    var layer = el.feedbackLayer;
    var chips = Array.isArray(config && config.chips) ? config.chips.filter(Boolean).slice(0, 3) : [];
    var toast;

    if (!layer) {
      return;
    }

    toast = document.createElement("div");
    toast.className = [
      "feedback-toast",
      safeClassName((config && config.toneClass) || "tone-reward"),
      safeClassName(config && config.rarity ? getRarityToneClass(config.rarity) : "")
    ].join(" ").trim();
    toast.innerHTML = [
      "<div class='feedback-toast-inner'>",
      "<p class='eyebrow'>" + safe(config && config.eyebrow ? config.eyebrow : "反馈更新") + "</p>",
      "<strong>" + safe(config && config.title ? config.title : "状态已更新") + "</strong>",
      (config && config.detail ? "<p>" + safe(config.detail) + "</p>" : ""),
      (chips.length ? "<div class='feedback-chip-row'>" + chips.map(function (chip) {
        return "<span class='feedback-chip'>" + safe(chip) + "</span>";
      }).join("") + "</div>" : ""),
      "</div>"
    ].join("");
    layer.appendChild(toast);
    window.requestAnimationFrame(function () {
      toast.classList.add("is-live");
    });
    window.setTimeout(function () {
      toast.classList.add("is-leaving");
    }, 1900);
    window.setTimeout(function () {
      if (toast.parentNode === layer) {
        layer.removeChild(toast);
      }
    }, 2700);
  }

  function buildGachaRevealMoment(results, pool, options) {
    var latest;
    var highest = null;
    var equipTarget = null;
    var feedback;

    if (!results || !results.length) {
      return null;
    }

    latest = results[results.length - 1];
    feedback = buildGachaFeedback(results, pool, options || {}) || {};
    results.forEach(function (entry) {
      if (!highest || getRarityRank(entry.rarity) > getRarityRank(highest.rarity)) {
        highest = entry;
      }
      if (!equipTarget && isEquipableInventoryItem(entry)) {
        equipTarget = entry;
      }
    });
    highest = highest || latest;

    return {
      type: "gacha_reveal",
      timestamp: Date.now(),
      title: feedback.title || ((pool && pool.name ? pool.name : "抽卡") + " 已完成"),
      summary: feedback.summary || ("[" + highest.rarity + "] " + highest.name),
      detail: feedback.detail || formatGachaResultMeta(highest),
      subtitle: results.length > 1
        ? ("共 " + results.length + " 发 · 最高 [" + highest.rarity + "] " + highest.name)
        : (highest.poolName || (pool && pool.name) || "最新掉落"),
      rarity: highest.rarity || "R",
      highest: highest,
      latest: latest,
      equipTarget: equipTarget || (isEquipableInventoryItem(highest) ? highest : null),
      count: results.length,
      isLive: true,
      chips: [
        results.length > 1 ? "共 " + results.length + " 发" : "单发出货",
        highest.rarity + " 命中",
        equipTarget ? (SLOT_LABELS[equipTarget.slot] || equipTarget.slot) + " 可换装" : ""
      ].filter(Boolean)
    };
  }

  function queueGachaRevealMoment(results, pool, options) {
    var moment = buildGachaRevealMoment(results, pool, options);

    if (!moment) {
      return;
    }

    setTabMoment("gacha", moment);
    showFeedbackToast({
      eyebrow: options && options.source === "daily_free" ? "免费抽揭示" : "抽卡揭示",
      title: moment.summary,
      detail: moment.detail,
      chips: moment.chips,
      toneClass: "tone-gacha",
      rarity: moment.rarity
    });
  }

  function announceRewardMoment(reward, feedback) {
    var payload = feedback || {};
    var chips = buildRewardChips(reward);
    var detailText = [payload.summary || formatReward(reward || {}), payload.detail || ""].filter(Boolean).join(" · ");

    pulseResourceBars(reward || {});
    showFeedbackToast({
      eyebrow: resolveContextLabel(payload.context || "reward"),
      title: payload.title || "奖励到账",
      detail: detailText,
      chips: chips,
      toneClass: resolveContextTone(payload.context || "reward")
    });

    if (payload.context === "daily_boss") {
      setTabMoment("boss", {
        type: "daily_boss",
        context: payload.context,
        title: payload.title || "首通奖励已到账",
        detail: payload.detail || "Boss 首通奖励已发放",
        summary: chips.join(" · ") || formatReward(reward || {}),
        chips: chips
      });
      setTabMoment("leaderboard", {
        type: "rank_refresh",
        context: payload.context,
        title: "首通奖励已到账",
        detail: "去 Rank / 活动确认这波收益有没有接上",
        summary: chips.join(" · ") || formatReward(reward || {})
      });
    }
  }

  function announceActionMoment(feedback, options) {
    var config = options || {};
    var chips = Array.isArray(config.chips) ? config.chips.filter(Boolean).slice(0, 3) : [];
    var detailText = [config.summary || "", feedback && feedback.detail ? feedback.detail : "", config.detail || ""].filter(Boolean).join(" · ");

    if (config.reward) {
      pulseResourceBars(config.reward);
    }

    showFeedbackToast({
      eyebrow: config.eyebrow || resolveContextLabel(feedback && feedback.context ? feedback.context : "reward"),
      title: feedback && feedback.title ? feedback.title : (config.title || "状态已更新"),
      detail: detailText,
      chips: chips,
      toneClass: resolveContextTone(feedback && feedback.context ? feedback.context : "reward"),
      rarity: config.rarity || ""
    });

    (config.tabMoments || []).forEach(function (entry) {
      if (!entry || !entry.tab) {
        return;
      }
      setTabMoment(entry.tab, Object.assign({
        context: feedback && feedback.context ? feedback.context : ""
      }, entry.payload || {}));
    });
  }

  function consumeServerFeedbackMoment(response, endpoint, latestBattle) {
    var feedback = response && response.feedback ? response.feedback : null;
    var todayDailyBoss;
    var bossState;
    var todayRecord;
    var challengeState;
    var summary;
    var chips;

    if (!feedback) {
      return;
    }

    if (endpoint === "/boss/report" || feedback.context === "boss_challenge") {
      todayDailyBoss = buildDailyBoss(todayKey());
      bossState = response && response.playerState && response.playerState.bossState
        ? response.playerState.bossState
        : (serverCache.playerState && serverCache.playerState.bossState);
      todayRecord = getBossRecordForDate(bossState || { records: {} }, todayKey(), todayDailyBoss);
      challengeState = getBossChallengeState(bossState || { ticketState: {} });
      summary = latestBattle
        ? ((latestBattle.result === "victory" ? "胜利" : "失败") + " · 最佳榜分 " + todayRecord.bestScore)
        : ("最佳榜分 " + todayRecord.bestScore);
      chips = [
        "最佳榜分 " + todayRecord.bestScore,
        challengeState.remaining > 0 ? "剩余记分 " + challengeState.remaining + "/" + challengeState.dailyCap : "今日记分已打满",
        todayRecord.firstClearAchieved ? "已首通" : "待首通"
      ];

      setTabMoment("boss", {
        type: "boss_challenge",
        context: feedback.context,
        title: feedback.title,
        detail: feedback.detail,
        summary: summary,
        chips: chips,
        isLive: true
      });
      setTabMoment("leaderboard", {
        type: "rank_refresh",
        context: feedback.context,
        title: feedback.title,
        detail: "去 Rank 看这轮追分有没有缩小差距",
        summary: summary
      });
      showFeedbackToast({
        eyebrow: resolveContextLabel(feedback.context),
        title: feedback.title,
        detail: summary + (feedback.detail ? " · " + feedback.detail : ""),
        chips: chips,
        toneClass: resolveContextTone(feedback.context)
      });
    }
  }

  function renderAll() {
    var today = todayKey();
    var bridge = readBridgeState();
    var wallet = readWalletState();
    var gachaState = readGachaState();
    var todayFortune = buildDailyFortune(bridge.profileSnapshot, today);
    var todayDailyBoss = buildDailyBoss(today);
    var previewDailyBoss = buildDailyBoss(activeBossDateKey);
    var localBossState = syncBossState(bridge, todayDailyBoss);
    var localDailyState = syncDailyState(bridge, gachaState, todayDailyBoss, localBossState);
    var bossState = getResolvedBossState(localBossState, todayDailyBoss);
    var dailyState = getResolvedDailyState(localDailyState);
    var signInState = readSignInState(today);
    var opsState = readOpsState(bridge, today);
    var commerceState = readCommerceState(opsState, today);
    var activityState = readActivityState(today, todayDailyBoss, bossState);
    var rewardState = readRewardState();
    var analyticsState = readAnalyticsState();
    var equipmentState = readEquipmentState();
    var guideState;
    var boards = buildLeaderboards(bridge, gachaState, todayDailyBoss, bossState);

    syncPhase2UrlState();
    markGuideTabVisit(activeTab);
    guideState = readGuideState(gachaState, dailyState, bossState, rewardState, equipmentState);
    trackPlaytestMilestones(guideState, dailyState, signInState, bridge, bossState, todayDailyBoss, rewardState);

    updateResourceBar(wallet);
    renderHome(bridge, dailyState, signInState, gachaState, wallet, todayFortune, todayDailyBoss, bossState, opsState, commerceState, activityState, rewardState, analyticsState, guideState, boards);
    renderGacha(gachaState, wallet, dailyState, opsState, rewardState, guideState, todayDailyBoss);
    renderAdventure(bridge, todayFortune, guideState, todayDailyBoss);
    renderGear(bridge, wallet, guideState, equipmentState, boards, todayDailyBoss, bossState);
    renderBoss(bridge, previewDailyBoss, todayDailyBoss, bossState, dailyState, opsState, commerceState, activityState, rewardState, guideState, boards);
    renderLeaderboard(boards, todayDailyBoss, bossState, dailyState, opsState, commerceState, activityState, guideState);
    refreshTabUI();
  }

  function syncPhase2UrlState() {
    var params;
    var nextUrl;

    if (!window.history || typeof window.history.replaceState !== "function") {
      return;
    }

    params = new URLSearchParams(window.location.search || "");
    params.set("tab", activeTab || "home");
    if (activeMapId) {
      params.set("map", activeMapId);
    } else {
      params.delete("map");
    }
    if (activeBossDateKey) {
      params.set("bossDate", activeBossDateKey);
    } else {
      params.delete("bossDate");
    }

    nextUrl = window.location.pathname + "?" + params.toString();
    if (window.location.hash) {
      nextUrl += window.location.hash;
    }
    window.history.replaceState(null, "", nextUrl);
  }


  function bootstrapServerState() {
    serverCache.loading = true;
    refreshServerSnapshot()
      .then(function () {
        return maybeSyncBridgeStateToServer();
      })
      .then(function (reported) {
        if (reported) {
          return refreshServerSnapshot();
        }
        return null;
      })
      .catch(function (err) {
        serverCache.available = false;
        serverCache.lastError = err && err.message ? err.message : "backend unavailable";
      })
      .finally(function () {
        serverCache.loading = false;
        renderAll();
      });
  }

  function refreshServerSnapshot() {
    return refreshServerPlayerState().then(function () {
      return Promise.all([
        refreshDailyBossLeaderboard().catch(function () {
          return null;
        }),
        refreshPowerLeaderboards().catch(function () {
          return null;
        })
      ]);
    });
  }

  function refreshPowerLeaderboards() {
    return requestJson("/leaderboard/power").then(function (response) {
      serverCache.powerBoards = response || { totalRows: [], sameDayMasterRows: [], dayMaster: "无" };
      return serverCache.powerBoards;
    });
  }

  function refreshServerPlayerState() {
    return requestJson("/player/state").then(function (response) {
      if (!response || !response.playerState) {
        throw new Error("missing player state");
      }
      applyServerPlayerState(response.playerState);
      serverCache.available = true;
      serverCache.lastError = "";
      return response.playerState;
    });
  }

  function refreshDailyBossLeaderboard() {
    return requestJson("/leaderboard/daily-boss").then(function (response) {
      serverCache.dailyBossBoard = response || { rows: [] };
      return serverCache.dailyBossBoard;
    });
  }

  function applyServerPlayerState(playerState) {
    var localOpsState;

    serverCache.playerState = playerState ? clone(playerState) : null;
    if (!serverCache.playerState) {
      return;
    }
    localOpsState = readStorageJson(STORAGE_KEYS.opsState) || {};
    writeStorageJson(STORAGE_KEYS.dailyState, serverCache.playerState.dailyState || createDefaultDailyState(todayKey()));
    writeStorageJson(STORAGE_KEYS.bossState, serverCache.playerState.bossState || { lastProcessedBattleTimestamp: "", records: {} });
    writeStorageJson(STORAGE_KEYS.gachaState, serverCache.playerState.gachaState || { history: [], inventory: [], lastResult: null });
    writeStorageJson(STORAGE_KEYS.signInState, serverCache.playerState.signInState || normalizeSignInState(null, todayKey()));
    writeStorageJson(STORAGE_KEYS.activityState, serverCache.playerState.activityState || { events: {} });
    writeStorageJson(STORAGE_KEYS.walletState, serverCache.playerState.walletState || clone(DEFAULT_WALLET));
    writeStorageJson(STORAGE_KEYS.equipmentState, serverCache.playerState.equipmentState || null);
    writeStorageJson(STORAGE_KEYS.opsState, {
      firstPurchase: serverCache.playerState.opsState ? serverCache.playerState.opsState.firstPurchase : null,
      monthlyCard: serverCache.playerState.opsState ? serverCache.playerState.opsState.monthlyCard : null,
      tenDrawOffer: normalizeTenDrawOffer(localOpsState.tenDrawOffer)
    });
    writeStorageJson(STORAGE_KEYS.commerceState, serverCache.playerState.commerceState || { catalogVersion: LAUNCH_PREP_CONFIG.version, entitlements: {}, orders: [], lastUpdatedAt: new Date().toISOString() });
    writeStorageJson(STORAGE_KEYS.rewardState, serverCache.playerState.rewardState || { latest: null, history: [] });
    writeStorageJson(STORAGE_KEYS.analyticsState, serverCache.playerState.analyticsState || { events: [], funnel: {}, monitoring: {}, recent: { keyEvents: [], orders: [], rewards: [] } });
  }

  function maybeSyncBridgeStateToServer() {
    var bridge = readBridgeState();
    var todayDailyBoss = buildDailyBoss(todayKey());
    var latest = bridge.latestBattle;
    var snapshot = bridge.profileSnapshot;
    var processedTimestamp = serverCache.playerState && serverCache.playerState.bossState
      ? serverCache.playerState.bossState.lastProcessedBattleTimestamp
      : "";
    var lastSnapshotTimestamp = serverCache.playerState && serverCache.playerState.profile
      ? serverCache.playerState.profile.snapshotTimestamp
      : "";
    var shouldSyncBattle = !!(latest && latest.timestamp && isToday(latest.timestamp) && latest.timestamp !== processedTimestamp);
    var shouldSyncSnapshot = !!(snapshot && snapshot.timestamp && snapshot.timestamp !== lastSnapshotTimestamp);
    var shouldReportBossBattle = !!(shouldSyncBattle && activeTab === "boss" && isBossCandidateMapId(latest.mapId));
    var endpoint = shouldReportBossBattle ? "/boss/report" : "/player/sync";

    if (!serverCache.available || (!shouldSyncBattle && !shouldSyncSnapshot)) {
      return Promise.resolve(false);
    }

    return requestJson(endpoint, {
      method: "POST",
      body: {
        latestBattle: shouldSyncBattle ? latest : null,
        profileSnapshot: snapshot,
        dailyBoss: buildDailyBossPayload(todayDailyBoss)
      }
    }).then(function (response) {
      if (response && response.playerState) {
        applyServerPlayerState(response.playerState);
      }
      consumeServerFeedbackMoment(response, endpoint, latest);
      return true;
    });
  }

  function buildDailyBossPayload(dailyBoss) {
    if (!dailyBoss) {
      return null;
    }
    return {
      dateKey: dailyBoss.dateKey,
      mapId: dailyBoss.mapId,
      bossId: dailyBoss.bossId,
      bossName: dailyBoss.boss ? dailyBoss.boss.name : "",
      rewardFocus: dailyBoss.rewardFocus
    };
  }

  function isBackendEnabled() {
    return !!(serverCache.available && serverCache.playerState);
  }

  function getResolvedBossState(localBossState, todayDailyBoss) {
    var today = todayKey();
    var previewBoss = buildDailyBoss(activeBossDateKey);
    var resolved;

    if (!isBackendEnabled()) {
      if (localBossState) {
        localBossState.ticketState = normalizeBossTicketState(localBossState.ticketState, today);
      }
      return localBossState;
    }

    resolved = clone(serverCache.playerState.bossState || { lastProcessedBattleTimestamp: "", records: {} });
    resolved.records = resolved.records || {};
    resolved.ticketState = normalizeBossTicketState(resolved.ticketState, today);
    resolved.records[today] = mergeBossRecord(
      resolved.records[today],
      localBossState && localBossState.records ? localBossState.records[today] : null,
      todayDailyBoss,
      today
    );

    if (activeBossDateKey && activeBossDateKey !== today) {
      resolved.records[activeBossDateKey] = mergeBossRecord(
        resolved.records[activeBossDateKey],
        localBossState && localBossState.records ? localBossState.records[activeBossDateKey] : null,
        previewBoss,
        activeBossDateKey
      );
    }

    return resolved;
  }

  function mergeBossRecord(serverRecord, localRecord, dailyBoss, dateValue) {
    var merged = ensureBossRecord(serverRecord, dailyBoss, dateValue);
    var fallback = ensureBossRecord(localRecord, dailyBoss, dateValue);

    merged.attempts = Math.max(merged.attempts, fallback.attempts);
    merged.victories = Math.max(merged.victories, fallback.victories);
    merged.bestScore = Math.max(merged.bestScore, fallback.bestScore);
    if (fallback.lastScore >= merged.lastScore) {
      merged.lastScore = fallback.lastScore;
    }
    if (fallback.lastBattleTimestamp && (!merged.lastBattleTimestamp || fallback.lastBattleTimestamp > merged.lastBattleTimestamp)) {
      merged.lastBattleTimestamp = fallback.lastBattleTimestamp;
      merged.lastResult = fallback.lastResult;
    }
    if (!merged.firstClearAchieved && fallback.firstClearAchieved) {
      merged.firstClearAchieved = true;
      merged.firstClearAt = fallback.firstClearAt;
    }
    return merged;
  }

  function getResolvedDailyState(localDailyState) {
    var resolved;

    if (!isBackendEnabled()) {
      return localDailyState;
    }

    resolved = normalizeDailyState(clone(serverCache.playerState.dailyState), todayKey());
    DAILY_TASKS.forEach(function (task) {
      resolved.progress[task.id] = Math.max(
        normalizeNumber(resolved.progress[task.id], 0),
        normalizeNumber(localDailyState.progress[task.id], 0)
      );
    });
    return applyDailyStateMetrics(resolved);
  }

  function applyDailyStateMetrics(daily) {
    daily.completedCount = DAILY_TASKS.filter(function (task) {
      return normalizeNumber(daily.progress[task.id], 0) >= task.target;
    }).length;
    daily.claimedCount = DAILY_TASKS.filter(function (task) {
      return !!daily.claimed[task.id];
    }).length;
    return daily;
  }

  function claimServerTask(taskId, options) {
    var bridge = readBridgeState();
    var gachaState = readGachaState();
    var todayDailyBoss = buildDailyBoss(todayKey());
    var localBossState = syncBossState(bridge, todayDailyBoss);
    var localDailyState = syncDailyState(bridge, gachaState, todayDailyBoss, localBossState);

    requestJson((options && options.endpoint) || "/claim/daily-task", {
      method: "POST",
      body: {
        taskId: taskId,
        progressHint: normalizeNumber(localDailyState.progress[taskId], 0),
        latestBattle: bridge.latestBattle,
        gachaCountToday: countTodayGacha(gachaState),
        profileSnapshot: bridge.profileSnapshot,
        dailyBoss: buildDailyBossPayload(todayDailyBoss)
      }
    }).then(function (response) {
      handleServerClaimResponse(response, taskId, options, todayDailyBoss);
    }).catch(function () {
      serverCache.available = false;
      if (options && typeof options.fallback === "function") {
        options.fallback();
        return;
      }
      renderAll();
    });
  }

  function handleServerClaimResponse(response, taskId, options, todayDailyBoss) {
    if (response && response.playerState) {
      applyServerPlayerState(response.playerState);
    }
    if (response && response.status === "claimed" && response.playerState) {
      announceRewardMoment(
        response.reward || resolveClaimReward(taskId, options),
        response.feedback || resolveClaimFeedback(taskId, options, todayDailyBoss)
      );
    }
    if (response && response.status === "claimed" && !response.playerState) {
      grantReward(response.reward || resolveClaimReward(taskId, options), response.feedback || resolveClaimFeedback(taskId, options, todayDailyBoss));
    }
    refreshServerSnapshot().catch(function () {
      return null;
    }).then(function () {
      activeTab = options && options.targetTab ? options.targetTab : "home";
      renderAll();
    });
  }

  function resolveClaimReward(taskId, options) {
    var task;
    if (options && options.reward) {
      return options.reward;
    }
    task = findDailyTask(taskId);
    if (task) {
      return task.reward;
    }
    if (taskId === SPECIAL_DAILY_TASK_ID) {
      return DAILY_BOSS_FIRST_CLEAR_REWARD;
    }
    return {};
  }

  function resolveClaimFeedback(taskId, options, todayDailyBoss) {
    var task;
    if (options && options.feedback) {
      return options.feedback;
    }
    task = findDailyTask(taskId);
    if (task) {
      return {
        context: "task",
        title: "每日任务已领取 · " + task.label,
        detail: "任务奖励入袋"
      };
    }
    if (taskId === SPECIAL_DAILY_TASK_ID) {
      return {
        context: "daily_boss",
        title: (todayDailyBoss && todayDailyBoss.boss ? todayDailyBoss.boss.name : "今日 Boss") + " 首通奖励已到账",
        detail: "首通结算"
      };
    }
    return {
      context: "reward",
      title: "奖励到账",
      detail: "服务端发奖"
    };
  }

  function requestJson(url, options) {
    var settings = options || {};
    var headers = buildRequestHeaders(settings.headers || {});
    var fetchOptions = {
      method: settings.method || "GET",
      headers: headers,
      credentials: "same-origin"
    };

    if (!window.fetch) {
      return Promise.reject(new Error("fetch unavailable"));
    }
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

  function buildRequestHeaders(extraHeaders) {
    var headers = clone(extraHeaders || {});
    headers["Content-Type"] = "application/json";
    headers["X-Player-Id"] = getOrCreatePlayerId();
    return headers;
  }

  function readAnalyticsExposureLog() {
    return readStorageJson(STORAGE_KEYS.analyticsExposureLog) || {};
  }

  function markAnalyticsExposureTracked(key) {
    var log = readAnalyticsExposureLog();
    log[key] = new Date().toISOString();
    writeStorageJson(STORAGE_KEYS.analyticsExposureLog, log);
  }

  function trackAnalyticsEvents(events) {
    if (!isBackendEnabled() || !Array.isArray(events) || !events.length) {
      return;
    }
    requestJson("/analytics/track", {
      method: "POST",
      body: {
        events: events
      }
    }).then(function (response) {
      if (response && response.playerState) {
        applyServerPlayerState(response.playerState);
      }
    }).catch(function () {
      return null;
    });
  }

  function trackAnalyticsEventOnce(dedupeKey, entry) {
    var log;

    if (!dedupeKey || !entry || !entry.name || !isBackendEnabled()) {
      return;
    }
    log = readAnalyticsExposureLog();
    if (log[dedupeKey]) {
      return;
    }
    markAnalyticsExposureTracked(dedupeKey);
    trackAnalyticsEvents([Object.assign({
      category: "guide",
      status: "visible",
      source: "client",
      timestamp: new Date().toISOString()
    }, entry)]);
  }

  function trackPlaytestMilestone(dedupeKey, message, metadata, options) {
    var config = options || {};

    trackAnalyticsEventOnce(dedupeKey, {
      name: config.name || "playtest_step_recorded",
      category: config.category || "playtest",
      funnelStep: config.funnelStep || config.name || "playtest_step_recorded",
      placementId: config.placementId || activeTab || "home",
      status: config.status || "completed",
      message: message || "试玩节点已记录",
      metadata: clone(metadata || {})
    });
  }

  function trackPlaytestMilestones(guideState, dailyState, signInState, bridge, bossState, todayDailyBoss, rewardState) {
    var visited = guideState && guideState.visited ? guideState.visited : {};
    var latestBattle = bridge && bridge.latestBattle ? bridge.latestBattle : null;

    if (dailyState && dailyState.specialClaims && dailyState.specialClaims.loginReward) {
      trackPlaytestMilestone(todayKey() + ":playtest:daily-login", "已领取登录奖励", {
        stepId: "daily_login",
        rewardContext: "daily_login"
      }, {
        name: "playtest_reward_claimed",
        funnelStep: "playtest_reward"
      });
    }
    if (signInState && !signInState.canClaimToday && signInState.lastClaimDate === todayKey()) {
      trackPlaytestMilestone(todayKey() + ":playtest:sign-in", "已领取今日签到", {
        stepId: "sign_in",
        rewardContext: "sign_in"
      }, {
        name: "playtest_reward_claimed",
        funnelStep: "playtest_reward"
      });
    }
    if (dailyState && dailyState.specialClaims && dailyState.specialClaims.freeDraw) {
      trackPlaytestMilestone(todayKey() + ":playtest:free-draw", "已完成今日免费抽", {
        stepId: "free_draw",
        rewardContext: "free_draw"
      }, {
        name: "playtest_gacha_completed",
        funnelStep: "playtest_gacha"
      });
    }
    if (guideState && guideState.completions && guideState.completions.first_equip) {
      trackPlaytestMilestone(todayKey() + ":playtest:first-equip", "已完成第一次换装", {
        stepId: "first_equip",
        rewardContext: "gear_equip"
      }, {
        name: "playtest_gear_progressed",
        funnelStep: "playtest_gear"
      });
    }
    if (guideState && guideState.completions && guideState.completions.first_enhance) {
      trackPlaytestMilestone(todayKey() + ":playtest:first-enhance", "已完成第一次强化", {
        stepId: "first_enhance",
        rewardContext: "enhancement"
      }, {
        name: "playtest_gear_progressed",
        funnelStep: "playtest_gear"
      });
    }
    if (dailyState && normalizeNumber(dailyState.progress && dailyState.progress.adventure, 0) > 0) {
      trackPlaytestMilestone(todayKey() + ":playtest:adventure", "已完成一轮 Adventure", {
        stepId: "first_farm",
        mapId: latestBattle && latestBattle.mapId ? latestBattle.mapId : activeMapId
      }, {
        name: "playtest_adventure_started",
        funnelStep: "playtest_adventure"
      });
    }
    if (bossState && hasAnyBossAttempt(bossState)) {
      trackPlaytestMilestone(todayKey() + ":playtest:boss", "已进入今日 Boss 流程", {
        stepId: "first_boss",
        bossId: todayDailyBoss && todayDailyBoss.bossId ? todayDailyBoss.bossId : ""
      }, {
        name: "playtest_boss_started",
        funnelStep: "playtest_boss"
      });
    }
    if (visited && visited.leaderboardChecked) {
      trackPlaytestMilestone(todayKey() + ":playtest:leaderboard", "已查看排行榜差距", {
        stepId: "leaderboard_check",
        boardType: activeBoardType || "total"
      }, {
        name: "playtest_leaderboard_viewed",
        funnelStep: "playtest_leaderboard"
      });
    }
    if (rewardState && rewardState.latest && activeTab === "home" && visited && (visited.gacha || visited.adventure || visited.boss || visited.leaderboard)) {
      trackPlaytestMilestone(todayKey() + ":playtest:home-return", "已回到主城继续收口", {
        stepId: guideState && guideState.currentStepId ? guideState.currentStepId : "home_return",
        latestRewardContext: rewardState.latest.context || ""
      }, {
        name: "playtest_home_returned",
        funnelStep: "playtest_home_return",
        placementId: "home"
      });
    }
  }

  function trackGuideAndRetentionExposures(guideState, nextSessionPlan) {
    var currentStep = getGuideStep(guideState && guideState.currentStepId);

    if (currentStep) {
      trackAnalyticsEventOnce(todayKey() + ":guide-step:" + currentStep.id, {
        name: "guide_step_viewed",
        category: "guide",
        funnelStep: "guide_step",
        placementId: "home_guide",
        message: "主城当前推荐步骤：" + currentStep.id,
        metadata: { stepId: currentStep.id }
      });
    }
    if (nextSessionPlan) {
      trackAnalyticsEventOnce(todayKey() + ":next-day-preview", {
        name: "next_day_preview_viewed",
        category: "retention",
        funnelStep: "next_day_preview",
        placementId: "home_next_session",
        message: nextSessionPlan.tomorrowSummary,
        metadata: { nextActionTab: nextSessionPlan.actionTab || "home" }
      });
    }
    if (guideState && guideState.currentStepId === "loop_repeat") {
      trackAnalyticsEventOnce(todayKey() + ":session-loop-completed", {
        name: "session_loop_completed",
        category: "retention",
        funnelStep: "session_loop_completed",
        placementId: "home_guide",
        message: "首轮动作链已跑通"
      });
    }
  }

  function trackReturnHookExposure(surfaceId, message) {
    if (!surfaceId) {
      return;
    }
    trackAnalyticsEventOnce(todayKey() + ":return-hook:" + surfaceId, {
      name: "return_hook_viewed",
      category: "retention",
      funnelStep: "return_hook",
      placementId: surfaceId,
      message: message || (surfaceId + " 回流钩子曝光")
    });
  }

  function trackHomeExposureEvents(offerSurface) {
    var log;
    var events = [];

    if (!isBackendEnabled() || !offerSurface || !Array.isArray(offerSurface.order) || !offerSurface.order.length) {
      return;
    }
    log = readAnalyticsExposureLog();
    offerSurface.order.slice(0, 6).forEach(function (offerId) {
      var dedupeKey = todayKey() + ":offer:" + offerId;
      if (log[dedupeKey]) {
        return;
      }
      events.push({
        name: "product_exposed",
        category: "commerce",
        funnelStep: "offer_exposure",
        status: "visible",
        source: "client",
        offerId: offerId,
        placementId: getOfferLaunchConfig(offerId).entrySlot || "home_ops_grid",
        message: "Home 商品位曝光"
      });
      markAnalyticsExposureTracked(dedupeKey);
    });
    if (!events.length) {
      return;
    }
    trackAnalyticsEvents(events);
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
      return "guest-" + todayKey();
    }
  }

  function renderHome(bridge, dailyState, signInState, gachaState, wallet, dailyFortune, todayDailyBoss, bossState, opsState, commerceState, activityState, rewardState, analyticsState, guideState, boards) {
    var claimableCount = countClaimableTasks(dailyState);
    var offerSurface = buildOfferSurface(opsState, bridge, dailyState, gachaState);
    var competitionFocus = buildCompetitionFocus(boards || { total: [], same_day_master: [], today_boss: [] }, todayDailyBoss, bossState);
    var homeModules = getLaunchPrepConfigValue("surfaces.home.modules", {});
    var nextSessionPlan = buildNextSessionPlan(dailyState, signInState, opsState, commerceState, activityState, todayDailyBoss, bossState, guideState, boards);

    el.home.innerHTML = [
      "<h2 class='section-title'>Home / 主城面板</h2>",
      renderGuideNextActionTile(guideState, dailyFortune, todayDailyBoss),
      renderTodayGoalsPanel(dailyState, signInState, gachaState, opsState, commerceState, activityState, todayDailyBoss, bossState, boards, guideState, dailyFortune),
      "<div class='grid cols-2 home-priority-grid' style='margin-top:10px'>",
      renderLatestBattleCard(bridge),
      renderReturnReasonsTile("home", dailyState, opsState, commerceState, activityState, todayDailyBoss, bossState, boards),
      renderCompetitionPulseTile("home", boards, todayDailyBoss, bossState),
      renderTomorrowPreviewTile(nextSessionPlan),
      "</div>",
      "<div class='grid cols-2'>",
      renderRewardSpotlight(rewardState, ["daily_login", "sign_in", "daily_boss", "free_draw", "task", "monthly_card", "first_purchase", "event"], "最新到账"),
      renderFortuneTile(dailyFortune),
      renderDailyLoginTile(dailyState, signInState, opsState),
      "</div>",
      "<div class='tile' style='margin-top:10px'>",
      "<h3>每日任务奖励</h3>",
      "<div class='task-grid'>" + renderDailyTasks(dailyState) + "</div>",
      "<p class='meta'>今日抽卡次数: " + countTodayGacha(gachaState) +
        " | 完成 " + dailyState.completedCount + "/3 | 已领取 " + dailyState.claimedCount + "/3 | 可领取 " + claimableCount + " 个</p>",
      "<div class='button-row'>" + renderGuideButtons(guideState, dailyFortune, todayDailyBoss, "home") + "</div>",
      "</div>",
      "<div class='grid cols-2' style='margin-top:10px'>",
      renderHomeLoopTile(dailyFortune, todayDailyBoss, bossState, guideState),
      renderPlaytestWatchTile(dailyState, signInState, guideState, rewardState, analyticsState, bossState, todayDailyBoss),
      renderOfferSpotlightTile(offerSurface, opsState),
      (homeModules.commerceOps === false ? "" : renderCommerceReadinessTile(commerceState, opsState, rewardState)),
      (homeModules.analyticsOps === false ? "" : renderAnalyticsOpsTile(analyticsState)),
      "</div>",
      (competitionFocus ? renderShareReadySurface("home", competitionFocus.boardType, boards[competitionFocus.boardType] || [], competitionFocus.insight, todayDailyBoss, bossState) : ""),
      (homeModules.offerOverview === false ? "" : "<div class='tile' style='margin-top:10px'><h3>运营入口总览</h3><div class='offer-grid'>" + renderOfferCards(opsState, offerSurface.order) + "</div></div>"),
      (homeModules.eventOverview === false ? "" : "<div class='tile' style='margin-top:10px'><h3>活动入口 / 兑换</h3><div class='offer-grid'>" + renderEventCards(todayKey(), activityState, todayDailyBoss, bossState) + "</div></div>"),
      "<div class='tile' style='margin-top:10px'>",
      "<h3>今日资源结算</h3>",
      "<p>灵石 " + wallet.spiritStone + " · 抽卡券 " + wallet.drawTickets + " · 材料 " + wallet.materials + "</p>",
      "<p class='meta'>启用 npm start 时奖励 / 消耗优先走后端钱包与奖励账本；仅静态模式才回退到本地占位。</p>",
      "<div class='list reward-history'>" + renderRewardHistory(rewardState, 3) + "</div>",
      "</div>"
    ].join("");

    bindHomeActions(dailyState, dailyFortune, todayDailyBoss, opsState);
    trackHomeExposureEvents(offerSurface);
    trackGuideAndRetentionExposures(guideState, nextSessionPlan);
    trackReturnHookExposure("home", "主城回流与明日承接曝光");
  }

  function renderPlaytestWatchTile(dailyState, signInState, guideState, rewardState, analyticsState, bossState, todayDailyBoss) {
    var model = buildPlaytestWatchModel(dailyState, signInState, guideState, rewardState, analyticsState, bossState, todayDailyBoss);

    return [
      "<div class='tile' style='margin-top:10px'>",
      "<p class='eyebrow'>试玩观察面</p>",
      "<h3>当前卡点</h3>",
      "<p>当前阶段：" + safe(model.stageText) + "</p>",
      "<p class='meta'>当前卡点：" + safe(model.blockerText) + "</p>",
      "<div class='list' style='margin-top:10px'>" + model.eventRows + "</div>",
      "<p class='meta'>最近奖励：" + safe(model.latestRewardText) + "</p>",
      "</div>"
    ].join("");
  }

  function buildPlaytestWatchModel(dailyState, signInState, guideState, rewardState, analyticsState, bossState, todayDailyBoss) {
    var currentStep = getGuideStep(guideState && guideState.currentStepId);
    var recent = analyticsState && analyticsState.recent ? analyticsState.recent : { keyEvents: [] };
    var events = (recent.keyEvents || []).slice(0, 3);
    var latestReward = rewardState && rewardState.latest ? rewardState.latest : null;
    var stageText = currentStep ? currentStep.label : "先收免费收益，再进入抽卡 / 配装 / Boss";
    var latestRewardText = latestReward
      ? latestReward.title + " · " + (latestReward.summary || "-") + (latestReward.detail ? " · " + latestReward.detail : "")
      : "还没有最近奖励，先收登录奖励 / 签到 / 免费抽。";
    var eventRows = events.map(function (entry) {
      return "<div class='item'><strong>" + safe(formatAnalyticsEventLabel(entry.name || entry.funnelStep || "event")) + "</strong><p class='meta'>" +
        safe(entry.message || "已记录") + " · " + safe(formatTime(entry.timestamp || "")) + "</p></div>";
    }).join("") || "<div class='item'><p class='meta'>还没有关键行为记录；这正适合观察玩家第一次会先点哪里。</p></div>";

    return {
      stageText: stageText,
      blockerText: buildPlaytestCurrentBlocker(dailyState, signInState, guideState, bossState, todayDailyBoss),
      latestRewardText: latestRewardText,
      eventRows: eventRows
    };
  }

  function buildPlaytestCurrentBlocker(dailyState, signInState, guideState, bossState, todayDailyBoss) {
    var currentStep = getGuideStep(guideState && guideState.currentStepId);
    var todayRecord = getBossRecordForDate(bossState, todayKey(), todayDailyBoss);

    if (!dailyState.specialClaims.loginReward || signInState.canClaimToday || !dailyState.specialClaims.freeDraw) {
      return "免费收益还没收齐，先把登录奖励 / 签到 / 免费单抽拿掉。";
    }
    if (todayRecord.firstClearAchieved && !dailyState.specialClaims.dailyBossFirstClear) {
      return "今日 Boss 首通已经达成，但首通奖励还没领。";
    }
    if (!currentStep) {
      return "还没形成明确主路径，先从免费抽开始。";
    }
    if (currentStep.id === "loop_repeat") {
      return "首轮主链路已跑通，下一步该回榜读差距，再决定去 Gear / Adventure / Boss。";
    }
    return currentStep.description;
  }

  function formatAnalyticsEventLabel(name) {
    var labels = {
      playtest_reward_claimed: "免费收益已收",
      playtest_gacha_completed: "抽卡已发生",
      playtest_gear_progressed: "Gear 已推进",
      playtest_adventure_started: "Adventure 已完成",
      playtest_boss_started: "Boss 已进入",
      playtest_leaderboard_viewed: "榜单已查看",
      playtest_home_returned: "已回主城",
      guide_step_viewed: "当前推荐步骤",
      guide_cta_clicked: "引导 CTA",
      return_hook_viewed: "回流提示",
      next_day_preview_viewed: "明日承接"
    };

    return labels[name] || name || "事件";
  }

  function renderAnalyticsOpsTile(analyticsState) {
    var state = analyticsState || readAnalyticsState();
    var funnel = state.funnel || {};
    var monitoring = state.monitoring || {};
    var recent = state.recent || { keyEvents: [], orders: [], rewards: [] };
    var eventRows = (recent.keyEvents || []).slice(0, 4).map(function (entry) {
      return "<div class='item'><strong>" + safe(formatAnalyticsEventLabel(entry.name || entry.funnelStep || "event")) + "</strong><p class='meta'>" +
        safe(entry.status || "recorded") + (entry.offerId ? " · " + safe(entry.offerId) : "") + (entry.message ? " · " + safe(entry.message) : "") +
        " · " + safe(formatTime(entry.timestamp || "")) + "</p></div>";
    }).join("") || "<div class='item'><p class='meta'>暂无关键事件，先顺着免费收益 → 抽卡 → Gear → Adventure / Boss 跑一轮。</p></div>";
    var orderRows = (recent.orders || []).slice(0, 3).map(function (order) {
      return "<div class='item'><strong>" + safe((order.offerId || "order") + " · " + (order.orderId || "-")) + "</strong><p class='meta'>" +
        safe(formatCommerceOrder(order)) + "</p></div>";
    }).join("") || "<div class='item'><p class='meta'>暂无最近订单。</p></div>";
    var rewardRows = (recent.rewards || []).slice(0, 3).map(function (entry) {
      return "<div class='item'><strong>" + safe(entry.title || "奖励") + "</strong><p class='meta'>" +
        safe(entry.summary || "-") + (entry.detail ? " · " + safe(entry.detail) : "") + " · " + safe(formatTime(entry.timestamp || "")) + "</p></div>";
    }).join("") || "<div class='item'><p class='meta'>暂无最近奖励。</p></div>";

    return [
      "<div class='tile'>",
      "<h3>试玩观察 / 漏斗骨架</h3>",
      "<p>先看 5~20 人试玩主链路有没有顺跑，再看商品 / 支付骨架是否还会制造噪音。</p>",
      "<p class='meta'>免费收益 " + safe(String(getAnalyticsMetricCount(funnel.playtestRewardClaimed))) +
        " · 抽卡 " + safe(String(getAnalyticsMetricCount(funnel.playtestGachaCompleted))) +
        " · Gear 推进 " + safe(String(getAnalyticsMetricCount(funnel.playtestGearProgressed))) +
        " · Adventure " + safe(String(getAnalyticsMetricCount(funnel.playtestAdventureStarted))) +
        " · Boss " + safe(String(getAnalyticsMetricCount(funnel.playtestBossStarted))) +
        " · 榜单 " + safe(String(getAnalyticsMetricCount(funnel.playtestLeaderboardViewed))) +
        " · 回主城 " + safe(String(getAnalyticsMetricCount(funnel.playtestHomeReturned))) + "</p>",
      "<p class='meta'>曝光 " + safe(String(getAnalyticsMetricCount(funnel.productExposed))) +
        " · 下单 " + safe(String(getAnalyticsMetricCount(funnel.orderCreated))) +
        " · Checkout " + safe(String(getAnalyticsMetricCount(funnel.checkoutSessionCreated))) +
        " · 支付成功 " + safe(String(getAnalyticsMetricCount(funnel.paymentSucceeded))) + "</p>",
      "<p class='meta'>支付失败 " + safe(String(getAnalyticsMetricCount(funnel.paymentFailed))) +
        " · 取消 " + safe(String(getAnalyticsMetricCount(funnel.paymentCancelled))) +
        " · 超时 " + safe(String(getAnalyticsMetricCount(funnel.paymentTimedOut))) +
        " · 异常 " + safe(String(getAnalyticsMetricCount(funnel.paymentException))) + "</p>",
      "<p class='meta'>权益到账 " + safe(String(getAnalyticsMetricCount(funnel.entitlementFulfilled))) +
        " · 月卡领取 " + safe(String(getAnalyticsMetricCount(funnel.monthlyCardClaimed))) +
        " · Boss 首通 " + safe(String(getAnalyticsMetricCount(funnel.bossFirstClear))) +
        " · 活动兑换 " + safe(String(getAnalyticsMetricCount(funnel.activityRedeemed))) + "</p>",
      "<p class='meta'>引导曝光 " + safe(String(getAnalyticsMetricCount(funnel.guideStepViewed))) +
        " · 引导点击 " + safe(String(getAnalyticsMetricCount(funnel.guideCtaClicked))) +
        " · 回流钩子 " + safe(String(getAnalyticsMetricCount(funnel.returnHookViewed))) +
        " · 明日预告 " + safe(String(getAnalyticsMetricCount(funnel.nextDayPreviewViewed))) +
        " · 首轮跑通 " + safe(String(getAnalyticsMetricCount(funnel.sessionLoopCompleted))) + "</p>",
      "<p class='meta'>监控：待支付 " + safe(String(normalizeNumber(monitoring.pendingOrders, 0))) +
        " · 重复 callback 拦截 " + safe(String(normalizeNumber(monitoring.duplicateCallbacksBlocked, 0))) +
        " · 未验签/待复核 " + safe(String(normalizeNumber(monitoring.unverifiedCallbacks, 0))) +
        " · 异常回调 " + safe(String(normalizeNumber(monitoring.callbackExceptions, 0))) + "</p>",
      "<div class='list'>" + eventRows + "</div>",
      "<div class='list' style='margin-top:8px'>" + orderRows + "</div>",
      "<div class='list' style='margin-top:8px'>" + rewardRows + "</div>",
      "</div>"
    ].join("");
  }

  function renderFortuneTile(dailyFortune) {
    if (!dailyFortune || !dailyFortune.ready) {
      return [
        "<div class='tile'>",
        "<h3>今日运势</h3>",
        "<p>尚未同步命格快照。</p>",
        "<p class='meta'>先去 Phase 1 打一把，带回日主/喜用/身强弱后，再生成个性化今日倾向。</p>",
        "</div>"
      ].join("");
    }

    return [
      "<div class='tile is-featured'>",
      "<h3>今日运势</h3>",
      "<p>" + safe(dailyFortune.tone) + " · 幸运五行 " + safe(dailyFortune.luckyElement) + "</p>",
      "<p class='meta'>推荐地图: " + safe(dailyFortune.recommendedMapName) + "</p>",
      "<p class='meta'>推荐玩法: " + safe(dailyFortune.recommendedMode) + "</p>",
      "<p class='meta'>推荐克制: " + safe(dailyFortune.counterElement) + " | 避免五行: " + safe(dailyFortune.cautionElement) + "</p>",
      "<p class='meta'>依据: " + safe(dailyFortune.reasonText) + "</p>",
      "</div>"
    ].join("");
  }

  function renderRewardSpotlight(rewardState, contexts, heading) {
    var latest = rewardState && rewardState.latest ? rewardState.latest : null;
    var pills;

    if (!latest) {
      return "";
    }
    if (Array.isArray(contexts) && contexts.length && contexts.indexOf(latest.context) === -1) {
      return "";
    }

    pills = renderMomentPills([
      {
        label: resolveContextLabel(latest.context),
        tone: latest.context === "gacha" || latest.context === "free_draw"
          ? "is-rare"
          : (latest.context === "daily_boss" ? "is-claimable" : "is-live")
      },
      { label: "账本已刷新", tone: "is-preview" }
    ], "is-compact");

    return [
      "<div class='tile reward-spotlight is-featured " + safeClassName(resolveContextTone(latest.context)) + "' style='margin-top:10px'>",
      "<p class='eyebrow'>到账播报</p>",
      "<h3>" + safe(heading || "最新收获") + "</h3>",
      pills,
      "<p>" + safe(latest.title) + "</p>",
      "<p class='meta'>获得：" + safe(latest.summary) + (latest.detail ? " · " + safe(latest.detail) : "") + "</p>",
      "<p class='meta'>时间：" + safe(formatTime(latest.timestamp)) + "</p>",
      "</div>"
    ].join("");
  }

  function renderRewardHistory(rewardState, limit) {
    var history = rewardState && Array.isArray(rewardState.history) ? rewardState.history.slice(0, limit || 3) : [];
    if (!history.length) {
      return "<span class='muted'>暂无账本记录</span>";
    }
    return history.map(function (entry) {
      return "<div class='item'><strong>" + safe(entry.title) + "</strong><p class='meta'>" +
        safe(entry.summary) + (entry.detail ? " · " + safe(entry.detail) : "") + " · " +
      safe(formatTime(entry.timestamp)) + "</p></div>";
    }).join("");
  }

  function renderTodayGoalsPanel(dailyState, signInState, gachaState, opsState, commerceState, activityState, todayDailyBoss, bossState, boards, guideState, dailyFortune) {
    var goals = buildTodayGoals(dailyState, signInState, gachaState, opsState, commerceState, activityState, todayDailyBoss, bossState, boards, guideState, dailyFortune);

    return [
      "<div class='tile today-goals-panel is-featured' style='margin-top:10px'>",
      "<p class='eyebrow'>Today Goals</p>",
      "<h3>今天先做这几步</h3>",
      "<p class='meta'>先收奖励，再补当前 build，最后去 Boss / 榜单验收，避免一屏里什么都想点。</p>",
      renderTodayGoalSummaryStrip(goals),
      "<div class='today-goals-grid'>" + goals.map(function (goal) {
        return renderTodayGoalCard(goal);
      }).join("") + "</div>",
      "</div>"
    ].join("");
  }

  function renderTodayGoalSummaryStrip(goals) {
    var collectGoal = pickGoalByTag(goals, ["免费抽", "签到", "日常奖励", "首通奖"]);
    var buildGoal = pickGoalByTag(goals, ["主线", "日常奖励", "活动", "商品位"]);
    var verifyGoal = pickGoalByTag(goals, ["Boss", "冲榜", "活动", "商品位"]);

    return "<div class='status-row today-goals-strip'>" + [
      renderTodayGoalSummaryPill("先领", collectGoal ? collectGoal.title : "把免费收益收掉"),
      renderTodayGoalSummaryPill("再补", buildGoal ? buildGoal.title : "补当前 build 缺口"),
      renderTodayGoalSummaryPill("验收", verifyGoal ? verifyGoal.title : "回 Boss / 榜单复盘")
    ].join("") + "</div>";
  }

  function renderTodayGoalSummaryPill(label, text) {
    return "<span class='status-pill today-goal-pill'><strong>" + safe(label) + "</strong>" + safe(text || "-") + "</span>";
  }

  function pickGoalByTag(goals, tags) {
    var matched = null;
    (goals || []).some(function (goal) {
      if (tags.indexOf(goal.tag) >= 0) {
        matched = goal;
        return true;
      }
      return false;
    });
    return matched;
  }

  function buildTodayGoals(dailyState, signInState, gachaState, opsState, commerceState, activityState, todayDailyBoss, bossState, boards, guideState, dailyFortune) {
    var goalConfig = getLaunchPrepConfigValue("home.goalScores", {});
    var goals = [];
    var todayRecord = getBossRecordForDate(bossState, todayKey(), todayDailyBoss);
    var challengeState = getBossChallengeState(bossState);
    var bossRewardReady = !!(todayRecord.firstClearAchieved && !dailyState.specialClaims.dailyBossFirstClear);
    var claimableTasks = DAILY_TASKS.filter(function (task) {
      return normalizeNumber(dailyState.progress[task.id], 0) >= task.target && !dailyState.claimed[task.id];
    });
    var activeEvent = getPrimaryActiveEvent(todayKey(), activityState, todayDailyBoss, bossState);
    var competitionFocus = buildCompetitionFocus(boards || { total: [], same_day_master: [], today_boss: [] }, todayDailyBoss, bossState);
    var offerSurface = buildOfferSurface(opsState, readBridgeState(), dailyState, gachaState);

    if (!dailyState.specialClaims.freeDraw) {
      goals.push({
        score: normalizeNumber(goalConfig.freeDraw, 124),
        tag: "免费抽",
        title: "先把今天的免费单抽拿掉",
        summary: "命器池免费单抽 x1，最容易直接换装涨战力。",
        meta: "免费收益先收掉，再决定今天补哪件。",
        actionHtml: "<button type='button' class='cta' data-today-action='claim-free-draw'>领取免费抽</button>"
      });
    }

    if (signInState.canClaimToday) {
      goals.push({
        score: normalizeNumber(goalConfig.signIn, 120),
        tag: "签到",
        title: "把第 " + signInState.currentDayIndex + " 天签到领掉",
        summary: formatSignInReward(SIGN_IN_REWARDS[signInState.currentDayIndex - 1] || {}),
        meta: (signInState.statusText || "今日可签") + " · 先把今天这笔稳定资源收进账本。",
        actionHtml: "<button type='button' class='cta' data-today-action='claim-sign-in'>领取签到</button>"
      });
    }

    pushGuideGoal(goals, goalConfig, guideState, dailyFortune, todayDailyBoss);

    if (!dailyState.specialClaims.loginReward || claimableTasks.length) {
      goals.push({
        score: !dailyState.specialClaims.loginReward
          ? normalizeNumber(goalConfig.loginReward, 116)
          : normalizeNumber(goalConfig.taskClaim, 108),
        tag: "日常奖励",
        title: !dailyState.specialClaims.loginReward ? "先收掉今天的基础收益" : "把已完成的每日奖励收掉",
        summary: !dailyState.specialClaims.loginReward
          ? "登录奖励：" + formatReward(DAILY_LOGIN_REWARD)
          : "可领取日常奖励 " + claimableTasks.length + " 个",
        meta: !dailyState.specialClaims.loginReward
          ? "登录奖励 + 日常任务会给今天第一轮抽卡 / 强化 / Boss 启动资金。"
          : "已完成 " + dailyState.completedCount + "/3 · 已领取 " + dailyState.claimedCount + "/3",
        actionHtml: !dailyState.specialClaims.loginReward
          ? "<button type='button' class='cta' data-today-action='claim-login-reward'>领取登录奖</button>"
          : (claimableTasks[0]
            ? "<button type='button' class='cta' data-claim-task='" + safe(claimableTasks[0].id) + "'>领取" + safe(claimableTasks[0].label) + "</button>"
            : "<button type='button' data-jump-tab='home'>回主城总览</button>")
      });
    }

    if (bossRewardReady) {
      goals.push({
        score: normalizeNumber(goalConfig.bossReward, 118),
        tag: "首通奖",
        title: "先把今日 Boss 首通奖励领掉",
        summary: "首通奖励：" + formatReward(DAILY_BOSS_FIRST_CLEAR_REWARD),
        meta: (todayDailyBoss ? todayDailyBoss.boss.name : "今日 Boss") + " · 首通已经达成，这一笔是今天最直接的回流收益。",
        actionHtml: "<button type='button' class='cta' data-today-action='claim-daily-boss-reward'>领取首通奖励</button>"
      });
    }

    goals.push({
      score: (!todayRecord.firstClearAchieved ? normalizeNumber(goalConfig.bossFirstClear, 114) : normalizeNumber(goalConfig.bossPush, 98)) + (challengeState.remaining > 0 ? 4 : 0),
      tag: "Boss",
      title: !todayRecord.firstClearAchieved ? "今天至少打一轮 Boss" : "今天还能继续追 Boss 分",
      summary: !todayRecord.firstClearAchieved
        ? "首通奖励：" + formatReward(DAILY_BOSS_FIRST_CLEAR_REWARD)
        : "当前最佳榜分 " + todayRecord.bestScore + " · 记分次数 " + formatBossChallengeState(challengeState),
      meta: (todayDailyBoss ? todayDailyBoss.boss.name : "今日 Boss") + " · " +
        (!todayRecord.firstClearAchieved ? "首通后还能接活动兑换和今日 Boss 榜。" : "打完回榜确认是否缩小差距。"),
      actionHtml: "<button type='button' class='cta' data-jump-tab='boss'" +
        (todayDailyBoss && todayDailyBoss.mapId ? " data-map-id='" + safe(todayDailyBoss.mapId) + "'" : "") + ">去 Boss</button>"
    });

    if (competitionFocus && competitionFocus.insight) {
      goals.push({
        score: normalizeNumber(goalConfig.leaderboard, 104),
        tag: "冲榜",
        title: "看清今天最值得追的榜",
        summary: getBoardName(competitionFocus.boardType, todayDailyBoss) + " · " + competitionFocus.insight.climbText,
        meta: competitionFocus.insight.priorityText + " · " + competitionFocus.insight.farmText,
        actionHtml: "<button type='button' class='cta' data-jump-tab='leaderboard'>去看榜</button>"
      });
    }

    if (activeEvent) {
      goals.push({
        score: activeEvent.claimable ? normalizeNumber(goalConfig.eventClaimable, 112) : normalizeNumber(goalConfig.eventActive, 94),
        tag: "活动",
        title: activeEvent.claimable ? "活动奖励现在就能兑" : "今天的活动入口别浪费",
        summary: activeEvent.config.title + " · " + activeEvent.rewardText,
        meta: activeEvent.progressText + " · " + safe(activeEvent.config.todayReason || activeEvent.config.rewardFocus || "今天别断活动进度"),
        actionHtml: activeEvent.claimable
          ? "<button type='button' class='cta' data-event-claim='" + safe(activeEvent.config.id) + "'>兑换奖励</button>"
          : "<button type='button' data-jump-tab='" + safe(activeEvent.config.ctaTab) + "'" +
            (activeEvent.config.mapId ? " data-map-id='" + safe(activeEvent.config.mapId) + "'" : "") + ">" + safe(activeEvent.config.ctaLabel || "查看活动") + "</button>"
      });
    }

    if (offerSurface && offerSurface.spotlight) {
      goals.push({
        score: normalizeNumber(goalConfig.offer, 90),
        tag: "商品位",
        title: offerSurface.spotlight.offer.name,
        summary: getOfferValueSummary(offerSurface.spotlight.offer.id),
        meta: offerSurface.spotlight.reason + " · 当前收益：" + getCommerceEntitlementBenefitText(getCommerceEntitlement(commerceState, offerSurface.spotlight.offer.id), offerSurface.spotlight.offer.id) + " · 剩余价值：" + getCommerceEntitlementValueText(getCommerceEntitlement(commerceState, offerSurface.spotlight.offer.id), offerSurface.spotlight.offer.id),
        actionHtml: renderOfferPrimaryAction(offerSurface.spotlight.offer, opsState) || "<button type='button' data-offer-id='" + safe(offerSurface.spotlight.offer.id) + "'>查看说明</button>"
      });
    }

    return goals.sort(function (a, b) {
      return b.score - a.score;
    }).slice(0, normalizeNumber(getLaunchPrepConfigValue("home.todayGoalsLimit", 6), 6));
  }

  function pushGuideGoal(goals, goalConfig, guideState, dailyFortune, todayDailyBoss) {
    var currentStep = getGuideStep(guideState && guideState.currentStepId);
    var nextStep;
    var mapId = dailyFortune && dailyFortune.ready && dailyFortune.recommendedMapId ? dailyFortune.recommendedMapId : activeMapId;
    var bossMapId = todayDailyBoss && todayDailyBoss.mapId ? todayDailyBoss.mapId : activeMapId;
    var targetMapId = "";

    if (!currentStep || ["free_draw", "first_boss", "leaderboard_check", "loop_repeat"].indexOf(currentStep.id) >= 0) {
      return;
    }

    nextStep = getGuideNextStep(currentStep.id);
    if (currentStep.primaryTab === "adventure") {
      targetMapId = mapId;
    } else if (currentStep.primaryTab === "boss") {
      targetMapId = bossMapId;
    }

    goals.push({
      score: normalizeNumber(goalConfig.guideStep, 119),
      tag: "主线",
      title: "现在先" + currentStep.label,
      summary: "把这一步做完，今天的 build 节奏才会顺起来。",
      meta: nextStep ? "接下来：" + nextStep.label : "做完后回榜看差距，再决定补哪一段。",
      actionHtml: buildJumpButton(currentStep.primaryLabel, currentStep.primaryTab, targetMapId, true)
    });
  }

  function renderTodayGoalCard(goal) {
    return [
      "<div class='today-goal-card'>",
      "<p class='eyebrow'>" + safe(goal.tag || "今日") + "</p>",
      "<h4>" + safe(goal.title || "今日动作") + "</h4>",
      "<p>" + safe(goal.summary || "-") + "</p>",
      (goal.meta ? "<p class='meta'>" + safe(goal.meta) + "</p>" : ""),
      "<div class='button-row'>" + (goal.actionHtml || "") + "</div>",
      "</div>"
    ].join("");
  }

  function getPrimaryActiveEvent(dateValue, activityState, todayDailyBoss, bossState) {
    var best = null;

    EVENT_CONFIGS.forEach(function (eventConfig) {
      var status = getEventStatus(eventConfig, dateValue);
      var eventState;
      var claimable = false;
      var progressText = "";
      var score = 0;

      if (status.code !== "active") {
        return;
      }

      eventState = getActivityEventState(activityState, eventConfig.id);
      if (eventConfig.redeem) {
        claimable = !!(!eventConfig.redeem.oncePerEvent || !eventState.claimed) &&
          normalizeNumber(eventState.tokenCount, 0) >= normalizeNumber(eventConfig.redeem.cost, 1);
        progressText = buildEventRedeemMeta(eventConfig, status, activityState, dateValue, todayDailyBoss, bossState).body
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }

      score = claimable ? 2 : 1;
      if (!best || score > best.score) {
        best = {
          score: score,
          claimable: claimable,
          config: eventConfig,
          rewardText: eventConfig.redeem ? formatReward(eventConfig.redeem.reward || {}) : (eventConfig.rewardFocus || "活动奖励"),
          progressText: progressText || getEventStatusText(eventConfig, status)
        };
      }
    });

    return best;
  }

  function getOfferValueSummary(offerId) {
    var product = findProductByOfferId(offerId);
    var offer = findOffer(offerId);

    if (product && product.valueSummary) {
      return product.valueSummary;
    }
    return offer && offer.items ? offer.items.join(" / ") : "本地原型占位";
  }

  function getOfferCareText(offerId, opsState, commerceState) {
    var product = findProductByOfferId(offerId);
    var entitlement = getCommerceEntitlement(commerceState, offerId);

    if (entitlement && entitlement.whyToday) {
      return entitlement.whyToday;
    }
    if (product && product.whyToday) {
      return product.whyToday;
    }
    return getOfferValueSummary(offerId);
  }

  function getCommerceEntitlementBenefitText(entitlement, offerId) {
    var product = findProductByOfferId(offerId);
    if (entitlement && entitlement.currentBenefitText) {
      return entitlement.currentBenefitText;
    }
    return product && product.valueSummary ? product.valueSummary : "本地原型占位";
  }

  function getCommerceEntitlementValueText(entitlement, offerId) {
    var product = findProductByOfferId(offerId);
    if (entitlement && entitlement.remainingValueText) {
      return entitlement.remainingValueText;
    }
    return product && Array.isArray(product.benefits) && product.benefits.length
      ? product.benefits.join(" / ")
      : "本地原型占位";
  }

  function formatUiKey(key) {
    return String(key || "")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^./, function (value) {
        return value.toUpperCase();
      })
      .trim();
  }

  function formatUiValue(value) {
    var keys;

    if (value == null) {
      return "";
    }
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.map(function (entry) {
        return formatUiValue(entry);
      }).filter(Boolean).join(" / ");
    }
    if (typeof value === "object") {
      if (value.summary) {
        return formatUiValue(value.summary);
      }
      if (value.label && value.value != null) {
        return formatUiValue(value.label) + "：" + formatUiValue(value.value);
      }
      if (value.title && value.detail) {
        return formatUiValue(value.title) + " · " + formatUiValue(value.detail);
      }
      if (value.stage && value.summary) {
        return formatUiValue(value.stage) + "：" + formatUiValue(value.summary);
      }
      if (value.stage && value.label) {
        return formatUiValue(value.label);
      }

      keys = Object.keys(value).filter(function (key) {
        return value[key] != null && value[key] !== "";
      }).slice(0, 4);

      return keys.map(function (key) {
        return formatUiKey(key) + "：" + formatUiValue(value[key]);
      }).filter(Boolean).join(" · ");
    }
    return String(value);
  }

  function formatCommerceOrderFlow(order, offerId) {
    var product = findProductByOfferId(offerId || (order && order.offerId) || "");
    if (!order) {
      return product ? formatProductGrantPreview(product) : "创建占位订单 → 等待后续支付链路接入";
    }
    return formatUiValue(order.stageSummary) || (product ? formatProductGrantPreview(product) : "创建占位订单 → 模拟支付成功 → 履约占位");
  }

  function formatCommerceUnlockCondition(product) {
    if (!product) {
      return "always";
    }
    if (product.unlockCondition === "first_battle_complete") {
      return "首战后解锁";
    }
    if (product.unlockCondition === "event_active") {
      return "活动进行中";
    }
    if (product.unlockCondition === "boss_attempted") {
      return "Boss 首次尝试后解锁";
    }
    return product.unlockCondition || "always";
  }

  function formatCommerceProductMeta(product) {
    if (!product) {
      return "暂无商品定义";
    }
    return [
      product.sku || product.id,
      product.productType || "product",
      product.purchaseType || "non-consumable",
      product.entitlementType || "delivery",
      (product.price && product.price.label) || product.priceLabel || "支付占位"
    ].filter(Boolean).join(" · ");
  }

  function formatCommerceTimeline(order) {
    if (!order || !Array.isArray(order.stageHistory) || !order.stageHistory.length) {
      return "created → pending_payment → paid → fulfilled / failed / cancelled";
    }
    return order.stageHistory.map(function (entry) {
      return entry.label || entry.stage || "created";
    }).join(" → ");
  }

  function isCommerceFeedbackContext(context) {
    return ["commerce", "first_purchase", "monthly_card", "event_bundle", "combat_supply_bundle", "boss_rush_bundle"].indexOf(context) !== -1;
  }

  function getLatestCommerceFeedback(rewardState) {
    var history = rewardState && Array.isArray(rewardState.history) ? rewardState.history : [];
    var latest = rewardState && rewardState.latest ? rewardState.latest : null;
    var matched = null;

    if (latest && isCommerceFeedbackContext(latest.context)) {
      return latest;
    }

    history.some(function (entry) {
      if (entry && isCommerceFeedbackContext(entry.context)) {
        matched = entry;
        return true;
      }
      return false;
    });

    return matched;
  }

  function renderCommerceReadinessTile(commerceState, opsState, rewardState) {
    var monthlyEntitlement = getCommerceEntitlement(commerceState, "monthly_card");
    var firstPurchaseEntitlement = getCommerceEntitlement(commerceState, "first_purchase");
    var monthlyOrder = getLatestCommerceOrder(commerceState, "monthly_card");
    var firstPurchaseOrder = getLatestCommerceOrder(commerceState, "first_purchase");
    var refreshText = commerceState && commerceState.lastUpdatedAt ? formatTime(commerceState.lastUpdatedAt) : "刚刚";
    var latestFeedback = getLatestCommerceFeedback(rewardState);
    var orderCount = commerceState && Array.isArray(commerceState.orders) ? commerceState.orders.length : 0;
    var pendingCount = commerceState && Array.isArray(commerceState.orders)
      ? commerceState.orders.filter(function (order) {
        return order.status === "pending_payment";
      }).length
      : 0;

    return [
      "<div class='tile commerce-tile'>",
      "<h3>商品状态</h3>",
      "<p>商品、权益和最近订单已收口到同一处，试玩先看状态，不把支付技术细节顶到前面。</p>",
      "<p class='meta'>Catalog：" + safe(commerceState && commerceState.catalogVersion ? commerceState.catalogVersion : LAUNCH_PREP_CONFIG.version) + " · 最近刷新：" + safe(refreshText) + "</p>",
      "<p class='meta'>订单池：" + safe(String(orderCount)) + " 单 · 待支付 " + safe(String(pendingCount)) + " 单</p>",
      "<p class='meta'>首购权益：" + safe(formatCommerceEntitlement(firstPurchaseEntitlement)) + " · 当前收益：" + safe(getCommerceEntitlementBenefitText(firstPurchaseEntitlement, "first_purchase")) + "</p>",
      "<p class='meta'>首购剩余价值：" + safe(getCommerceEntitlementValueText(firstPurchaseEntitlement, "first_purchase")) + "</p>",
      "<p class='meta'>最近首购订单：" + safe(formatCommerceOrder(firstPurchaseOrder)) + "</p>",
      "<p class='meta'>首购链路：" + safe(formatCommerceOrderFlow(firstPurchaseOrder, "first_purchase")) + "</p>",
      "<p class='meta'>月卡权益：" + safe(formatCommerceEntitlement(monthlyEntitlement || getCommerceEntitlement(readCommerceState(opsState, todayKey()), "monthly_card"))) + " · 当前收益：" + safe(getCommerceEntitlementBenefitText(monthlyEntitlement, "monthly_card")) + "</p>",
      "<p class='meta'>月卡剩余价值：" + safe(getCommerceEntitlementValueText(monthlyEntitlement, "monthly_card")) + "</p>",
      "<p class='meta'>最近月卡订单：" + safe(formatCommerceOrder(monthlyOrder)) + "</p>",
      "<p class='meta'>月卡链路：" + safe(formatCommerceOrderFlow(monthlyOrder, "monthly_card")) + "</p>",
      (latestFeedback
        ? "<p class='meta'>最近商业化反馈：" + safe(latestFeedback.title) + " · " + safe(latestFeedback.summary || "-") + (latestFeedback.detail ? " · " + safe(latestFeedback.detail) : "") + "</p>"
        : "<p class='meta'>最近商业化反馈：尚未触发订单操作。</p>"),
      "</div>"
    ].join("");
  }

  function renderDailyLoginTile(dailyState, signInState, opsState) {
    var commerceState = readCommerceState(opsState, todayKey());
    var monthlyEntitlement = getCommerceEntitlement(commerceState, "monthly_card");
    var loginClaimed = !!dailyState.specialClaims.loginReward;
    var freeDrawClaimed = !!dailyState.specialClaims.freeDraw;
    var monthlyCard = opsState.monthlyCard;
    var monthlyAction = "";
    var nextSignInText = buildNextSignInPreviewText(signInState);
    var loginStatusText = loginClaimed
      ? "已领取" + (dailyState.specialClaimTimes.loginReward ? " · " + formatTime(dailyState.specialClaimTimes.loginReward) : "")
      : "待领取";
    var freeDrawStatusText = freeDrawClaimed
      ? "已使用" + (dailyState.specialClaimTimes.freeDraw ? " · " + formatTime(dailyState.specialClaimTimes.freeDraw) : "")
      : "待领取";

    if (monthlyCard.status === "active") {
      monthlyAction = "<button type='button' data-offer-action='claim-monthly-card'" +
        (monthlyCard.lastClaimDate === todayKey() ? " disabled" : " class='cta'") + ">" +
        (monthlyCard.lastClaimDate === todayKey() ? "月卡已领" : "领取月卡日常") + "</button>";
    }

    return [
      "<div class='tile'>",
      "<h3>每日登录 / 7 日签到</h3>",
      "<p>今日福利：" + safe(formatReward(DAILY_LOGIN_REWARD)) + " · 命器池免费单抽 x1</p>",
      "<div class='status-row'><span class='status-pill " + (loginClaimed ? "is-claimed" : "is-claimable") + "'>登录奖励 " + safe(loginStatusText) + "</span>" +
        "<span class='status-pill " + (freeDrawClaimed ? "is-claimed" : "is-claimable") + "'>免费单抽 " + safe(freeDrawStatusText) + "</span></div>",
      (monthlyCard.status === "active"
        ? "<p class='meta'>月卡状态：进行中 · 剩余 " + getMonthlyCardRemainingDays(monthlyCard) + " 天 · " +
          (monthlyCard.lastClaimDate === todayKey() ? "今日已领" : "今日可领") + " · 明天回来可领：" + safe(formatReward(MONTHLY_CARD_CONFIG.dailyReward)) + " · 剩余价值：" + safe(getCommerceEntitlementValueText(monthlyEntitlement, "monthly_card")) + "</p>"
        : "<p class='meta'>月卡状态：" + safe(getOfferStatusText(findOffer("monthly_card"), opsState)) + " · 今天为什么看：" + safe(getOfferCareText("monthly_card", opsState, commerceState)) + " · 明天承接：开通后每日可领 " + safe(formatReward(MONTHLY_CARD_CONFIG.dailyReward)) + "</p>"),
      "<p class='meta'>明天预告：" + safe(nextSignInText) + "</p>",
      "<div class='button-row'>",
      "<button type='button' id='btn-claim-login-reward'" + (loginClaimed ? " disabled" : " class='cta'") + ">" +
        (loginClaimed ? "登录已领" : "领取登录奖励") + "</button>",
      "<button type='button' id='btn-claim-free-draw'" + (freeDrawClaimed ? " disabled" : " class='cta'") + ">" +
        (freeDrawClaimed ? "免费单抽已用" : "领取免费单抽") + "</button>",
      monthlyAction,
      "</div>",
      renderSignInPanel(signInState),
      "</div>"
    ].join("");
  }

  function renderSignInPanel(signInState) {
    return [
      "<div class='tile' style='margin-top:10px'>",
      "<div class='signin-summary'><strong>连签 " + normalizeNumber(signInState.streakCount, 0) + " 天</strong><span class='meta'>本轮 " +
        normalizeNumber(signInState.cycleProgress, 0) + "/7 · 累计 " + normalizeNumber(signInState.totalClaimed, 0) + " 天 · 周目 " +
        Math.max(1, normalizeNumber(signInState.cycleIndex, 1)) + "</span></div>",
      "<div class='signin-grid'>" + SIGN_IN_REWARDS.map(function (entry) {
        return renderSignInDay(entry, signInState);
      }).join("") + "</div>",
      "<p class='meta'>" + safe(signInState.statusText || "今天可签到") + "</p>",
      "<div class='button-row'><button type='button' id='btn-claim-sign-in'" +
        (signInState.canClaimToday ? " class='cta'" : " disabled") + ">" +
        (signInState.canClaimToday ? "领取第 " + signInState.currentDayIndex + " 天签到" : "今日已签到") + "</button></div>",
      "</div>"
    ].join("");
  }

  function renderSignInDay(entry, signInState) {
    var dayIndex = normalizeNumber(entry.day, 1);
    var claimed = !!(signInState.claimedDays && signInState.claimedDays[dayIndex]);
    var isTodayTarget = dayIndex === signInState.currentDayIndex;
    var classes = ["signin-day"];
    var statusClass = "is-locked";
    var statusText = "未解锁";

    if (claimed) {
      classes.push("is-claimed");
      statusClass = "is-claimed";
      statusText = isTodayTarget ? "今日已签" : "已领取";
    } else if (isTodayTarget && signInState.canClaimToday) {
      classes.push("is-today");
      statusClass = "is-claimable";
      statusText = "今日可签";
    } else if (isTodayTarget && !signInState.canClaimToday) {
      classes.push("is-today");
      statusClass = "is-claimed";
      statusText = "今日已签";
    } else {
      classes.push("is-locked");
    }

    return [
      "<div class='" + classes.join(" ") + "'>",
      "<strong>Day " + dayIndex + "</strong>",
      "<span>" + safe(entry.title) + "</span>",
      "<span class='meta'>" + safe(formatSignInReward(entry)) + "</span>",
      "<span class='status-pill " + statusClass + "'>" + safe(statusText) + "</span>",
      "</div>"
    ].join("");
  }

  function formatSignInReward(entry) {
    var parts = [];
    if (entry.reward) {
      parts.push(formatReward(entry.reward));
    }
    if (entry.rewardHint) {
      parts.push(entry.rewardHint);
    }
    return parts.join(" · ");
  }

  function renderHomeLoopTile(dailyFortune, todayDailyBoss, bossState, guideState) {
    var todayRecord = getBossRecordForDate(bossState, todayKey(), todayDailyBoss);
    var currentStep = getGuideStep(guideState && guideState.currentStepId);
    return [
      "<div class='tile'>",
      "<h3>今日行动链</h3>",
      "<p>主城 → 抽卡 / 免费单抽 → 配装 → 强化 → 刷图 → 今日 Boss → 榜单 → 回主城。</p>",
      (guideState ? "<div class='status-row'>" + renderGuideProgressPills(guideState) + "</div>" : ""),
      (currentStep ? "<p class='meta'>当前推荐：" + safe(currentStep.label) + "</p>" : ""),
      "<p class='meta'>今日 Boss: " + safe(todayDailyBoss ? todayDailyBoss.boss.name : "暂无") +
        " | 今日战绩: 挑战 " + todayRecord.attempts + " / 胜利 " + todayRecord.victories + " / 榜分 " + todayRecord.bestScore + "</p>",
      "<div class='button-row'>",
      "<button type='button' id='btn-home-go-daily-boss'" + (todayDailyBoss ? "" : " disabled") + ">去今日 Boss</button>",
      "<button class='cta' type='button' id='btn-home-go-fortune-map'" +
        (dailyFortune && dailyFortune.ready && dailyFortune.recommendedMapId ? "" : " disabled") + ">按运势出发</button>",
      "</div>",
      "</div>"
    ].join("");
  }

  function renderGuideNextActionTile(guideState, dailyFortune, todayDailyBoss) {
    var currentStep = getGuideStep(guideState && guideState.currentStepId);
    var nextStep = currentStep && currentStep.id !== "loop_repeat" ? getGuideNextStep(currentStep.id) : null;
    var heading = guideState && guideState.currentStepId === "loop_repeat"
      ? "首轮动作链已跑通"
      : "What Next / 下一步只点这个";
    var body = currentStep
      ? currentStep.description
      : "先从免费抽开始，再把命器穿上、强化、刷图、Boss、看榜。";

    return [
      "<div class='tile loop-card is-featured surface-hero home-hero-card is-live-surface' style='margin-top:10px'>",
      "<p class='eyebrow'>新手主路径</p>",
      "<h3>" + safe(heading) + "</h3>",
      renderMomentPills([
        { label: guideState ? ("主线 " + guideState.completedCount + "/" + GUIDE_STEPS.length) : "主线起步", tone: "is-live" },
        { label: currentStep ? currentStep.primaryLabel : "先免费抽", tone: "is-recommended" },
        { label: todayDailyBoss ? todayDailyBoss.boss.name : "今日 Boss", tone: "is-preview" }
      ], "is-compact"),
      "<p class='hero-copy'>" + safe(body) + "</p>",
      (guideState ? "<p class='meta'>进度：" + safe(guideState.progressText) + " · 已完成 " + guideState.completedCount + "/" + GUIDE_STEPS.length + " 个关键动作</p>" : ""),
      "<p class='meta'>现在最该点：" + safe(currentStep ? currentStep.primaryLabel : "去免费抽") + "</p>",
      "<p class='meta'>做完后：" + safe(nextStep ? nextStep.label : "回榜单 / 主城验收这轮提升") + "</p>",
      (guideState ? "<div class='status-row'>" + renderGuideProgressPills(guideState) + "</div>" : ""),
      (guideState ? "<div class='guide-list'>" + renderGuideChecklist(guideState, 2) + "</div>" : ""),
      "<div class='button-row'>" + renderGuideButtons(guideState, dailyFortune, todayDailyBoss, "home") + "</div>",
      "</div>"
    ].join("");
  }

  function bindHomeActions(dailyState, dailyFortune, todayDailyBoss, opsState) {
    bindScopedTabJumps(el.home);
    bindShareButtons(el.home);
    bindOfferButtons(el.home);
    bindOfferActionButtons(el.home);
    bindTodayActionButtons(el.home);

    var loginRewardBtn = document.getElementById("btn-claim-login-reward");
    if (loginRewardBtn) {
      loginRewardBtn.addEventListener("click", function () {
        claimDailyLoginReward();
      });
    }

    var freeDrawBtn = document.getElementById("btn-claim-free-draw");
    if (freeDrawBtn) {
      freeDrawBtn.addEventListener("click", function () {
        claimDailyFreeDraw();
      });
    }

    var signInBtn = document.getElementById("btn-claim-sign-in");
    if (signInBtn) {
      signInBtn.addEventListener("click", function () {
        claimSignInReward();
      });
    }

    var goFortuneMapBtn = document.getElementById("btn-home-go-fortune-map");
    if (goFortuneMapBtn && dailyFortune && dailyFortune.ready && dailyFortune.recommendedMapId) {
      goFortuneMapBtn.addEventListener("click", function () {
        activeMapId = dailyFortune.recommendedMapId;
        activeTab = "adventure";
        renderAll();
      });
    }

    var goDailyBossBtn = document.getElementById("btn-home-go-daily-boss");
    if (goDailyBossBtn && todayDailyBoss) {
      goDailyBossBtn.addEventListener("click", function () {
        activeBossDateKey = todayKey();
        activeMapId = todayDailyBoss.mapId;
        activeTab = "boss";
        renderAll();
      });
    }

    el.home.querySelectorAll("button[data-claim-task]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var taskId = btn.getAttribute("data-claim-task");
        var task = findDailyTask(taskId);
        if (!task) {
          return;
        }
        var progress = dailyState.progress[task.id] || 0;
        var claimed = !!dailyState.claimed[task.id];
        if (progress < task.target || claimed) {
          return;
        }
        claimDailyTask(task.id);
      });
    });

    el.home.querySelectorAll("button[data-event-claim]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        claimEventReward(btn.getAttribute("data-event-claim"));
      });
    });
  }

  function bindTodayActionButtons(scope) {
    if (!scope) {
      return;
    }

    scope.querySelectorAll("button[data-today-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-today-action");
        if (action === "claim-login-reward") {
          claimDailyLoginReward();
          return;
        }
        if (action === "claim-free-draw") {
          claimDailyFreeDraw();
          return;
        }
        if (action === "claim-sign-in") {
          claimSignInReward();
          return;
        }
        if (action === "claim-daily-boss-reward") {
          claimDailyBossFirstClearReward();
        }
      });
    });
  }

  function bindScopedTabJumps(scope) {
    if (!scope) {
      return;
    }
    scope.querySelectorAll("button[data-jump-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var analyticsName = btn.getAttribute("data-analytics-name");
        var nextTab = btn.getAttribute("data-jump-tab");
        var nextMapId = btn.getAttribute("data-map-id");

        if (analyticsName) {
          trackAnalyticsEvents([{
            name: analyticsName,
            category: btn.getAttribute("data-analytics-category") || "guide",
            funnelStep: btn.getAttribute("data-analytics-funnel-step") || "guide_cta",
            status: "clicked",
            source: "client",
            placementId: btn.getAttribute("data-analytics-surface") || (scope.id || activeTab),
            message: btn.getAttribute("data-analytics-message") || btn.textContent || "",
            metadata: {
              stepId: btn.getAttribute("data-analytics-step") || ""
            }
          }]);
        }

        if (!isValidTab(nextTab)) {
          return;
        }
        if (nextMapId && mapById[nextMapId]) {
          activeMapId = nextMapId;
        }
        activeTab = nextTab;
        renderAll();
      });
    });
  }

  function bindShareButtons(scope) {
    if (!scope) {
      return;
    }

    scope.querySelectorAll("button[data-share-preview]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var previewId = btn.getAttribute("data-share-preview");
        var preview = scope.querySelector("[data-share-preview-body='" + previewId + "']");
        var closedLabel = btn.getAttribute("data-preview-closed-label") || "展开分享卡";
        var openLabel = btn.getAttribute("data-preview-open-label") || "收起分享卡";

        if (!preview) {
          return;
        }

        if (preview.hasAttribute("hidden")) {
          preview.removeAttribute("hidden");
          btn.textContent = openLabel;
        } else {
          preview.setAttribute("hidden", "hidden");
          btn.textContent = closedLabel;
        }
      });
    });

    scope.querySelectorAll("button[data-share-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var previewId = btn.getAttribute("data-share-copy");
        var payload = scope.querySelector("[data-share-copy-body='" + previewId + "']");
        var originalLabel = btn.getAttribute("data-default-label") || "复制文案";

        if (!payload) {
          btn.textContent = "无可复制数据";
          window.setTimeout(function () {
            btn.textContent = originalLabel;
          }, 1200);
          return;
        }

        copyTextToClipboard(payload.textContent || "").then(function (copied) {
          btn.textContent = copied ? "已复制" : "复制失败";
          window.setTimeout(function () {
            btn.textContent = originalLabel;
          }, 1200);
        });
      });
    });
  }

  function markGuideTabVisit(tabName) {
    var state;
    var visited;
    var timestamp;

    if (!tabName) {
      return;
    }

    state = readStorageJson(STORAGE_KEYS.guideState) || {};
    visited = state.visited || {};
    timestamp = new Date().toISOString();

    if (!visited[tabName]) {
      visited[tabName] = timestamp;
    }
    if (tabName === "leaderboard" && !visited.leaderboardChecked) {
      visited.leaderboardChecked = timestamp;
    }

    state.visited = visited;
    writeStorageJson(STORAGE_KEYS.guideState, state);
  }

  function readGuideState(gachaState, dailyState, bossState, rewardState, equipmentState) {
    var state = readStorageJson(STORAGE_KEYS.guideState) || {};
    var visited = state.visited || {};
    var completions = state.completions || {};
    var hasEquip = hasRewardContext(rewardState, ["gear_equip"]) || !!(
      equipmentState && equipmentState.summary && normalizeNumber(equipmentState.summary.gearSwapPower, 0) > 0
    );
    var hasEnhance = hasRewardContext(rewardState, ["enhancement"]) || !!(
      equipmentState && equipmentState.summary && normalizeNumber(equipmentState.summary.totalEnhancementLevel, 0) > 0
    );

    completions.free_draw = !!(completions.free_draw || dailyState.specialClaims.freeDraw || countTodayGacha(gachaState) > 0);
    completions.first_equip = !!(completions.first_equip || hasEquip);
    completions.first_enhance = !!(completions.first_enhance || hasEnhance);
    completions.first_farm = !!(completions.first_farm || normalizeNumber(dailyState.progress.adventure, 0) > 0);
    completions.first_boss = !!(completions.first_boss || hasAnyBossAttempt(bossState));
    completions.leaderboard_check = !!(completions.leaderboard_check || visited.leaderboardChecked);

    state.visited = visited;
    state.completions = completions;
    state.completedCount = GUIDE_STEPS.filter(function (step) {
      return !!completions[step.id];
    }).length;
    state.currentStepId = "loop_repeat";

    GUIDE_STEPS.some(function (step) {
      if (!completions[step.id]) {
        state.currentStepId = step.id;
        return true;
      }
      return false;
    });

    state.progressText = state.completedCount + "/" + GUIDE_STEPS.length;
    writeStorageJson(STORAGE_KEYS.guideState, state);
    return state;
  }

  function hasRewardContext(rewardState, contexts) {
    var history = rewardState && Array.isArray(rewardState.history) ? rewardState.history : [];
    var allowed = Array.isArray(contexts) ? contexts : [contexts];
    if (rewardState && rewardState.latest && allowed.indexOf(rewardState.latest.context) !== -1) {
      return true;
    }
    return history.some(function (entry) {
      return allowed.indexOf(entry.context) !== -1;
    });
  }

  function hasAnyBossAttempt(bossState) {
    var records = bossState && bossState.records ? bossState.records : {};
    return Object.keys(records).some(function (dateValue) {
      return normalizeNumber(records[dateValue] && records[dateValue].attempts, 0) > 0;
    });
  }

  function getGuideStep(stepId) {
    var found = GUIDE_STEPS.filter(function (step) {
      return step.id === stepId;
    })[0];

    if (found) {
      return found;
    }

    if (stepId === "loop_repeat") {
      return {
        id: "loop_repeat",
        shortLabel: "回环",
        label: "回到 Boss / 榜单继续冲高",
        description: "第一轮动作链已经打通，现在按榜单差距回到 Gear、刷图或 Boss，把成长变成下一个循环。",
        primaryTab: "leaderboard",
        primaryLabel: "去看榜"
      };
    }

    return null;
  }

  function renderGuideProgressPills(guideState) {
    return GUIDE_STEPS.map(function (step) {
      var statusClass = guideState.completions[step.id]
        ? "is-claimed"
        : (guideState.currentStepId === step.id ? "is-claimable" : "is-locked");
      return "<span class='status-pill " + statusClass + "'>" + safe(step.shortLabel) + "</span>";
    }).join("");
  }

  function renderGuideChecklist(guideState, limit) {
    return GUIDE_STEPS.slice(0, limit || GUIDE_STEPS.length).map(function (step, idx) {
      var isDone = !!guideState.completions[step.id];
      var isCurrent = guideState.currentStepId === step.id;
      var statusText = isDone ? "已完成" : (isCurrent ? "当前推荐" : "待完成");

      return [
        "<div class='guide-item " + (isDone ? "is-done" : (isCurrent ? "is-current" : "")) + "'>",
        "<div class='guide-item-head'><strong>Step " + (idx + 1) + " · " + safe(step.label) + "</strong><span class='rank-detail'>" + safe(statusText) + "</span></div>",
        "<p class='meta'>" + safe(step.description) + "</p>",
        "</div>"
      ].join("");
    }).join("");
  }

  function renderGuideTimingStrip() {
    return "<div class='status-row'>" + [
      "<span class='status-pill'><strong>登录后</strong>先收登录奖 / 签到 / 免费单抽</span>",
      "<span class='status-pill'><strong>抽完后</strong>有能穿的命器就立刻换上</span>",
      "<span class='status-pill'><strong>打 Boss 前</strong>主武器 / 核心先抬到 +1~+3</span>",
      "<span class='status-pill'><strong>打完后</strong>回榜 / 回主城确认差距、领奖、记明日目标</span>"
    ].join("") + "</div>";
  }

  function buildAnalyticsButtonAttrs(analytics) {
    if (!analytics || !analytics.name) {
      return "";
    }
    return " data-analytics-name='" + safe(analytics.name) + "'" +
      (analytics.category ? " data-analytics-category='" + safe(analytics.category) + "'" : "") +
      (analytics.funnelStep ? " data-analytics-funnel-step='" + safe(analytics.funnelStep) + "'" : "") +
      (analytics.surface ? " data-analytics-surface='" + safe(analytics.surface) + "'" : "") +
      (analytics.step ? " data-analytics-step='" + safe(analytics.step) + "'" : "") +
      (analytics.message ? " data-analytics-message='" + safe(analytics.message) + "'" : "");
  }

  function buildJumpButton(label, tabName, mapId, isPrimary) {
    return "<button type='button'" + (isPrimary ? " class='cta'" : "") + " data-jump-tab='" + safe(tabName) + "'" +
      (mapId ? " data-map-id='" + safe(mapId) + "'" : "") + ">" + safe(label) + "</button>";
  }

  function buildTrackedJumpButton(label, tabName, mapId, isPrimary, analytics) {
    return "<button type='button'" + (isPrimary ? " class='cta'" : "") + " data-jump-tab='" + safe(tabName) + "'" +
      (mapId ? " data-map-id='" + safe(mapId) + "'" : "") + buildAnalyticsButtonAttrs(analytics) + ">" + safe(label) + "</button>";
  }

  function renderDecisionGrid(items, extraClass) {
    var cells = (items || []).filter(function (item) {
      return item && item.label && item.text;
    }).slice(0, 3).map(function (item) {
      return "<div class='decision-card'>" +
        "<span>" + safe(item.label) + "</span><strong>" + safe(item.text) + "</strong>" +
      "</div>";
    }).join("");

    if (!cells) {
      return "";
    }

    return "<div class='decision-grid" + (extraClass ? " " + extraClass : "") + "'>" + cells + "</div>";
  }

  function buildGuideFollowUpButton(nextStep, surfaceId, recommendMapId, bossMapId) {
    var mapId = "";
    var label;

    if (!nextStep) {
      if (surfaceId !== "home") {
        return buildJumpButton("回主城", "home", "", false);
      }
      return "";
    }

    if (nextStep.primaryTab === "adventure") {
      mapId = recommendMapId;
    } else if (nextStep.primaryTab === "boss") {
      mapId = bossMapId;
    }
    label = "做完后：" + nextStep.primaryLabel;
    return buildJumpButton(label, nextStep.primaryTab, mapId, false);
  }

  function renderGuideButtons(guideState, dailyFortune, todayDailyBoss, surfaceId) {
    var currentStep = getGuideStep(guideState && guideState.currentStepId);
    var nextStep = currentStep && currentStep.id !== "loop_repeat" ? getGuideNextStep(currentStep.id) : null;
    var buttons = [];
    var recommendMapId = dailyFortune && dailyFortune.recommendedMapId ? dailyFortune.recommendedMapId : activeMapId;
    var bossMapId = todayDailyBoss && todayDailyBoss.mapId ? todayDailyBoss.mapId : activeMapId;

    if (!currentStep) {
      return buildJumpButton("回主城", "home", "", false);
    }

    if (currentStep.id === "loop_repeat") {
      buttons.push(buildTrackedJumpButton("去榜单看差距", "leaderboard", "", true, {
        name: "guide_cta_clicked",
        category: "guide",
        funnelStep: "guide_cta",
        surface: surfaceId,
        step: "loop_repeat",
        message: "首轮动作链已完成，去榜单复盘"
      }));
      buttons.push(buildTrackedJumpButton("去今日 Boss", "boss", bossMapId, false, {
        name: "guide_cta_clicked",
        category: "guide",
        funnelStep: "guide_cta",
        surface: surfaceId,
        step: "loop_repeat",
        message: "首轮动作链已完成，继续打今日 Boss"
      }));
      return buttons.join("");
    }

    if (currentStep.primaryTab === "adventure") {
      buttons.push(buildTrackedJumpButton(currentStep.primaryLabel, currentStep.primaryTab, recommendMapId, true, {
        name: "guide_cta_clicked",
        category: "guide",
        funnelStep: "guide_cta",
        surface: surfaceId,
        step: currentStep.id,
        message: currentStep.label
      }));
    } else if (currentStep.primaryTab === "boss") {
      buttons.push(buildTrackedJumpButton(currentStep.primaryLabel, currentStep.primaryTab, bossMapId, true, {
        name: "guide_cta_clicked",
        category: "guide",
        funnelStep: "guide_cta",
        surface: surfaceId,
        step: currentStep.id,
        message: currentStep.label
      }));
    } else {
      buttons.push(buildTrackedJumpButton(currentStep.primaryLabel, currentStep.primaryTab, "", true, {
        name: "guide_cta_clicked",
        category: "guide",
        funnelStep: "guide_cta",
        surface: surfaceId,
        step: currentStep.id,
        message: currentStep.label
      }));
    }

    if (nextStep) {
      buttons.push(buildGuideFollowUpButton(nextStep, surfaceId, recommendMapId, bossMapId));
    } else {
      buttons.push(buildJumpButton("去榜单验收", "leaderboard", "", false));
    }
    return buttons.join("");
  }

  function getNextSignInRewardPreview(signInState) {
    var state = signInState || normalizeSignInState(null, todayKey());
    var rewardCount = SIGN_IN_REWARDS.length;
    var nextDayIndex = state && !state.canClaimToday ? state.currentDayIndex : normalizeNumber(state.currentDayIndex, 1) + 1;

    if (nextDayIndex > rewardCount) {
      nextDayIndex = 1;
    }
    return {
      day: nextDayIndex,
      entry: SIGN_IN_REWARDS[nextDayIndex - 1] || null
    };
  }

  function buildNextSignInPreviewText(signInState) {
    var preview = getNextSignInRewardPreview(signInState);

    if (!preview || !preview.entry) {
      return "明天回来继续拿签到奖励。";
    }
    return "Day " + preview.day + " · " + preview.entry.title + " · " + formatSignInReward(preview.entry);
  }

  function getGuideNextStep(stepId) {
    var currentIndex = -1;

    GUIDE_STEPS.some(function (step, index) {
      if (step.id === stepId) {
        currentIndex = index;
        return true;
      }
      return false;
    });

    if (currentIndex < 0 || currentIndex >= GUIDE_STEPS.length - 1) {
      return null;
    }

    return GUIDE_STEPS[currentIndex + 1];
  }

  function renderSurfaceLoopTile(surfaceId, guideState, todayDailyBoss) {
    var currentStep = getGuideStep(guideState && guideState.currentStepId);
    var copy;

    if (surfaceId === "gacha") {
      copy = {
        title: "抽卡不是终点",
        body: "抽到命器后立刻去 Gear 换上，并优先把主武器 / 核心抬到 +1~+3，才能把抽卡手感转成真实战力。",
        whenText: "登录奖励 / 签到 / 免费单抽收完后就来；先把免费抽用掉，再决定要不要补抽。",
        afterText: "抽到新件立刻去 Gear；如果今天还没开打，就别在这里停太久，继续去刷图或 Boss。"
      };
    } else if (surfaceId === "adventure") {
      copy = {
        title: "刷图负责补材料和追件",
        body: "换装或强化后再来刷图最顺：命宫试炼补底子，五行秘境补输出，流年劫关补 Boss 签名件。",
        whenText: "至少换上一件新命器，或把主武器 / 核心抬到 +1~+3 之后再来，收益最直观。",
        afterText: "打完一把后先看掉落，再去 Boss 验收，或回主城 / 榜单确认这轮 build 有没有真的涨。"
      };
    } else if (surfaceId === "gear") {
      copy = {
        title: "配装负责把抽卡变成排名",
        body: "先换装、再强化主武器 / 核心，然后按榜单卡上的“还差多少 / 先补什么 / 去哪刷”去补件，把提升兑现到总战力榜和同日主榜。",
        whenText: "抽到可穿戴命器、凑到 2 件 / 4 件套，或准备进 Boss 前，都先来这里。",
        afterText: "换装 / 强化完别停留，立刻去 Adventure 补材料，或去 Boss / 榜单验收提升。"
      };
    } else if (surfaceId === "boss") {
      copy = {
        title: "Boss 负责把 build 变成榜分",
        body: "先拿首通和榜分，再决定回 Gear / Adventure 补哪一段，让每次记分机会都更值。",
        whenText: "至少完成一轮换装 / 强化，或者今天只差首通时再来，记分机会会更值。",
        afterText: "打完后先领首通奖励，再回榜读差距；差一口气时回 Gear / Adventure 补最短短板。"
      };
    } else {
      copy = {
        title: "榜单决定你下一轮补什么",
        body: "先看差距，再回 Gear / Adventure / Boss 兑现提升，不把榜单停留在纯展示。",
        whenText: "Boss 打完、Gear 有变化、或者想确认今天到底还差什么时就回来。",
        afterText: "读完差距后马上去补最短那一段；这页不是终点，而是下一轮回主城 / 刷图 / Boss 的导航。"
      };
    }

    return [
      "<div class='tile loop-card is-featured' style='margin-top:10px'>",
      "<p class='eyebrow'>动作链提示</p>",
      "<h3>" + safe(copy.title) + "</h3>",
      "<p>" + safe(copy.body) + "</p>",
      "<p class='meta'>什么时候来：" + safe(copy.whenText) + "</p>",
      "<p class='meta'>做完后：" + safe(copy.afterText) + "</p>",
      (guideState ? "<p class='meta'>当前推荐：" + safe(currentStep ? currentStep.label : "回主城继续循环") + " · 进度 " + safe(guideState.progressText) + "</p>" : ""),
      (todayDailyBoss && surfaceId === "boss" ? "<p class='meta'>今日 Boss：" + safe(todayDailyBoss.boss.name) + "</p>" : ""),
      "</div>"
    ].join("");
  }

  function renderDailyTasks(dailyState) {
    return DAILY_TASKS.map(function (task) {
      return renderTaskItem(task, dailyState);
    }).join("");
  }

  function renderTaskItem(task, dailyState) {
    var progress = dailyState.progress[task.id] || 0;
    var done = progress >= task.target;
    var claimed = !!dailyState.claimed[task.id];
    var claimedAt = dailyState.claimTimes ? dailyState.claimTimes[task.id] : "";
    var classes = ["task-item"];
    var buttonText = "未完成";
    var buttonAttrs = " disabled";

    if (done) {
      classes.push("done");
    }
    if (done && !claimed) {
      classes.push("claimable");
      buttonText = "领取";
      buttonAttrs = " class='cta'";
    }
    if (claimed) {
      classes.push("claimed");
      buttonText = "已领取";
      buttonAttrs = " disabled";
    }

    return [
      "<div class='" + classes.join(" ") + "'>",
      "<div class='task-main'>",
      "<span>" + safe(task.label) + "</span>",
      "<p class='meta'>奖励: " + safe(formatReward(task.reward)) + (claimedAt ? " · 领取于 " + safe(formatTime(claimedAt)) : "") + "</p>",
      "</div>",
      "<div class='task-side'><strong>" + Math.min(progress, task.target) + "/" + task.target +
        "</strong><button type='button' data-claim-task='" + safe(task.id) + "'" + buttonAttrs + ">" + buttonText + "</button></div>",
      "</div>"
    ].join("");
  }

  function countClaimableTasks(dailyState) {
    return DAILY_TASKS.filter(function (task) {
      return (dailyState.progress[task.id] || 0) >= task.target && !dailyState.claimed[task.id];
    }).length;
  }

  function claimDailyTask(taskId) {
    if (!isBackendEnabled()) {
      claimDailyTaskLocal(taskId);
      return;
    }
    claimServerTask(taskId, {
      targetTab: "home",
      fallback: function () {
        claimDailyTaskLocal(taskId);
      }
    });
  }

  function claimDailyTaskLocal(taskId) {
    var task = findDailyTask(taskId);
    var daily = normalizeDailyState(readStorageJson(STORAGE_KEYS.dailyState), todayKey());
    var claimedAt = new Date().toISOString();

    if (!task || (daily.progress[task.id] || 0) < task.target || daily.claimed[task.id]) {
      return;
    }

    daily.claimed[task.id] = true;
    daily.claimTimes[task.id] = claimedAt;
    daily.claimedCount = DAILY_TASKS.filter(function (entry) {
      return !!daily.claimed[entry.id];
    }).length;
    writeStorageJson(STORAGE_KEYS.dailyState, daily);
    grantReward(task.reward, {
      context: "task",
      title: "每日任务已领取 · " + task.label,
      detail: "任务奖励入袋"
    });
    activeTab = "home";
    renderAll();
  }

  function claimDailyLoginReward() {
    if (!isBackendEnabled()) {
      claimDailyLoginRewardLocal();
      return;
    }
    requestJson("/claim/login-reward", {
      method: "POST",
      body: {
        profileSnapshot: readBridgeState().profileSnapshot
      }
    }).then(function (response) {
      handleServerClaimResponse(response, "login_reward", {
        targetTab: "home",
        reward: DAILY_LOGIN_REWARD,
        feedback: {
          context: "daily_login",
          title: "每日登录奖励已到账",
          detail: "主城登录补给"
        }
      }, buildDailyBoss(todayKey()));
    }).catch(function () {
      serverCache.available = false;
      claimDailyLoginRewardLocal();
    });
  }

  function claimDailyLoginRewardLocal() {
    var daily = normalizeDailyState(readStorageJson(STORAGE_KEYS.dailyState), todayKey());
    var claimedAt = new Date().toISOString();
    if (daily.specialClaims.loginReward) {
      return;
    }
    daily.specialClaims.loginReward = true;
    daily.specialClaimTimes.loginReward = claimedAt;
    writeStorageJson(STORAGE_KEYS.dailyState, daily);
    grantReward(DAILY_LOGIN_REWARD, {
      context: "daily_login",
      title: "每日登录奖励已到账",
      detail: "主城登录补给"
    });
    activeTab = "home";
    renderAll();
  }

  function claimDailyFreeDraw() {
    if (isBackendEnabled()) {
      runGacha(FREE_DAILY_DRAW.poolId, 1, {
        source: "daily_free",
        note: FREE_DAILY_DRAW.note,
        targetTab: "gacha",
        fallback: claimDailyFreeDrawLocal
      });
      return;
    }
    claimDailyFreeDrawLocal();
  }

  function claimDailyFreeDrawLocal() {
    var daily = normalizeDailyState(readStorageJson(STORAGE_KEYS.dailyState), todayKey());
    var claimedAt = new Date().toISOString();
    if (daily.specialClaims.freeDraw) {
      return;
    }
    daily.specialClaims.freeDraw = true;
    daily.specialClaimTimes.freeDraw = claimedAt;
    writeStorageJson(STORAGE_KEYS.dailyState, daily);
    runGachaLocal(FREE_DAILY_DRAW.poolId, 1, {
      source: "daily_free",
      note: FREE_DAILY_DRAW.note,
      targetTab: "gacha"
    });
  }

  function claimDailyBossFirstClearReward() {
    var dailyBoss = buildDailyBoss(todayKey());

    if (!isBackendEnabled()) {
      claimDailyBossFirstClearRewardLocal();
      return;
    }
    claimServerTask(SPECIAL_DAILY_TASK_ID, {
      targetTab: "boss",
      reward: DAILY_BOSS_FIRST_CLEAR_REWARD,
      feedback: {
        context: "daily_boss",
        title: (dailyBoss && dailyBoss.boss ? dailyBoss.boss.name : "今日 Boss") + " 首通奖励已到账",
        detail: "首通结算"
      },
      fallback: claimDailyBossFirstClearRewardLocal
    });
  }

  function claimDailyBossFirstClearRewardLocal() {
    var dailyBoss = buildDailyBoss(todayKey());
    var bridge = readBridgeState();
    var bossState = syncBossState(bridge, dailyBoss);
    var record = getBossRecordForDate(bossState, todayKey(), dailyBoss);
    var daily = normalizeDailyState(readStorageJson(STORAGE_KEYS.dailyState), todayKey());
    var claimedAt = new Date().toISOString();

    if (!record.firstClearAchieved || daily.specialClaims.dailyBossFirstClear) {
      return;
    }

    daily.specialClaims.dailyBossFirstClear = true;
    daily.specialClaimTimes.dailyBossFirstClear = claimedAt;
    writeStorageJson(STORAGE_KEYS.dailyState, daily);
    grantReward(DAILY_BOSS_FIRST_CLEAR_REWARD, {
      context: "daily_boss",
      title: (dailyBoss && dailyBoss.boss ? dailyBoss.boss.name : "今日 Boss") + " 首通奖励已到账",
      detail: "首通结算"
    });
    activeTab = "boss";
    renderAll();
  }

  function claimSignInReward() {
    if (!isBackendEnabled()) {
      claimSignInRewardLocal();
      return;
    }

    requestJson("/claim/sign-in", {
      method: "POST",
      body: {
        profileSnapshot: readBridgeState().profileSnapshot
      }
    }).then(function (response) {
      if (response && response.playerState) {
        applyServerPlayerState(response.playerState);
      }
      if (response && response.status === "claimed" && !response.playerState) {
        grantReward(response.reward || {}, response.feedback || {
          context: "sign_in",
          title: "签到奖励已到账",
          detail: "7 日签到"
        });
      }
      refreshServerSnapshot().catch(function () {
        return null;
      }).then(function () {
        activeTab = "home";
        renderAll();
      });
    }).catch(function () {
      serverCache.available = false;
      claimSignInRewardLocal();
    });
  }

  function claimSignInRewardLocal() {
    var today = todayKey();
    var state = readSignInState(today);
    var rewardConfig;
    var previousDate;

    if (!state.canClaimToday) {
      return;
    }

    rewardConfig = SIGN_IN_REWARDS[state.currentDayIndex - 1];
    if (!rewardConfig) {
      return;
    }

    previousDate = state.lastClaimDate;
    state.claimedDays[state.currentDayIndex] = true;
    state.cycleProgress = state.currentDayIndex;
    state.lastClaimDate = today;
    state.totalClaimed = normalizeNumber(state.totalClaimed, 0) + 1;
    state.streakCount = previousDate && diffDaysBetween(previousDate, today) === 1
      ? normalizeNumber(state.streakCount, 0) + 1
      : 1;
    if (state.currentDayIndex >= SIGN_IN_REWARDS.length) {
      state.completedCycles = normalizeNumber(state.completedCycles, 0) + 1;
    }
    state.canClaimToday = false;
    state.statusText = state.currentDayIndex >= SIGN_IN_REWARDS.length
      ? "本轮 7 天奖励已拿满，明天重置到 Day 1。"
      : "今日已签到，明天继续领取第 " + (state.currentDayIndex + 1) + " 天奖励。";
    writeStorageJson(STORAGE_KEYS.signInState, state);

    grantReward(rewardConfig.reward, {
      context: "sign_in",
      title: "第 " + state.currentDayIndex + " 天签到达成",
      detail: rewardConfig.title + (rewardConfig.rewardHint ? " · " + rewardConfig.rewardHint : "")
    });
    activeTab = "home";
    renderAll();
  }

  function findDailyTask(taskId) {
    var i;
    for (i = 0; i < DAILY_TASKS.length; i += 1) {
      if (DAILY_TASKS[i].id === taskId) {
        return DAILY_TASKS[i];
      }
    }
    return null;
  }

  function renderOfferCards(opsState, offerOrder) {
    var offers = Array.isArray(offerOrder) && offerOrder.length
      ? offerOrder.map(findOffer).filter(Boolean)
      : OPS_ENTRIES.slice().filter(function (offer) {
        return isOfferEnabled(offer.id);
      });
    var commerceState = readCommerceState(opsState, todayKey());

    return offers.map(function (offer) {
      var launchConfig = getOfferLaunchConfig(offer.id);
      var primaryAction = renderOfferPrimaryAction(offer, opsState, commerceState);
      var product = findProductByOfferId(offer.id);
      var entitlement = getCommerceEntitlement(commerceState, offer.id);
      var latestOrder = getLatestCommerceOrder(commerceState, offer.id);
      var extraButton = offer.jumpTab
        ? "<button type='button' data-jump-tab='" + safe(offer.jumpTab) + "'>" + safe(offer.jumpLabel || "前往") + "</button>"
        : "";
      return [
        "<div class='ops-card " + safe(getOfferCardClass(offer, opsState)) + "'>",
        "<p class='eyebrow'>" + safe(offer.tag) + "</p>",
        "<h4>" + safe(offer.name) + "</h4>",
        "<p>" + safe(offer.summary) + "</p>",
        (product ? "<p class='meta'>商品占位：" + safe(product.priceLabel) + " · " + safe(product.orderTemplate) + "</p>" : ""),
        (product ? "<p class='meta'>商品骨架：" + safe(formatCommerceProductMeta(product)) + "</p>" : ""),
        "<p class='meta'>价值：" + safe(getOfferValueSummary(offer.id)) + "</p>",
        "<p class='meta'>状态：" + safe(getOfferStatusText(offer, opsState)) + "</p>",
        "<p class='meta'>今天为什么看：" + safe(getOfferCareText(offer.id, opsState, commerceState)) + "</p>",
        "<p class='meta'>当前收益：" + safe(getCommerceEntitlementBenefitText(entitlement, offer.id)) + "</p>",
        "<p class='meta'>剩余价值：" + safe(getCommerceEntitlementValueText(entitlement, offer.id)) + "</p>",
        (entitlement ? "<p class='meta'>权益：" + safe(formatCommerceEntitlement(entitlement)) + "</p>" : ""),
        (product ? "<p class='meta'>解锁条件：" + safe(formatCommerceUnlockCondition(product)) + "</p>" : ""),
        "<p class='meta'>入口位：" + safe(getOfferPlacementLabel(offer)) + " · Campaign：" + safe(launchConfig.campaignId || "-") + " · Bucket：" + safe(launchConfig.rollout ? launchConfig.rollout.bucketKey : "-") + "</p>",
        "<p class='meta'>内容：" + safe((offer.items || []).join(" / ")) + "</p>",
        (latestOrder ? "<p class='meta'>最近订单：" + safe(formatCommerceOrder(latestOrder)) + "</p>" : ""),
        "<p class='meta'>订单链路：" + safe(formatCommerceOrderFlow(latestOrder, offer.id)) + "</p>",
        (latestOrder ? "<p class='meta'>阶段轨迹：" + safe(formatCommerceTimeline(latestOrder)) + "</p>" : ""),
        "<div class='button-row'>",
        primaryAction,
        "<button type='button' data-offer-id='" + safe(offer.id) + "'>查看说明</button>",
        extraButton,
        "</div>",
        "</div>"
      ].join("");
    }).join("");
  }

  function buildOfferSurface(opsState, bridge, dailyState, gachaState) {
    var scoreConfig = getLaunchPrepConfigValue("offers.spotlightScores", {});
    var commerceState = readCommerceState(opsState, todayKey());
    var orderedIds;
    var scored = [];
    var seen = {};

    pushOfferScore(scored, seen, "first_purchase", opsState.firstPurchase.status === "available" ? normalizeNumber(scoreConfig.firstPurchaseUnlocked, 120) : 0,
      "刚完成首战，首购位最适合承接第一次到账测试。", opsState);
    pushOfferScore(scored, seen, "monthly_card",
      opsState.monthlyCard.status === "active" && opsState.monthlyCard.lastClaimDate !== todayKey() ? normalizeNumber(scoreConfig.monthlyClaim, 112) : 0,
      "月卡已开通，今日福利还没领，适合在主城顶部提醒。", opsState);
    pushOfferScore(scored, seen, "monthly_card",
      opsState.monthlyCard.status !== "active" && (dailyState.completedCount >= 2 || dailyState.claimedCount >= 1) ? normalizeNumber(scoreConfig.monthlyUpsell, 98) : 0,
      "玩家已经形成日常动作，月卡位更适合露出长期留存价值。", opsState);
    pushOfferScore(scored, seen, "event_bundle",
      getCommerceEntitlement(commerceState, "event_bundle") && getCommerceEntitlement(commerceState, "event_bundle").status === "available"
        ? normalizeNumber(scoreConfig.eventBundleActive, 118)
        : 0,
      "活动进行中，活动礼包最适合承接 Boss 周期里的追榜与兑换缺口。", opsState);
    pushOfferScore(scored, seen, "boss_rush_bundle",
      getCommerceEntitlement(commerceState, "boss_rush_bundle") && getCommerceEntitlement(commerceState, "boss_rush_bundle").status === "available"
        ? normalizeNumber(scoreConfig.bossRushActive, 104)
        : 0,
      "已经打过 Boss，冲刺包现在最容易讲清“买完马上补什么”。", opsState);
    pushOfferScore(scored, seen, "combat_supply_bundle",
      (countTodayGacha(gachaState) > 0 || dailyState.completedCount > 0) ? normalizeNumber(scoreConfig.consumableSupplyReady, 84) : 0,
      "今天已经进入 build 循环，消耗型补给适合补抽卡 / 强化差的那一口。", opsState);
    pushOfferScore(scored, seen, "ten_draw_offer",
      (countTodayGacha(gachaState) > 0 || dailyState.specialClaims.freeDraw) ? normalizeNumber(scoreConfig.tenDrawActive, 88) : 0,
      "已经进入抽卡心流，十连位现在更顺手。", opsState);
    pushOfferScore(scored, seen, "ten_draw_offer",
      countTodayGacha(gachaState) === 0 && !dailyState.specialClaims.freeDraw ? normalizeNumber(scoreConfig.tenDrawWarm, 72) : 0,
      "先把免费福利用掉，再用十连特惠承接抽卡心智。", opsState);
    pushOfferScore(scored, seen, "first_purchase",
      opsState.firstPurchase.status === "locked" && !bridge.latestBattle ? normalizeNumber(scoreConfig.firstPurchaseLocked, 40) : 0,
      "先完成首战，再触发首购礼包露出。", opsState);

    if (!scored.length) {
      pushOfferScore(scored, seen, "monthly_card", normalizeNumber(scoreConfig.fallback, 60), "默认展示长期留存位。", opsState);
    }

    scored.sort(function (a, b) {
      return b.score - a.score;
    });

    orderedIds = scored.map(function (entry) {
      return entry.offer.id;
    });
    OPS_ENTRIES.slice().filter(function (offer) {
      return isOfferEnabled(offer.id);
    }).sort(function (left, right) {
      return normalizeNumber(getOfferLaunchConfig(right.id).sortWeight, 0) - normalizeNumber(getOfferLaunchConfig(left.id).sortWeight, 0);
    }).forEach(function (offer) {
      if (orderedIds.indexOf(offer.id) === -1) {
        orderedIds.push(offer.id);
      }
    });

    return {
      spotlight: scored[0] || null,
      order: orderedIds
    };
  }

  function pushOfferScore(scored, seen, offerId, score, reason, opsState) {
    var offer;
    var launchConfig = getOfferLaunchConfig(offerId);

    if (!score || seen[offerId] || launchConfig.enabled === false) {
      return;
    }
    score = normalizeNumber(score, 0) + normalizeNumber(launchConfig.recommendedWeight, 0);
    offer = findOffer(offerId);
    if (!offer) {
      return;
    }
    seen[offerId] = true;
    scored.push({
      offer: offer,
      score: score,
      reason: reason,
      statusText: getOfferStatusText(offer, opsState)
    });
  }

  function renderOfferSpotlightTile(surface, opsState) {
    var spotlight = surface && surface.spotlight ? surface.spotlight : null;
    var commerceState = readCommerceState(opsState, todayKey());
    var primaryAction;
    var jumpButton = "";

    if (!spotlight) {
      return "<div class='tile'><h3>今日运营推荐</h3><p class='muted'>暂无推荐入口。</p></div>";
    }

    primaryAction = renderOfferPrimaryAction(spotlight.offer, opsState, commerceState);
    if (spotlight.offer.jumpTab) {
      jumpButton = "<button type='button' data-jump-tab='" + safe(spotlight.offer.jumpTab) + "'>" +
        safe(spotlight.offer.jumpLabel || "前往") + "</button>";
    }

    return [
      "<div class='tile is-featured'>",
      "<h3>今日运营推荐</h3>",
      "<p><strong>" + safe(spotlight.offer.name) + "</strong> · " + safe(spotlight.offer.summary) + "</p>",
      "<p class='meta'>价值：" + safe(getOfferValueSummary(spotlight.offer.id)) + "</p>",
      "<p class='meta'>推荐原因：" + safe(spotlight.reason) + "</p>",
      "<p class='meta'>状态：" + safe(spotlight.statusText) + " | 权益：" + safe(formatCommerceEntitlement(getCommerceEntitlement(commerceState, spotlight.offer.id))) + "</p>",
      (findProductByOfferId(spotlight.offer.id) ? "<p class='meta'>商品骨架：" + safe(formatCommerceProductMeta(findProductByOfferId(spotlight.offer.id))) + "</p>" : ""),
      "<p class='meta'>今天为什么值：" + safe(getOfferCareText(spotlight.offer.id, opsState, commerceState)) + "</p>",
      "<p class='meta'>当前收益：" + safe(getCommerceEntitlementBenefitText(getCommerceEntitlement(commerceState, spotlight.offer.id), spotlight.offer.id)) + "</p>",
      "<p class='meta'>剩余价值：" + safe(getCommerceEntitlementValueText(getCommerceEntitlement(commerceState, spotlight.offer.id), spotlight.offer.id)) + "</p>",
      "<p class='meta'>订单链路：" + safe(formatCommerceOrderFlow(getLatestCommerceOrder(commerceState, spotlight.offer.id), spotlight.offer.id)) + "</p>",
      "<p class='meta'>露出位：" + safe(getOfferPlacementLabel(spotlight.offer)) + "</p>",
      "<div class='button-row'>",
      primaryAction,
      "<button type='button' data-offer-id='" + safe(spotlight.offer.id) + "'>查看说明</button>",
      jumpButton,
      "</div>",
      "</div>"
    ].join("");
  }

  function renderOfferPrimaryAction(offer, opsState, commerceState) {
    var product = findProductByOfferId(offer.id);
    var entitlement = getCommerceEntitlement(commerceState, offer.id);
    var latestOrder = getLatestCommerceOrder(commerceState, offer.id);
    var availability = product ? getLocalProductAvailability(product, opsState, todayKey()) : { available: false, reason: "当前仅保留说明入口" };

    if (latestOrder && latestOrder.status === "pending_payment") {
      if (isBackendEnabled()) {
        if (!latestOrder.checkoutSessionId || latestOrder.checkoutStatus === "pending_payment") {
          return "<button type='button' class='cta' data-offer-action='create-checkout-session' data-offer-id='" + safe(offer.id) + "'>创建 Checkout</button>";
        }
        return [
          ((latestOrder.checkoutStatus === "timed_out" || latestOrder.checkoutStatus === "exception")
            ? "<button type='button' data-offer-action='create-checkout-session' data-offer-id='" + safe(offer.id) + "'>重建 Checkout</button>"
            : ""),
          "<button type='button' class='cta' data-offer-action='simulate-payment-callback' data-offer-id='" + safe(offer.id) + "' data-order-action='pay_success'>成功回调</button>",
          "<button type='button' data-offer-action='simulate-payment-callback' data-offer-id='" + safe(offer.id) + "' data-order-action='pay_fail'>失败回调</button>",
          "<button type='button' data-offer-action='simulate-payment-callback' data-offer-id='" + safe(offer.id) + "' data-order-action='cancel'>取消回调</button>",
          "<button type='button' data-offer-action='simulate-payment-callback' data-offer-id='" + safe(offer.id) + "' data-order-action='timeout'>超时回调</button>",
          "<button type='button' data-offer-action='simulate-payment-callback' data-offer-id='" + safe(offer.id) + "' data-order-action='exception'>异常回调</button>"
        ].filter(Boolean).join("");
      }
      return [
        "<button type='button' class='cta' data-offer-action='simulate-commerce-order' data-offer-id='" + safe(offer.id) + "' data-order-action='pay_success'>模拟支付成功</button>",
        "<button type='button' data-offer-action='simulate-commerce-order' data-offer-id='" + safe(offer.id) + "' data-order-action='pay_fail'>模拟支付失败</button>",
        "<button type='button' data-offer-action='simulate-commerce-order' data-offer-id='" + safe(offer.id) + "' data-order-action='cancel'>取消订单</button>"
      ].join("");
    }

    if (offer.id === "first_purchase") {
      if (opsState.firstPurchase.status === "locked") {
        return "<button type='button' disabled>首战后解锁</button>";
      }
      if (opsState.firstPurchase.status === "converted") {
        return "<button type='button' disabled>已到账</button>";
      }
      return "<button type='button' class='cta' data-offer-action='create-commerce-order' data-offer-id='first_purchase'>创建首购订单</button>";
    }

    if (offer.id === "monthly_card") {
      if (opsState.monthlyCard.status === "active") {
        if (opsState.monthlyCard.lastClaimDate === todayKey()) {
          return "<button type='button' disabled>月卡今日已领</button>";
        }
        return "<button type='button' class='cta' data-offer-action='claim-monthly-card'>领取今日月卡</button>";
      }
      return "<button type='button' class='cta' data-offer-action='create-commerce-order' data-offer-id='monthly_card'>创建月卡订单</button>";
    }

    if (offer.id === "ten_draw_offer") {
      return "<button type='button' class='cta' data-jump-tab='gacha'>去抽卡</button>";
    }

    if (!product) {
      return "<button type='button' disabled>查看说明</button>";
    }
    if (!availability.available && product.purchaseType !== "consumable") {
      if (entitlement && (entitlement.status === "fulfilled" || entitlement.status === "active")) {
        return "<button type='button' disabled>权益已生效</button>";
      }
      return "<button type='button' disabled>" + safe(availability.reason || "暂不可购买") + "</button>";
    }
    if (latestOrder && (latestOrder.status === "failed" || latestOrder.status === "cancelled")) {
      return "<button type='button' class='cta' data-offer-action='create-commerce-order' data-offer-id='" + safe(offer.id) + "'>重新创建订单</button>";
    }
    if (product.purchaseType === "consumable") {
      return "<button type='button' class='cta' data-offer-action='create-commerce-order' data-offer-id='" + safe(offer.id) + "'>" +
        safe(entitlement && entitlement.grantCount > 0 ? "再次创建订单" : "创建补给订单") + "</button>";
    }
    return "<button type='button' class='cta' data-offer-action='create-commerce-order' data-offer-id='" + safe(offer.id) + "'>创建订单</button>";
  }

  function getOfferCardClass(offer, opsState) {
    if (offer.id === "first_purchase") {
      return opsState.firstPurchase.status === "available" ? "is-active" : "is-upcoming";
    }
    if (offer.id === "monthly_card") {
      return opsState.monthlyCard.status === "active" ? "is-active" : (opsState.monthlyCard.status === "expired" ? "is-expired" : "is-upcoming");
    }
    return "is-upcoming";
  }

  function bindOfferButtons(scope) {
    if (!scope) {
      return;
    }
    scope.querySelectorAll("button[data-offer-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openOfferModal(btn.getAttribute("data-offer-id"));
      });
    });
  }

  function bindOfferActionButtons(scope) {
    if (!scope) {
      return;
    }
    scope.querySelectorAll("button[data-offer-action]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = btn.getAttribute("data-offer-action");
        var offerId = btn.getAttribute("data-offer-id") || "";
        var orderAction = btn.getAttribute("data-order-action") || "";
        if (action === "activate-first-purchase") {
          activateFirstPurchase();
          return;
        }
        if (action === "activate-monthly-card") {
          activateMonthlyCard();
          return;
        }
        if (action === "create-commerce-order") {
          createCommerceOrderFlow(offerId);
          return;
        }
        if (action === "create-checkout-session") {
          createCheckoutSessionFlow(offerId);
          return;
        }
        if (action === "simulate-commerce-order") {
          simulateCommerceOrderFlow(offerId, orderAction);
          return;
        }
        if (action === "simulate-payment-callback") {
          simulatePaymentCallbackFlow(offerId, orderAction);
          return;
        }
        if (action === "claim-monthly-card") {
          claimMonthlyCardDailyReward();
        }
      });
    });
  }

  function createCommerceOrderFlow(offerId) {
    if (!offerId) {
      return;
    }
    if (isBackendEnabled()) {
      createCommerceOrderServer(offerId).catch(function () {
        serverCache.available = false;
        createCommerceOrderLocal(offerId);
      });
      return;
    }
    createCommerceOrderLocal(offerId);
  }

  function createCheckoutSessionFlow(offerId) {
    var opsState = readOpsState(readBridgeState(), todayKey());
    var commerceState = readCommerceState(opsState, todayKey());
    var order = getLatestCommerceOrder(commerceState, offerId);

    if (!order) {
      pushRewardFeedback({
        context: "commerce",
        title: "请先创建订单",
        summary: offerId || "商品",
        detail: "当前还没有待支付订单，无法创建 checkout session。"
      });
      activeTab = "home";
      renderAll();
      return;
    }
    if (isBackendEnabled()) {
      createCheckoutSessionServer(order.orderId).catch(function () {
        serverCache.available = false;
        pushRewardFeedback({
          context: "commerce",
          title: "Checkout 需要后端模式",
          summary: offerId || "商品",
          detail: "请使用 npm start 后再验证支付承接链路。"
        });
        activeTab = "home";
        renderAll();
      });
      return;
    }
    pushRewardFeedback({
      context: "commerce",
      title: "静态模式不创建 checkout session",
      summary: offerId || "商品",
      detail: "支付 callback 骨架仅在后端模式生效。"
    });
    activeTab = "home";
    renderAll();
  }

  function simulateCommerceOrderFlow(offerId, action) {
    var opsState = readOpsState(readBridgeState(), todayKey());
    var commerceState = readCommerceState(opsState, todayKey());
    var order = getLatestCommerceOrder(commerceState, offerId);

    if (!order) {
      pushRewardFeedback({
        context: "commerce",
        title: "暂无可模拟订单",
        summary: offerId || "商品",
        detail: "请先创建订单，再模拟支付成功 / 失败 / 取消。"
      });
      activeTab = "home";
      renderAll();
      return;
    }
    if (isBackendEnabled()) {
      simulateCommerceOrderServer(order.orderId, action).catch(function () {
        serverCache.available = false;
        simulateLocalCommerceOrder(order.orderId, action);
        activeTab = "home";
        renderAll();
      });
      return;
    }
    simulateLocalCommerceOrder(order.orderId, action);
    activeTab = "home";
    renderAll();
  }

  function simulatePaymentCallbackFlow(offerId, action) {
    var opsState = readOpsState(readBridgeState(), todayKey());
    var commerceState = readCommerceState(opsState, todayKey());
    var order = getLatestCommerceOrder(commerceState, offerId);

    if (!order) {
      pushRewardFeedback({
        context: "commerce",
        title: "暂无 callback 目标订单",
        summary: offerId || "商品",
        detail: "请先创建订单并创建 checkout session。"
      });
      activeTab = "home";
      renderAll();
      return;
    }
    if (isBackendEnabled()) {
      simulatePaymentCallbackServer(order, action).catch(function () {
        serverCache.available = false;
        pushRewardFeedback({
          context: "commerce",
          title: "支付 callback 需要后端模式",
          summary: offerId || "商品",
          detail: "请使用 npm start 后再验证回调链路。"
        });
        activeTab = "home";
        renderAll();
      });
      return;
    }
    if (action === "pay_success" || action === "pay_fail" || action === "cancel") {
      simulateLocalCommerceOrder(order.orderId, action);
    } else {
      pushRewardFeedback({
        context: "commerce",
        title: action === "timeout" ? "支付超时占位" : "支付异常占位",
        summary: offerId || "商品",
        detail: "超时 / 异常 callback 仅在后端支付承接层模拟。"
      });
    }
    activeTab = "home";
    renderAll();
  }

  function createCommerceOrderLocal(offerId) {
    createLocalCommerceOrder(offerId);
    activeTab = "home";
    renderAll();
  }

  function activateFirstPurchase() {
    createCommerceOrderFlow("first_purchase");
  }

  function activateFirstPurchaseServer() {
    createCommerceOrderFlow("first_purchase");
  }

  function activateFirstPurchaseLocal() {
    createCommerceOrderFlow("first_purchase");
  }

  function activateMonthlyCard() {
    createCommerceOrderFlow("monthly_card");
  }

  function activateMonthlyCardServer() {
    createCommerceOrderFlow("monthly_card");
  }

  function activateMonthlyCardLocal() {
    createCommerceOrderFlow("monthly_card");
  }

  function claimMonthlyCardDailyReward() {
    if (isBackendEnabled()) {
      claimMonthlyCardDailyRewardServer();
      return;
    }
    claimMonthlyCardDailyRewardLocal();
  }

  function claimMonthlyCardDailyRewardServer() {
    requestJson("/ops/monthly-card/claim", {
      method: "POST",
      body: buildOpsRequestBody()
    }).then(function (response) {
      if (response && response.playerState) {
        applyServerPlayerState(response.playerState);
      }
      refreshServerSnapshot().catch(function () {
        return null;
      }).then(function () {
        activeTab = "home";
        renderAll();
      });
    }).catch(function () {
      serverCache.available = false;
      claimMonthlyCardDailyRewardLocal();
    });
  }

  function claimMonthlyCardDailyRewardLocal() {
    var today = todayKey();
    var offer = findOffer("monthly_card");
    var opsState = readOpsState(readBridgeState(), today);

    if (opsState.monthlyCard.status !== "active" || opsState.monthlyCard.lastClaimDate === today) {
      return;
    }

    opsState.monthlyCard.lastClaimDate = today;
    writeStorageJson(STORAGE_KEYS.opsState, opsState);
    grantReward(offer.dailyReward || {}, {
      context: "monthly_card",
      title: "月卡日常奖励已领取",
      detail: "剩余 " + getMonthlyCardRemainingDays(opsState.monthlyCard) + " 天"
    });
    activeTab = "home";
    renderAll();
  }

  function buildOpsRequestBody() {
    return {
      latestBattle: readBridgeState().latestBattle,
      profileSnapshot: readBridgeState().profileSnapshot,
      dailyBoss: buildDailyBossPayload(buildDailyBoss(todayKey()))
    };
  }

  function handleCommerceServerResponse(response) {
    if (response && response.feedback) {
      pushRewardFeedback(response.feedback);
    }
    if (response && response.playerState) {
      applyServerPlayerState(response.playerState);
    }
    return refreshServerSnapshot().catch(function () {
      return null;
    }).then(function () {
      activeTab = "home";
      renderAll();
      return response && response.order ? response.order : null;
    });
  }

  function createCommerceOrderServer(offerId) {
    return requestJson("/commerce/orders/create", {
      method: "POST",
      body: Object.assign(buildOpsRequestBody(), {
        offerId: offerId
      })
    }).then(handleCommerceServerResponse);
  }

  function createCheckoutSessionServer(orderId) {
    return requestJson("/commerce/checkout/session", {
      method: "POST",
      body: Object.assign(buildOpsRequestBody(), {
        orderId: orderId
      })
    }).then(handleCommerceServerResponse);
  }

  function simulateCommerceOrderServer(orderId, action) {
    return requestJson("/commerce/orders/simulate", {
      method: "POST",
      body: Object.assign(buildOpsRequestBody(), {
        orderId: orderId,
        action: action
      })
    }).then(handleCommerceServerResponse);
  }

  function simulatePaymentCallbackServer(order, action) {
    return requestJson("/commerce/payment/callback", {
      method: "POST",
      body: Object.assign(buildOpsRequestBody(), {
        orderId: order.orderId,
        action: action,
        providerId: order.paymentProvider || getLaunchPrepConfigValue("payment.defaultProviderId", "mockpay_web"),
        providerSessionId: order.providerSessionId || "",
        externalTransactionId: order.externalTransactionId || "",
        simulated: true,
        summary: "phase2 callback smoke"
      })
    }).then(handleCommerceServerResponse);
  }

  function renderEventCards(dateValue, activityState, todayDailyBoss, bossState) {
    return EVENT_CONFIGS.filter(function (eventConfig) {
      return isEventEnabled(eventConfig.id);
    }).sort(function (left, right) {
      return normalizeNumber(getEventLaunchConfig(right.id).sortWeight, 0) - normalizeNumber(getEventLaunchConfig(left.id).sortWeight, 0);
    }).map(function (eventConfig) {
      var status = getEventStatus(eventConfig, dateValue);
      var statusText = getEventStatusText(eventConfig, status);
      var redeemMeta = buildEventRedeemMeta(eventConfig, status, activityState, dateValue, todayDailyBoss, bossState);
      var valueText = eventConfig.redeem ? formatReward(eventConfig.redeem.reward || {}) : (eventConfig.rewardFocus || "活动奖励");
      var eventLaunchConfig = getEventLaunchConfig(eventConfig.id);
      return [
        "<div class='ops-card " + safe(status.className) + "'>",
        "<p class='eyebrow'>活动</p>",
        "<h4>" + safe(eventConfig.title) + "</h4>",
        "<p>" + safe(eventConfig.summary) + "</p>",
        "<p class='meta'>状态：" + safe(statusText) + "</p>",
        "<p class='meta'>露出位：" + safe(getEventPlacementLabel(eventConfig)) + " · Campaign：" + safe(eventLaunchConfig.campaignId || "-") + "</p>",
        "<p class='meta'>奖励倾向：" + safe(eventConfig.rewardFocus) + "</p>",
        "<p class='meta'>今天为什么做：" + safe(eventConfig.todayReason || eventConfig.rewardFocus || "今天别断活动进度") + "</p>",
        "<p class='meta'>本期价值：" + safe(valueText) + "</p>",
        redeemMeta.body,
        "<div class='button-row'>",
        redeemMeta.button,
        "<button type='button' data-jump-tab='" + safe(eventConfig.ctaTab) +
          "' data-map-id='" + safe(eventConfig.mapId || "") + "'" + (status.code === "ended" ? " disabled" : "") + ">" +
          safe(eventConfig.ctaLabel || "查看") + "</button>",
        "</div>",
        "</div>"
      ].join("");
    }).join("");
  }

  function buildEventRedeemMeta(eventConfig, status, activityState, dateValue, todayDailyBoss, bossState) {
    var redeem = eventConfig.redeem;
    var state = getActivityEventState(activityState, eventConfig.id);
    var todayRecord = getBossRecordForDate(bossState, dateValue, todayDailyBoss);
    var tokenText = "";
    var progressText = "";
    var button = "<button type='button' disabled>待接兑换</button>";

    if (!redeem) {
      return {
        body: "<div class='event-redeem'><p class='meta'>当前仅展示活动入口骨架。</p></div>",
        button: button
      };
    }

    tokenText = redeem.tokenLabel + " x" + normalizeNumber(state.tokenCount, 0);
    if (state.claimed && redeem.oncePerEvent) {
      progressText = redeem.title + " 已兑换" + (state.claimedAt ? " · " + formatTime(state.claimedAt) : "");
      button = "<button type='button' disabled>本期已兑换</button>";
    } else if (status.code !== "active") {
      progressText = redeem.note || "活动未开启";
      button = "<button type='button' disabled>" + (status.code === "upcoming" ? "活动未开启" : "活动已结束") + "</button>";
    } else if (redeem.trigger === "daily_boss_first_clear") {
      progressText = redeem.progressLabel + "：" + (todayRecord.firstClearAchieved ? "已达成" : "0/1");
      if (normalizeNumber(state.tokenCount, 0) >= normalizeNumber(redeem.cost, 1)) {
        button = "<button type='button' class='cta' data-event-claim='" + safe(eventConfig.id) + "'>兑换活动奖励</button>";
      } else {
        button = "<button type='button' disabled>首通后可兑</button>";
      }
    } else {
      progressText = redeem.note || "后续接活动任务";
      button = "<button type='button' disabled>兑换位预留</button>";
    }

    return {
      body: [
        "<div class='event-redeem'>",
        "<p class='meta'>兑换奖励：" + safe(formatReward(redeem.reward || {})) + "</p>",
        "<p class='meta'>活动币：" + safe(tokenText) + "</p>",
        "<p class='meta'>进度：" + safe(progressText) + "</p>",
        "</div>"
      ].join(""),
      button: button
    };
  }

  function claimEventReward(eventId) {
    if (!isBackendEnabled()) {
      claimEventRewardLocal(eventId);
      return;
    }

    requestJson("/activity/redeem", {
      method: "POST",
      body: {
        eventId: eventId,
        latestBattle: readBridgeState().latestBattle,
        profileSnapshot: readBridgeState().profileSnapshot,
        dailyBoss: buildDailyBossPayload(buildDailyBoss(todayKey()))
      }
    }).then(function (response) {
      if (response && response.playerState) {
        applyServerPlayerState(response.playerState);
      }
      if (response && response.status === "claimed" && !response.playerState) {
        grantReward(response.reward || {}, response.feedback || {
          context: "event",
          title: "活动奖励已兑换",
          detail: eventId
        });
      }
      refreshServerSnapshot().catch(function () {
        return null;
      }).then(function () {
        activeTab = "home";
        renderAll();
      });
    }).catch(function () {
      serverCache.available = false;
      claimEventRewardLocal(eventId);
    });
  }

  function claimEventRewardLocal(eventId) {
    var today = todayKey();
    var eventConfig = findEventConfig(eventId);
    var dailyBoss = buildDailyBoss(today);
    var bossState = syncBossState(readBridgeState(), dailyBoss);
    var activityState = readActivityState(today, dailyBoss, bossState);
    var eventState;
    var cost;

    if (!eventConfig || !eventConfig.redeem || getEventStatus(eventConfig, today).code !== "active") {
      return;
    }

    eventState = getActivityEventState(activityState, eventId);
    cost = normalizeNumber(eventConfig.redeem.cost, 1);
    if ((eventConfig.redeem.oncePerEvent && eventState.claimed) || normalizeNumber(eventState.tokenCount, 0) < cost) {
      return;
    }

    eventState.tokenCount = Math.max(0, normalizeNumber(eventState.tokenCount, 0) - cost);
    eventState.claimed = !!eventConfig.redeem.oncePerEvent;
    eventState.claimedAt = new Date().toISOString();
    eventState.redemptionCount = normalizeNumber(eventState.redemptionCount, 0) + 1;
    activityState.events[eventId] = eventState;
    writeStorageJson(STORAGE_KEYS.activityState, activityState);

    grantReward(eventConfig.redeem.reward || {}, {
      context: "event",
      title: eventConfig.redeem.title + " 已兑换",
      detail: eventConfig.title
    });
    activeTab = "home";
    renderAll();
  }

  function getEventStatus(eventConfig, dateValue) {
    var start = normalizeDateKey(eventConfig.activeFrom);
    var end = normalizeDateKey(eventConfig.activeTo);
    if (start && dateValue < start) {
      return { code: "upcoming", className: "is-upcoming" };
    }
    if (end && dateValue > end) {
      return { code: "ended", className: "is-expired" };
    }
    return { code: "active", className: "is-active" };
  }

  function getEventStatusText(eventConfig, status) {
    if (status.code === "upcoming") {
      return "即将开启 · " + formatDateLabel(eventConfig.activeFrom) + " - " + formatDateLabel(eventConfig.activeTo);
    }
    if (status.code === "ended") {
      return "已结束 · " + formatDateLabel(eventConfig.activeFrom) + " - " + formatDateLabel(eventConfig.activeTo);
    }
    return "进行中 · " + formatDateLabel(eventConfig.activeFrom) + " - " + formatDateLabel(eventConfig.activeTo);
  }

  function renderGacha(gachaState, wallet, dailyState, opsState, rewardState, guideState, todayDailyBoss) {
    var latest = gachaState.lastResult;
    var history = gachaState.history.slice(-8).reverse();
    var inventoryCount = gachaState.inventory.length;
    var gearInventoryCount = getGearInventoryItems(gachaState).length;
    var freeDrawClaimed = !!dailyState.specialClaims.freeDraw;
    var costsApply = isBackendEnabled();
    var pityRows = renderGachaPityRows(gachaState);
    var revealMoment = getRecentTabMoment("gacha", 12000);
    var latestDirectEquipButton = renderLatestEquipButton(revealMoment && revealMoment.equipTarget ? revealMoment.equipTarget : latest);
    var currentStep = getGuideStep(guideState && guideState.currentStepId);
    var preferSinglePrimary = !freeDrawClaimed || (currentStep && (currentStep.id === "free_draw" || currentStep.id === "first_equip"));

    var poolCards = GACHA_POOLS.map(function (pool) {
      var singleDisabled = costsApply && wallet.drawTickets < 1 ? " disabled" : "";
      var tenDisabled = costsApply && wallet.drawTickets < 10 ? " disabled" : "";
      var singleClass = pool.id === "artifact" && preferSinglePrimary ? " class='cta'" : "";
      var tenClass = pool.id === "artifact" && preferSinglePrimary ? "" : " class='cta'";
      var pity = normalizePoolPityState(gachaState && gachaState.pity ? gachaState.pity[pool.id] : null, pool);
      var poolHint = pool.chaseHint || (pool.id === "artifact"
        ? "命器会落到五行套装路线，Gear 页可追 2 件 / 4 件套。"
        : "当前保留最小长期追求：SSR 保底进度随抽卡累积。");
      return "<div class='tile'>" +
        "<h3>" + safe(pool.name) + "</h3>" +
        "<p>" + safe(pool.description) + "</p>" +
        "<p class='meta'>概率: R " + toPercent(pool.rarityWeights.R) + " / SR " + toPercent(pool.rarityWeights.SR) +
        " / SSR " + toPercent(pool.rarityWeights.SSR) + " / UR " + toPercent(pool.rarityWeights.UR) + "</p>" +
        "<p class='meta'>SSR 保底：已累计 " + pity.sinceLastSsr + "/" + pity.ssrThreshold + "，距下次还差 " + pity.remaining + " 抽</p>" +
        "<p class='meta'>" + safe(poolHint) + "</p>" +
        "<div class='button-row'>" +
        "<button type='button'" + singleClass + " data-gacha-pool='" + pool.id + "' data-gacha-count='1'" + singleDisabled + ">" +
          (pool.id === "artifact" && preferSinglePrimary ? "先单抽" : "单抽") + "</button>" +
        "<button type='button'" + tenClass + " data-gacha-pool='" + pool.id + "' data-gacha-count='10'" + tenDisabled + ">十连</button>" +
        "</div>" +
      "</div>";
    }).join("");

    el.gacha.innerHTML = [
      "<h2 class='section-title'>Gacha / 抽卡页</h2>",
      "<p class='muted'>先把免费抽拿掉，再决定要不要补抽。当前抽卡券：" + wallet.drawTickets + (costsApply ? "（后端模式会消耗）" : "（静态模式为本地占位）") + "。</p>",
      renderRewardSpotlight(rewardState, ["gacha", "free_draw"], "抽卡回响"),
      renderSurfaceLoopTile("gacha", guideState, todayDailyBoss),
      "<div class='grid cols-2' style='margin-top:10px'>",
      "<div class='tile is-featured'><h3>先处理今天这发</h3><p>第一次来这里别纠结：先把命器池免费单抽用掉，再看有没有新件能直接去 Gear 换上。</p><p class='meta'>状态：" +
        (freeDrawClaimed ? "今日免费抽已用" : "今日免费抽待领取") + "</p><div class='button-row'><button type='button' id='btn-gacha-free-draw'" +
        (freeDrawClaimed ? " disabled" : " class='cta'") + ">" + (freeDrawClaimed ? "今日已领" : "领取免费单抽") +
        "</button><button type='button' data-jump-tab='gear'>抽完去 Gear</button></div></div>",
      renderGachaRevealCard(latest, revealMoment, inventoryCount, gearInventoryCount, latestDirectEquipButton),
      "</div>",
      "<div class='grid cols-2' style='margin-top:10px'>" + poolCards + "</div>",
      "<div class='tile' style='margin-top:10px'><h3>保底追求</h3><p>当前只做一条最小长期追求：每个卡池独立累计 SSR 保底，抽到 SSR/UR 后重置。</p><p class='meta'>" + safe(pityRows) + "</p></div>",
      renderGachaOfferTile(opsState, dailyState, gachaState),
      "<div class='tile' style='margin-top:10px'><h3>十连入口骨架</h3><p>十连仍保留，但这轮试玩先观察：玩家会不会先把免费抽和换装跑完，再决定要不要追卡。</p>" +
        "<div class='button-row'><button type='button' data-offer-id='ten_draw_offer'>查看十连说明</button><button type='button' data-jump-tab='home'>回主城</button></div></div>",
      "<div class='tile' style='margin-top:10px'><h3>最近抽卡记录</h3><div class='list'>" + renderGachaHistory(history) + "</div></div>"
    ].join("");

    el.gacha.querySelectorAll("button[data-gacha-pool]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var poolId = btn.getAttribute("data-gacha-pool");
        var drawCount = parseInt(btn.getAttribute("data-gacha-count"), 10);
        runGacha(poolId, drawCount, { targetTab: "gacha" });
      });
    });

    var gachaFreeDrawBtn = document.getElementById("btn-gacha-free-draw");
    if (gachaFreeDrawBtn) {
      gachaFreeDrawBtn.addEventListener("click", function () {
        claimDailyFreeDraw();
      });
    }

    el.gacha.querySelectorAll("button[data-equip-item]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        equipInventoryItem(btn.getAttribute("data-equip-item"), "gear");
      });
    });

    bindOfferButtons(el.gacha);
    bindOfferActionButtons(el.gacha);
    bindScopedTabJumps(el.gacha);
  }

  function renderGachaRevealCard(latest, revealMoment, inventoryCount, gearInventoryCount, latestDirectEquipButton) {
    var focus = revealMoment && revealMoment.highest ? revealMoment.highest : latest;
    var rarity = revealMoment && revealMoment.rarity ? revealMoment.rarity : (focus && focus.rarity ? focus.rarity : "R");
    var title = focus ? ("[" + focus.rarity + "] " + focus.name) : "暂无结果，先抽一发";
    var subtitle = revealMoment && revealMoment.subtitle
      ? revealMoment.subtitle
      : (focus && focus.poolName ? focus.poolName : "命器 / 神通会在这里做更强强调");
    var detailText = revealMoment && revealMoment.detail
      ? revealMoment.detail
      : formatGachaResultMeta(focus);

    return [
      "<div class='tile is-featured surface-hero gacha-reveal-card " + safeClassName(getRarityToneClass(rarity)) + (revealMoment && revealMoment.isLive ? " is-live" : "") + "'>",
      "<p class='eyebrow'>抽卡揭示</p>",
      "<div class='gacha-reveal-shell'>",
      "<div class='gacha-reveal-core'><span class='gacha-reveal-rarity'>" + safe(rarity) + "</span><h3>" + safe(title) + "</h3><p>" + safe(subtitle) + "</p></div>",
      "<div class='gacha-reveal-copy'>",
      renderMomentPills([
        { label: revealMoment && revealMoment.isLive ? "Reveal" : "最近掉落", tone: revealMoment && revealMoment.isLive ? "is-live" : "is-preview" },
        { label: rarity + " 稀有度", tone: getRarityToneClass(rarity) },
        revealMoment && revealMoment.count > 1 ? { label: "共 " + revealMoment.count + " 发", tone: "is-rare" } : null,
        focus && isEquipableInventoryItem(focus) ? { label: (SLOT_LABELS[focus.slot] || focus.slot) + " 可换装", tone: "is-recommended" } : null
      ], "is-compact"),
      "<p class='meta'>" + safe(detailText) + "</p>",
      "<p class='meta'>仓库总数: " + inventoryCount + " · 可穿戴命器: " + gearInventoryCount + " · 抽到可穿戴件就立刻去 Gear。</p>",
      "<div class='button-row'>" + latestDirectEquipButton + "<button type='button' data-jump-tab='gear'>去配装</button></div>",
      "</div>",
      "</div>",
      "</div>"
    ].join("");
  }

  function renderGachaOfferTile(opsState, dailyState, gachaState) {
    var surface = buildOfferSurface(opsState, readBridgeState(), dailyState, gachaState);
    var spotlight = surface.spotlight;
    var primaryAction;
    var jumpButton = "";

    if (!spotlight) {
      return "";
    }
    primaryAction = renderOfferPrimaryAction(spotlight.offer, opsState);
    if (spotlight.offer.jumpTab && spotlight.offer.jumpTab !== "gacha") {
      jumpButton = "<button type='button' data-jump-tab='" + safe(spotlight.offer.jumpTab) + "'>" +
        safe(spotlight.offer.jumpLabel || "前往") + "</button>";
    }

    return [
      "<div class='tile is-featured' style='margin-top:10px'>",
      "<h3>抽卡页推荐露出</h3>",
      "<p><strong>" + safe(spotlight.offer.name) + "</strong> · " + safe(spotlight.reason) + "</p>",
      "<p class='meta'>状态：" + safe(spotlight.statusText) + "</p>",
      "<div class='button-row'>",
      primaryAction,
      "<button type='button' data-offer-id='" + safe(spotlight.offer.id) + "'>查看说明</button>",
      jumpButton,
      "</div>",
      "</div>"
    ].join("");
  }

  function renderGachaHistory(history) {
    if (history.length === 0) {
      return "<span class='muted'>暂无历史</span>";
    }
    return history.map(function (entry) {
      var noteText = entry.note ? " · " + entry.note : "";
      var metaText = formatGachaResultMeta(entry);
      var gearText = isEquipableInventoryItem(entry)
        ? " · " + safe(SLOT_LABELS[entry.slot] || entry.slot) + " · GS " + entry.gearScore + (entry.enhancementLevel ? " · +" + entry.enhancementLevel : "")
        : "";
      return "<div class='item'><strong>[" + safe(entry.rarity) + "] " + safe(entry.name) + "</strong> · " +
        safe(entry.poolName) + gearText + noteText + (metaText ? " · " + safe(metaText) : "") + " · <span class='meta'>" + safe(formatTime(entry.timestamp)) + "</span></div>";
    }).join("");
  }

  function runGacha(poolId, drawCount, options) {
    options = options || {};
    if (!isBackendEnabled()) {
      if (typeof options.fallback === "function") {
        options.fallback();
        return;
      }
      runGachaLocal(poolId, drawCount, options);
      return;
    }
    runGachaServer(poolId, drawCount, options);
  }

  function runGachaServer(poolId, drawCount, options) {
    var pool = findPool(poolId);
    var bridge = readBridgeState();
    var todayDailyBoss = buildDailyBoss(todayKey());

    if (!pool) {
      return;
    }

    requestJson("/gacha/draw", {
      method: "POST",
      body: {
        poolId: poolId,
        drawCount: drawCount,
        source: options.source || "normal",
        note: options.note || "",
        latestBattle: bridge.latestBattle,
        profileSnapshot: bridge.profileSnapshot,
        dailyBoss: buildDailyBossPayload(todayDailyBoss)
      }
    }).then(function (response) {
      if (response && response.playerState) {
        applyServerPlayerState(response.playerState);
      }
      if (response && response.status === "drawn") {
        queueGachaRevealMoment(response.results || [], pool, options);
      }
      if (response && response.status === "drawn" && !response.playerState) {
        pushRewardFeedback(response.feedback || buildGachaFeedback(response.results || [], pool, options));
      }
      refreshServerSnapshot().catch(function () {
        return null;
      }).then(function () {
        activeTab = options.targetTab || "gacha";
        renderAll();
      });
    }).catch(function () {
      serverCache.available = false;
      if (typeof options.fallback === "function") {
        options.fallback();
        return;
      }
      runGachaLocal(poolId, drawCount, options);
    });
  }

  function runGachaLocal(poolId, drawCount, options) {
    options = options || {};
    var pool = findPool(poolId);
    var results = [];
    var gachaState = readGachaState();
    var pity;
    if (!pool) {
      return;
    }
    pity = normalizePoolPityState(gachaState.pity[poolId], pool);
    var chaseProfile = getLoopProfile(readBridgeState());
    var chaseEquipmentState = readEquipmentState();
    var i;
    for (i = 0; i < drawCount; i += 1) {
      var guaranteeSsr = pity.sinceLastSsr >= pity.ssrThreshold - 1;
      var rarity = guaranteeSsr ? pickGuaranteedRarity(pool.rarityWeights, "SSR") : pickRarity(pool.rarityWeights);
      var candidates = pool.entries.filter(function (entry) {
        return entry.rarity === rarity;
      });
      if (candidates.length === 0) {
        candidates = pool.entries;
      }
      var picked = clone(pickByWeight(candidates.map(function (entry) {
        return [entry, buildGachaEntryWeight(pool, entry, chaseProfile, chaseEquipmentState, gachaState)];
      })) || candidates[0]);
      var timestamp = new Date().toISOString();
      var setMeta = picked.element ? resolveSetDefinition(picked.element) : null;
      if (isHighRarity(rarity)) {
        pity.sinceLastSsr = 0;
        pity.lastHighRarityAt = timestamp;
        if (guaranteeSsr) {
          pity.lastPityTriggeredAt = timestamp;
        }
      } else {
        pity.sinceLastSsr += 1;
      }
      pity.lastDrawAt = timestamp;
      pity.remaining = Math.max(0, pity.ssrThreshold - pity.sinceLastSsr);
      var result = normalizeGachaEntry({
        poolId: pool.id,
        poolName: pool.name,
        type: picked.type,
        name: picked.name,
        rarity: picked.rarity,
        element: picked.element || "",
        slot: picked.slot || "",
        gearScore: normalizeNumber(picked.gearScore, 0),
        stats: clone(picked.stats || {}),
        enhancementLevel: 0,
        itemKey: buildGachaItemKey(pool.id, picked, timestamp, i),
        setId: setMeta ? setMeta.id : "",
        setName: setMeta ? setMeta.name : "",
        setFocus: setMeta ? setMeta.focus : "",
        source: options.source || "normal",
        note: options.note || "",
        pityTriggered: guaranteeSsr,
        pityState: {
          sinceLastSsr: pity.sinceLastSsr,
          ssrThreshold: pity.ssrThreshold,
          remaining: pity.remaining
        },
        timestamp: timestamp
      });
      gachaState.history.push(result);
      gachaState.inventory.push(result);
      gachaState.lastResult = result;
      results.push(result);
    }
    gachaState.pity[poolId] = pity;
    writeStorageJson(STORAGE_KEYS.gachaState, gachaState);
    pushRewardFeedback(buildGachaFeedback(results, pool, options));
    queueGachaRevealMoment(results, pool, options);
    activeTab = options.targetTab || "gacha";
    renderAll();
  }

  function findPool(poolId) {
    var i;
    for (i = 0; i < GACHA_POOLS.length; i += 1) {
      if (GACHA_POOLS[i].id === poolId) {
        return GACHA_POOLS[i];
      }
    }
    return null;
  }

  function pickRarity(weights) {
    var entries = Object.keys(weights).map(function (key) {
      return [key, weights[key]];
    });
    return pickByWeight(entries);
  }

  function pickGuaranteedRarity(weights, minimumRarity) {
    var minimumRank = getRarityRank(minimumRarity);
    var entries = Object.keys(weights).filter(function (key) {
      return getRarityRank(key) >= minimumRank;
    }).map(function (key) {
      return [key, weights[key]];
    });
    return pickByWeight(entries.length ? entries : [[minimumRarity, 1]]);
  }

  function pickByWeight(entries) {
    var total = entries.reduce(function (sum, entry) {
      return sum + entry[1];
    }, 0);
    var roll = Math.random() * total;
    var acc = 0;
    var i;
    for (i = 0; i < entries.length; i += 1) {
      acc += entries[i][1];
      if (roll <= acc) {
        return entries[i][0];
      }
    }
    return entries[entries.length - 1][0];
  }

  function collectEquippedElementCounts(equipmentState) {
    var counts = {};

    GEAR_SLOT_KEYS.forEach(function (slot) {
      var item = equipmentState && equipmentState.slots ? equipmentState.slots[slot] : null;
      if (!item || !item.element) {
        return;
      }
      counts[item.element] = (counts[item.element] || 0) + 1;
    });

    return counts;
  }

  function resolvePreferredChaseElement(profile, equipmentState) {
    var counts = collectEquippedElementCounts(equipmentState);
    var ranked = Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a];
    });

    if (ranked.length) {
      return ranked[0];
    }
    if (profile && Array.isArray(profile.usefulGods) && profile.usefulGods.length) {
      return profile.usefulGods[0];
    }
    return profile && profile.dayMasterElement ? profile.dayMasterElement : "";
  }

  function hasInventoryDuplicate(inventory, entry) {
    return (inventory || []).some(function (item) {
      return item &&
        item.name === entry.name &&
        item.rarity === entry.rarity &&
        item.slot === (entry.slot || "") &&
        item.element === (entry.element || "");
    });
  }

  function buildGachaEntryWeight(pool, entry, profile, equipmentState, gachaState) {
    var inventory = gachaState && Array.isArray(gachaState.inventory) ? gachaState.inventory : [];
    var preferredElement = resolvePreferredChaseElement(profile, equipmentState);
    var weight = 1;

    if (pool.id === "artifact") {
      if (entry.slot && !(equipmentState && equipmentState.slots && equipmentState.slots[entry.slot])) {
        weight += 1.35;
      }
      if (preferredElement && entry.element === preferredElement) {
        weight += 1.1;
      }
      if (profile && Array.isArray(profile.usefulGods) && profile.usefulGods.indexOf(entry.element) >= 0) {
        weight += 0.75;
      }
      if (profile && profile.dayMasterElement && profile.dayMasterElement === entry.element) {
        weight += 0.35;
      }
      if (entry.slot === "weapon" || entry.slot === "core") {
        weight += getRarityRank(entry.rarity) >= getRarityRank("SSR") ? 0.4 : 0.15;
      }
      if (profile && profile.tabooGod && profile.tabooGod === entry.element) {
        weight -= 0.45;
      }
      if (hasInventoryDuplicate(inventory, entry)) {
        weight -= 0.2;
      }
    } else if (pool.id === "skill") {
      if (profile && Array.isArray(profile.usefulGods) && profile.usefulGods.indexOf(entry.element) >= 0) {
        weight += 0.7;
      }
      if (profile && profile.dayMasterElement && profile.dayMasterElement === entry.element) {
        weight += 0.3;
      }
      if (profile && profile.tabooGod && profile.tabooGod === entry.element) {
        weight -= 0.35;
      }
      if (hasInventoryDuplicate(inventory, entry)) {
        weight -= 0.15;
      }
    }

    return Math.max(0.05, weight);
  }

  function resolvePoolPityThreshold(pool, rawThreshold) {
    return Math.max(1, normalizeNumber(rawThreshold || (pool && pool.ssrThreshold) || GACHA_PITY_SSR_THRESHOLD, GACHA_PITY_SSR_THRESHOLD));
  }

  function isHighRarity(rarity) {
    return rarity === "SSR" || rarity === "UR";
  }

  function renderAdventure(bridge, dailyFortune, guideState, todayDailyBoss) {
    var profile = getLoopProfile(bridge);
    var playerPower = getLoopPower(profile);
    var todayBoss = buildTodayBossView();
    var html = [
      "<h2 class='section-title'>Adventure / 秘境页</h2>",
      renderLatestBattleCard(bridge),
      renderSurfaceLoopTile("adventure", guideState, todayDailyBoss || todayBoss),
      "<p class='muted'>这里只回答 3 件事：现在该刷哪张图、刷它是为了什么、刷完后下一步去哪。</p>",
      "<div class='map-row'>"
    ];

    (config.maps || []).forEach(function (map) {
      var classes = ["map-card"];
      var recommendText = "";
      var mapView = buildMapView(map, playerPower, todayBoss);
      var advice = getResolvedMapAdvice(profile, map, playerPower);
      if (map.id === activeMapId) {
        classes.push("is-active");
      }
      if (dailyFortune && dailyFortune.ready && dailyFortune.recommendedMapId === map.id) {
        classes.push("is-recommended");
        recommendText = "<p class='meta ok'>今日运势推荐图</p>";
      }

      html.push(
        "<div class='" + classes.join(" ") + "'>" +
          "<h3>" + safe(map.name) + "</h3>" +
          "<p>" + safe(map.purpose || map.description || "") + "</p>" +
          recommendText +
          "<p class='meta'>推荐战力: " + map.recommendedPower + " | 当前战力: " + playerPower + " | " + safe(mapView.powerText) + "</p>" +
          "<p class='meta'>奖励焦点: " + safe(map.dropFocus || "-") + " | 目标掉落: " + safe(mapView.featuredLootText) + "</p>" +
          "<p class='meta'>套装目标: " + safe(mapView.setTargetText) + " | 本轮追件: " + safe(mapView.chaseTargetText) + "</p>" +
          "<p class='meta'>适合谁刷: " + safe(mapView.chaseWhoText) + " | 为什么现在: " + safe(mapView.chaseWhyText) + "</p>" +
          "<p class='meta'>刷图路线: " + safe(mapView.routeText) + " | 做完后: 去 Boss / 榜单验收</p>" +
          "<p class='meta'>命格判断: " + safe(advice.verdict) + " | 风险: " + safe(advice.pressureText) + "</p>" +
          "<div class='button-row'><button class='cta' type='button' data-map-id='" + safe(map.id) + "'>设为当前挑战</button></div>" +
        "</div>"
      );
    });
    html.push("</div>");

    if (dailyFortune && dailyFortune.ready) {
      html.push(
        "<div class='tile' style='margin-top:10px'>" +
        "<h3>今日推荐路线</h3>" +
        "<p>" + safe(dailyFortune.recommendedMapName) + "</p>" +
        "<p class='meta'>" + safe(dailyFortune.recommendedMode) + "</p>" +
        "<p class='meta'>" + safe(dailyFortune.reasonText) + "</p>" +
        "</div>"
      );
    }

    html.push(
      "<div class='tile' style='margin-top:10px'>" +
      "<h3>接入现有战斗循环</h3>" +
      "<p>选好图后直接去打一把；这轮试玩重点看：玩家会不会在刷完后自然回 Boss / 榜单。</p>" +
      "<div class='button-row'><button class='cta' type='button' id='btn-go-phase1'>去打这一把</button><button type='button' data-jump-tab='home'>回主城</button></div>" +
      "</div>"
    );

    el.adventure.innerHTML = html.join("");
    el.adventure.querySelectorAll("button[data-map-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeMapId = btn.getAttribute("data-map-id");
        renderAll();
      });
    });

    var goBtn = document.getElementById("btn-go-phase1");
    if (goBtn) {
      goBtn.addEventListener("click", function () {
        window.location.href = buildPhase1Url(activeMapId, "adventure");
      });
    }

    bindScopedTabJumps(el.adventure);
  }

  function renderGear(bridge, wallet, guideState, equipmentState, boards, todayDailyBoss, bossState) {
    var snapshot = bridge.profileSnapshot;
    var gachaState = readGachaState();
    var rewardState = readRewardState();
    var profile = serverCache.playerState && serverCache.playerState.profile ? serverCache.playerState.profile : snapshot;
    var fateMeta;

    equipmentState = equipmentState || readEquipmentState();

    if (isBackendEnabled() && equipmentState && equipmentState.summary) {
      fateMeta = [
        "职业: " + safe(profile.className) + " (" + safe(profile.dayMasterElement) + ")",
        "身强弱: " + safe(profile.strength || "待同步"),
        "后端同步: " + safe(formatTime(equipmentState.lastSyncedAt))
      ];

      if (Array.isArray(profile.usefulGods) && profile.usefulGods.length) {
        fateMeta.push("喜用: " + safe(profile.usefulGods.join("/")));
      }
      if (profile.tabooGod) {
        fateMeta.push("忌神: " + safe(profile.tabooGod));
      }

      el.gear.innerHTML = [
        "<h2 class='section-title'>Gear / 配装页</h2>",
        "<p class='muted'>当前 Gear 由后端主路径持久化；抽到命器后可直接换上，强化消耗直接走后端钱包（灵石 / 材料）。</p>",
        renderRewardSpotlight(rewardState, ["gear_equip", "enhancement"], "配装变化"),
        renderSurfaceLoopTile("gear", guideState, null),
        "<div class='tile'><h3>当前 build 摘要</h3><p class='meta'>" + fateMeta.join(" | ") + "</p>" +
          "<p>总战力 <strong>" + equipmentState.summary.totalPower + "</strong> · 基础 " + equipmentState.summary.basePower +
          " · 换装增益 " + formatSignedNumber(equipmentState.summary.gearSwapPower || 0) + " · 强化增益 +" + equipmentState.summary.enhancementPower + " · 套装增益 +" + equipmentState.summary.setBonusPower + "</p>" +
          "<p class='meta'>装备强度: " + equipmentState.summary.baseGearScore + " → " + equipmentState.summary.enhancedGearScore +
          " | 总强化 +" + equipmentState.summary.totalEnhancementLevel + " | build 标签: " + safe(equipmentState.summary.buildTag) + "</p></div>",
        "<div class='grid cols-2' style='margin-top:10px'>",
        "<div class='tile'><h3>强化 / 套装</h3><p>" + safe(equipmentState.setBonus && equipmentState.setBonus.active ? equipmentState.setBonus.label : "未激活套装") + "</p>" +
          "<p class='meta'>" + safe(equipmentState.setBonus ? equipmentState.setBonus.detail : "同一套装 2 件激活，4 件升级核心效果") + "</p>" +
          "<p class='meta'>进度：" + safe(equipmentState.setBonus && equipmentState.setBonus.progressText ? equipmentState.setBonus.progressText : "0/2") +
          (equipmentState.setBonus && equipmentState.setBonus.focus ? " | 路线：" + safe(equipmentState.setBonus.focus) : "") + "</p>" +
          "<p class='meta'>下一步：" + safe(equipmentState.setBonus && equipmentState.setBonus.nextStep ? equipmentState.setBonus.nextStep : "优先补同套 2 件") + "</p>" +
          "<p class='meta'>当前资源：灵石 " + wallet.spiritStone + " · 材料 " + wallet.materials + "</p></div>",
        renderCompetitionPulseTile("gear", boards, todayDailyBoss, bossState),
        "<div class='tile'><h3>后续动作</h3><p>优先把主武器/核心抬到 +3~+5：命宫试炼补底子，五行秘境补输出，流年劫关拿冲榜件，再围绕同一套装追 2 件起步、4 件成型。</p>" +
          "<p class='meta'>该页会直接影响总战力榜与同日主榜排名。</p></div>",
        "</div>",
        "<div class='tile' style='margin-top:10px'><h3>当前追装路线</h3><p class='meta'>命器池这轮补进了五行追件锚点；Gear 页会直接告诉你谁该去刷、现在该追什么、以及为什么要先刷这张图。</p><div class='list'>" + renderGearChaseRoadmap() + "</div></div>",
        "<div class='tile' style='margin-top:10px'><h3>当前已穿戴装备</h3><div class='list'>" + renderEnhancedGearRows(equipmentState, wallet) +
          "</div><div class='button-row'>" + renderGearNextActionButtons(guideState, todayDailyBoss) + "</div></div>",
        "<div class='tile' style='margin-top:10px'><h3>命器背包（最新 10 件）</h3><p class='meta'>只显示可穿戴命器；支持按槽位直接换上，并看到当前槽位 / 套装进度对比。</p><div class='list'>" + renderGearBagRows(gachaState, equipmentState) + "</div></div>"
      ].join("");

      el.gear.querySelectorAll("button[data-enhance-slot]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          enhanceEquippedItem(btn.getAttribute("data-enhance-slot"));
        });
      });
      el.gear.querySelectorAll("button[data-equip-item]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          equipInventoryItem(btn.getAttribute("data-equip-item"), "gear");
        });
      });
      bindScopedTabJumps(el.gear);
      return;
    }

    if (!snapshot) {
      el.gear.innerHTML = [
        "<h2 class='section-title'>Gear / 配装页</h2>",
        "<p class='muted'>尚未同步到 Phase 1 角色快照。先去 Adventure/Boss 打一把后回城查看。</p>"
      ].join("");
      return;
    }

    var equippedRows = Object.keys(SLOT_LABELS).map(function (slot) {
      var item = snapshot.equipped ? snapshot.equipped[slot] : null;
      if (!item) {
        return "<div class='item'>" + SLOT_LABELS[slot] + "：<span class='muted'>空</span></div>";
      }
      return "<div class='item'>" + SLOT_LABELS[slot] + "：<strong>" + safe(item.name) + "</strong> [" + safe(item.rarity) + "] · " +
        safe(item.element) + " · GS " + item.gearScore + "</div>";
    }).join("");

    var inventorySummary = snapshot.inventorySummary || { total: 0, byRarity: {}, bySlot: {} };
    var rarityText = formatCounter(inventorySummary.byRarity);
    var slotText = formatCounter(inventorySummary.bySlot);
    var previewItems = (snapshot.inventoryItems || []).slice(0, 6).map(function (item) {
      return "<div class='item'><strong>" + safe(item.name) + "</strong> [" + safe(item.rarity) + "] · " +
        safe(SLOT_LABELS[item.slot] || item.slot) + " · GS " + item.gearScore + "</div>";
    }).join("");
    var fateMeta = [
      "职业: " + safe(snapshot.className) + " (" + safe(snapshot.dayMasterElement) + ")",
      "身强弱: " + safe(snapshot.strength)
    ];

    if (Array.isArray(snapshot.usefulGods) && snapshot.usefulGods.length) {
      fateMeta.push("喜用: " + safe(snapshot.usefulGods.join("/")));
    }
    if (snapshot.tabooGod) {
      fateMeta.push("忌神: " + safe(snapshot.tabooGod));
    }

    el.gear.innerHTML = [
      "<h2 class='section-title'>Gear / 配装页</h2>",
      "<p class='muted'>来自 Phase 1 的只读快照（可扩展为后续可操作 Gear 管理）。</p>",
      "<div class='tile'><h3>最近同步</h3><p class='meta'>" + safe(formatTime(snapshot.timestamp)) + " | 来源: " + safe(snapshot.source || "-") + "</p>" +
        "<p class='meta'>" + fateMeta.join(" | ") + "</p></div>",
      "<div class='grid cols-2' style='margin-top:10px'>",
      "<div class='tile'><h3>战力与关键属性</h3>" + renderStatRows(snapshot) + "</div>",
      "<div class='tile'><h3>背包摘要</h3><p>总数: " + inventorySummary.total + "</p><p class='meta'>按稀有度: " + safe(rarityText) +
        "</p><p class='meta'>按槽位: " + safe(slotText) + "</p></div>",
      "</div>",
      "<div class='tile' style='margin-top:10px'><h3>已穿戴装备</h3><div class='list'>" + equippedRows + "</div></div>",
      "<div class='tile' style='margin-top:10px'><h3>背包预览（前 6）</h3><div class='list'>" + (previewItems || "<span class='muted'>背包为空</span>") + "</div>" +
        "<div class='button-row'><button class='cta' type='button' data-jump-tab='adventure'>去刷图</button></div></div>"
    ].join("");

    bindScopedTabJumps(el.gear);
  }

  function renderEnhancedGearRows(equipmentState, wallet) {
    return Object.keys(SLOT_LABELS).map(function (slot) {
      var item = equipmentState && equipmentState.slots ? equipmentState.slots[slot] : null;
      var affordable = item && item.nextEnhanceCost ? wallet.spiritStone >= item.nextEnhanceCost.spiritStone && wallet.materials >= item.nextEnhanceCost.materials : false;
      var statBonusText;
      var action;

      if (!item) {
        return "<div class='item'>" + SLOT_LABELS[slot] + "：<span class='muted'>空</span></div>";
      }

      statBonusText = formatGearStatBonus(item.statBonus);
      action = item.enhancementLevel >= 10
        ? "<button type='button' disabled>已满级 +10</button>"
        : "<button type='button' data-enhance-slot='" + safe(slot) + "'" + (affordable ? " class='cta'" : " disabled") + ">强化到 +" + (item.enhancementLevel + 1) + "</button>";

      return [
        "<div class='item'>",
        "<div class='gear-slot-head'><strong>" + safe(SLOT_LABELS[slot]) + " · " + safe(item.name) + "</strong><span>+" + item.enhancementLevel + "</span></div>",
        "<p class='meta'>[" + safe(item.rarity) + "] · " + safe(item.element) + " · GS " + item.baseGearScore + " → " + item.enhancedGearScore + "</p>",
        "<p class='meta'>套装：" + safe(item.setName || resolveSetDefinition(item.element).name) + "</p>",
        "<p class='meta'>强化增益：" + safe(statBonusText) + "</p>",
        "<div class='button-row'>" + action + (item.nextEnhanceCost
          ? "<span class='status-pill " + (affordable ? "is-claimable" : "is-locked") + "'>下一次消耗 " + safe(formatReward(item.nextEnhanceCost)) + "</span>"
          : "<span class='status-pill is-claimed'>强化已满</span>") + "</div>",
        "</div>"
      ].join("");
    }).join("");
  }

  function formatGearStatBonus(statBonus) {
    var keys = Object.keys(statBonus || {}).filter(function (key) {
      return normalizeNumber(statBonus[key], 0) > 0;
    });
    if (!keys.length) {
      return "当前无额外增益";
    }
    return keys.map(function (key) {
      return key + " +" + statBonus[key];
    }).join(" / ");
  }

  function renderGearBagRows(gachaState, equipmentState) {
    var items = getGearInventoryItems(gachaState).slice(0, 10);

    if (!items.length) {
      return "<span class='muted'>暂无可穿戴命器，先去命器池抽一发。</span>";
    }

    return items.map(function (item) {
      var current = equipmentState && equipmentState.slots ? equipmentState.slots[item.slot] : null;
      var isEquipped = !!(current && current.itemKey === item.itemKey);
      var scoreDelta = normalizeNumber(item.gearScore, 0) - normalizeNumber(current ? current.baseGearScore : 0, 0);
      var compareText = current
        ? "当前槽位: " + current.name + " · GS " + current.baseGearScore + (scoreDelta === 0 ? " · 同档替换" : scoreDelta > 0 ? " · 基础GS +" + scoreDelta : " · 基础GS " + scoreDelta)
        : "当前槽位为空，可直接换上";
      var setProgress = formatSetProgressPreview(item, equipmentState);
      var buttonLabel = isEquipped
        ? "已穿戴"
        : (current ? "替换" + (SLOT_LABELS[item.slot] || item.slot) : "穿上" + (SLOT_LABELS[item.slot] || item.slot));

      return [
        "<div class='item" + (isEquipped ? " is-equipped" : "") + "'>",
        "<div class='gear-slot-head'><strong>[" + safe(item.rarity) + "] " + safe(item.name) + "</strong><span>" + safe(SLOT_LABELS[item.slot] || item.slot) + (item.enhancementLevel ? " · +" + item.enhancementLevel : "") + "</span></div>",
        "<p class='meta'>" + safe(item.element) + " · GS " + item.gearScore + " · 套装 " + safe(item.setName || resolveSetDefinition(item.element).name) + "</p>",
        "<p class='meta'>" + safe(compareText) + "</p>",
        "<p class='meta'>" + safe(setProgress) + "</p>",
        "<div class='button-row'><button type='button' data-equip-item='" + safe(item.itemKey) + "'" + (isEquipped ? " disabled" : " class='cta'") + ">" + safe(buttonLabel) + "</button></div>",
        "</div>"
      ].join("");
    }).join("");
  }

  function renderGearNextActionButtons(guideState, todayDailyBoss) {
    var currentStep = getGuideStep(guideState && guideState.currentStepId);
    var bossMapId = todayDailyBoss && todayDailyBoss.mapId ? todayDailyBoss.mapId : activeMapId;

    if (currentStep && currentStep.id === "first_farm") {
      return buildJumpButton("去刷图验收提升", "adventure", activeMapId, true) + buildJumpButton("做完再去 Boss", "boss", bossMapId, false);
    }
    if (currentStep && currentStep.id === "first_boss") {
      return buildJumpButton("去今日 Boss", "boss", bossMapId, true) + buildJumpButton("去榜单复盘", "leaderboard", "", false);
    }
    if (currentStep && currentStep.id === "leaderboard_check") {
      return buildJumpButton("去看榜单差距", "leaderboard", "", true) + buildJumpButton("回主城", "home", "", false);
    }
    return buildJumpButton("去刷图", "adventure", activeMapId, true) + buildJumpButton("去今日 Boss", "boss", bossMapId, false);
  }

  function enhanceEquippedItem(slot) {
    var beforeState = readEquipmentState();
    var beforeSummary = beforeState && beforeState.summary ? beforeState.summary : null;
    var beforePower = beforeSummary ? normalizeNumber(beforeSummary.totalPower, 0) : 0;

    if (!isBackendEnabled()) {
      return;
    }

    requestJson("/gear/enhance", {
      method: "POST",
      body: {
        slot: slot,
        latestBattle: readBridgeState().latestBattle,
        profileSnapshot: readBridgeState().profileSnapshot
      }
    }).then(function (response) {
      var afterState;
      var afterSummary;
      var powerDelta = 0;
      var chips;

      if (response && response.playerState) {
        applyServerPlayerState(response.playerState);
      }
      afterState = response && response.playerState ? response.playerState.equipmentState : readEquipmentState();
      afterSummary = afterState && afterState.summary ? afterState.summary : null;
      powerDelta = afterSummary ? normalizeNumber(afterSummary.totalPower, 0) - beforePower : 0;
      chips = [
        response && response.nextLevel ? "强化 +" + response.nextLevel : "",
        powerDelta ? "战力 " + formatSignedNumber(powerDelta) : "",
        response && response.cost ? "消耗 " + formatReward(response.cost) : ""
      ].filter(Boolean);

      if (response && response.feedback) {
        announceActionMoment(response.feedback, {
          eyebrow: "强化成功",
          summary: powerDelta ? ("总战力 " + formatSignedNumber(powerDelta)) : "装备强度与总战力已更新",
          chips: chips,
          tabMoments: [
            {
              tab: "gear",
              payload: {
                type: "enhancement",
                title: response.feedback.title,
                detail: response.feedback.detail,
                summary: powerDelta ? ("总战力 " + formatSignedNumber(powerDelta)) : "Build 已更新",
                chips: chips
              }
            },
            {
              tab: "leaderboard",
              payload: {
                type: "rank_refresh",
                title: "战力已刷新",
                detail: "强化后建议回 Rank 验收",
                summary: powerDelta ? ("总战力 " + formatSignedNumber(powerDelta)) : "强化已生效"
              }
            }
          ]
        });
      }

      return refreshPowerLeaderboards().catch(function () {
        return null;
      });
    }).then(function () {
      activeTab = "gear";
      renderAll();
    }).catch(function () {
      serverCache.available = false;
      renderAll();
    });
  }

  function equipInventoryItem(itemKey, targetTab) {
    if (!isBackendEnabled() || !itemKey) {
      return;
    }

    requestJson("/gear/equip", {
      method: "POST",
      body: {
        itemKey: itemKey,
        latestBattle: readBridgeState().latestBattle,
        profileSnapshot: readBridgeState().profileSnapshot
      }
    }).then(function (response) {
      if (response && response.playerState) {
        applyServerPlayerState(response.playerState);
      }
      return refreshServerSnapshot().catch(function () {
        return null;
      });
    }).then(function () {
      activeTab = targetTab || "gear";
      renderAll();
    }).catch(function () {
      serverCache.available = false;
      renderAll();
    });
  }

  function renderBoss(bridge, previewDailyBoss, todayDailyBoss, bossState, dailyState, opsState, commerceState, activityState, rewardState, guideState, boards) {
    var profile = getLoopProfile(bridge);
    var playerPower = getLoopPower(profile);
    var challengeState = getBossChallengeState(bossState);
    var selectedMap = mapById[activeMapId];
    var selectedBoss = selectedMap ? config.bosses[selectedMap.bossId] : null;
    var selectedAdvice = selectedMap ? getResolvedMapAdvice(profile, selectedMap, playerPower) : null;
    var todayRecord = getBossRecordForDate(bossState, todayKey(), todayDailyBoss);
    var bossInsight = buildLeaderboardInsight("today_boss", boards && boards.today_boss ? boards.today_boss : [], todayDailyBoss, bossState);
    var selectedMechanicText = selectedBoss
      ? formatBossMechanicHeadline(selectedBoss) + (formatBossMechanicSecondary(selectedBoss) ? " · " + formatBossMechanicSecondary(selectedBoss) : "")
      : "-";
    var selectedNextStepText = todayRecord.firstClearAchieved
      ? (challengeState.remaining > 0
        ? "再打一轮后回 Rank 看差距有没有缩小。"
        : "先去 Gear / Adventure 补 build，明天再回来验收。")
      : "先打首通，领奖后回 Rank 看这轮 build 值不值得继续追。";
    var leaderboardButton = todayRecord && todayRecord.attempts > 0
      ? "<button type='button' data-jump-tab='leaderboard'>去榜单复盘</button>"
      : "";
    var bossCards = bossCandidates.map(function (candidate) {
      var isPreviewed = previewDailyBoss && candidate.map.id === previewDailyBoss.mapId;
      var mapView = buildMapView(candidate.map, playerPower, todayDailyBoss);
      var advice = getResolvedMapAdvice(profile, candidate.map, playerPower);
      return [
        "<div class='tile " + (isPreviewed ? "is-featured" : "") + "'>",
        "<h3>" + safe(candidate.boss.name) + "</h3>",
        "<p>" + safe(candidate.map.purpose || candidate.map.description || "") + "</p>",
        renderDecisionGrid([
          { label: "现在在哪", text: candidate.map.name + " · 推荐 " + candidate.map.recommendedPower + " · " + mapView.powerText },
          { label: "为什么打", text: (candidate.map.dropFocus || "装备/材料") + " · " + mapView.chaseWhyText },
          { label: "先注意", text: formatBossMechanicHeadline(candidate.boss) + (advice ? " · " + advice.verdict : "") }
        ]),
        "<p class='meta'>目标掉落：" + safe(mapView.featuredLootText) + " · 适合 " + safe(mapView.chaseWhoText) + (advice ? " · 风险 " + safe(advice.pressureText) : "") + "</p>",
        "<div class='button-row'><button type='button' data-boss-map='" + safe(candidate.map.id) + "'>切到该 Boss</button></div>",
        "</div>"
      ].join("");
    }).join("");

    el.boss.innerHTML = [
      "<h2 class='section-title'>Boss / 挑战页</h2>",
      renderDailyBossTile(previewDailyBoss, todayDailyBoss, todayRecord, dailyState),
      "<div class='tile is-featured' style='margin-top:10px'><p class='eyebrow'>当前决策</p><h3>当前准备进的 Boss</h3><p>" + safe(selectedBoss ? selectedBoss.name : "暂无") +
        (selectedMap ? " · " + safe(selectedMap.name) : "") + "</p>" +
        renderDecisionGrid([
          { label: "我现在在哪", text: (selectedMap ? selectedMap.name : "未选地图") + " · 推荐 " + (selectedMap ? selectedMap.recommendedPower : "-") + " · " + safe(formatBossChallengeState(challengeState)) },
          { label: "先补什么", text: (selectedMap ? formatMapChaseField(selectedMap, 'whyNow', '-') : "-") + " · " + selectedMechanicText },
          { label: "做完回哪", text: selectedNextStepText }
        ]) +
        (selectedAdvice ? "<p class='meta'>命格建议：" + safe(selectedAdvice.verdict) + " · 风险 " + safe(selectedAdvice.pressureText) + "</p>" : "") +
        "<p class='meta'>奖励倾向：" + safe(selectedMap ? selectedMap.dropFocus || "-" : "-") + " · 目标掉落 " + safe(selectedMap ? formatDropTableFieldList(selectedMap, "featuredLoot") : "-") + "</p>" +
      "<div class='button-row'><button class='cta' type='button' id='btn-boss-go-phase1'" + (selectedMap ? "" : " disabled") + ">" + safe(challengeState.remaining === 0 ? "进入练习挑战" : "进入记分挑战") + "</button>" +
        leaderboardButton +
        "<button type='button' data-jump-tab='home'>回主城</button></div></div>",
      renderLatestBattleCard(bridge),
      renderBossSettlementTile(bridge, rewardState, todayDailyBoss, todayRecord, bossState, dailyState),
      renderRewardSpotlight(rewardState, ["daily_boss", "event", "boss_challenge"], "Boss 收获"),
      renderSurfaceLoopTile("boss", guideState, todayDailyBoss),
      "<div class='grid cols-2' style='margin-top:10px'>" + bossCards + "</div>",
      "<div class='grid cols-2' style='margin-top:10px'>" +
        renderCompetitionPulseTile("boss", boards, todayDailyBoss, bossState) +
        renderReturnReasonsTile("boss", dailyState, opsState, commerceState, activityState, todayDailyBoss, bossState, boards) +
      "</div>",
      renderShareReadySurface("boss", "today_boss", boards && boards.today_boss ? boards.today_boss : [], bossInsight, todayDailyBoss, bossState)
    ].join("");

    var goFightBtn = document.getElementById("btn-boss-go-phase1");
    if (goFightBtn && selectedMap) {
      goFightBtn.addEventListener("click", function () {
        window.location.href = buildPhase1Url(selectedMap.id, "boss");
      });
    }

    var dailyFightBtn = document.getElementById("btn-boss-go-daily-fight");
    if (dailyFightBtn && previewDailyBoss) {
      dailyFightBtn.addEventListener("click", function () {
        window.location.href = buildPhase1Url(previewDailyBoss.mapId, "boss");
      });
    }

    var setDailyMapBtn = document.getElementById("btn-boss-set-daily-map");
    if (setDailyMapBtn && previewDailyBoss) {
      setDailyMapBtn.addEventListener("click", function () {
        activeMapId = previewDailyBoss.mapId;
        activeTab = "boss";
        renderAll();
      });
    }

    var bossDateInput = document.getElementById("daily-boss-date");
    if (bossDateInput) {
      bossDateInput.addEventListener("change", function () {
        var nextDateKey = normalizeDateKey(bossDateInput.value);
        if (!nextDateKey) {
          bossDateInput.value = activeBossDateKey;
          return;
        }
        activeBossDateKey = nextDateKey;
        activeTab = "boss";
        renderAll();
      });
    }

    var bossDateTodayBtn = document.getElementById("btn-boss-date-today");
    if (bossDateTodayBtn) {
      bossDateTodayBtn.addEventListener("click", function () {
        activeBossDateKey = todayKey();
        activeTab = "boss";
        renderAll();
      });
    }

    var bossRewardBtn = document.getElementById("btn-claim-daily-boss-reward");
    if (bossRewardBtn) {
      bossRewardBtn.addEventListener("click", function () {
        claimDailyBossFirstClearReward();
      });
    }

    el.boss.querySelectorAll("button[data-boss-map]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mapId = btn.getAttribute("data-boss-map");
        if (!mapById[mapId]) {
          return;
        }
        activeMapId = mapId;
        activeTab = "boss";
        renderAll();
      });
    });

    el.boss.querySelectorAll("button[data-event-claim]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        claimEventReward(btn.getAttribute("data-event-claim"));
      });
    });

    bindTodayActionButtons(el.boss);
    bindShareButtons(el.boss);

    bindScopedTabJumps(el.boss);
    trackReturnHookExposure("boss", "Boss 页回流与明日承接曝光");
  }

  function renderBossSettlementTile(bridge, rewardState, todayDailyBoss, todayRecord, bossState, dailyState) {
    var bossMoment = getRecentTabMoment("boss", 14000);
    var challengeState = getBossChallengeState(bossState);
    var latest = bridge && bridge.latestBattle ? bridge.latestBattle : null;
    var rewardReady = !!(todayRecord.firstClearAchieved && !dailyState.specialClaims.dailyBossFirstClear);
    var actionButtons = [];

    if (!bossMoment) {
      return "";
    }

    if (rewardReady) {
      actionButtons.push("<button type='button' class='cta' data-today-action='claim-daily-boss-reward'>领取首通奖励</button>");
    }
    actionButtons.push("<button type='button' data-jump-tab='leaderboard'>回 Rank 看变化</button>");
    actionButtons.push("<button type='button' data-jump-tab='gear'>去 Gear 补强</button>");

    return [
      "<div class='tile is-featured surface-hero boss-settlement-card is-live-surface' style='margin-top:10px'>",
      "<p class='eyebrow'>" + safe(bossMoment.type === "daily_boss" ? "首通到账" : "Boss 结算") + "</p>",
      "<h3>" + safe(bossMoment.title || "Boss 结果已更新") + "</h3>",
      renderMomentPills([
        { label: rewardReady ? "首通奖可领" : (todayRecord.firstClearAchieved ? "已首通" : "待首通"), tone: rewardReady ? "is-claimable" : (todayRecord.firstClearAchieved ? "is-live" : "is-danger") },
        { label: challengeState.remaining > 0 ? "可继续追榜" : "今日记分已打满", tone: challengeState.remaining > 0 ? "is-recommended" : "is-preview" },
        { label: "最佳榜分 " + todayRecord.bestScore, tone: "is-rare" }
      ], "is-compact"),
      "<p class='hero-copy'>" + safe(bossMoment.summary || bossMoment.detail || "这次结果已经记进账本和今日榜。") + "</p>",
      (latest ? "<p class='meta'>最近结果：" + safe((latest.result === "victory" ? "胜利" : "失败") + " · " + formatLootSummary(latest.lootSummary)) + "</p>" : ""),
      "<p class='meta'>剩余记分 " + challengeState.remaining + "/" + challengeState.dailyCap + (bossMoment.detail ? " · " + safe(bossMoment.detail) : "") + "</p>",
      "<div class='button-row'>" + actionButtons.join("") + "</div>",
      "</div>"
    ].join("");
  }

  function renderDailyBossTile(previewDailyBoss, todayDailyBoss, todayRecord, dailyState) {
    if (!previewDailyBoss) {
      return "<div class='tile is-featured surface-hero boss-daily-hero' style='margin-top:10px'><h3>今日 Boss</h3><p class='muted'>暂无 Boss 配置</p></div>";
    }

    var isTodayBoss = previewDailyBoss.dateKey === todayKey();
    var rewardClaimedAt = dailyState.specialClaimTimes ? dailyState.specialClaimTimes.dailyBossFirstClear : "";
    var note = isTodayBoss
      ? "当前为当天轮换结果，首通奖励和榜单都以这只 Boss 为准。"
      : "当前为按日期预览的轮换结果，不影响今日结算。";
    var bossRewardClaimed = !!dailyState.specialClaims.dailyBossFirstClear;
    var bossRewardButton = "";
    var recordText = "今日战绩：挑战 " + todayRecord.attempts + " 次 / 胜利 " + todayRecord.victories + " 次 / 最佳榜分 " + todayRecord.bestScore;
    var challengeState = getBossChallengeState(readStorageJson(STORAGE_KEYS.bossState) || (serverCache.playerState && serverCache.playerState.bossState) || {});
    var previewAdvice = getDailyBossAdvice(getLoopProfile(readBridgeState()), previewDailyBoss, getLoopPower(getLoopProfile(readBridgeState())));
    var mechanicDigest = [
      formatBossMechanicHeadline(previewDailyBoss.boss),
      formatBossMechanicSecondary(previewDailyBoss.boss)
    ].filter(Boolean).join(" · ");
    var tomorrowBoss = buildDailyBoss(shiftDateKey(todayKey(), 1));
    var rewardStatusText = todayRecord.firstClearAchieved
      ? (bossRewardClaimed ? "已领取" + (rewardClaimedAt ? " · " + formatTime(rewardClaimedAt) : "") : "可领取")
      : "待首通";
    var actionButtons = [];
    var nextCheckText = !todayRecord.firstClearAchieved
      ? "先打首通 → 领奖 → 回 Rank 看差距。"
      : (!bossRewardClaimed
        ? "先领奖，再回 Rank / 活动验收。"
        : (challengeState.remaining > 0
          ? "还能追分，打完立刻回 Rank。"
          : "今天记分打满，先去 Gear / Adventure 补 build。"));

    if (isTodayBoss) {
      bossRewardButton = "<button type='button' id='btn-claim-daily-boss-reward'" +
        ((!todayRecord.firstClearAchieved || bossRewardClaimed) ? " disabled" : " class='cta'") + ">" +
        (!todayRecord.firstClearAchieved ? "首通后可领" : (bossRewardClaimed ? "首通奖励已领" : "领取首通奖励")) + "</button>";
    }

    if (bossRewardButton) {
      actionButtons.push(bossRewardButton);
    }
    actionButtons.push("<button class='cta' type='button' id='btn-boss-go-daily-fight'>" + (todayRecord.firstClearAchieved ? "继续打今日 Boss" : "先打今日 Boss") + "</button>");
    actionButtons.push("<button type='button' data-jump-tab='leaderboard'>去榜单复盘</button>");
    actionButtons.push("<button type='button' id='btn-boss-set-daily-map'>设为当前挑战</button>");

    return [
      "<div class='tile is-featured surface-hero boss-daily-hero " + (isTodayBoss ? "is-live-surface" : "is-preview-surface") + (previewAdvice && previewAdvice.tier === "risky" ? " is-danger-surface" : "") + "' style='margin-top:10px'>",
      "<p class='eyebrow'>今日决策</p>",
      "<h3>" + (isTodayBoss ? "今日 Boss" : "Boss 日期预览") + "</h3>",
      renderMomentPills([
        { label: isTodayBoss ? "当前结算" : "日期预览", tone: isTodayBoss ? "is-live" : "is-preview" },
        { label: rewardStatusText, tone: bossRewardClaimed ? "is-live" : (todayRecord.firstClearAchieved ? "is-claimable" : "is-danger") },
        { label: challengeState.remaining > 0 ? ("可追榜 · 剩余 " + challengeState.remaining) : "今日记分已打满", tone: challengeState.remaining > 0 ? "is-recommended" : "is-preview" }
      ], "is-compact"),
      "<p class='hero-copy'>" + safe(previewDailyBoss.boss.name) + " · " + safe(previewDailyBoss.description) + "</p>",
      "<div class='inline-input-row'><label class='meta' for='daily-boss-date'>按日期切换</label><input type='date' id='daily-boss-date' value='" +
        safe(previewDailyBoss.dateKey) + "' /><button type='button' id='btn-boss-date-today'>回到今天</button></div>",
      renderDecisionGrid([
        { label: "我现在在哪", text: formatDateLabel(previewDailyBoss.dateKey) + " · " + note },
        { label: "先补什么", text: "推荐 " + previewDailyBoss.recommendedPower + " · " + previewDailyBoss.rewardFocus + " · " + (previewAdvice ? previewAdvice.verdict : mechanicDigest || previewDailyBoss.tendency) },
        { label: "做完回哪", text: nextCheckText }
      ]),
      "<div class='button-row'>" + actionButtons.join("") + "</div>",
      "<p class='meta'>首通奖励：" + safe(formatReward(DAILY_BOSS_FIRST_CLEAR_REWARD)) + " · " + safe(rewardStatusText) + "</p>",
      "<p class='meta'>" + safe(recordText) + (todayRecord.lastBattleTimestamp ? " · 最近记录：" + safe(formatTime(todayRecord.lastBattleTimestamp)) : "") + "</p>",
      "<p class='meta'>目标掉落：" + safe(formatDropTableFieldList(previewDailyBoss.map, "featuredLoot")) + " · Boss 追件：" + safe(formatBossSignatureReward(previewDailyBoss.map, previewDailyBoss.boss)) + "</p>",
      "<p class='meta'>机制重点：" + safe(mechanicDigest || previewDailyBoss.tendency) + (previewAdvice ? " · 风险 " + safe(previewAdvice.pressureText) : "") + "</p>",
      (tomorrowBoss ? "<p class='meta'>明日承接：" + safe(formatDateLabel(tomorrowBoss.dateKey) + " · " + tomorrowBoss.boss.name + " · " + tomorrowBoss.rewardFocus) + "</p>" : ""),
      (todayRecord.lastMechanicSummary ? "<p class='meta'>最近机制处理: " + safe(todayRecord.lastMechanicSummary) + "</p>" : ""),
      (todayRecord.lastFateSummary ? "<p class='meta'>最近命格反馈: " + safe(todayRecord.lastFateSummary) + "</p>" : ""),
      "</div>"
    ].join("");
  }

  function renderLeaderboard(boards, todayDailyBoss, bossState, dailyState, opsState, commerceState, activityState, guideState) {
    var boardTabs = BOARD_TYPES.map(function (board) {
      return "<button type='button' class='board-btn " + (board.id === activeBoardType ? "active" : "") +
        "' data-board='" + board.id + "'>" + board.name + "</button>";
    }).join("");
    var rows = boards[activeBoardType] || [];
    var todayRecord = getBossRecordForDate(bossState, todayKey(), todayDailyBoss);
    var totalPower = serverCache.playerState && serverCache.playerState.equipmentState && serverCache.playerState.equipmentState.summary
      ? serverCache.playerState.equipmentState.summary.totalPower
      : 0;
    var sameDayMaster = serverCache.powerBoards && serverCache.powerBoards.dayMaster ? serverCache.powerBoards.dayMaster : "无";
    var insight = buildLeaderboardInsight(activeBoardType, rows, todayDailyBoss, bossState);
    var tomorrowBoss = buildDailyBoss(shiftDateKey(todayKey(), 1));

    el.leaderboard.innerHTML = [
      "<h2 class='section-title'>Leaderboard / 榜单页</h2>",
      renderLeaderboardStatusHero(insight, activeBoardType, todayDailyBoss, totalPower, sameDayMaster, todayRecord, tomorrowBoss),
      "<div class='board-tabs'>" + boardTabs + "</div>",
      "<div class='grid cols-2' style='margin-top:10px'>" +
        renderLeaderboardWhyCard(insight) +
        renderLeaderboardActionCard(insight, activeBoardType, todayDailyBoss) +
      "</div>",
      "<div class='tile' style='margin-top:10px'><div class='rank-head'><span>#</span><span>玩家</span><span>标签</span><span>分数</span></div>" +
      "<div class='list'>" + renderBoardRows(rows, insight) + "</div><div class='button-row'><button type='button' data-jump-tab='home'>回主城</button></div></div>",
      "<div class='grid cols-2' style='margin-top:10px'>" +
        renderReturnReasonsTile("leaderboard", dailyState, opsState, commerceState, activityState, todayDailyBoss, bossState, boards) +
        renderSurfaceLoopTile("leaderboard", guideState, todayDailyBoss) +
      "</div>",
      "<div class='grid cols-2' style='margin-top:10px'>" + renderLeaderboardDisplayCards(rows, insight, activeBoardType, todayDailyBoss) + "</div>",
      renderShareReadySurface("leaderboard", activeBoardType, rows, insight, todayDailyBoss, bossState)
    ].join("");

    el.leaderboard.querySelectorAll("button[data-board]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeBoardType = btn.getAttribute("data-board");
        activeTab = "leaderboard";
        renderAll();
      });
    });
    bindShareButtons(el.leaderboard);
    el.leaderboard.querySelectorAll("button[data-event-claim]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        claimEventReward(btn.getAttribute("data-event-claim"));
      });
    });

    bindTodayActionButtons(el.leaderboard);

    bindScopedTabJumps(el.leaderboard);
    trackReturnHookExposure("leaderboard", "榜单回流与明日承接曝光");
  }

  function renderLeaderboardStatusHero(insight, boardType, todayDailyBoss, totalPower, sameDayMaster, todayRecord, tomorrowBoss) {
    var currentBoardName = getBoardName(boardType, todayDailyBoss);
    var boardProgressText = insight && insight.myRow
      ? insight.rankText
      : (currentBoardName + " 还没有你的真实成绩，先打一轮再回来读差距。");
    var primaryAction = insight && insight.primaryAction ? insight.primaryAction : { label: "去 Gear 补强", tab: "gear", mapId: "" };
    var heroButtons = [buildJumpButton(primaryAction.label, primaryAction.tab, primaryAction.mapId || "", true)];
    var rankMoment = getRecentTabMoment("leaderboard", 14000);

    if (boardType === "today_boss" && primaryAction.tab !== "boss") {
      heroButtons.push(buildJumpButton("去 Boss 追分", "boss", todayDailyBoss && todayDailyBoss.mapId ? todayDailyBoss.mapId : activeMapId, false));
    } else if (boardType !== "today_boss" && primaryAction.tab !== "leaderboard") {
      heroButtons.push(buildJumpButton("回 Home 总览", "home", "", false));
    }

    return [
      "<div class='tile loop-card is-featured surface-hero leaderboard-status-hero " + (insight && insight.myRow ? "is-live-surface" : "is-preview-surface") + (rankMoment ? " is-flash-surface" : "") + "'>",
      "<p class='eyebrow'>当前真实状态</p>",
      "<h3>" + safe(currentBoardName) + "</h3>",
      renderMomentPills([
        { label: insight && insight.myRow ? "真实成绩" : "参考样本", tone: insight && insight.myRow ? "is-live" : "is-preview" },
        { label: boardType === "today_boss" ? (todayRecord.bestScore > 0 ? "可追榜" : "先出分") : "当前可追", tone: boardType === "today_boss" && todayRecord.bestScore === 0 ? "is-danger" : "is-recommended" },
        rankMoment ? { label: "刚更新", tone: "is-claimable" } : null
      ], "is-compact"),
      "<p class='hero-copy'>" + safe(boardProgressText) + "</p>",
      renderDecisionGrid([
        { label: "我现在在哪", text: insight && insight.gapText ? insight.gapText : boardProgressText },
        { label: "先补什么", text: insight && insight.priorityText ? insight.priorityText : "先去 Gear / Adventure / Boss 打出第一条真实成绩。" },
        { label: "做完回哪", text: "回 Rank 验收这轮变化" }
      ], "is-compact"),
      "<div class='button-row'>" + heroButtons.join("") + "</div>",
      "<p class='meta'>当前总战力 " + safe(String(totalPower)) + " · 同日主 " + safe(sameDayMaster) + " · 今日 Boss " + safe(String(todayRecord.bestScore)) + "</p>",
      (rankMoment && rankMoment.summary ? "<p class='meta'>刚刷新：" + safe(rankMoment.summary) + "</p>" : ""),
      (tomorrowBoss ? "<p class='meta'>明日承接：" + safe(tomorrowBoss.boss.name) + " · " + safe(tomorrowBoss.rewardFocus) + "</p>" : ""),
      "</div>"
    ].join("");
  }

  function renderBoardRows(rows, insight) {
    var hasRealRow = !!(insight && insight.myRow);

    if (rows.length === 0) {
      return "<span class='muted'>暂无数据</span>";
    }
    return rows.map(function (row, idx) {
      var classes = ["rank-row"];
      var detailLabel = row.isYou ? "当前角色" : (hasRealRow ? "参考对手" : "参考样本");

      if (row.isYou) {
        classes.push("you");
      } else {
        classes.push("is-sample");
      }
      if (idx === 0) {
        classes.push("is-top");
      }

      return "<div class='" + classes.join(" ") + "'><span>" + (idx + 1) + "</span><span><strong>" + safe(row.name) +
        "</strong><span class='rank-detail'>" + safe(detailLabel) + "</span></span><span>" + safe(row.tag) +
        (row.detail ? "<span class='rank-detail'>" + safe(row.detail) + "</span>" : "") + "</span><strong>" + row.score + "</strong></div>";
    }).join("");
  }

  function buildLeaderboardInsight(boardType, rows, todayDailyBoss, bossState) {
    var equipmentState = readEquipmentState();
    var summary = equipmentState && equipmentState.summary ? equipmentState.summary : null;
    var myIndex = -1;
    var myRow;
    var aheadRow;
    var mySummary;
    var aheadSummary;
    var gapToNext = 0;
    var todayRecord = getBossRecordForDate(bossState, todayKey(), todayDailyBoss);
    var challengeState = getBossChallengeState(bossState);
    var bossName = todayDailyBoss && todayDailyBoss.boss ? todayDailyBoss.boss.name : "今日 Boss";
    var sameDayMaster = serverCache.powerBoards && serverCache.powerBoards.dayMaster ? serverCache.powerBoards.dayMaster : "无";
    var fateAdvice = serverCache.playerState && serverCache.playerState.dailyBoss ? serverCache.playerState.dailyBoss.fateAdvice : null;
    var title = "排名解释";
    var rankText = "当前尚未入榜";
    var summaryText = "先完成当前动作链，再回来确认差距。";
    var whyRankText = "先打出一条有效成绩，再回来读差距。";
    var compareText = "暂无上一名可对比。";
    var actionText = "先去 Gear / Boss 建立有效成绩，再回榜单看位置。";
    var gapText = "暂无上一名可追。";
    var climbText = "先打出一条有效成绩，再回来确认离下一名还有多远。";
    var priorityText = "先补齐当前 build 的基础强度。";
    var farmText = "按当前推荐地图补一轮件，再回来读榜。";
    var proofText = "先做出一套完整 build，再让这轮成绩更值得晒。";
    var loopText = "看榜 → 补 build → 刷图 / Boss → 回榜复盘。";
    var primaryAction = { label: "去 Gear 补强", tab: "gear", mapId: "" };
    var farmPlan;

    rows.some(function (row, idx) {
      if (row.isYou) {
        myIndex = idx;
        myRow = row;
        return true;
      }
      return false;
    });

    mySummary = myRow && myRow.summary ? myRow.summary : null;

    if (myIndex > 0) {
      aheadRow = rows[myIndex - 1];
      gapToNext = Math.max(0, normalizeNumber(aheadRow.score, 0) - normalizeNumber(myRow.score, 0));
      gapText = "离前一名 " + aheadRow.name + " 还差 " + gapToNext + (boardType === "today_boss" ? " 榜分" : " 战力");
    } else if (myIndex === 0) {
      gapText = "你当前就在该榜单第一位。";
    }

    aheadSummary = aheadRow && aheadRow.summary ? aheadRow.summary : null;

    if (myRow) {
      rankText = "你当前排名第 " + (myIndex + 1) + " / " + rows.length + "。";
    }

    if (boardType === "total") {
      title = "为什么你在总战力榜排这里";
      summaryText = summary
        ? "总战力 " + summary.totalPower + " = 基础 " + summary.basePower + " + 换装 " + formatSignedNumber(summary.gearSwapPower || 0) + " + 强化 +" + summary.enhancementPower + " + 套装 +" + summary.setBonusPower
        : "总战力榜按后端当前装备、强化、套装共鸣后的真实战力排序。";
      whyRankText = mySummary
        ? "你当前主要靠 " + [mySummary.buildTag || "当前 build", "强化 +" + normalizeNumber(mySummary.totalEnhancementLevel, 0), mySummary.setLabel || "未激活套装"].join(" · ") + " 站在这个位置。"
        : "总榜只认当前后端真实 build，没完成换装 / 强化就很难往前。";
      compareText = aheadRow ? buildPowerCompareText(mySummary, aheadSummary) : (myIndex === 0 ? "你已经在总榜第一，接下来重点是继续拉大战力差。" : "先完成配装与强化，再回来读总榜差距。");
      actionText = gapToNext > 0
        ? "最快补法：先在 Gear 抬主武器 / 核心，再补 2 件或 4 件套，把差距直接追掉。"
        : "继续强化或补套装，把和后面玩家的差距拉开。";
      climbText = gapToNext > 0
        ? "再补 " + gapToNext + " 战力就能超过 " + aheadRow.name + "，这是当前最短的翻排名窗口。"
        : (myIndex === 0 ? "你已经站在总榜第一，下一步是把领先差距继续拉大。" : "先做出稳定配装，再回来读取总榜冲线距离。");
      priorityText = buildPowerPriorityText(mySummary, aheadSummary);
      primaryAction = !mySummary || normalizeNumber(mySummary.equippedCount, 0) < 5
        ? { label: "去 Gear 补齐槽位", tab: "gear", mapId: "" }
        : (!mySummary.setActive || normalizeNumber(mySummary.setCount, 0) < 4
          ? { label: "去刷图补套装", tab: "adventure", mapId: activeMapId }
          : { label: "去 Gear 强化主武器", tab: "gear", mapId: "" });
      farmPlan = buildCompetitionFarmPlan(boardType, mySummary, todayDailyBoss, fateAdvice);
      farmText = farmPlan.text;
      proofText = buildLeaderboardProofText(boardType, mySummary, myRow, myRow && myRow.shareCard ? myRow.shareCard : {});
      loopText = "看总战力榜差距 → Gear 强化 / Adventure 补套装 → 回榜确认名次变化。";
    } else if (boardType === "same_day_master") {
      title = "为什么你在同日主榜排这里";
      summaryText = "同日主榜只和 " + sameDayMaster + " 日主玩家比较，仍然按后端真实总战力排序，更适合新手看清公平差距。" +
        (summary ? " 你当前总战力 " + summary.totalPower + "。" : "");
      whyRankText = mySummary
        ? "这张榜里大家都是 " + sameDayMaster + " 日主，位置更多由 build 兑现效率决定。你当前是 " + (mySummary.buildTag || "当前 build") + "，总强化 +" + normalizeNumber(mySummary.totalEnhancementLevel, 0) + "。"
        : "同日主榜会把命理标签相同的玩家放在一起，更容易看清 build 差距。";
      compareText = aheadRow ? buildPowerCompareText(mySummary, aheadSummary) : (myIndex === 0 ? "你已经压住同日主对手，下一步是继续巩固领先。" : "先把当前同日主 build 跑起来，再回来对比。");
      actionText = gapToNext > 0
        ? "这里比的是同日主 build 兑现效率，优先去 Gear 强化，再回 Boss / Adventure 补套装件。"
        : "你已经压住同日主对手，继续优化套装和强化，维持优势。";
      climbText = gapToNext > 0
        ? "同日主榜还差 " + gapToNext + " 战力，先把最直观的 build 缺口补上就能翻前一名。"
        : (myIndex === 0 ? "你已经压住当前同日主对手，下一步是继续扩大优势。" : "先跑出一套同命 build，再回来确认公平差距。");
      priorityText = buildPowerPriorityText(mySummary, aheadSummary);
      primaryAction = !mySummary || !mySummary.setActive
        ? { label: "去刷图补同系套装", tab: "adventure", mapId: activeMapId }
        : { label: "去 Gear 强化", tab: "gear", mapId: "" };
      farmPlan = buildCompetitionFarmPlan(boardType, mySummary, todayDailyBoss, fateAdvice);
      farmText = farmPlan.text;
      proofText = buildLeaderboardProofText(boardType, mySummary, myRow, myRow && myRow.shareCard ? myRow.shareCard : {});
      loopText = "看同日主榜差距 → Gear / Adventure 优化同命 build → 回榜看同日主位次。";
    } else {
      title = "为什么你在今日 Boss 榜排这里";
      summaryText = bossName + " 的榜分只看今天最佳成绩：胜负、剩余血量、掉落、今日 Boss 加成、机制处理、命格贴合都会计入。你当前挑战 " +
        todayRecord.attempts + " 次 / 胜利 " + todayRecord.victories + " 次 / 最佳分 " + todayRecord.bestScore + "。";
      whyRankText = mySummary
        ? "你当前 Boss 位次由 " + (mySummary.firstClearAchieved ? "已首通" : "未首通") + "、胜利 " + normalizeNumber(mySummary.victories, 0) + "/" + normalizeNumber(mySummary.attempts, 0) + "、机制处理和命格贴合共同决定。"
        : "今日 Boss 榜只看当天最佳有效成绩，没有成绩就不会往前。";
      compareText = aheadRow ? buildBossCompareText(mySummary, aheadSummary) : (myIndex === 0 ? "你当前已在 Boss 榜前列，继续追求更稳定的机制处理。" : "先打一条有效 Boss 记分，再回来读榜。");
      actionText = gapToNext > 0
        ? (challengeState.remaining > 0
          ? "你还有记分次数，先看 Gear 抬一点伤害，再回来打更高分。"
          : "今日记分次数已用完，先去刷图 / 抽卡补 build，明天再回来冲更高分。")
        : "当前已在前列，继续优化机制处理和命格贴合，把榜首优势拉大。";
      climbText = gapToNext > 0
        ? "还差 " + gapToNext + " 榜分" + (challengeState.remaining > 0 ? "，今天还能再打 " + challengeState.remaining + " 次记分挑战。" : "，今天记分已用完，先补 build 等下一轮。")
        : (myIndex === 0 ? "你已在今日 Boss 榜前列，接下来重点是把领先优势稳住。" : "先打出首条有效 Boss 成绩，再回来对照冲线差距。");
      priorityText = buildBossPriorityText(mySummary, aheadSummary, challengeState, fateAdvice);
      primaryAction = challengeState.remaining > 0 && (!mySummary || !mySummary.firstClearAchieved || gapToNext <= 180)
        ? { label: "去 Boss 追分", tab: "boss", mapId: todayDailyBoss && todayDailyBoss.mapId ? todayDailyBoss.mapId : activeMapId }
        : (fateAdvice && fateAdvice.tier === "risky"
          ? { label: "去刷图补克制件", tab: "adventure", mapId: todayDailyBoss && todayDailyBoss.mapId ? todayDailyBoss.mapId : activeMapId }
          : { label: "去 Gear 补强", tab: "gear", mapId: "" });
      farmPlan = buildCompetitionFarmPlan(boardType, mySummary, todayDailyBoss, fateAdvice);
      farmText = farmPlan.text;
      proofText = buildLeaderboardProofText(boardType, mySummary, myRow, myRow && myRow.shareCard ? myRow.shareCard : {});
      loopText = "看今日 Boss 榜差距 → Gear / Adventure 补 build → 回 Boss 打更高分 → 回榜确认最佳成绩。";
    }

    return {
      title: title,
      rankText: rankText,
      summaryText: summaryText,
      whyRankText: whyRankText,
      compareText: compareText,
      gapText: gapText,
      actionText: actionText,
      climbText: climbText,
      priorityText: priorityText,
      farmText: farmText,
      proofText: proofText,
      loopText: loopText,
      primaryAction: primaryAction,
      myRow: myRow,
      aheadRow: aheadRow,
      myIndex: myIndex,
      gapToNext: gapToNext,
      boardType: boardType
    };
  }

  function renderLeaderboardWhyCard(insight) {
    return [
      "<div class='tile rank-insight is-featured'>",
      "<p class='eyebrow'>位置解释</p>",
      "<h3>为什么现在在这里</h3>",
      "<p>" + safe(insight.rankText) + "</p>",
      renderDecisionGrid([
        { label: "差距", text: insight.gapText },
        { label: "原因", text: insight.whyRankText },
        { label: "先看懂", text: insight.summaryText }
      ], "is-compact"),
      "</div>"
    ].join("");
  }

  function renderLeaderboardActionCard(insight, boardType, todayDailyBoss) {
    var buttons = [];
    var bossMapId = todayDailyBoss && todayDailyBoss.mapId ? todayDailyBoss.mapId : activeMapId;
    var primaryAction = insight.primaryAction || { label: "去 Gear 补强", tab: "gear", mapId: "" };

    buttons.push(buildJumpButton(primaryAction.label, primaryAction.tab, primaryAction.mapId || "", true));

    if (boardType === "today_boss") {
      if (primaryAction.tab !== "boss") {
        buttons.push(buildJumpButton("去 Boss 追分", "boss", bossMapId, false));
      }
      if (primaryAction.tab !== "gear") {
        buttons.push(buildJumpButton("去 Gear 补强", "gear", "", false));
      }
    } else {
      if (primaryAction.tab !== "gear") {
        buttons.push(buildJumpButton("去 Gear 补强", "gear", "", false));
      }
      if (primaryAction.tab !== "adventure") {
        buttons.push(buildJumpButton("去刷图", "adventure", activeMapId, false));
      }
      if (primaryAction.tab !== "boss") {
        buttons.push(buildJumpButton("去 Boss", "boss", bossMapId, false));
      }
    }

    return [
      "<div class='tile'>",
      "<p class='eyebrow'>下一步</p>",
      "<h3>先补这一下</h3>",
      "<p>" + safe(insight.actionText) + "</p>",
      renderDecisionGrid([
        { label: "先补什么", text: insight.priorityText },
        { label: "下一站", text: insight.farmText },
        { label: "做完回哪", text: "回 Rank / Boss 验收变化" }
      ], "is-compact"),
      "<p class='meta'>冲线目标：" + safe(insight.climbText) + "</p>",
      "<div class='button-row'>" + buttons.join("") + "</div>",
      "</div>"
    ].join("");
  }

  function renderLeaderboardDisplayCards(rows, insight, boardType, todayDailyBoss) {
    var primaryRow = insight.myRow || rows[0] || insight.aheadRow || null;

    if (!primaryRow) {
      return "";
    }

    return renderLeaderboardDisplayCard(primaryRow, insight, boardType, todayDailyBoss, !!primaryRow.isYou);
  }

  function renderLeaderboardDisplayCard(row, insight, boardType, todayDailyBoss, isPrimary) {
    var model = buildLeaderboardDisplayModel(row, insight, boardType, todayDailyBoss, isPrimary);
    var previewId = boardType + "-" + normalizeNumber(row && row.rank, 0) + "-" + (row && row.isYou ? "you" : "peer");
    var jumpAction = boardType === "today_boss"
      ? buildJumpButton("去 Boss 追分", "boss", todayDailyBoss && todayDailyBoss.mapId ? todayDailyBoss.mapId : activeMapId, false)
      : buildJumpButton("去 Gear 补强", "gear", "", false);
    var previewButtonLabel = model.isSample ? "看参考卡" : "看详情";
    var copyButtonLabel = model.isSample ? "复制参考文案" : "复制文案";
    var cardEyebrow = model.isSample ? model.statusText : "排名展示卡";
    var previewEyebrow = model.isSample ? "参考卡预览" : "分享卡预览";
    var decisionReturnText = (model.farmText || "按当前推荐路线补 build") + "，再回 Rank 验收。";

    return [
      "<div class='tile rank-display-card" + (row && row.isYou ? " is-featured" : "") + (model.isSample ? " is-sample" : "") + (getRecentTabMoment("leaderboard", 14000) ? " is-live" : "") + "'>",
      "<p class='eyebrow'>" + safe(cardEyebrow) + "</p>",
      renderMomentPills([
        { label: model.isSample ? "参考样本" : "真实成绩", tone: model.isSample ? "is-preview" : "is-live" },
        { label: boardType === "today_boss" ? "打完回 Boss / Rank" : "做完回 Rank", tone: "is-recommended" },
        getRecentTabMoment("leaderboard", 14000) ? { label: "刚刷新", tone: "is-claimable" } : null
      ], "is-compact"),
      "<div class='rank-display-hero'><strong>" + safe(model.rankBadge) + "</strong><div><h3>" + safe(model.heading) + "</h3><p class='meta'>" + safe(model.statusText) + "</p></div></div>",
      "<p>" + safe(model.heroLine) + "</p>",
      "<div class='rank-display-stats'><div><span>成绩</span><strong>" + safe(model.scoreText) + "</strong></div><div><span>差距</span><strong>" + safe(model.deltaText) + "</strong></div><div><span>亮点</span><strong>" + safe(model.highlightText) + "</strong></div></div>",
      renderDecisionGrid([
        { label: "我现在在哪", text: model.compareText },
        { label: "先补什么", text: model.priorityText },
        { label: "做完回哪", text: decisionReturnText }
      ], "is-compact"),
      "<p class='meta'>Build：" + safe(model.buildLabel) + " · 值得晒：" + safe(model.proofText) + "</p>",
      "<div class='button-row'><button type='button' data-share-preview='" + safe(previewId) + "'>" + safe(previewButtonLabel) + "</button><button type='button' data-share-copy='" + safe(previewId) + "' data-default-label='" + safe(copyButtonLabel) + "'>" + safe(copyButtonLabel) + "</button>" + jumpAction + "</div>",
      "<div class='share-preview' data-share-preview-body='" + safe(previewId) + "' hidden><div class='share-preview-card'><p class='eyebrow'>" + safe(previewEyebrow) + "</p><h3>" + safe(model.heading) + "</h3><p>" + safe(model.heroLine) + "</p>" + renderDecisionGrid([{ label: "成绩", text: model.scoreText + " · " + model.deltaText }, { label: "先补", text: model.priorityText }, { label: "下一站", text: model.farmText }], "is-compact") + "<p class='meta'>亮点：" + safe(model.highlightText) + " · Build " + safe(model.buildLabel) + "</p><p class='share-preview-copy'>" + safe(model.shareCopy) + "</p></div><pre class='share-export-payload' data-share-copy-body='" + safe(previewId) + "'>" + safe(model.exportText) + "</pre><p class='meta'>" + safe(model.isSample ? "这是榜单参考样本，不代表你当前已经拿到这条成绩。" : "这里只保留玩家可复制文案，方便直接分享。") + "</p></div>",
      "</div>"
    ].join("");
  }

  function buildLeaderboards(bridge, gachaState, todayDailyBoss, bossState) {
    var player = buildPlayerBoardRow(bridge, gachaState, todayDailyBoss, bossState);
    var others = [
      { name: "北斗剑心", tag: "木·青龙", score: 1580, dayMaster: "木", bossScore: 780, isYou: false },
      { name: "离火行者", tag: "火·朱雀", score: 1510, dayMaster: "火", bossScore: 760, isYou: false },
      { name: "坤岳守门", tag: "土·麒麟", score: 1490, dayMaster: "土", bossScore: 735, isYou: false },
      { name: "玄潮谋士", tag: "水·玄武", score: 1465, dayMaster: "水", bossScore: 710, isYou: false },
      { name: "庚刃夜行", tag: "金·白虎", score: 1430, dayMaster: "金", bossScore: 700, isYou: false }
    ];
    var totalRows = (player.scoreEligible ? [player] : []).concat(others);
    var bossRows = (player.bossEligible ? [player] : []).concat(others);
    var todayBossTag = todayDailyBoss ? todayDailyBoss.boss.name : "今日Boss";
    var todayBossBoard;

    var totalBoard = sortByScore(totalRows.map(function (row) {
      return { name: row.name, tag: row.tag, score: row.score, isYou: row.isYou };
    }));

    var sameDayMasterBoard = sortByScore(totalRows.filter(function (row) {
      return row.dayMaster === player.dayMaster;
    }).map(function (row) {
      return { name: row.name, tag: row.tag, score: row.score, isYou: row.isYou };
    }));

    todayBossBoard = sortByScore(bossRows.map(function (row) {
      return { name: row.name, tag: todayBossTag, score: row.bossScore, isYou: row.isYou };
    }));

    if (serverCache.dailyBossBoard && Array.isArray(serverCache.dailyBossBoard.rows) && serverCache.dailyBossBoard.rows.length) {
      todayBossBoard = sortByScore(serverCache.dailyBossBoard.rows.map(function (row) {
        return {
          name: row.name,
          tag: row.tag || todayBossTag,
          rank: row.rank,
          detail: row.detail || "",
          summary: row.summary || null,
          shareCard: row.shareCard || null,
          score: normalizeNumber(row.score, 0),
          isYou: !!row.isYou
        };
      }));
    }

    if (serverCache.powerBoards && Array.isArray(serverCache.powerBoards.totalRows) && serverCache.powerBoards.totalRows.length) {
      totalBoard = sortByScore(serverCache.powerBoards.totalRows.map(function (row) {
        return {
          name: row.name,
          tag: row.tag,
          rank: row.rank,
          dayMaster: row.dayMaster,
          detail: row.detail || "",
          summary: row.summary || null,
          shareCard: row.shareCard || null,
          score: normalizeNumber(row.score, 0),
          isYou: !!row.isYou
        };
      }));
    }

    if (serverCache.powerBoards && Array.isArray(serverCache.powerBoards.sameDayMasterRows) && serverCache.powerBoards.sameDayMasterRows.length) {
      sameDayMasterBoard = sortByScore(serverCache.powerBoards.sameDayMasterRows.map(function (row) {
        return {
          name: row.name,
          tag: row.tag,
          rank: row.rank,
          dayMaster: row.dayMaster,
          detail: row.detail || "",
          summary: row.summary || null,
          shareCard: row.shareCard || null,
          score: normalizeNumber(row.score, 0),
          isYou: !!row.isYou
        };
      }));
    }

    return {
      total: hydrateBoardRows("total", totalBoard, todayDailyBoss),
      same_day_master: hydrateBoardRows("same_day_master", sameDayMasterBoard, todayDailyBoss),
      today_boss: hydrateBoardRows("today_boss", todayBossBoard, todayDailyBoss)
    };
  }

  function hydrateBoardRows(boardType, rows, todayDailyBoss) {
    return sortByScore(rows || []).map(function (row, index) {
      var hydrated = Object.assign({}, row || {});
      var rank = normalizeNumber(hydrated.rank, index + 1);
      var summary = hydrated.summary || buildFallbackBoardSummary(boardType, hydrated, todayDailyBoss);
      var shareCard = Object.assign({
        boardName: getBoardName(boardType, todayDailyBoss),
        rank: rank,
        rankText: "第 " + rank + " 名",
        scoreLabel: boardType === "today_boss" ? "Boss 分" : "总战力",
        scoreValue: normalizeNumber(hydrated.score, 0),
        heroLine: summary.dayMaster ? (summary.dayMaster + "命 · " + (summary.className || "未开局")) : (hydrated.name || "当前角色"),
        buildLabel: hydrated.tag || summary.buildTag || "当前 build",
        highlight: summary.mainWeapon ? ("主武器 " + summary.mainWeapon) : (summary.setLabel || summary.rewardFocus || hydrated.detail || "继续优化 build"),
        caption: hydrated.detail || summary.scoreBreakdown || summary.lastMechanicSummary || summary.setNextStep || "继续冲榜",
        cta: "测测你的命格能冲到第几"
      }, hydrated.shareCard || {});

      if (!shareCard.copy) {
        shareCard.copy = buildShareCardCopy(shareCard.boardName, hydrated, shareCard);
      }

      hydrated.rank = rank;
      hydrated.summary = summary;
      hydrated.shareCard = shareCard;
      return hydrated;
    });
  }

  function buildFallbackBoardSummary(boardType, row, todayDailyBoss) {
    if (boardType === "today_boss") {
      return {
        bossName: todayDailyBoss && todayDailyBoss.boss ? todayDailyBoss.boss.name : "今日 Boss",
        rewardFocus: row.detail || "继续追更高分",
        bestScore: normalizeNumber(row.score, 0),
        victories: 0,
        attempts: 0,
        firstClearAchieved: false,
        className: "未开局",
        dayMaster: row.dayMaster || "无",
        buildTag: row.tag || "当前 build",
        setLabel: "继续配装",
        totalEnhancementLevel: 0,
        mainWeapon: ""
      };
    }

    return {
      className: "未开局",
      dayMaster: row.dayMaster || "无",
      buildTag: row.tag || "当前 build",
      totalPower: normalizeNumber(row.score, 0),
      basePower: normalizeNumber(row.score, 0),
      gearSwapPower: 0,
      enhancementPower: 0,
      setBonusPower: 0,
      totalEnhancementLevel: 0,
      equippedCount: 0,
      setActive: false,
      setCount: 0,
      setTier: 0,
      setLabel: row.detail || "未激活套装",
      setNextStep: "优先补齐同套 2 件",
      scoreBreakdown: row.detail || "先补装、强化，再回来冲榜",
      mainWeapon: ""
    };
  }

  function getBoardName(boardType, todayDailyBoss) {
    if (boardType === "same_day_master") {
      return "同日主榜";
    }
    if (boardType === "today_boss") {
      return (todayDailyBoss && todayDailyBoss.boss ? todayDailyBoss.boss.name : "今日 Boss") + " 榜";
    }
    return "总战力榜";
  }

  function buildShareCardCopy(boardName, row, shareCard) {
    var parts = [
      "我在" + boardName + "冲到第 " + normalizeNumber(shareCard.rank != null ? shareCard.rank : row.rank, 0) + " 名",
      "当前" + (shareCard.scoreLabel || "分数") + " " + normalizeNumber(shareCard.scoreValue != null ? shareCard.scoreValue : row.score, 0),
      shareCard.buildLabel || row.tag || "当前 build"
    ];

    if (shareCard.highlight) {
      parts.push("亮点：" + shareCard.highlight);
    }
    if (shareCard.caption) {
      parts.push("下一步：" + shareCard.caption);
    } else if (shareCard.cta) {
      parts.push(shareCard.cta);
    }

    return parts.join("，") + "。";
  }

  function buildPowerCompareText(mySummary, aheadSummary) {
    var notes = [];

    if (!mySummary) {
      return "你还没形成稳定的配装与强化结构。";
    }
    if (normalizeNumber(mySummary.equippedCount, 0) < 5) {
      notes.push("你还有 " + Math.max(0, 5 - normalizeNumber(mySummary.equippedCount, 0)) + " 个槽位没吃满");
    }
    if (aheadSummary && normalizeNumber(aheadSummary.totalEnhancementLevel, 0) > normalizeNumber(mySummary.totalEnhancementLevel, 0)) {
      notes.push("前一名总强化多 " + (normalizeNumber(aheadSummary.totalEnhancementLevel, 0) - normalizeNumber(mySummary.totalEnhancementLevel, 0)) + " 级");
    }
    if (aheadSummary && normalizeNumber(aheadSummary.setTier, 0) > normalizeNumber(mySummary.setTier, 0)) {
      notes.push("前一名套装档位更高（" + (aheadSummary.setLabel || "已成型") + "）");
    } else if (aheadSummary && normalizeNumber(aheadSummary.setCount, 0) > normalizeNumber(mySummary.setCount, 0)) {
      notes.push("前一名同套多 " + (normalizeNumber(aheadSummary.setCount, 0) - normalizeNumber(mySummary.setCount, 0)) + " 件");
    }
    if (!notes.length) {
      notes.push("主要差在 build 转化效率，优先把强化和套装收益做满");
    }
    return notes.join("；") + "。";
  }

  function buildBossCompareText(mySummary, aheadSummary) {
    var notes = [];

    if (!mySummary) {
      return "你还没有形成有效的 Boss 记分。";
    }
    if (!mySummary.firstClearAchieved && aheadSummary && aheadSummary.firstClearAchieved) {
      notes.push("前一名已首通而你还没首通");
    }
    if (aheadSummary && normalizeNumber(aheadSummary.victories, 0) > normalizeNumber(mySummary.victories, 0)) {
      notes.push("前一名多 " + (normalizeNumber(aheadSummary.victories, 0) - normalizeNumber(mySummary.victories, 0)) + " 场有效胜利");
    }
    if (aheadSummary && normalizeNumber(aheadSummary.bestScore, 0) > normalizeNumber(mySummary.bestScore, 0)) {
      notes.push("榜分还差 " + (normalizeNumber(aheadSummary.bestScore, 0) - normalizeNumber(mySummary.bestScore, 0)));
    }
    if (aheadSummary && aheadSummary.lastMechanicSummary && aheadSummary.lastMechanicSummary !== mySummary.lastMechanicSummary) {
      notes.push("对手机制处理更稳定");
    } else if (aheadSummary && aheadSummary.lastFateSummary && aheadSummary.lastFateSummary !== mySummary.lastFateSummary) {
      notes.push("对手命格贴合更好");
    }
    if (!notes.length) {
      notes.push("关键差距在于更稳定地把 build 转成 Boss 有效分");
    }
    return notes.join("；") + "。";
  }

  function buildPowerPriorityText(mySummary, aheadSummary) {
    if (!mySummary) {
      return "先在 Gear 换上可穿戴命器，做出第一套有效 build。";
    }
    if (normalizeNumber(mySummary.equippedCount, 0) < 5) {
      return "先补齐 " + Math.max(0, 5 - normalizeNumber(mySummary.equippedCount, 0)) + " 个空槽，空位是最直接的战力损失。";
    }
    if (aheadSummary && normalizeNumber(aheadSummary.totalEnhancementLevel, 0) > normalizeNumber(mySummary.totalEnhancementLevel, 0)) {
      return "先强化主武器 / 核心，至少补 " + (normalizeNumber(aheadSummary.totalEnhancementLevel, 0) - normalizeNumber(mySummary.totalEnhancementLevel, 0)) + " 级总强化。";
    }
    if (!mySummary.setActive || normalizeNumber(mySummary.setCount, 0) < 2) {
      return "先凑同套 2 件，尽快吃到第一档套装收益。";
    }
    if (aheadSummary && normalizeNumber(aheadSummary.setCount, 0) > normalizeNumber(mySummary.setCount, 0)) {
      return "先补同套 " + (normalizeNumber(aheadSummary.setCount, 0) - normalizeNumber(mySummary.setCount, 0)) + " 件，追上前一名的套装完成度。";
    }
    if (normalizeNumber(mySummary.setCount, 0) < 4) {
      return "先补到 4 件套，把当前 build 的套装收益做满。";
    }
    return "继续抬主武器 / 核心的强化和稀有度，把 build 转化率做满。";
  }

  function buildBossPriorityText(mySummary, aheadSummary, challengeState, fateAdvice) {
    if (!mySummary || !mySummary.firstClearAchieved) {
      return "先拿到首通和第一条有效 Boss 成绩，再谈追榜分。";
    }
    if (fateAdvice && fateAdvice.tier === "risky") {
      return "先补顺命 / 克制件，降低承压后再把剩余记分次数打满。";
    }
    if (aheadSummary && normalizeNumber(aheadSummary.victories, 0) > normalizeNumber(mySummary.victories, 0)) {
      return "优先把有效胜场补上，Boss 榜更吃稳定完成度。";
    }
    if (aheadSummary && normalizeNumber(aheadSummary.bestScore, 0) > normalizeNumber(mySummary.bestScore, 0)) {
      return challengeState.remaining > 0
        ? "先补一点伤害 / 机制处理，再用剩余 " + challengeState.remaining + " 次记分挑战追分。"
        : "今天先补 build 和路线，明天优先把更高分那一把打出来。";
    }
    return "继续优化机制处理和命格贴合，把每次挑战都尽量打成有效高分。";
  }

  function buildCompetitionFarmPlan(boardType, mySummary, todayDailyBoss, fateAdvice) {
    var adventureFocus = serverCache.playerState && serverCache.playerState.adventureAdvice ? serverCache.playerState.adventureAdvice : null;
    var targetMapId = adventureFocus && adventureFocus.recommendedMapId ? adventureFocus.recommendedMapId : activeMapId;
    var reason = adventureFocus && adventureFocus.reasonText ? adventureFocus.reasonText : "按当前 build 缺口补件";
    var map;
    var mapView;
    var mapName;

    if (boardType === "today_boss") {
      targetMapId = todayDailyBoss && todayDailyBoss.mapId ? todayDailyBoss.mapId : targetMapId;
      if (fateAdvice && fateAdvice.tier === "risky") {
        reason = "先补顺命 / 克制件，把今日 Boss 的承压降下来";
      } else if (!mySummary || !mySummary.firstClearAchieved) {
        reason = "先沿着今日 Boss 追件路线补一轮，优先把首通打出来";
      } else {
        reason = "延续今日 Boss 追件路线补一轮，再回来追更高分";
      }
    } else if (!mySummary || normalizeNumber(mySummary.equippedCount, 0) < 5 || normalizeNumber(mySummary.setCount, 0) < 2) {
      targetMapId = "minggong_trial";
      reason = "补槽位、防具核心和开荒底子，先把基础 build 立起来";
    } else if (normalizeNumber(mySummary.setCount, 0) < 4 || normalizeNumber(mySummary.totalEnhancementLevel, 0) < 8) {
      targetMapId = "wuxing_realm";
      reason = "补主力输出件和第 4 件套，把最直观的战力涨幅做出来";
    } else {
      targetMapId = "liunian_tribulation";
      reason = boardType === "same_day_master"
        ? "追高稀有核心，继续拉开同日主 build 上限"
        : "追高稀有核心和 Boss 毕业件，把总榜上限再抬一档";
    }

    map = mapById[targetMapId] || (adventureFocus && mapById[adventureFocus.recommendedMapId] ? mapById[adventureFocus.recommendedMapId] : null);
    mapView = map ? buildMapView(map, 0, todayDailyBoss) : null;
    mapName = map ? map.name : (adventureFocus && adventureFocus.recommendedMapName ? adventureFocus.recommendedMapName : "当前推荐地图");

    return {
      mapId: map ? map.id : targetMapId,
      mapName: mapName,
      text: mapName + "：" + reason + (mapView && mapView.chaseTargetText && mapView.chaseTargetText !== "-" ? " · 本轮追 " + mapView.chaseTargetText : "")
    };
  }

  function buildLeaderboardProofText(boardType, summary, row, shareCard) {
    var notes = [];

    if (boardType === "today_boss") {
      if (summary && summary.firstClearAchieved) {
        notes.push("已首通");
      }
      if (summary && normalizeNumber(summary.victories, 0) > 0) {
        notes.push("胜利 " + normalizeNumber(summary.victories, 0) + " 场");
      }
      if (summary && summary.lastMechanicSummary) {
        notes.push(summary.lastMechanicSummary);
      } else if (summary && summary.lastFateSummary) {
        notes.push(summary.lastFateSummary);
      }
    } else {
      if (shareCard && shareCard.buildLabel) {
        notes.push(shareCard.buildLabel);
      }
      if (summary && summary.setLabel) {
        notes.push(summary.setLabel);
      }
      if (summary && normalizeNumber(summary.totalEnhancementLevel, 0) > 0) {
        notes.push("强化 +" + normalizeNumber(summary.totalEnhancementLevel, 0));
      }
      if (summary && summary.mainWeapon) {
        notes.push("主武器 " + summary.mainWeapon);
      }
    }

    if (!notes.length && shareCard && shareCard.highlight) {
      notes.push(shareCard.highlight);
    }
    if (!notes.length && row && row.detail) {
      notes.push(row.detail);
    }
    return notes.length ? notes.slice(0, 3).join(" · ") : "继续把这轮 build 做成一张更能比较的成绩卡。";
  }

  function buildBenchmarkLeadText(boardType, summary, row, shareCard) {
    var notes = [];

    if (boardType === "today_boss") {
      if (summary && summary.firstClearAchieved) {
        notes.push("已首通");
      }
      if (summary && normalizeNumber(summary.victories, 0) > 0) {
        notes.push("胜利 " + normalizeNumber(summary.victories, 0) + " 场");
      }
      if (summary && summary.lastMechanicSummary) {
        notes.push(summary.lastMechanicSummary);
      } else if (summary && summary.lastFateSummary) {
        notes.push(summary.lastFateSummary);
      }
    } else {
      if (summary && summary.setLabel) {
        notes.push(summary.setLabel);
      }
      if (summary && normalizeNumber(summary.totalEnhancementLevel, 0) > 0) {
        notes.push("强化 +" + normalizeNumber(summary.totalEnhancementLevel, 0));
      }
      if (summary && summary.mainWeapon) {
        notes.push("主武器 " + summary.mainWeapon);
      }
    }

    if (!notes.length && shareCard && shareCard.highlight) {
      notes.push(shareCard.highlight);
    }
    if (!notes.length && row && row.detail) {
      notes.push(row.detail);
    }
    return notes.length ? ("这名对手当前靠 " + notes.slice(0, 3).join(" · ") + " 领先。") : "这是当前更成型的榜单样本。";
  }

  function getBoardScoreUnit(boardType) {
    return boardType === "today_boss" ? "榜分" : "战力";
  }

  function buildBoardLeadGapText(row, insight, boardType) {
    var lead;

    if (!row || row.isYou) {
      return insight && insight.gapText ? insight.gapText : "暂无差距信息";
    }
    if (!insight || !insight.myRow) {
      return "当前榜单参考样本。";
    }

    lead = Math.max(0, normalizeNumber(row.score, 0) - normalizeNumber(insight.myRow.score, 0));
    return lead > 0 ? ("当前领先你 " + lead + " " + getBoardScoreUnit(boardType) + "。") : "这是你当前要追的榜单样本。";
  }

  function buildShareExportText(fields, shareCopy) {
    return fields.map(function (field) {
      return field.label + ": " + field.value;
    }).concat(["分享文案: " + shareCopy]).join("\n");
  }

  function buildSharePayloadText(payload) {
    return JSON.stringify(payload, null, 2);
  }

  function buildEnhanceFocusText(boardType, summary, aheadSummary) {
    var weaponName = summary && summary.mainWeapon ? summary.mainWeapon : "";

    if (weaponName) {
      return boardType === "today_boss"
        ? "最该先抬「" + weaponName + "」，这是当前最直接的 Boss 伤害兑现位。"
        : "最该先强化「" + weaponName + "」，这是当前最直接的战力兑现位。";
    }
    if (aheadSummary && aheadSummary.mainWeapon) {
      return "先把主武器 / 核心的强化档追上前一名的主输出件。";
    }
    return boardType === "today_boss"
      ? "先抬主武器 / 核心，再补一件顺命 / 克制件，最容易把 build 兑现成 Boss 榜分。"
      : "先抬主武器 / 核心，再补齐同套件数，把最短的战力差直接补掉。";
  }

  function buildDailyHighlightText(boardType, todayDailyBoss, todayRecord, challengeState) {
    var bossName = todayDailyBoss && todayDailyBoss.boss ? todayDailyBoss.boss.name : "今日 Boss";
    var remaining = challengeState ? normalizeNumber(challengeState.remaining, 0) : 0;

    if (boardType === "today_boss") {
      if (!todayRecord.firstClearAchieved) {
        return bossName + " 首通未拿，首通奖励和 Boss 榜会一起开启。";
      }
      return bossName + " · 最佳分 " + todayRecord.bestScore + " / 胜利 " + todayRecord.victories + " 场" +
        (remaining > 0 ? " / 还剩 " + remaining + " 次记分" : " / 今日记分已打满");
    }
    if (!todayRecord.firstClearAchieved) {
      return bossName + " 仍是今日最值的验证位：首通后会立刻解锁奖励与 Boss 榜。";
    }
    return bossName + " · 已首通 / 最佳分 " + todayRecord.bestScore + (remaining > 0 ? " / 还能继续追分" : " / 今日记分已打满");
  }

  function buildBossReplayText(insight, todayDailyBoss, todayRecord, challengeState) {
    var bossName = todayDailyBoss && todayDailyBoss.boss ? todayDailyBoss.boss.name : "今日 Boss";
    var remaining = challengeState ? normalizeNumber(challengeState.remaining, 0) : 0;

    if (!todayRecord.firstClearAchieved) {
      return bossName + " 的首通奖励、活动兑换和今日 Boss 榜会一起开启，今天第一把价值最高。";
    }
    if (insight && insight.gapToNext > 0 && remaining > 0) {
      return "离前一名只差 " + insight.gapToNext + " 榜分，今天还剩 " + remaining + " 次记分挑战，是最值得立刻再打一轮的窗口。";
    }
    if (remaining > 0) {
      return "今天还剩 " + remaining + " 次记分挑战，补完 build 后马上能验证这轮提升有没有变成更高榜分。";
    }
    return "今天记分已打满，但现在补好的 build 会直接决定明天第一把 Boss 能冲到哪。";
  }

  function buildShareSummaryLine(boardName, row, insight, boardType, todayDailyBoss, farmPlan, summary, challengeState) {
    var gapText = insight && insight.gapToNext > 0
      ? ("离前一名只差 " + insight.gapToNext + " " + getBoardScoreUnit(boardType))
      : (insight && insight.myIndex === 0 ? "已经站上当前榜首" : "已经拿到可追位置");
    var bossName = todayDailyBoss && todayDailyBoss.boss ? todayDailyBoss.boss.name : "今日 Boss";
    var enhanceTarget = summary && summary.mainWeapon ? ("「" + summary.mainWeapon + "」") : "主武器 / 核心";
    var rankText = "第 " + normalizeNumber(row && row.rank, 0) + " 名";
    var remainText = challengeState && challengeState.remaining > 0 ? "，今天还剩 " + challengeState.remaining + " 次 Boss 记分机会" : "";

    return "今天在" + boardName + "冲到" + rankText + "，" + gapText + "；补" + (farmPlan.mapName || "推荐图") + "、强化" + enhanceTarget + "后，再打一轮" + bossName + "就能回榜验收" + remainText + "。";
  }

  function buildCompetitionStory(boardType, rows, insight, todayDailyBoss, bossState) {
    var resolvedRows = rows || [];
    var resolvedInsight = insight || buildLeaderboardInsight(boardType, resolvedRows, todayDailyBoss, bossState);
    var row = resolvedInsight && resolvedInsight.myRow ? resolvedInsight.myRow : resolvedRows[0];
    var isSample = !(resolvedInsight && resolvedInsight.myRow && resolvedInsight.myRow.isYou);
    var todayRecord = getBossRecordForDate(bossState, todayKey(), todayDailyBoss);
    var challengeState = getBossChallengeState(bossState);
    var boardName = getBoardName(boardType, todayDailyBoss);
    var exportDate = todayKey();
    var summary;
    var aheadSummary;
    var fateAdvice = serverCache.playerState && serverCache.playerState.dailyBoss ? serverCache.playerState.dailyBoss.fateAdvice : null;
    var farmPlan;
    var model;
    var enhanceText;
    var dailyHighlightText;
    var bossReplayText;
    var summaryLine;
    var exportText;
    var payloadText;

    if (!row) {
      return null;
    }

    summary = row.summary || buildFallbackBoardSummary(boardType, row, todayDailyBoss);
    aheadSummary = resolvedInsight && resolvedInsight.aheadRow
      ? (resolvedInsight.aheadRow.summary || buildFallbackBoardSummary(boardType, resolvedInsight.aheadRow, todayDailyBoss))
      : null;
    farmPlan = buildCompetitionFarmPlan(boardType, summary, todayDailyBoss, fateAdvice);
    model = buildLeaderboardDisplayModel(row, resolvedInsight, boardType, todayDailyBoss, true);
    enhanceText = buildEnhanceFocusText(boardType, summary, aheadSummary);
    dailyHighlightText = buildDailyHighlightText(boardType, todayDailyBoss, todayRecord, challengeState);
    bossReplayText = buildBossReplayText(resolvedInsight, todayDailyBoss, todayRecord, challengeState);
    summaryLine = buildShareSummaryLine(boardName, row, resolvedInsight, boardType, todayDailyBoss, farmPlan, summary, challengeState);
    if (isSample) {
      summaryLine = "你当前还没有这张榜的真实成绩；下面这张卡只是参考样本，先按建议打一轮，再回来对照自己的位置。";
    }
    exportText = buildShareExportText([
      { label: "卡片类型", value: isSample ? "参考样本" : "当前成绩" },
      { label: "榜单", value: boardName },
      { label: "当前名次", value: (isSample ? "参考第 " : "第 ") + normalizeNumber(row.rank, 0) + " 名" },
      { label: "当前成绩", value: (isSample ? "参考成绩 · " : "") + model.scoreText },
      { label: "离前一名", value: resolvedInsight && resolvedInsight.gapText ? resolvedInsight.gapText : model.deltaText },
      { label: "build / 角色亮点", value: model.buildLabel + " · " + model.highlightText },
      { label: "今日 Boss / 当日亮点", value: dailyHighlightText },
      { label: "最该刷图", value: farmPlan.text },
      { label: "最该强化", value: enhanceText },
      { label: "为什么还值得打一轮 Boss", value: bossReplayText },
      { label: "打完回榜", value: resolvedInsight && resolvedInsight.loopText ? resolvedInsight.loopText : "回榜确认名次有没有真的上涨" },
      { label: "一句话总结", value: summaryLine }
    ], summaryLine);
    payloadText = buildSharePayloadText({
      exportDate: exportDate,
      cardType: isSample ? "sample_preview" : "current_result",
      boardType: boardType,
      boardName: boardName,
      rank: normalizeNumber(row.rank, 0),
      score: {
        value: normalizeNumber(row.score, 0),
        text: model.scoreText,
        unit: getBoardScoreUnit(boardType)
      },
      gapToNext: resolvedInsight && resolvedInsight.gapToNext > 0 ? resolvedInsight.gapToNext : 0,
      gapText: resolvedInsight && resolvedInsight.gapText ? resolvedInsight.gapText : model.deltaText,
      buildLabel: model.buildLabel,
      highlight: model.highlightText,
      proof: model.proofText,
      dailyHighlight: dailyHighlightText,
      farm: {
        mapId: farmPlan.mapId || activeMapId,
        mapName: farmPlan.mapName || "当前推荐地图",
        text: farmPlan.text
      },
      enhance: enhanceText,
      bossReplay: bossReplayText,
      comeback: resolvedInsight && resolvedInsight.loopText ? resolvedInsight.loopText : "回榜确认名次有没有真的上涨",
      summary: summaryLine
    });

    return {
      boardName: boardName,
      rankText: isSample ? ("参考第 " + normalizeNumber(row.rank, 0) + " 名") : ("第 " + normalizeNumber(row.rank, 0) + " 名"),
      rankBadge: isSample ? "样本" : ("#" + normalizeNumber(row.rank, 0)),
      scoreText: isSample ? ("参考成绩 · " + model.scoreText) : model.scoreText,
      gapText: resolvedInsight && resolvedInsight.gapText ? resolvedInsight.gapText : model.deltaText,
      buildLabel: model.buildLabel,
      highlightText: model.highlightText,
      proofText: isSample ? "这是榜单参考样本，不代表你当前已经拿到这条成绩。" : model.proofText,
      dailyHighlightText: dailyHighlightText,
      farmText: farmPlan.text,
      enhanceText: enhanceText,
      bossReplayText: bossReplayText,
      comebackText: resolvedInsight && resolvedInsight.loopText ? resolvedInsight.loopText : "打完回榜确认变化",
      summaryLine: summaryLine,
      exportText: exportText,
      payloadText: payloadText,
      isSample: isSample,
      tags: [
        { label: "状态", value: isSample ? "样本预览" : "当前真实成绩" },
        { label: "日期", value: formatDateLabel(exportDate) },
        { label: "榜单", value: boardName },
        { label: "Build", value: model.buildLabel },
        { label: "推荐图", value: farmPlan.mapName || "当前推荐地图" }
      ],
      primaryAction: resolvedInsight && resolvedInsight.primaryAction ? resolvedInsight.primaryAction : { label: "去 Gear 补强", tab: "gear", mapId: "" },
      bossMapId: todayDailyBoss && todayDailyBoss.mapId ? todayDailyBoss.mapId : activeMapId,
      farmMapId: farmPlan.mapId || activeMapId
    };
  }

  function renderShareReadyFlow(surfaceId, story) {
    var currentKey = surfaceId === "home" ? "leaderboard" : surfaceId;
    var steps = [
      { key: "leaderboard", label: "看榜读差距", detail: story.gapText },
      { key: story.primaryAction && story.primaryAction.tab ? story.primaryAction.tab : "gear", label: story.primaryAction && story.primaryAction.label ? story.primaryAction.label : "去 Gear 补强", detail: story.enhanceText },
      { key: "boss", label: "打一轮今日 Boss", detail: story.bossReplayText },
      { key: "leaderboard-return", label: "回榜确认上涨", detail: story.comebackText }
    ];

    return "<div class='share-ready-flow'>" + steps.map(function (step, index) {
      var isCurrent = step.key === currentKey || (currentKey === "leaderboard" && index === 0);
      return [
        "<div class='share-ready-step" + (isCurrent ? " is-current" : "") + "'>",
        "<span>" + (index + 1) + "</span>",
        "<strong>" + safe(step.label) + "</strong>",
        "<p>" + safe(step.detail) + "</p>",
        "</div>"
      ].join("");
    }).join("") + "</div>";
  }

  function renderShareReadySurface(surfaceId, boardType, rows, insight, todayDailyBoss, bossState) {
    var story = buildCompetitionStory(boardType, rows, insight, todayDailyBoss, bossState);
    var previewId;
    var shareButtons = [];
    var actionButtons = [];
    var copyLabel;
    var previewClosedLabel;
    var previewOpenLabel;

    if (!story) {
      return "";
    }

    previewId = surfaceId + "-share-ready-" + boardType;
    copyLabel = story.isSample ? "复制参考文案" : "复制分享文案";
    previewClosedLabel = story.isSample ? "展开参考卡" : "展开分享卡";
    previewOpenLabel = story.isSample ? "收起参考卡" : "收起分享卡";
    shareButtons.push("<button type='button' data-share-copy='" + safe(previewId) + "-export' data-default-label='" + safe(copyLabel) + "'>" + safe(copyLabel) + "</button>");
    shareButtons.push("<button type='button' data-share-preview='" + safe(previewId) + "' data-preview-closed-label='" + safe(previewClosedLabel) + "' data-preview-open-label='" + safe(previewOpenLabel) + "'>" + safe(previewClosedLabel) + "</button>");

    if (surfaceId === "home") {
      actionButtons.push(buildJumpButton("先去 Rank 看差距", "leaderboard", "", true));
      actionButtons.push(buildJumpButton("去今日 Boss", "boss", story.bossMapId, false));
      actionButtons.push(buildJumpButton("去刷推荐图", "adventure", story.farmMapId, false));
    } else if (surfaceId === "boss") {
      actionButtons.push(buildJumpButton("打完回榜复盘", "leaderboard", "", true));
      actionButtons.push(buildJumpButton("去 Gear 补强", "gear", "", false));
      actionButtons.push(buildJumpButton("去刷推荐图", "adventure", story.farmMapId, false));
    } else {
      actionButtons.push(buildJumpButton(story.primaryAction.label, story.primaryAction.tab, story.primaryAction.mapId || "", true));
      if (story.primaryAction.tab !== "boss") {
        actionButtons.push(buildJumpButton("去 Boss 兑现", "boss", story.bossMapId, false));
      }
      if (story.primaryAction.tab !== "adventure") {
        actionButtons.push(buildJumpButton("去刷推荐图", "adventure", story.farmMapId, false));
      }
    }

    return [
      "<div class='tile share-ready-surface" + (story.isSample ? " is-preview" : " is-featured") + "' style='margin-top:10px'>",
      "<div class='share-ready-head'>",
      "<div><p class='eyebrow'>" + safe(story.isSample ? "榜单样本 / 预览" : (surfaceId === "leaderboard" ? "真实成绩可晒卡" : "回流成品卡")) + "</p><h3>" + safe(story.boardName + " · " + story.rankText) + "</h3><p class='meta'>" + safe(story.summaryLine) + "</p></div>",
      "<div class='share-ready-badge'><span>" + safe(story.isSample ? "卡片类型" : "当前名次") + "</span><strong>" + safe(story.rankBadge) + "</strong><p>" + safe(story.scoreText) + "</p></div>",
      "</div>",
      "<div class='share-ready-card'>",
      "<p class='eyebrow'>" + safe(story.isSample ? "参考截图" : "适合截图传播") + "</p>",
      "<h3>" + safe(story.boardName + " · " + story.rankText) + "</h3>",
      renderDecisionGrid([
        { label: "我现在在哪", text: story.gapText + " · " + story.scoreText },
        { label: "先补什么", text: story.enhanceText },
        { label: "做完回哪", text: story.comebackText }
      ], "is-compact"),
      "<div class='share-ready-proof'><span>" + safe(story.isSample ? "可信提示" : "这轮最值得晒") + "</span><strong>" + safe(story.proofText) + "</strong></div>",
      "<p class='meta'>最该刷图：" + safe(story.farmText) + "</p>",
      "<p class='meta'>今日 Boss 理由：" + safe(story.bossReplayText) + "</p>",
      "<p class='meta share-ready-footer'>" + safe(story.isSample ? "这是参考卡，先做出真实成绩，再回来截自己的卡。" : "直接截图这张卡，或展开复制精简文案。") + "</p>",
      "</div>",
      "<div class='button-row share-ready-actions'>" + shareButtons.join("") + "</div>",
      "<div class='button-row'>" + actionButtons.join("") + "</div>",
      "<div class='share-preview share-ready-export' data-share-preview-body='" + safe(previewId) + "' hidden><div class='share-preview-card'><p class='eyebrow'>" + safe(story.isSample ? "参考详情" : "分享详情") + "</p><h3>" + safe(story.boardName + " · " + story.rankText) + "</h3>" + renderDecisionGrid([{ label: "离前一名", text: story.gapText }, { label: "最该刷图", text: story.farmText }, { label: "打完回榜", text: story.comebackText }], "is-compact") + renderShareReadyFlow(surfaceId, story) + "<p class='meta'>" + safe(story.dailyHighlightText) + " · " + safe(story.buildLabel + " · " + story.highlightText) + "</p></div><p class='meta'>" + safe(story.isSample ? "参考文案" : "分享文案") + "</p><pre class='share-export-payload' data-share-copy-body='" + safe(previewId) + "-export'>" + safe(story.exportText) + "</pre><p class='meta'>" + safe(story.isSample ? "这里只展示参考卡与参考文案，避免把样本误看成当前真实成绩。" : "这里只保留玩家可直接复制的文案，不再把调试型 JSON 暴露给试玩用户。") + "</p></div>",
      "</div>"
    ].join("");
  }

  function buildLeaderboardDisplayModel(row, insight, boardType, todayDailyBoss, isPrimary) {
    var shareCard = row && row.shareCard ? row.shareCard : {};
    var summary = row && row.summary ? row.summary : buildFallbackBoardSummary(boardType, row || {}, todayDailyBoss);
    var isSample = !(row && row.isYou);
    var hint = row && row.isYou ? "当前角色卡" : (isPrimary ? "榜单样本 · 仅供参考" : "前一名样本 · 仅供参考");
    var scoreText = (shareCard.scoreLabel || (boardType === "today_boss" ? "Boss 分" : "总战力")) + " " + normalizeNumber(shareCard.scoreValue != null ? shareCard.scoreValue : row.score, 0);
    var compareText = row && row.isYou
      ? (insight && insight.climbText ? insight.climbText : "继续冲榜")
      : buildBoardLeadGapText(row, insight, boardType);
    var deltaText = row && row.isYou
      ? (insight && insight.gapToNext > 0 ? ("差 " + insight.gapToNext + " " + getBoardScoreUnit(boardType)) : (insight && insight.myIndex === 0 ? "当前榜首" : "待冲榜"))
      : (insight && insight.myRow ? ("领先 " + Math.max(0, normalizeNumber(row.score, 0) - normalizeNumber(insight.myRow.score, 0)) + " " + getBoardScoreUnit(boardType)) : "榜单样本");
    var priorityText = row && row.isYou
      ? (insight && insight.priorityText ? insight.priorityText : "继续补当前 build")
      : buildBenchmarkLeadText(boardType, summary, row, shareCard);
    var farmText = row && row.isYou
      ? (insight && insight.farmText ? insight.farmText : "按当前推荐地图补件")
      : (shareCard.caption || row.detail || "可作为下一轮 build 参考");
    var proofText = buildLeaderboardProofText(boardType, summary, row, shareCard);
    var shareCopy = isSample
      ? ("参考样本：" + (shareCard.boardName || getBoardName(boardType, todayDailyBoss)) + " 当前可见 " + (shareCard.rankText || ("第 " + normalizeNumber(row && row.rank, 0) + " 名")) +
        "，成绩 " + scoreText + "。先去做出你的真实成绩，再回来对照这张样本卡。")
      : (shareCard.copy || buildShareCardCopy(shareCard.boardName || getBoardName(boardType, todayDailyBoss), row, shareCard));
    var exportText = buildShareExportText([
      { label: "卡片类型", value: isSample ? "参考样本" : "当前角色" },
      { label: "榜单", value: shareCard.boardName || getBoardName(boardType, todayDailyBoss) },
      { label: "名次", value: (isSample ? "参考" : "当前") + (shareCard.rankText || ("第 " + normalizeNumber(row && row.rank, 0) + " 名")) },
      { label: "角色", value: shareCard.heroLine || row.name || (isSample ? "榜单样本" : "当前角色") },
      { label: "标签", value: shareCard.buildLabel || row.tag || "当前 build" },
      { label: "成绩", value: scoreText },
      { label: "冲线", value: compareText },
      { label: "先补", value: priorityText },
      { label: "下一站", value: farmText },
      { label: "亮点", value: shareCard.highlight || row.detail || "继续优化 build" },
      { label: "值得晒", value: proofText }
    ], shareCopy);

    return {
      heading: (shareCard.boardName || getBoardName(boardType, todayDailyBoss)) + " · " + (isSample ? ("参考" + (shareCard.rankText || ("第 " + normalizeNumber(row && row.rank, 0) + " 名"))) : (shareCard.rankText || ("第 " + normalizeNumber(row && row.rank, 0) + " 名"))),
      rankBadge: isSample ? "样本" : ("#" + normalizeNumber(row && row.rank, 0)),
      statusText: hint,
      heroLine: shareCard.heroLine || row.name || (isSample ? "榜单样本" : "当前角色"),
      buildLabel: shareCard.buildLabel || row.tag || "当前 build",
      scoreText: scoreText,
      deltaText: deltaText,
      compareText: compareText,
      priorityText: priorityText,
      farmText: farmText,
      proofText: proofText,
      highlightText: shareCard.highlight || row.detail || "继续优化 build",
      shareCopy: shareCopy,
      exportText: exportText,
      isSample: isSample
    };
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return false;
      });
    }

    return new Promise(function (resolve) {
      var input;
      var ok = false;

      try {
        input = document.createElement("textarea");
        input.value = text;
        input.setAttribute("readonly", "readonly");
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.focus();
        input.select();
        ok = document.execCommand("copy");
        document.body.removeChild(input);
        resolve(!!ok);
      } catch (err) {
        if (input && input.parentNode) {
          input.parentNode.removeChild(input);
        }
        resolve(false);
      }
    });
  }

  function buildCompetitionFocus(boards, todayDailyBoss, bossState) {
    var challengeState = getBossChallengeState(bossState);
    var priority = ["today_boss", "same_day_master", "total"];
    var best = null;

    priority.forEach(function (boardType) {
      var insight = buildLeaderboardInsight(boardType, boards[boardType] || [], todayDailyBoss, bossState);
      var score = 0;

      if (boardType === "today_boss" && challengeState.remaining > 0) {
        score += 5;
      }
      if (insight.myIndex < 0) {
        score += 4;
      } else if (insight.gapToNext > 0) {
        score += 3;
      } else {
        score += 1;
      }
      if (boardType === "same_day_master") {
        score += 2;
      }
      if (boardType === "total") {
        score += 1;
      }
      if (!best || score > best.score) {
        best = { boardType: boardType, insight: insight, score: score };
      }
    });

    return best;
  }

  function buildNextSessionPlan(dailyState, signInState, opsState, commerceState, activityState, todayDailyBoss, bossState, guideState, boards) {
    var currentStep = getGuideStep(guideState && guideState.currentStepId);
    var todayRecord = getBossRecordForDate(bossState, todayKey(), todayDailyBoss);
    var competitionFocus = buildCompetitionFocus(boards || { total: [], same_day_master: [], today_boss: [] }, todayDailyBoss, bossState);
    var tomorrowDate = shiftDateKey(todayKey(), 1);
    var tomorrowBoss = buildDailyBoss(tomorrowDate);
    var tomorrowEvent = getPrimaryActiveEvent(tomorrowDate, activityState, tomorrowBoss, bossState);
    var nextSignIn = getNextSignInRewardPreview(signInState);
    var monthlyCard = opsState && opsState.monthlyCard ? opsState.monthlyCard : { status: "inactive" };
    var todayLeft = [];
    var tomorrowGets = [];
    var actionTab = "leaderboard";
    var actionMapId = "";
    var actionLabel = "去榜单复盘";
    var nextActionText = "";

    if (dailyState && !dailyState.specialClaims.loginReward) {
      todayLeft.push("登录奖励还没领");
    }
    if (signInState && signInState.canClaimToday) {
      todayLeft.push("Day " + signInState.currentDayIndex + " 签到还没领");
    }
    if (dailyState && !dailyState.specialClaims.freeDraw) {
      todayLeft.push("免费单抽还没用");
    }
    if (dailyState && todayRecord.firstClearAchieved && !dailyState.specialClaims.dailyBossFirstClear) {
      todayLeft.push("今日 Boss 首通奖励还没领");
    }
    if (currentStep && currentStep.id !== "loop_repeat") {
      todayLeft.push("主线还停在「" + currentStep.label + "」");
      actionTab = currentStep.primaryTab;
      actionMapId = currentStep.primaryTab === "boss" && todayDailyBoss && todayDailyBoss.mapId ? todayDailyBoss.mapId : (currentStep.primaryTab === "adventure" ? activeMapId : "");
      actionLabel = currentStep.primaryLabel;
    } else if (!todayRecord.firstClearAchieved) {
      todayLeft.push("今日 Boss 首通还没打");
      actionTab = "boss";
      actionMapId = todayDailyBoss && todayDailyBoss.mapId ? todayDailyBoss.mapId : "";
      actionLabel = "去今日 Boss";
    } else if (competitionFocus && competitionFocus.insight) {
      todayLeft.push(getBoardName(competitionFocus.boardType, todayDailyBoss) + " 还差一口气：" + competitionFocus.insight.climbText);
      actionTab = "leaderboard";
      actionLabel = "去榜单复盘";
    }

    if (!todayLeft.length) {
      todayLeft.push("首轮已经跑通，今天只剩按榜单差距补 build");
    }
    if (nextSignIn && nextSignIn.entry) {
      tomorrowGets.push("Day " + nextSignIn.day + " 签到：" + formatSignInReward(nextSignIn.entry));
    }
    if (tomorrowBoss) {
      tomorrowGets.push("明日 Boss：" + tomorrowBoss.boss.name + " · " + tomorrowBoss.rewardFocus);
    }
    if (monthlyCard.status === "active") {
      tomorrowGets.push("月卡日常：" + formatReward(MONTHLY_CARD_CONFIG.dailyReward));
    } else {
      tomorrowGets.push("月卡预期：开通后明天起每天可领 " + formatReward(MONTHLY_CARD_CONFIG.dailyReward));
    }
    if (tomorrowEvent) {
      tomorrowGets.push(tomorrowEvent.claimable ? tomorrowEvent.config.title + " 明天可继续兑换" : tomorrowEvent.config.title + " 明天仍可继续推进");
    }

    nextActionText = currentStep && currentStep.id !== "loop_repeat"
      ? "先继续 " + currentStep.label + "，这样明天回来时签到、Boss 和榜单会更顺地接上。"
      : (competitionFocus && competitionFocus.insight
        ? "先回榜单确认差距，再按提示回 Gear / Adventure / Boss 补最短那一段。"
        : "先回主城把白拿收益收干净，明天回来继续打一轮新 Boss。");

    return {
      todaySummary: todayLeft.slice(0, 3).join(" · "),
      tomorrowSummary: tomorrowGets.slice(0, 4).join(" · "),
      nextActionText: nextActionText,
      actionLabel: actionLabel,
      actionTab: actionTab,
      actionMapId: actionMapId
    };
  }

  function renderTomorrowPreviewTile(nextSessionPlan) {
    if (!nextSessionPlan) {
      return "";
    }

    return [
      "<div class='tile loop-card is-featured' style='margin-top:10px'>",
      "<p class='eyebrow'>明日承接</p>",
      "<h3>今天还剩什么，明天回来拿什么</h3>",
      "<div class='list' style='margin-top:10px'>",
      "<div class='item'><strong>今天还剩</strong><p class='meta'>" + safe(nextSessionPlan.todaySummary) + "</p></div>",
      "<div class='item'><strong>明天可拿</strong><p class='meta'>" + safe(nextSessionPlan.tomorrowSummary) + "</p></div>",
      "<div class='item'><strong>下次上线最该继续</strong><p class='meta'>" + safe(nextSessionPlan.nextActionText) + "</p></div>",
      "</div>",
      "<div class='button-row'>",
      buildTrackedJumpButton(nextSessionPlan.actionLabel, nextSessionPlan.actionTab, nextSessionPlan.actionMapId, true, {
        name: "guide_cta_clicked",
        category: "guide",
        funnelStep: "guide_cta",
        surface: "home_next_session",
        step: "next_session",
        message: "明日承接 CTA"
      }),
      buildJumpButton("去榜单复盘", "leaderboard", "", false),
      "</div>",
      "</div>"
    ].join("");
  }

  function renderReturnReasonsTile(surfaceId, dailyState, opsState, commerceState, activityState, todayDailyBoss, bossState, boards) {
    var todayRecord = getBossRecordForDate(bossState, todayKey(), todayDailyBoss);
    var competitionFocus = buildCompetitionFocus(boards || { total: [], same_day_master: [], today_boss: [] }, todayDailyBoss, bossState);
    var activeEvent = getPrimaryActiveEvent(todayKey(), activityState, todayDailyBoss, bossState);
    var offerSurface = buildOfferSurface(opsState, readBridgeState(), getResolvedDailyState(dailyState || createDefaultDailyState(todayKey())), readGachaState());
    var surfaceHint = getLaunchPrepConfigValue("returnLoop.surfaceHints." + surfaceId, "");
    var bossRewardReady = !!(dailyState && todayRecord.firstClearAchieved && !dailyState.specialClaims.dailyBossFirstClear);
    var reasons = [];
    var buttons = [];

    if (surfaceHint) {
      reasons.push(surfaceHint);
    }

    if (dailyState && (!dailyState.specialClaims.loginReward || !dailyState.specialClaims.freeDraw)) {
      reasons.push("主城还有免费收益没收，先回去把登录奖励 / 免费单抽拿掉，再继续追榜或打 Boss。");
      if (surfaceId !== "home") {
        buttons.push(buildJumpButton("回主城收免费收益", "home", "", true));
      }
    }

    if (bossRewardReady) {
      reasons.push("今日 Boss 首通奖励还没领，先把这笔大额资源收掉，再接活动兑换或榜单复盘。");
      buttons.push("<button type='button' class='cta' data-today-action='claim-daily-boss-reward'>领取首通奖励</button>");
    } else if (!todayRecord.firstClearAchieved) {
      reasons.push("今日 Boss 首通还没收，打掉后能拿首通奖励并开启活动 / 榜单回报。");
    } else {
      reasons.push("今日 Boss 最佳分 " + todayRecord.bestScore + "，还能继续追分验证 build 是否真的涨了。");
    }

    if (competitionFocus && competitionFocus.insight) {
      reasons.push(getBoardName(competitionFocus.boardType, todayDailyBoss) + " 仍有可追空间：" + competitionFocus.insight.climbText + "。");
      buttons.push(buildJumpButton("去榜单复盘", "leaderboard", "", surfaceId !== "leaderboard"));
    }

    if (activeEvent) {
      reasons.push(activeEvent.claimable
        ? activeEvent.config.title + " 现在可兑，先把活动奖励收进账本。"
        : activeEvent.config.title + " 还在进行中，今天别断掉活动进度。");
      if (activeEvent.claimable) {
        buttons.push("<button type='button' class='cta' data-event-claim='" + safe(activeEvent.config.id) + "'>兑换活动奖励</button>");
      }
    }

    if (offerSurface && offerSurface.spotlight) {
      reasons.push("主城还有今日补给「" + offerSurface.spotlight.offer.name + "」可看，当前状态：" + formatCommerceEntitlement(getCommerceEntitlement(commerceState, offerSurface.spotlight.offer.id)) + "。");
      if (surfaceId !== "home") {
        buttons.push(buildJumpButton("回主城看今日目标", "home", "", buttons.length === 0));
      }
    }

    return [
      "<div class='tile return-reason-tile' style='margin-top:10px'>",
      "<p class='eyebrow'>回流提醒</p>",
      "<h3>今天回来干嘛</h3>",
      reasons.slice(0, 3).map(function (reason) {
        return "<p class='meta'>" + safe(reason) + "</p>";
      }).join(""),
      buttons.length ? "<div class='button-row'>" + buttons.slice(0, 3).join("") + "</div>" : "",
      "</div>"
    ].join("");
  }

  function renderCompetitionPulseTile(surfaceId, boards, todayDailyBoss, bossState) {
    var focus = buildCompetitionFocus(boards || { total: [], same_day_master: [], today_boss: [] }, todayDailyBoss, bossState);
    var heading;
    var buttons = [];
    var story;

    if (!focus || !focus.insight) {
      return "";
    }

    story = buildCompetitionStory(focus.boardType, boards && boards[focus.boardType] ? boards[focus.boardType] : [], focus.insight, todayDailyBoss, bossState);

    heading = surfaceId === "gear"
      ? "这波配装先验证哪张榜"
      : (surfaceId === "boss" ? "打完这一把回哪张榜" : "当前最值得回看的榜单");

    if (focus.insight.primaryAction && focus.insight.primaryAction.tab !== surfaceId) {
      buttons.push(buildJumpButton(focus.insight.primaryAction.label, focus.insight.primaryAction.tab, focus.insight.primaryAction.mapId || "", true));
    }
    buttons.push(buildJumpButton("去榜单复盘", "leaderboard", "", buttons.length === 0));

    return [
      "<div class='tile loop-card is-featured'>",
      "<p class='eyebrow'>冲榜回路</p>",
      "<h3>" + safe(heading) + "</h3>",
      "<p>" + safe(getBoardName(focus.boardType, todayDailyBoss) + " · " + focus.insight.rankText) + "</p>",
      "<p class='meta'>" + safe(focus.insight.myRow ? ("最短追赶：" + focus.insight.gapText) : "当前还没有真实成绩，下面的样本卡只作目标参考。") + "</p>",
      "<p class='meta'>先补：" + safe(focus.insight.priorityText) + "</p>",
      "<p class='meta'>下一站：" + safe(focus.insight.farmText) + "</p>",
      "<p class='meta'>下一步：" + safe(focus.insight.actionText) + "</p>",
      (story ? "<p class='meta'>" + safe(story.isSample ? ("参考样本：" + story.rankText + " · " + story.scoreText) : ("今天还值得继续：" + story.bossReplayText)) + "</p>" : ""),
      "<div class='button-row'>" + buttons.join("") + "</div>",
      "</div>"
    ].join("");
  }

  function buildPlayerBoardRow(bridge, gachaState, todayDailyBoss, bossState) {
    var profile = bridge.profileSnapshot || {};
    var dayMaster = profile.dayMasterElement || "无";
    var score = Math.max(0, normalizeNumber(profile.powerScore, 0));
    var todayRecord = getBossRecordForDate(bossState, todayKey(), todayDailyBoss);
    var hasBossResult = !!(todayRecord.firstClearAchieved || normalizeNumber(todayRecord.attempts, 0) > 0 || normalizeNumber(todayRecord.bestScore, 0) > 0);
    var bossScore = hasBossResult ? normalizeNumber(todayRecord.bestScore, 0) : 0;

    return {
      name: "你",
      tag: dayMaster + "·" + (profile.className || "未开局"),
      dayMaster: dayMaster,
      score: score,
      bossScore: bossScore,
      detail: score > 0
        ? ("当前总战力 " + score + " · 抽卡库存 " + gachaState.inventory.length)
        : "当前还没有可入榜的真实战力",
      scoreEligible: score > 0,
      bossEligible: hasBossResult && bossScore > 0,
      isYou: true
    };
  }

  function sortByScore(rows) {
    return rows.slice().sort(function (a, b) {
      return b.score - a.score;
    });
  }

  function syncDailyState(bridge, gachaState, todayDailyBoss, bossState) {
    var today = todayKey();
    var daily = normalizeDailyState(readStorageJson(STORAGE_KEYS.dailyState), today);
    var todayRecord = getBossRecordForDate(bossState, today, todayDailyBoss);

    if (bridge.latestBattle && isToday(bridge.latestBattle.timestamp)) {
      daily.progress.adventure = Math.max(daily.progress.adventure, 1);
    }
    if (todayRecord.attempts > 0) {
      daily.progress.boss = Math.max(daily.progress.boss, 1);
    }
    if (countTodayGacha(gachaState) > 0) {
      daily.progress.gacha = Math.max(daily.progress.gacha, 1);
    }

    daily.completedCount = DAILY_TASKS.filter(function (task) {
      return (daily.progress[task.id] || 0) >= task.target;
    }).length;
    daily.claimedCount = DAILY_TASKS.filter(function (task) {
      return !!daily.claimed[task.id];
    }).length;

    writeStorageJson(STORAGE_KEYS.dailyState, daily);
    return daily;
  }

  function normalizeDailyState(raw, dateValue) {
    var daily = (!raw || raw.date !== dateValue) ? createDefaultDailyState(dateValue) : raw;
    daily.progress = daily.progress || {};
    daily.claimed = daily.claimed || {};
    daily.specialClaims = daily.specialClaims || {};
    daily.claimTimes = daily.claimTimes || {};
    daily.specialClaimTimes = daily.specialClaimTimes || {};
    DAILY_TASKS.forEach(function (task) {
      daily.progress[task.id] = normalizeNumber(daily.progress[task.id], 0);
      daily.claimed[task.id] = !!daily.claimed[task.id];
      daily.claimTimes[task.id] = daily.claimTimes[task.id] || "";
    });
    daily.specialClaims.loginReward = !!daily.specialClaims.loginReward;
    daily.specialClaims.freeDraw = !!daily.specialClaims.freeDraw;
    daily.specialClaims.dailyBossFirstClear = !!daily.specialClaims.dailyBossFirstClear;
    daily.specialClaimTimes.loginReward = daily.specialClaimTimes.loginReward || "";
    daily.specialClaimTimes.freeDraw = daily.specialClaimTimes.freeDraw || "";
    daily.specialClaimTimes.dailyBossFirstClear = daily.specialClaimTimes.dailyBossFirstClear || "";
    daily.completedCount = normalizeNumber(daily.completedCount, 0);
    daily.claimedCount = normalizeNumber(daily.claimedCount, 0);
    return daily;
  }

  function createDefaultDailyState(dateValue) {
    return {
      date: dateValue,
      progress: { adventure: 0, boss: 0, gacha: 0 },
      claimed: { adventure: false, boss: false, gacha: false },
      claimTimes: { adventure: "", boss: "", gacha: "" },
      specialClaims: { loginReward: false, freeDraw: false, dailyBossFirstClear: false },
      specialClaimTimes: { loginReward: "", freeDraw: "", dailyBossFirstClear: "" },
      completedCount: 0,
      claimedCount: 0
    };
  }

  function countTodayGacha(gachaState) {
    return gachaState.history.filter(function (entry) {
      return isToday(entry.timestamp);
    }).length;
  }

  function buildDailyFortune(profile, dateValue) {
    var mapAdvice;
    var recommended;
    if (!profile || !profile.dayMasterElement) {
      return { ready: false, dateKey: dateValue };
    }

    var elementPool = uniqueElements((profile.usefulGods || []).concat(profile.dayMasterElement ? [profile.dayMasterElement] : []));
    var seed = hashString(dateValue + "|" + buildProfileSeed(profile));
    var luckyElement = elementPool.length ? elementPool[seed % elementPool.length] : ELEMENT_ORDER[seed % ELEMENT_ORDER.length];
    var cautionElement = profile.tabooGod || ELEMENT_ORDER[(seed + 2) % ELEMENT_ORDER.length];
    mapAdvice = buildMapAdviceList(profile, getLoopPower(profile));
    recommended = mapAdvice[0] || null;

    return {
      ready: true,
      dateKey: dateValue,
      luckyElement: luckyElement,
      cautionElement: cautionElement,
      recommendedMapId: recommended ? recommended.mapId : "",
      recommendedMapName: recommended ? recommended.mapName : "暂无地图",
      recommendedMode: chooseRecommendedMode(profile, recommended && recommended.map ? recommended.map : null, seed, recommended),
      tone: chooseFortuneTone(profile, recommended && recommended.map ? recommended.map : null, seed, recommended),
      counterElement: recommended && recommended.boss ? getCounterElement(recommended.boss.element || recommended.map.element) : luckyElement,
      reasonText: recommended ? recommended.reasonText : buildFortuneReasonText(profile),
      mapAdvice: mapAdvice
    };
  }

  function chooseRecommendedMap(profile, luckyElement, cautionElement, seed) {
    var advice = buildMapAdviceList(profile, getLoopPower(profile));
    return advice.length ? advice[0].map : null;
  }

  function mapPowerFitScore(playerPower, recommendedPower) {
    var diff = Math.abs(playerPower - recommendedPower);
    if (diff <= 120) {
      return 3;
    }
    if (diff <= 360) {
      return 2;
    }
    if (diff <= 720) {
      return 1;
    }
    return 0;
  }

  function chooseRecommendedMode(profile, recommendedMap, seed, advice) {
    if (!recommendedMap) {
      return "先同步地图配置";
    }

    var playerPower = normalizeNumber(profile.powerScore, 0);
    var gap = recommendedMap.recommendedPower - playerPower;
    var options = [];

    if (recommendedMap.type === "boss" && gap <= 120) {
      options.push("宜直冲 Boss，打完再回城补配装");
    }
    if (recommendedMap.type === "farm") {
      options.push("宜先刷图补主力装，再考虑挑战 Boss");
    }
    if (recommendedMap.type === "trial") {
      options.push("宜稳扎稳打，先抬战力与材料储备");
    }
    if (advice && advice.tier === "favored") {
      options.push("命格顺势，适合把这张图当作当前主 farm / 主挑战入口");
    }
    if (advice && advice.tier === "risky") {
      options.push("当前逆势，建议先补喜用向装备再回头打这张图");
    }
    if (gap > 220) {
      options.push("战力略吃紧，先抽卡/替换装备再推进");
    }
    if (gap <= 0) {
      options.push("战力匹配，适合顺手冲一次榜单");
    }
    options.push("先打一把推荐图，再根据掉落回 Gear 页调装");

    return options[seed % options.length];
  }

  function chooseFortuneTone(profile, recommendedMap, seed, advice) {
    var tones = ["谨慎推进", "平稳蓄力", "小吉偏顺", "大吉可冲"];
    var idx = seed % tones.length;

    if (advice && advice.tier === "favored") {
      idx = Math.max(idx, 2);
    }
    if (advice && advice.tier === "risky") {
      idx = Math.min(idx, 1);
    }

    if (recommendedMap && recommendedMap.type === "boss" && profile.strength === "身强") {
      idx = Math.max(idx, 2);
    }
    if (recommendedMap && recommendedMap.type === "boss" && profile.strength === "身弱") {
      idx = Math.min(idx, 1);
    }

    return tones[idx];
  }

  function buildFortuneReasonText(profile) {
    var parts = [
      "日主 " + (profile.dayMasterElement || "未同步"),
      "身强弱 " + (profile.strength || "未同步")
    ];

    if (Array.isArray(profile.usefulGods) && profile.usefulGods.length) {
      parts.push("喜用 " + profile.usefulGods.join("/"));
    } else {
      parts.push("喜用待下次战斗同步");
    }
    if (profile.tabooGod) {
      parts.push("忌神 " + profile.tabooGod);
    }

    return parts.join(" · ");
  }

  function buildProfileSeed(profile) {
    return [
      profile.className || "",
      profile.dayMasterElement || "",
      profile.strength || "",
      Array.isArray(profile.usefulGods) ? profile.usefulGods.join(",") : "",
      profile.tabooGod || "",
      Math.floor(normalizeNumber(profile.powerScore, 0) / 100)
    ].join("|");
  }

  function buildBossCandidates() {
    return (config.maps || []).filter(function (map) {
      return !!(map && config.bosses && config.bosses[map.bossId]);
    }).map(function (map) {
      return {
        map: map,
        boss: config.bosses[map.bossId]
      };
    });
  }

  function buildDailyBoss(dateValue) {
    var normalizedDate = normalizeDateKey(dateValue) || todayKey();
    if (!bossCandidates.length) {
      return null;
    }

    var candidate = bossCandidates[hashString(normalizedDate + "|daily-boss") % bossCandidates.length];
    return {
      dateKey: normalizedDate,
      mapId: candidate.map.id,
      bossId: candidate.boss.id,
      map: candidate.map,
      boss: candidate.boss,
      description: candidate.map.description || candidate.boss.challengeValue || candidate.boss.name,
      tendency: buildBossTendencyText(candidate.boss),
      recommendedPower: candidate.map.recommendedPower,
      rewardFocus: candidate.map.dropFocus || "装备/材料",
      counterElement: getCounterElement(candidate.boss.element)
    };
  }

  function buildBossTendencyText(boss) {
    var parts = [];
    if (boss.challengeValue) {
      parts.push(boss.challengeValue);
    }
    if (boss.mechanic01 && boss.mechanic01.summary) {
      parts.push(boss.mechanic01.summary);
    }
    if (boss.mechanic02 && boss.mechanic02.summary) {
      parts.push(boss.mechanic02.summary);
    }
    if (boss.mechanic03 && boss.mechanic03.summary) {
      parts.push(boss.mechanic03.summary);
    }
    if (boss.mechanic04 && boss.mechanic04.summary) {
      parts.push(boss.mechanic04.summary);
    } else if (boss.mechanics && boss.mechanics[0]) {
      parts.push(boss.mechanics[0]);
    }
    if (boss.signatureReward && boss.signatureReward.note) {
      parts.push(boss.signatureReward.note);
    }
    return parts.join(" · ") || "按 build 克制调整节奏";
  }

  function syncBossState(bridge, todayDailyBoss) {
    var state = readStorageJson(STORAGE_KEYS.bossState);
    var latest = bridge.latestBattle;
    var today = todayKey();

    state = state || { lastProcessedBattleTimestamp: "", records: {} };
    state.records = state.records || {};
    state.ticketState = normalizeBossTicketState(state.ticketState, today);
    state.records[today] = ensureBossRecord(state.records[today], todayDailyBoss, today);

    if (latest && latest.timestamp && latest.timestamp !== state.lastProcessedBattleTimestamp) {
      if (isToday(latest.timestamp) && todayDailyBoss && latest.mapId === todayDailyBoss.mapId) {
        processDailyBossBattle(state.records[today], latest, todayDailyBoss);
      }
      state.lastProcessedBattleTimestamp = latest.timestamp;
    }

    writeStorageJson(STORAGE_KEYS.bossState, state);
    return state;
  }

  function ensureBossRecord(record, dailyBoss, dateValue) {
    var base = record || {
      date: dateValue,
      bossId: dailyBoss ? dailyBoss.bossId : "",
      bossName: dailyBoss ? dailyBoss.boss.name : "",
      mapId: dailyBoss ? dailyBoss.mapId : "",
      attempts: 0,
      victories: 0,
      bestScore: 0,
      lastScore: 0,
      lastResult: "",
      lastBattleTimestamp: "",
      firstClearAchieved: false,
      firstClearAt: "",
      rewardFocus: dailyBoss ? dailyBoss.rewardFocus : "",
      lastMechanicSummary: "",
      lastFateSummary: ""
    };

    if (dailyBoss) {
      base.date = dateValue;
      base.bossId = dailyBoss.bossId;
      base.bossName = dailyBoss.boss.name;
      base.mapId = dailyBoss.mapId;
      base.rewardFocus = dailyBoss.rewardFocus;
    }
    base.attempts = normalizeNumber(base.attempts, 0);
    base.victories = normalizeNumber(base.victories, 0);
    base.bestScore = normalizeNumber(base.bestScore, 0);
    base.lastScore = normalizeNumber(base.lastScore, 0);
    base.firstClearAchieved = !!base.firstClearAchieved;
    base.lastMechanicSummary = base.lastMechanicSummary || "";
    base.lastFateSummary = base.lastFateSummary || "";
    return base;
  }

  function processDailyBossBattle(record, latestBattle, dailyBoss) {
    var score = calculateBossBattleScore(latestBattle, dailyBoss);
    record.attempts += 1;
    record.lastScore = score;
    record.lastResult = latestBattle.result || "defeat";
    record.lastBattleTimestamp = latestBattle.timestamp;
    record.lastMechanicSummary = summarizeBossMechanic(latestBattle.bossMechanicSummary);
    record.lastFateSummary = latestBattle.fateImpact ? latestBattle.fateImpact.verdict + " · " + latestBattle.fateImpact.rewardText : "";
    if (latestBattle.result === "victory") {
      record.victories += 1;
      record.bestScore = Math.max(record.bestScore, score);
      if (!record.firstClearAchieved) {
        record.firstClearAchieved = true;
        record.firstClearAt = latestBattle.timestamp;
      }
    }
  }

  function calculateBossBattleScore(latestBattle, dailyBoss) {
    if (!latestBattle) {
      return 0;
    }
    var hpPart = Math.round((latestBattle.hpRatio || 0) * 500);
    var lootPart = latestBattle.lootSummary ? latestBattle.lootSummary.total * 60 : 0;
    var winPart = latestBattle.result === "victory" ? 220 : 40;
    var mapPart = dailyBoss && latestBattle.mapId === dailyBoss.mapId ? 120 : 0;
    var mechanic = latestBattle.bossMechanicSummary || {};
    var fateImpact = latestBattle.fateImpact || {};
    var mechanicPart = normalizeNumber(mechanic.successfulBreaks, 0) * 70 + normalizeNumber(mechanic.bonusTurns, 0) * 25 - normalizeNumber(mechanic.penaltyTurns, 0) * 25;
    var fatePart = fateImpact.tier === "favored" ? 35 : (fateImpact.tier === "risky" ? -20 : 0);
    return Math.max(120, hpPart + lootPart + winPart + mapPart + mechanicPart + fatePart);
  }

  function getBossRecordForDate(bossState, dateValue, dailyBoss) {
    if (!bossState || !bossState.records) {
      return ensureBossRecord(null, dailyBoss, dateValue);
    }
    return ensureBossRecord(bossState.records[dateValue], dailyBoss, dateValue);
  }

  function getCounterElement(targetElement) {
    return ELEMENT_COUNTER_TO[targetElement] || ELEMENT_ORDER[0];
  }

  function getResolvedMapAdvice(profile, map, playerPower) {
    var serverAdvice = serverCache.playerState && Array.isArray(serverCache.playerState.mapAdvice)
      ? serverCache.playerState.mapAdvice.filter(function (entry) { return entry.mapId === map.id; })[0]
      : null;
    return serverAdvice || buildMapFateAdvice(profile, map, playerPower);
  }

  function getDailyBossAdvice(profile, previewDailyBoss, playerPower) {
    if (!previewDailyBoss) {
      return null;
    }
    if (serverCache.playerState && serverCache.playerState.dailyBoss && serverCache.playerState.dailyBoss.fateAdvice && previewDailyBoss.dateKey === todayKey() && previewDailyBoss.mapId === serverCache.playerState.dailyBoss.mapId) {
      return serverCache.playerState.dailyBoss.fateAdvice;
    }
    return buildMapFateAdvice(profile, previewDailyBoss.map, playerPower);
  }


  function buildTodayBossView() {
    return serverCache.playerState && serverCache.playerState.dailyBoss ? serverCache.playerState.dailyBoss : buildDailyBoss(todayKey());
  }

  function getLoopProfile(bridge) {
    if (serverCache.playerState && serverCache.playerState.profile) {
      return serverCache.playerState.profile;
    }
    return bridge && bridge.profileSnapshot ? bridge.profileSnapshot : {};
  }

  function getLoopPower(profile) {
    var backendPower = serverCache.playerState && serverCache.playerState.equipmentState && serverCache.playerState.equipmentState.summary
      ? normalizeNumber(serverCache.playerState.equipmentState.summary.totalPower, 0)
      : 0;
    return backendPower || normalizeNumber(profile && profile.powerScore, 0);
  }

  function buildMapView(map, playerPower, todayDailyBoss) {
    var boss = map && config.bosses ? config.bosses[map.bossId] : null;
    var diff = normalizeNumber(map.recommendedPower, 0) - normalizeNumber(playerPower, 0);
    var preview = map.dropTable && Array.isArray(map.dropTable.preview) && map.dropTable.preview.length
      ? map.dropTable.preview.join(" / ")
      : (map.dropFocus || "装备");
    var powerText = playerPower > 0
      ? (diff <= 0 ? "战力已达标" : "还差 " + diff + " 战力")
      : "生成角色后显示匹配度";
    return {
      dropPreview: preview,
      powerText: powerText,
      identityText: map && map.dropTable && map.dropTable.identity ? map.dropTable.identity : (map.purpose || map.description || "按地图定位刷图"),
      rewardRhythmText: map && map.dropTable && map.dropTable.rewardRhythm ? map.dropTable.rewardRhythm : "按基础掉落节奏结算",
      featuredLootText: formatDropTableFieldList(map, "featuredLoot"),
      setTargetText: formatDropTableFieldList(map, "setTargets"),
      routeText: formatMapRouteChoices(map),
      chaseWhoText: formatMapChaseField(map, "whoShouldFarm", "按当前 build 缺口决定是否来刷"),
      chaseTargetText: formatMapChaseTargets(map),
      bossSignatureText: formatBossSignatureReward(map, boss),
      chaseWhyText: formatMapChaseField(map, "whyNow", map && map.dropTable && map.dropTable.farmPlan ? map.dropTable.farmPlan : "按当前 build 缺口决定是否来刷"),
      farmPlanText: map && map.dropTable && map.dropTable.farmPlan ? map.dropTable.farmPlan : "按当前 build 缺口决定是否来刷",
      bossRewardHint: map && map.dropTable && map.dropTable.bossRewardHint ? map.dropTable.bossRewardHint : "",
      isTodayBoss: !!(todayDailyBoss && todayDailyBoss.mapId === map.id)
    };
  }

  function formatDropTableFieldList(map, field) {
    var values = map && map.dropTable && Array.isArray(map.dropTable[field]) ? map.dropTable[field] : [];
    return values.length ? values.join(" / ") : "-";
  }

  function formatMapRouteChoices(map) {
    var routes = map && map.dropTable && Array.isArray(map.dropTable.routeChoices) ? map.dropTable.routeChoices : [];
    return routes.length
      ? routes.map(function (route) {
        var targets = Array.isArray(route.targets) && route.targets.length ? (" · 目标 " + route.targets.join(" / ")) : "";
        return route.name + "：" + (route.focus || "按当前 build 追") + targets;
      }).join("；")
      : "-";
  }

  function formatMapChaseField(map, field, fallback) {
    var chase = map && map.dropTable ? map.dropTable.phase2Chase : null;
    if (!chase || !chase[field]) {
      return fallback || "-";
    }
    return chase[field];
  }

  function formatMapChaseTargets(map) {
    var chase = map && map.dropTable ? map.dropTable.phase2Chase : null;
    var targets = chase && Array.isArray(chase.targets) ? chase.targets : [];
    return targets.length ? targets.join(" / ") : formatDropTableFieldList(map, "featuredLoot");
  }

  function formatBossSignatureReward(map, boss) {
    var reward = boss && boss.signatureReward ? boss.signatureReward : null;
    var loot = map && map.dropTable && Array.isArray(map.dropTable.bossSignatureLoot) ? map.dropTable.bossSignatureLoot : (reward && Array.isArray(reward.loot) ? reward.loot : []);
    var title = reward && reward.title ? reward.title : "Boss 签名件";
    var note = reward && reward.note ? reward.note : "顺势或贴 build 时更容易命中";
    return title + "：" + (loot.length ? loot.join(" / ") : "-") + " | " + note;
  }

  function renderGearChaseRoadmap() {
    return (config.maps || []).map(function (map) {
      var boss = config.bosses ? config.bosses[map.bossId] : null;
      return "<div class='item'><strong>" + safe(map.name) + "</strong><p class='meta'>刷图身份：" + safe(map.dropTable && map.dropTable.identity ? map.dropTable.identity : (map.purpose || "-")) + "</p><p class='meta'>适合谁刷：" + safe(formatMapChaseField(map, "whoShouldFarm", "按当前 build 缺口决定")) + "</p><p class='meta'>目标掉落：" + safe(formatDropTableFieldList(map, "featuredLoot")) + "</p><p class='meta'>本轮追件：" + safe(formatMapChaseTargets(map)) + "</p><p class='meta'>套装目标：" + safe(formatDropTableFieldList(map, "setTargets")) + "</p><p class='meta'>刷图路线：" + safe(formatMapRouteChoices(map)) + "</p><p class='meta'>为什么现在：" + safe(formatMapChaseField(map, "whyNow", "按当前 build 节奏决定")) + "</p><p class='meta'>Boss 追件：" + safe(formatBossSignatureReward(map, boss)) + "</p></div>";
    }).join("");
  }

  function isBossCandidateMapId(mapId) {
    return bossCandidates.some(function (candidate) {
      return candidate.map.id === mapId;
    });
  }

  function normalizeBossTicketState(raw, dateValue) {
    var state = raw || {};
    var targetDate = normalizeDateKey(dateValue) || todayKey();

    if (normalizeDateKey(state.date) !== targetDate) {
      return {
        date: targetDate,
        dailyCap: 2,
        used: 0,
        remaining: 2,
        practiceAttempts: 0
      };
    }

    state.date = targetDate;
    state.dailyCap = Math.max(1, normalizeNumber(state.dailyCap, 2));
    state.used = Math.max(0, normalizeNumber(state.used, 0));
    state.practiceAttempts = Math.max(0, normalizeNumber(state.practiceAttempts, 0));
    state.remaining = Math.max(0, state.dailyCap - state.used);
    return state;
  }

  function getBossChallengeState(bossState) {
    var state = normalizeBossTicketState(bossState && bossState.ticketState ? bossState.ticketState : null, todayKey());
    return {
      dailyCap: normalizeNumber(state.dailyCap, 2),
      used: normalizeNumber(state.used, 0),
      remaining: normalizeNumber(state.remaining, 0),
      practiceAttempts: normalizeNumber(state.practiceAttempts, 0)
    };
  }

  function formatBossChallengeState(state) {
    if (!state) {
      return "后端模式下每日 2 次记分，超出后仅练习";
    }
    return "剩余 " + state.remaining + "/" + state.dailyCap + "，练习 " + state.practiceAttempts + " 次";
  }

  function formatBossMechanicHeadline(boss) {
    if (!boss) {
      return "-";
    }
    if (boss.mechanic01 && boss.mechanic01.summary) {
      return boss.mechanic01.summary;
    }
    if (boss.mechanics && boss.mechanics[0]) {
      return boss.mechanics[0];
    }
    return "按五行克制处理";
  }

  function formatBossMechanicSecondary(boss) {
    if (!boss || !boss.mechanic02 || !boss.mechanic02.summary) {
      return "";
    }
    return boss.mechanic02.summary;
  }

  function formatBossMechanicTertiary(boss) {
    if (!boss || !boss.mechanic03 || !boss.mechanic03.summary) {
      return "";
    }
    return boss.mechanic03.summary;
  }

  function formatBossMechanicQuaternary(boss) {
    if (!boss || !boss.mechanic04 || !boss.mechanic04.summary) {
      return "";
    }
    return boss.mechanic04.summary;
  }

  function summarizeBossMechanic(summary) {
    var mechanics = summary && Array.isArray(summary.mechanics) ? summary.mechanics : [];
    if (!summary || !summary.name) {
      return "";
    }
    var text;
    if (mechanics.length) {
      text = mechanics.map(function (entry) {
        return entry.name + " · 触发" + normalizeNumber(entry.triggers, 0) + "次 / 顺势" + normalizeNumber(entry.successfulBreaks, 0) + "次 / 受压" + normalizeNumber(entry.penaltyTurns, 0) + "次";
      }).join("；");
    } else {
      text = summary.name + " · 触发" + normalizeNumber(summary.triggers, 0) + "次 / 破势" + normalizeNumber(summary.successfulBreaks, 0) + "次 / 受压" + normalizeNumber(summary.penaltyTurns, 0) + "次";
    }
    return summary.rewardShiftText ? text + " / " + summary.rewardShiftText : text;
  }

  function buildMapAdviceList(profile, playerPower) {
    return (config.maps || []).map(function (map) {
      return buildMapFateAdvice(profile, map, playerPower);
    }).sort(function (a, b) {
      return b.score - a.score;
    });
  }

  function buildMapFateAdvice(profile, map, playerPower) {
    var resolvedProfile = profile || {};
    var usefulGods = uniqueElements(Array.isArray(resolvedProfile.usefulGods) ? resolvedProfile.usefulGods : []);
    var alignedElements = uniqueElements(usefulGods.concat(resolvedProfile.dayMasterElement ? [resolvedProfile.dayMasterElement] : []));
    var boss = config.bosses[map.bossId] || null;
    var dropElements = map && map.dropTable && Array.isArray(map.dropTable.preferredElements) ? map.dropTable.preferredElements : [];
    var rewardElements = dropElements.filter(function (element) {
      return alignedElements.indexOf(element) >= 0;
    });
    var positive = [];
    var risky = [];
    var powerGap = normalizeNumber(map && map.recommendedPower, 0) - normalizeNumber(playerPower, 0);
    var score = 0;
    var tier;
    var rewardBonusRate;
    var difficultyPressure;

    if (resolvedProfile.dayMasterElement === map.element) {
      score += 2;
      positive.push("日主" + resolvedProfile.dayMasterElement + "贴合地图主五行");
    }
    if (usefulGods.indexOf(map.element) >= 0) {
      score += 3;
      positive.push("喜用" + map.element + "命中地图主五行");
    }
    if (boss && usefulGods.indexOf(boss.element) >= 0) {
      score += 2;
      positive.push("喜用" + boss.element + "可接 Boss 主压力");
    }
    if (boss && resolvedProfile.dayMasterElement && resolvedProfile.dayMasterElement === boss.viceElement) {
      score += 1;
      positive.push("日主贴合 Boss 副五行");
    }
    if (rewardElements.length) {
      score += 3 + rewardElements.length;
      positive.push("掉落偏向" + rewardElements.join("/") + "，更容易刷到贴命格的件");
    }
    if (resolvedProfile.tabooGod) {
      if (resolvedProfile.tabooGod === map.element) {
        score -= 4;
        risky.push("地图主五行撞忌神" + resolvedProfile.tabooGod);
      }
      if (boss && (resolvedProfile.tabooGod === boss.element || resolvedProfile.tabooGod === boss.viceElement)) {
        score -= 3;
        risky.push("Boss 五行压到忌神" + resolvedProfile.tabooGod);
      }
      if (dropElements.indexOf(resolvedProfile.tabooGod) >= 0) {
        score -= 2;
        risky.push("掉落偏向包含忌神" + resolvedProfile.tabooGod);
      }
    }
    if (resolvedProfile.strength === "身强" && map.type === "boss") {
      score += 2;
      positive.push("身强更适合顶 Boss 压力");
    }
    if (resolvedProfile.strength === "身弱" && map.type === "trial") {
      score += 2;
      positive.push("身弱更适合先补生存与核心");
    }
    if (resolvedProfile.strength === "身弱" && map.type === "boss") {
      score -= 2;
      risky.push("身弱直冲 Boss 更容易吃压制");
    }
    if (normalizeNumber(playerPower, 0) > 0 && powerGap <= 0) {
      score += 2;
      positive.push("当前战力已达推荐值");
    } else if (normalizeNumber(playerPower, 0) > 0 && powerGap > 360) {
      score -= 2;
      risky.push("当前战力低于推荐约 " + powerGap);
    }

    if (score >= 6) {
      tier = "favored";
      rewardBonusRate = 0.12;
      difficultyPressure = -0.08;
    } else if (score <= 1) {
      tier = "risky";
      rewardBonusRate = -0.06;
      difficultyPressure = 0.12;
    } else {
      tier = "neutral";
      rewardBonusRate = rewardElements.length ? 0.04 : 0;
      difficultyPressure = 0.02;
    }

    return {
      mapId: map.id,
      mapName: map.name,
      map: map,
      boss: boss,
      score: score,
      tier: tier,
      verdict: tier === "favored" ? "顺命收益高" : (tier === "risky" ? "逆势承压" : "可打但收益一般"),
      rewardElements: rewardElements,
      rewardBonusRate: rewardBonusRate,
      difficultyPressure: difficultyPressure,
      rewardFocusText: rewardElements.length
        ? "掉落更偏向 " + rewardElements.join("/") + "，收益修正 " + formatSignedPercent(rewardBonusRate)
        : "按地图基础掉落结算，收益修正 " + formatSignedPercent(rewardBonusRate),
      pressureText: difficultyPressure <= 0
        ? "顺势减压 " + formatSignedPercent(difficultyPressure)
        : "逆势承压 +" + Math.round(difficultyPressure * 100) + "%",
      reasonText: positive.concat(risky).join("；") || "当前仅按推荐战力与地图五行处理"
    };
  }

  function formatSignedPercent(value) {
    var rate = Math.round(normalizeNumber(value, 0) * 100);
    return (rate > 0 ? "+" : "") + rate + "%";
  }

  function readWalletState() {
    var wallet = isBackendEnabled()
      ? clone(serverCache.playerState.walletState)
      : readStorageJson(STORAGE_KEYS.walletState);
    if (!wallet) {
      wallet = clone(DEFAULT_WALLET);
      writeStorageJson(STORAGE_KEYS.walletState, wallet);
      return wallet;
    }

    wallet = {
      spiritStone: normalizeNumber(wallet.spiritStone, DEFAULT_WALLET.spiritStone),
      drawTickets: normalizeNumber(wallet.drawTickets, DEFAULT_WALLET.drawTickets),
      materials: normalizeNumber(wallet.materials, DEFAULT_WALLET.materials)
    };
    writeStorageJson(STORAGE_KEYS.walletState, wallet);
    return wallet;
  }

  function readEquipmentState() {
    var state = isBackendEnabled()
      ? clone(serverCache.playerState.equipmentState)
      : readStorageJson(STORAGE_KEYS.equipmentState);
    writeStorageJson(STORAGE_KEYS.equipmentState, state || null);
    return state || null;
  }

  function readSignInState(dateValue) {
    var state = isBackendEnabled()
      ? normalizeSignInState(clone(serverCache.playerState.signInState), dateValue)
      : normalizeSignInState(readStorageJson(STORAGE_KEYS.signInState), dateValue);
    writeStorageJson(STORAGE_KEYS.signInState, state);
    return state;
  }

  function normalizeSignInState(raw, dateValue) {
    var state = raw || {};
    var rewardCount = SIGN_IN_REWARDS.length;
    var diff;

    state.cycleIndex = Math.max(1, normalizeNumber(state.cycleIndex, 1));
    state.cycleProgress = Math.max(0, Math.min(rewardCount, normalizeNumber(state.cycleProgress, 0)));
    state.streakCount = Math.max(0, normalizeNumber(state.streakCount, 0));
    state.totalClaimed = Math.max(0, normalizeNumber(state.totalClaimed, 0));
    state.completedCycles = Math.max(0, normalizeNumber(state.completedCycles, 0));
    state.lastClaimDate = normalizeDateKey(state.lastClaimDate);
    state.claimedDays = state.claimedDays || {};

    SIGN_IN_REWARDS.forEach(function (entry) {
      state.claimedDays[entry.day] = !!state.claimedDays[entry.day];
    });

    state.currentDayIndex = Math.min(rewardCount, Math.max(1, state.cycleProgress + (state.lastClaimDate === dateValue ? 0 : 1)));
    state.canClaimToday = state.lastClaimDate !== dateValue;

    if (!state.lastClaimDate) {
      state.currentDayIndex = 1;
      state.canClaimToday = true;
      state.statusText = "今天可领取第 1 天签到奖励。";
      return state;
    }

    diff = diffDaysBetween(state.lastClaimDate, dateValue);
    if (diff > 1) {
      state.cycleProgress = 0;
      state.streakCount = 0;
      state.currentDayIndex = 1;
      state.canClaimToday = true;
      state.claimedDays = {};
      SIGN_IN_REWARDS.forEach(function (entry) {
        state.claimedDays[entry.day] = false;
      });
      state.statusText = "断签后已重置，今天从 Day 1 重新开始。";
      return state;
    }

    if (diff === 1 && state.cycleProgress >= rewardCount) {
      state.cycleIndex += 1;
      state.cycleProgress = 0;
      state.claimedDays = {};
      SIGN_IN_REWARDS.forEach(function (entry) {
        state.claimedDays[entry.day] = false;
      });
    }

    state.currentDayIndex = Math.min(rewardCount, Math.max(1, state.cycleProgress + (state.lastClaimDate === dateValue ? 0 : 1)));
    state.canClaimToday = state.lastClaimDate !== dateValue;
    if (state.canClaimToday) {
      state.statusText = "今天可领取第 " + state.currentDayIndex + " 天签到奖励。";
    } else if (state.cycleProgress >= rewardCount) {
      state.statusText = "本轮 7 天奖励已拿满，明天重置到 Day 1。";
    } else {
      state.statusText = "今日已签到，明天继续领取第 " + (state.cycleProgress + 1) + " 天奖励。";
    }

    return state;
  }

  function readActivityState(dateValue, todayDailyBoss, bossState) {
    var state = isBackendEnabled()
      ? normalizeActivityState(clone(serverCache.playerState.activityState))
      : normalizeActivityState(readStorageJson(STORAGE_KEYS.activityState));
    state = syncActivityState(state, dateValue, todayDailyBoss, bossState);
    writeStorageJson(STORAGE_KEYS.activityState, state);
    return state;
  }

  function normalizeActivityState(raw) {
    var state = raw || {};
    state.events = state.events || {};
    EVENT_CONFIGS.forEach(function (eventConfig) {
      var eventState = state.events[eventConfig.id] || {};
      eventState.tokenCount = Math.max(0, normalizeNumber(eventState.tokenCount, 0));
      eventState.lastTokenDate = normalizeDateKey(eventState.lastTokenDate);
      eventState.claimed = !!eventState.claimed;
      eventState.claimedAt = eventState.claimedAt || "";
      eventState.redemptionCount = Math.max(0, normalizeNumber(eventState.redemptionCount, 0));
      state.events[eventConfig.id] = eventState;
    });
    return state;
  }

  function syncActivityState(state, dateValue, todayDailyBoss, bossState) {
    EVENT_CONFIGS.forEach(function (eventConfig) {
      var status = getEventStatus(eventConfig, dateValue);
      var eventState = getActivityEventState(state, eventConfig.id);
      var redeem = eventConfig.redeem;
      var todayRecord;

      if (!redeem || status.code !== "active" || (redeem.oncePerEvent && eventState.claimed)) {
        state.events[eventConfig.id] = eventState;
        return;
      }

      if (redeem.trigger === "daily_boss_first_clear") {
        todayRecord = getBossRecordForDate(bossState, dateValue, todayDailyBoss);
        if (todayRecord.firstClearAchieved && eventState.lastTokenDate !== dateValue) {
          eventState.tokenCount = Math.min(
            normalizeNumber(redeem.tokenCap, 1),
            normalizeNumber(eventState.tokenCount, 0) + normalizeNumber(redeem.tokenGrant, 1)
          );
          eventState.lastTokenDate = dateValue;
        }
      }

      state.events[eventConfig.id] = eventState;
    });
    return state;
  }

  function getActivityEventState(activityState, eventId) {
    var state = activityState || { events: {} };
    state.events = state.events || {};
    state.events[eventId] = state.events[eventId] || {
      tokenCount: 0,
      lastTokenDate: "",
      claimed: false,
      claimedAt: "",
      redemptionCount: 0
    };
    return state.events[eventId];
  }

  function findEventConfig(eventId) {
    var i;
    for (i = 0; i < EVENT_CONFIGS.length; i += 1) {
      if (EVENT_CONFIGS[i].id === eventId) {
        return EVENT_CONFIGS[i];
      }
    }
    return null;
  }

  function readOpsState(bridge, dateValue) {
    var localState = readStorageJson(STORAGE_KEYS.opsState) || {};
    var useBackend = isBackendEnabled();
    var sourceState = isBackendEnabled()
      ? clone(serverCache.playerState.opsState || {})
      : clone(localState);
    var state = normalizeOpsState(sourceState, bridge, dateValue, { preserveServerState: useBackend });

    state.tenDrawOffer = normalizeTenDrawOffer(localState.tenDrawOffer || state.tenDrawOffer);
    writeStorageJson(STORAGE_KEYS.opsState, state);
    return state;
  }

  function normalizeTenDrawOffer(raw) {
    var state = raw || {};
    return {
      seenCount: normalizeNumber(state.seenCount, 0),
      lastSeenAt: state.lastSeenAt || ""
    };
  }

  function normalizeOpsState(raw, bridge, dateValue, options) {
    var state = raw || {};
    state.firstPurchase = state.firstPurchase || { status: "locked", activatedAt: "" };
    state.monthlyCard = state.monthlyCard || {
      status: "inactive",
      activatedAt: "",
      expiresAt: "",
      lastClaimDate: "",
      activationCount: 0
    };
    state.tenDrawOffer = normalizeTenDrawOffer(state.tenDrawOffer);

    if (!(options && options.preserveServerState) && state.firstPurchase.status !== "converted") {
      state.firstPurchase.status = bridge.latestBattle ? "available" : "locked";
    }

    if (state.monthlyCard.status === "active" && state.monthlyCard.expiresAt && state.monthlyCard.expiresAt < dateValue) {
      state.monthlyCard.status = "expired";
    }

    state.tenDrawOffer.seenCount = normalizeNumber(state.tenDrawOffer.seenCount, 0);
    state.monthlyCard.activationCount = normalizeNumber(state.monthlyCard.activationCount, 0);

    return state;
  }

  function readProductCatalog() {
    if (isBackendEnabled() && serverCache.playerState && Array.isArray(serverCache.playerState.productCatalog) && serverCache.playerState.productCatalog.length) {
      return clone(serverCache.playerState.productCatalog);
    }
    return clone(PRODUCT_CATALOG);
  }

  function readLaunchPrepConfig() {
    if (isBackendEnabled() && serverCache.playerState && serverCache.playerState.launchPrepConfig) {
      return clone(serverCache.playerState.launchPrepConfig);
    }
    return clone(LAUNCH_PREP_CONFIG);
  }

  function getOfferLaunchConfig(offerId) {
    return getLaunchPrepConfigValue("offers.entries." + offerId, {});
  }

  function getEventLaunchConfig(eventId) {
    return getLaunchPrepConfigValue("events.entries." + eventId, {});
  }

  function isOfferEnabled(offerId) {
    return getOfferLaunchConfig(offerId).enabled !== false;
  }

  function isEventEnabled(eventId) {
    return getEventLaunchConfig(eventId).enabled !== false;
  }

  function getOfferPlacementLabel(offer) {
    var config = getOfferLaunchConfig(offer && offer.id ? offer.id : "");
    return config.placementLabel || (offer && offer.placement) || "主城";
  }

  function getEventPlacementLabel(eventConfig) {
    var config = getEventLaunchConfig(eventConfig && eventConfig.id ? eventConfig.id : "");
    return config.entrySlot || "home_activity_entry";
  }

  function getLaunchPrepConfigValue(path, fallback) {
    var cursor = readLaunchPrepConfig();
    var parts = String(path || "").split(".");
    var i;

    for (i = 0; i < parts.length; i += 1) {
      if (!cursor || cursor[parts[i]] == null) {
        return fallback;
      }
      cursor = cursor[parts[i]];
    }

    return cursor;
  }

  function findProductByOfferId(offerId) {
    var products = readProductCatalog();
    var i;
    for (i = 0; i < products.length; i += 1) {
      if (products[i].offerId === offerId) {
        return products[i];
      }
    }
    return null;
  }

  function findProductById(productId) {
    var products = readProductCatalog();
    var i;
    for (i = 0; i < products.length; i += 1) {
      if (products[i].id === productId) {
        return products[i];
      }
    }
    return null;
  }

  function formatProductGrantPreview(product) {
    return ((product && Array.isArray(product.grantPreview)) ? product.grantPreview : []).map(function (entry) {
      return entry && entry.summary ? entry.summary : "";
    }).filter(Boolean).join(" → ") || "创建订单 → 等待支付 → 支付成功后发放权益";
  }

  function normalizeCommerceStageEntry(raw) {
    var entry = raw || {};
    if (!entry.stage && !entry.at && !entry.label) {
      return null;
    }
    return {
      stage: entry.stage || "created",
      label: entry.label || entry.stage || "created",
      detail: entry.detail || "",
      at: entry.at || new Date().toISOString()
    };
  }

  function buildCommerceStageSummary(order, product) {
    var history = order && Array.isArray(order.stageHistory) ? order.stageHistory : [];
    if (!history.length) {
      return formatProductGrantPreview(product);
    }
    return history.map(function (entry) {
      return entry.label || entry.stage;
    }).join(" → ");
  }

  function getLocalProductAvailability(product, opsState, dateValue) {
    var activityState = normalizeActivityState(readStorageJson(STORAGE_KEYS.activityState));
    var bossState = readStorageJson(STORAGE_KEYS.bossState) || { records: {} };
    var bridge = readBridgeState();
    var eventConfig;
    var status;
    var todayRecord = bossState.records && bossState.records[dateValue] ? bossState.records[dateValue] : null;

    if (!product) {
      return { available: false, status: "missing", reason: "商品不存在" };
    }
    if (product.unlockCondition === "first_battle_complete") {
      if (opsState.firstPurchase.status === "converted") {
        return { available: false, status: "fulfilled", reason: "首购已到账" };
      }
      if (opsState.firstPurchase.status !== "available") {
        return { available: false, status: "locked", reason: "首战后解锁" };
      }
    }
    if (product.unlockCondition === "event_active") {
      eventConfig = findEventConfig(product.eventId);
      status = eventConfig ? getEventStatus(eventConfig, dateValue) : { code: "ended" };
      if (status.code !== "active") {
        return { available: false, status: status.code, reason: status.code === "upcoming" ? "活动未开启" : "活动已结束" };
      }
      if (!activityState.events[product.eventId]) {
        return { available: false, status: "inactive", reason: "活动状态未准备好" };
      }
    }
    if (product.unlockCondition === "boss_attempted" && !(bridge && bridge.latestBattle) && !(todayRecord && normalizeNumber(todayRecord.attempts, 0) > 0)) {
      return { available: false, status: "locked", reason: "完成一次 Boss 尝试后解锁" };
    }
    return { available: true, status: "available", reason: "可创建订单" };
  }

  function normalizeCommerceOrder(raw) {
    var order = raw || {};
    var product = findProductById(order.productId) || findProductByOfferId(order.offerId) || {};
    var price = order.price || product.price || {
      amount: normalizeNumber(order.priceAmount || order.priceValue || product.priceValue, 0) * 100,
      currency: order.currency || product.currency || "CNY",
      label: order.priceLabel || product.priceLabel || "支付占位"
    };
    var history = Array.isArray(order.stageHistory)
      ? order.stageHistory.map(function (entry) {
        return normalizeCommerceStageEntry(entry);
      }).filter(Boolean)
      : [];

    if (!order.productId && !order.offerId && !order.createdAt) {
      return null;
    }

    if (!history.length) {
      history.push(normalizeCommerceStageEntry({
        stage: "created",
        label: "订单已创建",
        detail: "历史订单补齐默认创建态。",
        at: order.createdAt || new Date().toISOString()
      }));
      if ((order.orderStage || order.status || "created") !== "created") {
        history.push(normalizeCommerceStageEntry({
          stage: order.orderStage || order.status || "pending_payment",
          label: order.orderStage || order.status || "pending_payment",
          detail: order.note || "历史订单补齐当前阶段。",
          at: order.updatedAt || order.paidAt || order.fulfilledAt || order.createdAt || new Date().toISOString()
        }));
      }
    }

    return {
      orderId: order.orderId || createMockOrderId(order.offerId || order.productId || "mock"),
      sku: order.sku || product.sku || "",
      productId: order.productId || product.id || "",
      offerId: order.offerId || product.offerId || "",
      entitlementId: order.entitlementId || product.entitlementId || "",
      purchaseType: order.purchaseType || product.purchaseType || "non-consumable",
      entitlementType: order.entitlementType || product.entitlementType || "delivery",
      status: order.status || order.orderStage || "created",
      orderStage: order.orderStage || order.status || "created",
      checkoutStatus: order.checkoutStatus || (order.status === "paid" || order.status === "fulfilled" ? "paid" : "pending_payment"),
      deliveryStatus: order.deliveryStatus || (order.status === "fulfilled" ? (product.purchaseType === "subscription-like" ? "entitled" : "delivered") : "awaiting_payment"),
      fulfillmentStatus: order.fulfillmentStatus || (order.status === "fulfilled" ? "fulfilled" : "pending"),
      fulfillmentCount: Math.max(0, normalizeNumber(order.fulfillmentCount, 0)),
      duplicateBlocked: !!order.duplicateBlocked,
      paymentProvider: order.paymentProvider || getLaunchPrepConfigValue("payment.defaultProviderId", "mockpay_web"),
      providerAdapter: order.providerAdapter || "adapter.placeholder",
      checkoutSessionId: order.checkoutSessionId || "",
      providerSessionId: order.providerSessionId || "",
      providerCheckoutUrl: order.providerCheckoutUrl || "",
      externalTransactionId: order.externalTransactionId || "",
      verificationState: order.verificationState || "pending",
      verificationReason: order.verificationReason || "",
      callbackCount: Math.max(0, normalizeNumber(order.callbackCount, 0)),
      lastCallbackId: order.lastCallbackId || "",
      lastCallbackStatus: order.lastCallbackStatus || "",
      lastCallbackAt: order.lastCallbackAt || "",
      channel: order.channel || "mock_checkout",
      price: {
        amount: normalizeNumber(price.amount, 0),
        currency: price.currency || order.currency || product.currency || "CNY",
        label: price.label || order.priceLabel || product.priceLabel || "支付占位"
      },
      priceLabel: order.priceLabel || price.label || product.priceLabel || "支付占位",
      priceValue: normalizeNumber(order.priceValue || product.priceValue, 0),
      currency: order.currency || price.currency || product.currency || "CNY",
      orderTemplate: order.orderTemplate || product.orderTemplate || "",
      stageHistory: history,
      stageSummary: order.stageSummary || buildCommerceStageSummary({ stageHistory: history }, product),
      entryPoint: order.entryPoint || product.placement || "",
      note: order.note || "",
      createdAt: order.createdAt || (history[0] && history[0].at) || new Date().toISOString(),
      paidAt: order.paidAt || "",
      fulfilledAt: order.fulfilledAt || "",
      cancelledAt: order.cancelledAt || "",
      failedAt: order.failedAt || "",
      timedOutAt: order.timedOutAt || "",
      exceptionAt: order.exceptionAt || "",
      updatedAt: order.updatedAt || (history[history.length - 1] && history[history.length - 1].at) || new Date().toISOString()
    };
  }

  function normalizeCommerceEntitlement(raw, product, opsState, dateValue) {
    var entitlement = raw || {};
    var firstPurchase = opsState && opsState.firstPurchase ? opsState.firstPurchase : {};
    var monthlyCard = opsState && opsState.monthlyCard ? opsState.monthlyCard : {};
    var availability = getLocalProductAvailability(product, opsState, dateValue);

    entitlement.sku = entitlement.sku || product.sku;
    entitlement.productId = product.id;
    entitlement.offerId = product.offerId;
    entitlement.entitlementId = product.entitlementId;
    entitlement.kind = product.kind;
    entitlement.purchaseType = product.purchaseType;
    entitlement.entitlementType = product.entitlementType;
    entitlement.status = entitlement.status || "inactive";
    entitlement.activatedAt = entitlement.activatedAt || "";
    entitlement.expiresAt = entitlement.expiresAt || "";
    entitlement.lastClaimDate = entitlement.lastClaimDate || "";
    entitlement.lastOrderId = entitlement.lastOrderId || "";
    entitlement.lastGrantedAt = entitlement.lastGrantedAt || "";
    entitlement.updatedAt = entitlement.updatedAt || "";
    entitlement.remainingDays = Math.max(0, normalizeNumber(entitlement.remainingDays, 0));
    entitlement.todayClaimable = !!entitlement.todayClaimable;
    entitlement.claimable = !!entitlement.claimable;
    entitlement.claimedToday = !!entitlement.claimedToday;
    entitlement.fulfilled = !!entitlement.fulfilled;
    entitlement.grantCount = Math.max(0, normalizeNumber(entitlement.grantCount, 0));
    entitlement.fulfilledOrderIds = Array.isArray(entitlement.fulfilledOrderIds) ? entitlement.fulfilledOrderIds.slice(0, 20) : [];
    entitlement.remainingValueText = entitlement.remainingValueText || "";
    entitlement.currentBenefitText = entitlement.currentBenefitText || "";
    entitlement.whyToday = entitlement.whyToday || product.whyToday || "";

    if (product.offerId === "first_purchase") {
      entitlement.status = firstPurchase.status === "converted"
        ? "fulfilled"
        : (firstPurchase.status === "available" ? "available" : "locked");
      entitlement.activatedAt = firstPurchase.activatedAt || entitlement.activatedAt || "";
      entitlement.expiresAt = "";
      entitlement.lastClaimDate = entitlement.activatedAt || "";
      entitlement.remainingDays = 0;
      entitlement.todayClaimable = entitlement.status === "available";
      entitlement.claimable = entitlement.todayClaimable;
      entitlement.claimedToday = entitlement.status === "fulfilled";
      entitlement.fulfilled = entitlement.status === "fulfilled";
      entitlement.grantCount = entitlement.fulfilled ? Math.max(1, entitlement.grantCount) : entitlement.grantCount;
      entitlement.currentBenefitText = entitlement.status === "fulfilled"
        ? "首购奖励已到账，可直接回 Gear / Gacha 看第一轮转化。"
        : "只有支付成功并完成履约后才会到账，避免首购重复发奖。";
      entitlement.remainingValueText = entitlement.status === "fulfilled"
        ? "首购奖励已全部到账。"
        : formatReward(FIRST_PURCHASE_REWARD);
    } else if (product.offerId === "monthly_card") {
      entitlement.status = monthlyCard.status || "inactive";
      entitlement.activatedAt = monthlyCard.activatedAt || entitlement.activatedAt || "";
      entitlement.expiresAt = monthlyCard.expiresAt || "";
      entitlement.lastClaimDate = monthlyCard.lastClaimDate || "";
      if (entitlement.status === "active" && entitlement.expiresAt && entitlement.expiresAt < dateValue) {
        entitlement.status = "expired";
      }
      entitlement.remainingDays = getMonthlyCardRemainingDays(monthlyCard);
      entitlement.todayClaimable = entitlement.status === "active" && entitlement.lastClaimDate !== dateValue;
      entitlement.claimable = entitlement.todayClaimable;
      entitlement.claimedToday = entitlement.status === "active" && entitlement.lastClaimDate === dateValue;
      entitlement.fulfilled = entitlement.status === "active" || entitlement.status === "expired";
      entitlement.grantCount = entitlement.fulfilled ? Math.max(1, entitlement.grantCount) : entitlement.grantCount;
      if (entitlement.status === "active") {
        entitlement.currentBenefitText = entitlement.todayClaimable
          ? "月卡进行中，今日日常可领。"
          : "月卡进行中，今日已领，后续可继续补 build。";
        entitlement.remainingValueText = "剩余 " + entitlement.remainingDays + " 天 · 今日" +
          (entitlement.todayClaimable ? "可领 " : "已领 ") + formatReward(MONTHLY_CARD_CONFIG.dailyReward);
      } else if (entitlement.status === "expired") {
        entitlement.currentBenefitText = "月卡已过期，可重新开通恢复回流收益。";
        entitlement.remainingValueText = "重新开通后每日可领 " + formatReward(MONTHLY_CARD_CONFIG.dailyReward);
      } else {
        entitlement.currentBenefitText = "支付成功后先发放开通奖励，再激活 30 天权益。";
        entitlement.remainingValueText = "开通奖励 " + formatReward(MONTHLY_CARD_CONFIG.activationReward) + " · 每日 " + formatReward(MONTHLY_CARD_CONFIG.dailyReward);
      }
    } else if (product.purchaseType === "consumable") {
      entitlement.status = entitlement.grantCount > 0 ? "repeatable" : "ready";
      entitlement.todayClaimable = true;
      entitlement.claimable = true;
      entitlement.claimedToday = false;
      entitlement.fulfilled = entitlement.grantCount > 0;
      entitlement.currentBenefitText = "每次支付成功后都会立即到账，适合补今天的资源缺口。";
      entitlement.remainingValueText = "已到账 " + entitlement.grantCount + " 次 · 每次 " + formatReward(CONSUMABLE_SUPPLY_REWARD);
    } else {
      entitlement.status = entitlement.grantCount > 0
        ? "fulfilled"
        : (availability.available ? "available" : (availability.status === "ended" ? "expired" : availability.status));
      entitlement.todayClaimable = entitlement.status === "available";
      entitlement.claimable = entitlement.todayClaimable;
      entitlement.claimedToday = false;
      entitlement.fulfilled = entitlement.status === "fulfilled";
      entitlement.currentBenefitText = entitlement.fulfilled
        ? "礼包已到账，可回主循环继续消化收益。"
        : "只有完成支付成功 + 履约后才会到账。";
      entitlement.remainingValueText = entitlement.fulfilled
        ? "已到账 " + entitlement.grantCount + " 次。"
        : (Array.isArray(product.benefits) ? product.benefits.join(" / ") : "等待到账");
    }

    entitlement.updatedAt = new Date().toISOString();
    return entitlement;
  }

  function normalizeCommerceState(raw, opsState, dateValue) {
    var state = raw || {};

    state.catalogVersion = state.catalogVersion || getLaunchPrepConfigValue("version", "launch-prep-v4");
    state.orders = Array.isArray(state.orders)
      ? state.orders.map(function (order) {
        return normalizeCommerceOrder(order);
      }).filter(Boolean).slice(0, 20)
      : [];
    state.entitlements = state.entitlements || {};
    state.checkoutSessions = Array.isArray(state.checkoutSessions) ? state.checkoutSessions.slice(0, 20) : [];
    state.paymentCallbacks = Array.isArray(state.paymentCallbacks) ? state.paymentCallbacks.slice(0, 40) : [];

    readProductCatalog().forEach(function (product) {
      state.entitlements[product.entitlementId] = normalizeCommerceEntitlement(
        state.entitlements[product.entitlementId],
        product,
        opsState,
        dateValue
      );
    });
    state.lastUpdatedAt = new Date().toISOString();

    return state;
  }

  function readCommerceState(opsState, dateValue) {
    var state = isBackendEnabled()
      ? normalizeCommerceState(clone(serverCache.playerState.commerceState), opsState, dateValue)
      : normalizeCommerceState(readStorageJson(STORAGE_KEYS.commerceState), opsState, dateValue);
    writeStorageJson(STORAGE_KEYS.commerceState, state);
    return state;
  }

  function createMockOrderId(seed) {
    return "mock-order-" + String(seed || "product") + "-" + Date.now() + "-" + Math.random().toString(16).slice(2, 8);
  }

  function findCommerceOrderById(commerceState, orderId) {
    return (commerceState && Array.isArray(commerceState.orders) ? commerceState.orders : []).find(function (order) {
      return order.orderId === orderId;
    }) || null;
  }

  function getLatestCommerceOrderForOffer(commerceState, offerId) {
    return (commerceState && Array.isArray(commerceState.orders) ? commerceState.orders : []).find(function (order) {
      return order.offerId === offerId;
    }) || null;
  }

  function appendCommerceOrderStage(order, stage, label, detail, fields) {
    var patch = fields || {};
    var nowIso = patch.at || new Date().toISOString();
    var latest = Array.isArray(order.stageHistory) && order.stageHistory.length ? order.stageHistory[order.stageHistory.length - 1] : null;

    if (!latest || latest.stage !== stage) {
      order.stageHistory = Array.isArray(order.stageHistory) ? order.stageHistory : [];
      order.stageHistory.push({ stage: stage, label: label, detail: detail || "", at: nowIso });
    }
    order.status = patch.status || stage;
    order.orderStage = stage;
    order.checkoutStatus = patch.checkoutStatus || order.checkoutStatus;
    order.deliveryStatus = patch.deliveryStatus || order.deliveryStatus;
    order.fulfillmentStatus = patch.fulfillmentStatus || order.fulfillmentStatus;
    order.updatedAt = nowIso;
    if (stage === "paid") {
      order.paidAt = order.paidAt || nowIso;
    }
    if (stage === "fulfilled") {
      order.fulfilledAt = order.fulfilledAt || nowIso;
    }
    if (stage === "failed") {
      order.failedAt = order.failedAt || nowIso;
    }
    if (stage === "cancelled") {
      order.cancelledAt = order.cancelledAt || nowIso;
    }
    order.stageSummary = buildCommerceStageSummary(order, findProductById(order.productId) || findProductByOfferId(order.offerId));
    return order;
  }

  function markEntitlementFulfilled(entitlement, orderId, grantedAt) {
    entitlement.fulfilled = true;
    entitlement.lastOrderId = orderId;
    entitlement.lastGrantedAt = grantedAt;
    entitlement.grantCount = Math.max(0, normalizeNumber(entitlement.grantCount, 0)) + 1;
    entitlement.fulfilledOrderIds = Array.isArray(entitlement.fulfilledOrderIds) ? entitlement.fulfilledOrderIds : [];
    if (entitlement.fulfilledOrderIds.indexOf(orderId) === -1) {
      entitlement.fulfilledOrderIds.push(orderId);
    }
  }

  function createLocalCommerceOrder(offerId) {
    var opsState = readOpsState(readBridgeState(), todayKey());
    var state = readCommerceState(opsState, todayKey());
    var product = findProductByOfferId(offerId);
    var entitlement = product ? state.entitlements[product.entitlementId] : null;
    var latestOrder = getLatestCommerceOrderForOffer(state, offerId);
    var availability = getLocalProductAvailability(product, opsState, todayKey());
    var order;
    var nowIso = new Date().toISOString();

    if (!product || !availability.available) {
      pushRewardFeedback({
        context: "commerce",
        title: "当前不可下单",
        summary: product ? product.title : "商品不存在",
        detail: availability.reason || "该商品当前不可创建订单。"
      });
      return null;
    }
    if (latestOrder && latestOrder.status === "pending_payment") {
      pushRewardFeedback({
        context: "commerce",
        title: "已有待支付订单",
        summary: product.title,
        detail: "请先模拟支付成功 / 失败 / 取消，再决定是否重新下单。"
      });
      return latestOrder;
    }
    if (product.purchaseType === "subscription-like" && entitlement && entitlement.status === "active") {
      pushRewardFeedback({ context: "commerce", title: "月卡已开通", summary: product.title, detail: "当前无需重复创建月卡订单。" });
      return latestOrder;
    }
    if (product.purchaseType !== "consumable" && entitlement && normalizeNumber(entitlement.grantCount, 0) > 0 && offerId !== "monthly_card") {
      pushRewardFeedback({ context: "commerce", title: "商品已到账", summary: product.title, detail: "一次性商品已完成履约，不再重复创建订单。" });
      return latestOrder;
    }

    order = normalizeCommerceOrder({
      orderId: createMockOrderId(offerId),
      sku: product.sku,
      productId: product.id,
      offerId: product.offerId,
      entitlementId: product.entitlementId,
      purchaseType: product.purchaseType,
      entitlementType: product.entitlementType,
      status: "pending_payment",
      orderStage: "pending_payment",
      checkoutStatus: "pending_payment",
      deliveryStatus: "awaiting_payment",
      fulfillmentStatus: "pending",
      channel: "local_mock_checkout",
      price: clone(product.price),
      priceLabel: product.priceLabel,
      priceValue: product.priceValue,
      currency: product.currency,
      orderTemplate: product.orderTemplate,
      entryPoint: product.placement || "主城运营位",
      note: "本地 mock 订单已创建，可继续模拟支付成功 / 失败 / 取消。",
      createdAt: nowIso,
      updatedAt: nowIso,
      stageHistory: [
        { stage: "created", label: "订单已创建", detail: "商品骨架已生成。", at: nowIso },
        { stage: "pending_payment", label: "待支付", detail: "等待模拟支付结果。", at: nowIso }
      ]
    });
    state.orders = [order].concat(state.orders || []).slice(0, 20);
    if (state.entitlements[product.entitlementId]) {
      state.entitlements[product.entitlementId].lastOrderId = order.orderId;
    }
    state = normalizeCommerceState(state, opsState, todayKey());
    writeStorageJson(STORAGE_KEYS.commerceState, state);
    pushRewardFeedback({ context: "commerce", title: "订单已创建", summary: product.title + " · " + product.priceLabel, detail: "当前订单进入待支付，可继续模拟支付成功 / 失败 / 取消。" });
    return findCommerceOrderById(state, order.orderId);
  }

  function fulfillLocalCommerceOrder(state, order, product, opsState) {
    var entitlement = state.entitlements[product.entitlementId];
    var nowIso = new Date().toISOString();
    var reward = null;
    var feedback = null;

    if (order.status === "fulfilled") {
      order.duplicateBlocked = true;
      pushRewardFeedback({ context: "commerce", title: "重复履约已拦截", summary: product.title, detail: "该订单已完成履约，不会重复到账。" });
      return state;
    }

    if (product.offerId === "first_purchase") {
      reward = FIRST_PURCHASE_REWARD;
      opsState.firstPurchase.status = "converted";
      opsState.firstPurchase.activatedAt = nowIso;
      entitlement.status = "fulfilled";
      entitlement.activatedAt = nowIso;
      entitlement.claimable = false;
      entitlement.todayClaimable = false;
      entitlement.claimedToday = true;
      markEntitlementFulfilled(entitlement, order.orderId, nowIso);
      feedback = { context: "first_purchase", title: "首购礼包已到账", detail: "订单支付成功后已完成履约" };
    } else if (product.offerId === "monthly_card") {
      reward = MONTHLY_CARD_CONFIG.activationReward;
      opsState.monthlyCard.status = "active";
      opsState.monthlyCard.activatedAt = nowIso;
      opsState.monthlyCard.expiresAt = shiftDateKey(todayKey(), normalizeNumber(product.duration && product.duration.count, 30) - 1);
      opsState.monthlyCard.lastClaimDate = "";
      opsState.monthlyCard.activationCount = normalizeNumber(opsState.monthlyCard.activationCount, 0) + 1;
      entitlement.status = "active";
      entitlement.activatedAt = nowIso;
      entitlement.expiresAt = opsState.monthlyCard.expiresAt;
      entitlement.claimable = true;
      entitlement.todayClaimable = true;
      entitlement.claimedToday = false;
      markEntitlementFulfilled(entitlement, order.orderId, nowIso);
      feedback = { context: "monthly_card", title: "月卡权益已生效", detail: "开通奖励已到账，今日月卡收益可领取" };
    } else if (product.offerId === "event_bundle") {
      reward = EVENT_BUNDLE_REWARD;
      entitlement.status = "fulfilled";
      entitlement.claimable = false;
      entitlement.todayClaimable = false;
      markEntitlementFulfilled(entitlement, order.orderId, nowIso);
      feedback = { context: "event_bundle", title: "活动礼包已到账", detail: "本期活动礼包已完成履约" };
    } else if (product.offerId === "combat_supply_bundle") {
      reward = CONSUMABLE_SUPPLY_REWARD;
      entitlement.status = "repeatable";
      entitlement.claimable = true;
      entitlement.todayClaimable = true;
      markEntitlementFulfilled(entitlement, order.orderId, nowIso);
      feedback = { context: "combat_supply_bundle", title: "战备补给已到账", detail: "消耗型商品已到账，可继续重复购买" };
    } else if (product.offerId === "boss_rush_bundle") {
      reward = BOSS_RUSH_REWARD;
      entitlement.status = "fulfilled";
      entitlement.claimable = false;
      entitlement.todayClaimable = false;
      markEntitlementFulfilled(entitlement, order.orderId, nowIso);
      feedback = { context: "boss_rush_bundle", title: "Boss 冲刺礼包已到账", detail: "一次性冲刺包已完成履约" };
    }

    if (reward) {
      grantReward(reward, feedback);
    }
    order.fulfillmentCount = normalizeNumber(order.fulfillmentCount, 0) + 1;
    appendCommerceOrderStage(order, "fulfilled", product.purchaseType === "subscription-like" ? "权益已生效" : "奖励已到账", feedback && feedback.detail ? feedback.detail : "订单已完成履约。", {
      status: "fulfilled",
      checkoutStatus: "paid",
      deliveryStatus: product.purchaseType === "subscription-like" ? "entitled" : "delivered",
      fulfillmentStatus: "fulfilled",
      at: nowIso
    });
    writeStorageJson(STORAGE_KEYS.opsState, opsState);
    return normalizeCommerceState(state, opsState, todayKey());
  }

  function simulateLocalCommerceOrder(orderId, action) {
    var opsState = readOpsState(readBridgeState(), todayKey());
    var state = readCommerceState(opsState, todayKey());
    var order = findCommerceOrderById(state, orderId);
    var product = order ? (findProductById(order.productId) || findProductByOfferId(order.offerId)) : null;

    if (!order || !product) {
      return;
    }
    if (action === "pay_success") {
      if (order.status === "fulfilled") {
        order.duplicateBlocked = true;
        pushRewardFeedback({ context: "commerce", title: "重复履约已拦截", summary: product.title, detail: "订单已经完成履约，不会重复发放权益。" });
      } else {
        appendCommerceOrderStage(order, "paid", "支付成功", "模拟支付成功，准备进入履约。", {
          status: "paid",
          checkoutStatus: "paid",
          deliveryStatus: "awaiting_fulfillment",
          fulfillmentStatus: "pending"
        });
        state = fulfillLocalCommerceOrder(state, order, product, opsState);
      }
    } else if (action === "pay_fail") {
      if (order.status === "failed" || order.status === "cancelled") {
        pushRewardFeedback({ context: "commerce", title: "订单状态不可改写", summary: product.title, detail: "失败 / 取消订单保持终态，不会再切换成其他支付结果。" });
        writeStorageJson(STORAGE_KEYS.commerceState, normalizeCommerceState(state, opsState, todayKey()));
        return;
      }
      appendCommerceOrderStage(order, "failed", "支付失败", "模拟支付失败，权益不会发放。", {
        status: "failed",
        checkoutStatus: "failed",
        deliveryStatus: "not_started",
        fulfillmentStatus: "aborted"
      });
      pushRewardFeedback({ context: "commerce", title: "支付失败", summary: product.title, detail: "订单停在支付失败，未发放任何权益。" });
      state = normalizeCommerceState(state, opsState, todayKey());
    } else if (action === "cancel") {
      if (order.status === "failed" || order.status === "cancelled") {
        pushRewardFeedback({ context: "commerce", title: "订单状态不可改写", summary: product.title, detail: "失败 / 取消订单保持终态，不会再切换成其他支付结果。" });
        writeStorageJson(STORAGE_KEYS.commerceState, normalizeCommerceState(state, opsState, todayKey()));
        return;
      }
      appendCommerceOrderStage(order, "cancelled", "已取消", "模拟用户取消支付，订单不再继续履约。", {
        status: "cancelled",
        checkoutStatus: "cancelled",
        deliveryStatus: "not_started",
        fulfillmentStatus: "aborted"
      });
      pushRewardFeedback({ context: "commerce", title: "支付已取消", summary: product.title, detail: "订单已取消，可重新创建新订单。" });
      state = normalizeCommerceState(state, opsState, todayKey());
    }
    writeStorageJson(STORAGE_KEYS.commerceState, state);
  }

  function getCommerceEntitlement(commerceState, offerId) {
    var product = findProductByOfferId(offerId);
    if (!product || !commerceState || !commerceState.entitlements) {
      return null;
    }
    return commerceState.entitlements[product.entitlementId] || null;
  }

  function getLatestCommerceOrder(commerceState, offerId) {
    var orders = commerceState && Array.isArray(commerceState.orders) ? commerceState.orders : [];
    var i;
    for (i = 0; i < orders.length; i += 1) {
      if (orders[i].offerId === offerId) {
        return orders[i];
      }
    }
    return null;
  }

  function formatCommerceEntitlement(entitlement) {
    if (!entitlement) {
      return "未生成";
    }
    if (entitlement.offerId === "first_purchase") {
      if (entitlement.status === "fulfilled") {
        return "已到账" + (entitlement.activatedAt ? " · " + formatTime(entitlement.activatedAt) : "");
      }
      if (entitlement.status === "available") {
        return "已解锁 · 今日可到账";
      }
      return "待首战解锁";
    }
    if (entitlement.offerId === "monthly_card") {
      if (entitlement.status === "active") {
        return "进行中，剩余 " + Math.max(0, diffDaysInclusive(todayKey(), entitlement.expiresAt || todayKey())) +
          " 天" + (entitlement.lastClaimDate === todayKey() ? " · 今日已领" : " · 今日可领");
      }
      if (entitlement.status === "expired") {
        return "已过期，可重新开通";
      }
      return "未开通";
    }
    return entitlement.status || "未激活";
  }

  function formatCommerceOrder(order) {
    if (!order) {
      return "尚无模拟订单，支付接入位已预留。";
    }
    return [
      order.priceLabel || "支付占位",
      "Provider:" + (order.paymentProvider || getLaunchPrepConfigValue("payment.defaultProviderId", "mockpay_web")),
      "支付:" + (order.checkoutStatus === "mock_paid" ? "模拟成功" : (order.checkoutStatus || "待支付")),
      (order.externalTransactionId ? "交易:" + order.externalTransactionId : "交易:待生成"),
      "验签:" + (order.verificationState || "pending"),
      "履约:" + (order.deliveryStatus === "entitled" ? "权益生效" : (order.deliveryStatus === "delivered" ? "奖励到账" : (order.deliveryStatus || "待发放"))),
      formatTime(order.fulfilledAt || order.paidAt || order.createdAt)
    ].filter(Boolean).join(" · ");
  }

  function buildEmptyAnalyticsMetric() {
    return {
      count: 0,
      lastAt: "",
      lastStatus: "",
      lastOfferId: "",
      lastOrderId: ""
    };
  }

  function normalizeAnalyticsMetric(raw) {
    var metric = raw || {};
    return {
      count: Math.max(0, normalizeNumber(metric.count, 0)),
      lastAt: metric.lastAt || "",
      lastStatus: metric.lastStatus || "",
      lastOfferId: metric.lastOfferId || "",
      lastOrderId: metric.lastOrderId || ""
    };
  }

  function normalizeAnalyticsState(raw) {
    var state = raw || {};
    var funnel = state.funnel || {};

    state.events = Array.isArray(state.events) ? state.events : [];
    state.funnel = {
      productExposed: normalizeAnalyticsMetric(funnel.productExposed),
      orderCreated: normalizeAnalyticsMetric(funnel.orderCreated),
      checkoutSessionCreated: normalizeAnalyticsMetric(funnel.checkoutSessionCreated),
      paymentSucceeded: normalizeAnalyticsMetric(funnel.paymentSucceeded),
      paymentFailed: normalizeAnalyticsMetric(funnel.paymentFailed),
      paymentCancelled: normalizeAnalyticsMetric(funnel.paymentCancelled),
      paymentTimedOut: normalizeAnalyticsMetric(funnel.paymentTimedOut),
      paymentException: normalizeAnalyticsMetric(funnel.paymentException),
      entitlementFulfilled: normalizeAnalyticsMetric(funnel.entitlementFulfilled),
      monthlyCardClaimed: normalizeAnalyticsMetric(funnel.monthlyCardClaimed),
      bossFirstClear: normalizeAnalyticsMetric(funnel.bossFirstClear),
      activityRedeemed: normalizeAnalyticsMetric(funnel.activityRedeemed),
      guideStepViewed: normalizeAnalyticsMetric(funnel.guideStepViewed),
      guideCtaClicked: normalizeAnalyticsMetric(funnel.guideCtaClicked),
      returnHookViewed: normalizeAnalyticsMetric(funnel.returnHookViewed),
      nextDayPreviewViewed: normalizeAnalyticsMetric(funnel.nextDayPreviewViewed),
      sessionLoopCompleted: normalizeAnalyticsMetric(funnel.sessionLoopCompleted),
      playtestRewardClaimed: normalizeAnalyticsMetric(funnel.playtestRewardClaimed),
      playtestGachaCompleted: normalizeAnalyticsMetric(funnel.playtestGachaCompleted),
      playtestGearProgressed: normalizeAnalyticsMetric(funnel.playtestGearProgressed),
      playtestAdventureStarted: normalizeAnalyticsMetric(funnel.playtestAdventureStarted),
      playtestBossStarted: normalizeAnalyticsMetric(funnel.playtestBossStarted),
      playtestLeaderboardViewed: normalizeAnalyticsMetric(funnel.playtestLeaderboardViewed),
      playtestHomeReturned: normalizeAnalyticsMetric(funnel.playtestHomeReturned)
    };
    state.monitoring = state.monitoring || {};
    state.recent = state.recent || { keyEvents: [], orders: [], rewards: [] };
    return state;
  }

  function updateResourceBar(wallet) {
    if (el.resourceSpiritStone) {
      el.resourceSpiritStone.textContent = wallet.spiritStone;
    }
    if (el.resourceDrawTickets) {
      el.resourceDrawTickets.textContent = wallet.drawTickets;
    }
    if (el.resourceMaterials) {
      el.resourceMaterials.textContent = wallet.materials;
    }
  }

  function applyRewardToWallet(reward) {
    var wallet = readWalletState();
    Object.keys(REWARD_LABELS).forEach(function (key) {
      wallet[key] = normalizeNumber(wallet[key], 0) + normalizeNumber(reward[key], 0);
    });
    writeStorageJson(STORAGE_KEYS.walletState, wallet);
    return wallet;
  }

  function readRewardState() {
    var state = isBackendEnabled()
      ? clone(serverCache.playerState.rewardState)
      : readStorageJson(STORAGE_KEYS.rewardState);
    if (!state) {
      return { latest: null, history: [] };
    }
    state.latest = state.latest || null;
    state.history = Array.isArray(state.history) ? state.history : [];
    return state;
  }

  function readAnalyticsState() {
    var state = isBackendEnabled()
      ? normalizeAnalyticsState(clone(serverCache.playerState.analyticsState || {}))
      : normalizeAnalyticsState(readStorageJson(STORAGE_KEYS.analyticsState) || {});
    writeStorageJson(STORAGE_KEYS.analyticsState, state);
    return state;
  }

  function getAnalyticsMetricCount(metric) {
    return normalizeAnalyticsMetric(metric).count;
  }

  function pushRewardFeedback(entry) {
    var state = readRewardState();
    var normalized;

    if (!entry) {
      return state;
    }

    normalized = {
      context: entry.context || "reward",
      title: entry.title || "奖励到账",
      summary: entry.summary || "-",
      detail: entry.detail || "",
      timestamp: entry.timestamp || new Date().toISOString()
    };
    state.latest = normalized;
    state.history = [normalized].concat(state.history || []).slice(0, 12);
    writeStorageJson(STORAGE_KEYS.rewardState, state);
    return state;
  }

  function grantReward(reward, feedback) {
    var payload = feedback || {};
    applyRewardToWallet(reward || {});
    pushRewardFeedback({
      context: payload.context || "reward",
      title: payload.title || "奖励到账",
      summary: payload.summary || formatReward(reward || {}),
      detail: payload.detail || "",
      timestamp: payload.timestamp || new Date().toISOString()
    });
    announceRewardMoment(reward || {}, payload);
  }

  function buildGachaFeedback(results, pool, options) {
    var highest = null;
    var setNames = [];
    var pityTriggered;

    if (!results || !results.length) {
      return null;
    }

    pityTriggered = results.some(function (entry) {
      return !!entry.pityTriggered;
    });

    results.forEach(function (entry) {
      if (!highest || getRarityRank(entry.rarity) > getRarityRank(highest.rarity)) {
        highest = entry;
      }
      if (entry.setName && setNames.indexOf(entry.setName) === -1) {
        setNames.push(entry.setName);
      }
    });

    return {
      context: options.source === "daily_free" ? "free_draw" : "gacha",
      title: options.source === "daily_free"
        ? "每日免费单抽已入库"
        : pool.name + " x" + results.length + " 已完成",
      summary: results.length === 1
        ? "[" + results[0].rarity + "] " + results[0].name
        : "共 " + results.length + " 发 · 最高 [" + highest.rarity + "] " + highest.name,
      detail: [options.note || pool.name, pityTriggered ? "SSR 保底触发" : "", setNames.length ? "命器归属 " + setNames.join("/") : ""].filter(Boolean).join(" · "),
      timestamp: results[results.length - 1].timestamp
    };
  }

  function getRarityRank(rarity) {
    if (rarity === "UR") {
      return 4;
    }
    if (rarity === "SSR") {
      return 3;
    }
    if (rarity === "SR") {
      return 2;
    }
    return 1;
  }

  function formatReward(reward) {
    return Object.keys(REWARD_LABELS).filter(function (key) {
      return normalizeNumber(reward[key], 0) > 0;
    }).map(function (key) {
      return REWARD_LABELS[key] + " x" + reward[key];
    }).join(" / ") || "-";
  }

  function openOfferModal(offerId) {
    var offer = findOffer(offerId);
    var opsState = readOpsState(readBridgeState(), todayKey());
    var commerceState = readCommerceState(opsState, todayKey());
    var product = findProductByOfferId(offerId);
    var entitlement = getCommerceEntitlement(commerceState, offerId);
    var latestOrder = getLatestCommerceOrder(commerceState, offerId);
    if (!offer || !el.opsModal) {
      return;
    }

    if (offerId === "ten_draw_offer") {
      opsState.tenDrawOffer.seenCount += 1;
      opsState.tenDrawOffer.lastSeenAt = new Date().toISOString();
      writeStorageJson(STORAGE_KEYS.opsState, opsState);
    }

    el.opsModalTitle.textContent = offer.name;
    el.opsModalSub.textContent = offer.summary;
    el.opsModalContent.innerHTML = [
      "<div class='item'><strong>当前状态</strong><p class='meta'>" + safe(getOfferStatusText(offer, opsState)) + "</p></div>",
      (product ? "<div class='item'><strong>商品占位</strong><p class='meta'>" + safe(product.id + " · " + product.priceLabel + " · " + product.orderTemplate) + "</p></div>" : ""),
      (product ? "<div class='item'><strong>商品骨架</strong><p class='meta'>" + safe(formatCommerceProductMeta(product)) + "</p></div>" : ""),
      (product ? "<div class='item'><strong>解锁条件</strong><p class='meta'>" + safe(formatCommerceUnlockCondition(product)) + "</p></div>" : ""),
      (product ? "<div class='item'><strong>价值表达</strong><p class='meta'>" + safe(product.valueSummary || getOfferValueSummary(offerId)) + "</p></div>" : ""),
      (entitlement ? "<div class='item'><strong>权益状态</strong><p class='meta'>" + safe(formatCommerceEntitlement(entitlement)) + "</p></div>" : ""),
      "<div class='item'><strong>今天为什么值得点</strong><p class='meta'>" + safe(getOfferCareText(offerId, opsState, commerceState)) + "</p></div>",
      "<div class='item'><strong>当前收益</strong><p class='meta'>" + safe(getCommerceEntitlementBenefitText(entitlement, offerId)) + "</p></div>",
      "<div class='item'><strong>剩余价值</strong><p class='meta'>" + safe(getCommerceEntitlementValueText(entitlement, offerId)) + "</p></div>",
      "<div class='item'><strong>最近订单</strong><p class='meta'>" + safe(formatCommerceOrder(latestOrder)) + "</p></div>",
      (latestOrder ? "<div class='item'><strong>支付承接</strong><p class='meta'>" + safe((latestOrder.paymentProvider || "mockpay_web") + " · " + (latestOrder.providerAdapter || "adapter.placeholder") + (latestOrder.checkoutSessionId ? " · checkout " + latestOrder.checkoutSessionId : " · 待创建 checkout")) + "</p></div>" : ""),
      (latestOrder ? "<div class='item'><strong>回调状态</strong><p class='meta'>" + safe((latestOrder.lastCallbackStatus || "待回调") + " · 验签 " + (latestOrder.verificationState || "pending") + (latestOrder.externalTransactionId ? " · tx " + latestOrder.externalTransactionId : "")) + "</p></div>" : ""),
      "<div class='item'><strong>订单链路</strong><p class='meta'>" + safe(formatCommerceOrderFlow(latestOrder, offerId)) + "</p></div>",
      (latestOrder ? "<div class='item'><strong>阶段轨迹</strong><p class='meta'>" + safe(formatCommerceTimeline(latestOrder)) + "</p></div>" : ""),
      "<div class='item'><strong>入口定位</strong><p class='meta'>" + safe(getOfferPlacementLabel(offer)) + "</p></div>",
      "<div class='item'><strong>内容骨架</strong><p class='meta'>" + safe((offer.items || []).join(" / ")) + "</p></div>",
      (product && product.entryHooks ? "<div class='item'><strong>入口钩子</strong><p class='meta'>" + safe(product.entryHooks.join(" / ")) + "</p></div>" : ""),
      (offer.reward ? "<div class='item'><strong>模拟到账</strong><p class='meta'>" + safe(formatReward(offer.reward)) + "</p></div>" : ""),
      (offer.activationReward ? "<div class='item'><strong>开通奖励</strong><p class='meta'>" + safe(formatReward(offer.activationReward)) + "</p></div>" : ""),
      (offer.dailyReward ? "<div class='item'><strong>每日奖励</strong><p class='meta'>" + safe(formatReward(offer.dailyReward)) + "</p></div>" : ""),
      "<div class='item'><strong>备注</strong><p class='meta'>" + safe(offer.note || "本地原型占位") + "</p></div>"
    ].join("");

    el.opsModal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeOfferModal() {
    if (!el.opsModal) {
      return;
    }
    el.opsModal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function findOffer(offerId) {
    var i;
    for (i = 0; i < OPS_ENTRIES.length; i += 1) {
      if (OPS_ENTRIES[i].id === offerId) {
        return OPS_ENTRIES[i];
      }
    }
    return null;
  }

  function getOfferStatusText(offer, opsState) {
    if (!offer) {
      return "-";
    }
    if (offer.id === "first_purchase") {
      if (opsState.firstPurchase.status === "locked") {
        return "待首战解锁";
      }
      if (opsState.firstPurchase.status === "converted") {
        return "已模拟到账";
      }
      return "已解锁，待模拟转化";
    }
    if (offer.id === "monthly_card") {
      if (opsState.monthlyCard.status === "active") {
        return "进行中，剩余 " + getMonthlyCardRemainingDays(opsState.monthlyCard) + " 天" +
          (opsState.monthlyCard.lastClaimDate === todayKey() ? "，今日已领" : "，今日可领");
      }
      if (opsState.monthlyCard.status === "expired") {
        return "已过期，可重新开通";
      }
      return "未开通";
    }
    return "已查看 " + opsState.tenDrawOffer.seenCount + " 次";
  }

  function getMonthlyCardRemainingDays(monthlyCardState) {
    if (!monthlyCardState || monthlyCardState.status !== "active" || !monthlyCardState.expiresAt) {
      return 0;
    }
    return Math.max(0, diffDaysInclusive(todayKey(), monthlyCardState.expiresAt));
  }

  function renderStatRows(snapshot) {
    var current = snapshot.currentStats || {};
    var base = snapshot.baseStats || {};
    return [
      "<p>战力: <strong>" + (snapshot.powerScore || 0) + "</strong></p>",
      statLine("HP", current.HP, base.HP),
      statLine("ATK", current.ATK, base.ATK),
      statLine("DEF", current.DEF, base.DEF),
      statLine("INT", current.INT, base.INT),
      statLine("LUK", current.LUK, base.LUK)
    ].join("");
  }

  function statLine(label, current, base) {
    var delta = (current || 0) - (base || 0);
    var deltaText = delta === 0 ? "±0" : (delta > 0 ? "+" + delta : String(delta));
    return "<p class='meta'>" + label + ": " + (current || 0) + " (相对基础 " + deltaText + ")</p>";
  }

  function readBridgeState() {
    return {
      latestBattle: readStorageJson(STORAGE_KEYS.latestBattle),
      profileSnapshot: readStorageJson(STORAGE_KEYS.profileSnapshot)
    };
  }

  function renderLatestBattleCard(bridge) {
    var latest = bridge.latestBattle;
    if (!latest) {
      return "<div class='tile'><h3>最近一次战斗结果</h3><p class='muted'>暂无记录，先去 Adventure/Boss 挑战一场。</p></div>";
    }
    var mapName = mapById[latest.mapId] ? mapById[latest.mapId].name : latest.mapId;
    var latestMap = mapById[latest.mapId] || null;
    var followUpText = latest.result === "victory"
      ? "这把打完先回榜确认有没有真涨，再决定继续追 Boss 还是去刷图补件。"
      : "这把没打穿就先补 Gear 或刷推荐图，再回榜看差距是不是已经缩小。";
    var proofText = latest.bossMechanicSummary
      ? "如果这是记分 Boss，这次机制处理已经值得拿去验证榜分变化。"
      : "如果这是刷图回合，先确认掉落有没有补上当前最缺的追件。";
    return [
      "<div class='tile'>",
      "<h3>最近一次战斗结果</h3>",
      "<p>" + (latest.result === "victory" ? "胜利" : "失败") + " · " + safe(mapName) + "</p>",
      "<p class='meta'>剩余HP: " + (latest.remainingHp || 0) + " | HP比: " + toPercent(latest.hpRatio || 0) + "</p>",
      ((latest.mapRewardFocus || latest.mapPurpose) ? "<p class='meta'>地图价值: " + safe(latest.mapPurpose || "-") + " | 奖励焦点: " + safe(latest.mapRewardFocus || "-") + "</p>" : ""),
      (latestMap && latestMap.dropTable && latestMap.dropTable.rewardRhythm ? "<p class='meta'>奖励节奏: " + safe(latestMap.dropTable.rewardRhythm) + "</p>" : ""),
      (latest.fateImpact ? "<p class='meta'>命格反馈: " + safe(latest.fateImpact.verdict) + " | " + safe(latest.fateImpact.rewardText) + " | " + safe(latest.fateImpact.pressureText) + "</p>" : ""),
      (latest.bossMechanicSummary ? "<p class='meta'>机制处理: " + safe(summarizeBossMechanic(latest.bossMechanicSummary)) + "</p>" : ""),
      "<p class='meta'>掉落: " + safe(formatLootSummary(latest.lootSummary)) + "</p>",
      "<p class='meta'>回流建议: " + safe(followUpText) + " | " + safe(proofText) + "</p>",
      "<div class='button-row'>",
      "<button type='button' class='cta' data-jump-tab='leaderboard'>回榜看变化</button>",
      "<button type='button' data-jump-tab='gear'>去 Gear 补强</button>",
      "<button type='button' data-jump-tab='adventure' data-map-id='" + safe(latest.mapId || activeMapId) + "'>继续刷图</button>",
      "</div>",
      "<p class='meta'>时间: " + safe(formatTime(latest.timestamp)) + "</p>",
      "</div>"
    ].join("");
  }

  function buildPhase1Url(mapId, returnTab) {
    var returnTo = "../phase2/?tab=" + encodeURIComponent(returnTab || "home") + "&map=" + encodeURIComponent(mapId || "") + "&bossDate=" + encodeURIComponent(activeBossDateKey);
    return "../phase1/?map=" + encodeURIComponent(mapId || "") + "&returnTo=" + encodeURIComponent(returnTo);
  }

  function formatLootSummary(lootSummary) {
    if (!lootSummary || !lootSummary.total) {
      return "0 件";
    }
    return lootSummary.total + " 件 (" + formatCounter(lootSummary.byRarity || {}) + ")";
  }

  function formatCounter(counter) {
    var keys = Object.keys(counter || {});
    if (keys.length === 0) {
      return "-";
    }
    return keys.map(function (key) {
      return key + "x" + counter[key];
    }).join(" / ");
  }

  function normalizeGachaState(raw) {
    var state = raw || {};
    state.history = Array.isArray(state.history) ? state.history.map(normalizeGachaEntry).filter(Boolean) : [];
    state.inventory = Array.isArray(state.inventory) ? state.inventory.map(normalizeGachaEntry).filter(Boolean) : [];
    state.lastResult = state.lastResult ? normalizeGachaEntry(state.lastResult) : null;
    state.pity = state.pity || {};
    GACHA_POOLS.forEach(function (pool) {
      state.pity[pool.id] = normalizePoolPityState(state.pity[pool.id], pool);
    });
    return state;
  }

  function normalizeGachaEntry(raw) {
    var entry = raw || {};
    var slot = typeof entry.slot === "string" ? entry.slot : "";
    var setMeta = resolveSetDefinition(entry.element);

    if (!entry.name && !entry.poolId && !entry.timestamp) {
      return null;
    }

    return {
      poolId: entry.poolId || "",
      poolName: entry.poolName || "",
      type: entry.type || "",
      name: entry.name || "未命名掉落",
      rarity: entry.rarity || "R",
      element: entry.element || "",
      slot: slot,
      gearScore: Math.max(0, normalizeNumber(entry.gearScore != null ? entry.gearScore : entry.baseGearScore, 0)),
      stats: clone(entry.stats || {}),
      enhancementLevel: Math.max(0, normalizeNumber(entry.enhancementLevel, 0)),
      itemKey: entry.itemKey || buildEquipmentLikeItemKey(slot, entry),
      setId: entry.setId || (slot ? setMeta.id : ""),
      setName: entry.setName || (slot ? setMeta.name : ""),
      setFocus: entry.setFocus || (slot ? setMeta.focus : ""),
      source: entry.source || "normal",
      note: entry.note || "",
      pityTriggered: !!entry.pityTriggered,
      pityState: entry.pityState ? {
        sinceLastSsr: Math.max(0, normalizeNumber(entry.pityState.sinceLastSsr, 0)),
        ssrThreshold: Math.max(1, normalizeNumber(entry.pityState.ssrThreshold, GACHA_PITY_SSR_THRESHOLD)),
        remaining: Math.max(0, normalizeNumber(entry.pityState.remaining, 0))
      } : null,
      timestamp: entry.timestamp || ""
    };
  }

  function normalizePoolPityState(raw, pool) {
    var state = raw || {};
    var threshold = resolvePoolPityThreshold(pool, state.ssrThreshold);
    var sinceLastSsr = Math.max(0, Math.min(threshold - 1, normalizeNumber(state.sinceLastSsr, 0)));

    return {
      ssrThreshold: threshold,
      sinceLastSsr: sinceLastSsr,
      remaining: Math.max(0, threshold - sinceLastSsr),
      lastHighRarityAt: state.lastHighRarityAt || "",
      lastPityTriggeredAt: state.lastPityTriggeredAt || "",
      lastDrawAt: state.lastDrawAt || ""
    };
  }

  function renderGachaPityRows(gachaState) {
    return GACHA_POOLS.map(function (pool) {
      var pity = normalizePoolPityState(gachaState && gachaState.pity ? gachaState.pity[pool.id] : null, pool);
      return pool.name + " " + pity.sinceLastSsr + "/" + pity.ssrThreshold + "，还差 " + pity.remaining + " 抽";
    }).join(" | ");
  }

  function formatGachaResultMeta(entry) {
    var setName = entry && entry.setName ? entry.setName : resolveSetNameFromElement(entry && entry.element);
    var parts = [];

    if (!entry) {
      return "暂无结果";
    }
    if (isEquipableInventoryItem(entry)) {
      parts.push((SLOT_LABELS[entry.slot] || entry.slot) + " GS " + entry.gearScore);
    }
    if (setName) {
      parts.push(setName);
    }
    if (entry.pityTriggered) {
      parts.push("SSR 保底触发");
    } else if (entry.pityState && typeof entry.pityState.remaining === "number") {
      parts.push("距保底 " + entry.pityState.remaining + " 抽");
    }
    return parts.join(" · ") || "常规抽取";
  }

  function buildEquipmentLikeItemKey(slot, item) {
    return [slot || "", item.name || "", item.rarity || "", item.element || "", normalizeNumber(item.gearScore != null ? item.gearScore : item.baseGearScore, 0)].join("|");
  }

  function buildGachaItemKey(poolId, item, timestamp, index) {
    return [poolId || "", item.slot || "", item.name || "", item.rarity || "", item.element || "", normalizeNumber(item.gearScore, 0), timestamp || "", normalizeNumber(index, 0)].join("|");
  }

  function isEquipableInventoryItem(entry) {
    return !!(entry && entry.slot && entry.type === "命器");
  }

  function getGearInventoryItems(gachaState) {
    return (gachaState && Array.isArray(gachaState.inventory) ? gachaState.inventory : []).filter(function (entry) {
      return isEquipableInventoryItem(entry);
    }).sort(function (a, b) {
      return String(b.timestamp || "").localeCompare(String(a.timestamp || ""));
    });
  }

  function renderLatestEquipButton(entry) {
    if (!isBackendEnabled() || !isEquipableInventoryItem(entry)) {
      return "";
    }
    return "<button class='cta' type='button' data-equip-item='" + safe(entry.itemKey) + "'>直接换上</button>";
  }

  function formatSetProgressPreview(item, equipmentState) {
    var slots = equipmentState && equipmentState.slots ? equipmentState.slots : {};
    var counts = {};
    var current = slots[item.slot];
    var currentCount;
    var nextCount;
    var nextTarget;

    Object.keys(slots).forEach(function (slot) {
      var equipped = slots[slot];
      if (!equipped || !equipped.setId) {
        return;
      }
      counts[equipped.setId] = normalizeNumber(counts[equipped.setId], 0) + 1;
    });

    currentCount = normalizeNumber(counts[item.setId], 0);
    nextCount = currentCount;
    if (!current || current.setId !== item.setId) {
      nextCount += 1;
    }
    nextTarget = nextCount >= 4 ? 4 : 2;
    return "套装追踪: 当前 " + (item.setName || resolveSetDefinition(item.element).name) + " " + currentCount + " 件，换上后 " + nextCount + "/" + nextTarget;
  }

  function resolveSetDefinition(element) {
    return SET_DEFINITIONS[element] || {
      id: "misc",
      name: "散件路线",
      element: element || "无",
      focus: "混搭补位"
    };
  }

  function resolveSetNameFromElement(element) {
    if (!element || !SET_DEFINITIONS[element]) {
      return "";
    }
    return SET_DEFINITIONS[element].name;
  }

  function readGachaState() {
    var state = isBackendEnabled()
      ? normalizeGachaState(clone(serverCache.playerState.gachaState))
      : normalizeGachaState(readStorageJson(STORAGE_KEYS.gachaState));
    writeStorageJson(STORAGE_KEYS.gachaState, state);
    return state;
  }

  function readStorageJson(key) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function writeStorageJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // Ignore storage errors in prototype mode.
    }
  }

  function toMap(list) {
    return list.reduce(function (acc, item) {
      acc[item.id] = item;
      return acc;
    }, {});
  }

  function toPercent(value) {
    return Math.round(value * 100) + "%";
  }

  function isToday(value) {
    if (!value) {
      return false;
    }
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return false;
    }
    return dateKey(d) === todayKey();
  }

  function todayKey() {
    return dateKey(new Date());
  }

  function normalizeDateKey(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return "";
    }
    var d = new Date(value + "T00:00:00");
    if (Number.isNaN(d.getTime())) {
      return "";
    }
    return dateKey(d);
  }

  function dateKey(dateObj) {
    var y = dateObj.getFullYear();
    var m = String(dateObj.getMonth() + 1).padStart(2, "0");
    var d = String(dateObj.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function formatDateLabel(value) {
    var normalized = normalizeDateKey(value);
    if (!normalized) {
      return value || "-";
    }
    var d = new Date(normalized + "T00:00:00");
    return d.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric", weekday: "short" });
  }

  function formatTime(value) {
    if (!value) {
      return "-";
    }
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return value;
    }
    return d.toLocaleString("zh-CN", { hour12: false });
  }

  function normalizeNumber(value, fallback) {
    var num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  }

  function formatSignedNumber(value) {
    var num = normalizeNumber(value, 0);
    return num > 0 ? "+" + num : String(num);
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

  function shiftDateKey(dateValue, days) {
    var normalized = normalizeDateKey(dateValue);
    var d = new Date(normalized + "T00:00:00");
    d.setDate(d.getDate() + days);
    return dateKey(d);
  }

  function diffDaysBetween(startDate, endDate) {
    var start = normalizeDateKey(startDate);
    var end = normalizeDateKey(endDate);
    var startObj;
    var endObj;

    if (!start || !end) {
      return 0;
    }
    startObj = new Date(start + "T00:00:00");
    endObj = new Date(end + "T00:00:00");
    return Math.round((endObj.getTime() - startObj.getTime()) / 86400000);
  }

  function diffDaysInclusive(startDate, endDate) {
    var start = new Date(normalizeDateKey(startDate) + "T00:00:00");
    var end = new Date(normalizeDateKey(endDate) + "T00:00:00");
    var diff = Math.round((end.getTime() - start.getTime()) / 86400000);
    return diff + 1;
  }

  function hashString(input) {
    var hash = 2166136261;
    var i;
    for (i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return Math.abs(hash >>> 0);
  }

  function clone(obj) {
    if (obj == null) {
      return obj;
    }
    return JSON.parse(JSON.stringify(obj));
  }

  function safe(value) {
    return formatUiValue(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
