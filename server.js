const fs = require("fs");
const http = require("http");
const path = require("path");
const vm = require("vm");

const ROOT_DIR = __dirname;
const DEFAULT_DATA_DIR = path.join(ROOT_DIR, "backend", "data");
const DATA_FILE = process.env.LIFE_RPG_DATA_FILE
  ? path.resolve(process.env.LIFE_RPG_DATA_FILE)
  : path.join(DEFAULT_DATA_DIR, "state.json");
const DATA_DIR = path.dirname(DATA_FILE);
const PORT = Number(process.env.PORT || 8787);
const SPECIAL_DAILY_TASK_ID = "daily_boss_first_clear";
const DAILY_TASKS = {
  adventure: { id: "adventure", label: "刷图 1 次", target: 1, reward: { spiritStone: 80, materials: 8 } },
  boss: { id: "boss", label: "打 Boss 1 次", target: 1, reward: { spiritStone: 80, drawTickets: 1, materials: 5 } },
  gacha: { id: "gacha", label: "抽卡 1 次", target: 1, reward: { spiritStone: 120, materials: 3 } }
};
const DEFAULT_WALLET = { spiritStone: 1200, drawTickets: 4, materials: 36 };
const REWARD_LABELS = { spiritStone: "灵石", drawTickets: "抽卡券", materials: "材料" };
const DAILY_LOGIN_REWARD = { spiritStone: 70, materials: 5 };
const DAILY_BOSS_FIRST_CLEAR_REWARD = { spiritStone: 260, drawTickets: 2, materials: 12 };
const DAILY_BOSS_TICKET_CAP = 2;
const FIRST_PURCHASE_REWARD = { spiritStone: 360, drawTickets: 2, materials: 8 };
const MONTHLY_CARD_CONFIG = {
  activationReward: { drawTickets: 1, materials: 6 },
  dailyReward: { spiritStone: 100, materials: 4 },
  durationDays: 30
};
const EVENT_BUNDLE_REWARD = { spiritStone: 220, drawTickets: 2, materials: 10 };
const CONSUMABLE_SUPPLY_REWARD = { spiritStone: 180, drawTickets: 1, materials: 18 };
const BOSS_RUSH_REWARD = { spiritStone: 260, drawTickets: 2, materials: 12 };
const CHECKOUT_SESSION_TTL_MINUTES = 20;
const CHECKOUT_SESSION_LIMIT = 20;
const PAYMENT_CALLBACK_LIMIT = 40;
const ANALYTICS_EVENT_LIMIT = 120;
const PAYMENT_PROVIDER_CATALOG = {
  mockpay_web: {
    id: "mockpay_web",
    label: "MockPay Placeholder",
    adapterId: "adapter.mockpay.web.v1",
    mode: "redirect_checkout",
    callbackMode: "webhook",
    verificationMode: "placeholder_signature",
    callbackPath: "/commerce/payment/callback",
    timeoutMinutes: CHECKOUT_SESSION_TTL_MINUTES,
    notes: "当前只做真实支付接线前的最后一层占位，后续替换 adapter 即可。"
  }
};
const LAUNCH_PREP_CONFIG = {
  version: "launch-prep-v5",
  payment: {
    defaultProviderId: "mockpay_web",
    callbackPath: "/commerce/payment/callback",
    checkoutSessionTtlMinutes: CHECKOUT_SESSION_TTL_MINUTES,
    providers: cloneObject(PAYMENT_PROVIDER_CATALOG)
  },
  analytics: {
    eventLimit: ANALYTICS_EVENT_LIMIT,
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
const PRODUCT_CATALOG = [
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
const SIGN_IN_REWARDS = [
  { day: 1, title: "启程补给", reward: { spiritStone: 80, materials: 6 }, rewardHint: "先把第一件命器抬到 +1~+2" },
  { day: 2, title: "命器润养", reward: { spiritStone: 100, materials: 8 }, rewardHint: "把第一轮强化材料提前补齐" },
  { day: 3, title: "天机抽卡令", reward: { drawTickets: 1, materials: 5 }, rewardHint: "抽到新件后更容易接换装" },
  { day: 4, title: "太岁讨伐资粮", reward: { spiritStone: 160, materials: 8 }, rewardHint: "给第一次 Boss 冲榜准备战备" },
  { day: 5, title: "流年灵石雨", reward: { spiritStone: 200, materials: 10 }, rewardHint: "中段重点补强化与 farm 节奏" },
  { day: 6, title: "命纹双券礼", reward: { drawTickets: 2, materials: 10 }, rewardHint: "为一次集中追卡与补件蓄力" },
  { day: 7, title: "命盘觉醒礼", reward: { spiritStone: 420, drawTickets: 3, materials: 14 }, rewardHint: "周目高峰，给冲榜前的最后一轮追件窗口" }
];
const EVENT_CONFIGS = [
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
const GACHA_POOLS = [
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
const EQUIPMENT_SLOTS = ["weapon", "armor", "talisman", "accessory", "core"];
const EQUIPMENT_SLOT_LABELS = {
  weapon: "武器",
  armor: "防具",
  talisman: "护符",
  accessory: "饰品",
  core: "命盘核心"
};
const STAT_KEYS = ["HP", "ATK", "DEF", "INT", "CHA", "LUK"];
const STAT_POWER_WEIGHTS = { HP: 0.2, ATK: 1, DEF: 0.75, INT: 0.9, CHA: 0.55, LUK: 0.45 };
const ENHANCEMENT_MAX_LEVEL = 10;
const ENHANCEMENT_STAT_SCALE_PER_LEVEL = 0.055;
const ENHANCEMENT_GEAR_SCORE_SCALE_PER_LEVEL = 0.07;
const ENHANCEMENT_SPIRIT_STONE_COSTS = [0, 24, 34, 48, 68, 92, 122, 150, 182, 218, 258];
const ENHANCEMENT_MATERIAL_COSTS = [0, 1, 1, 1, 2, 3, 4, 4, 5, 6, 7];
const SET_BONUS_MIN_COUNT = 2;
const SET_BONUS_CORE_COUNT = 4;
const SET_BONUS_TIER_TWO_RATE = 0.1;
const SET_BONUS_TIER_FOUR_RATE = 0.22;
const SET_BONUS_MATCH_RATE = 0.03;
const SET_BONUS_TABOO_PENALTY = 0.04;
const GACHA_PITY_SSR_THRESHOLD = 50;
const SET_DEFINITIONS = {
  木: { id: "qinglong", name: "青龙套", element: "木", focus: "恢复 / 成长 / 续航" },
  火: { id: "zhuque", name: "朱雀套", element: "火", focus: "爆发 / 燃烧 / AOE" },
  土: { id: "qilin", name: "麒麟套", element: "土", focus: "护盾 / 减伤 / 反伤" },
  金: { id: "baihu", name: "白虎套", element: "金", focus: "暴击 / 穿透 / 斩杀" },
  水: { id: "xuanwu", name: "玄武套", element: "水", focus: "控制 / 回能 / 连携" }
};
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

const GAME_CONFIG = loadGameConfig();
const BOSS_CANDIDATES = (GAME_CONFIG.maps || []).filter(function (map) {
  return !!(map && GAME_CONFIG.bosses && GAME_CONFIG.bosses[map.bossId]);
}).map(function (map) {
  return {
    map: map,
    boss: GAME_CONFIG.bosses[map.bossId]
  };
});

const server = http.createServer(function (req, res) {
  const requestUrl = new URL(req.url, "http://127.0.0.1");
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (requestUrl.pathname === "/player/state" && req.method === "GET") {
    handlePlayerState(req, res);
    return;
  }
  if (requestUrl.pathname === "/player/sync" && req.method === "POST") {
    handlePlayerSync(req, res);
    return;
  }
  if (requestUrl.pathname === "/claim/login-reward" && req.method === "POST") {
    handleClaimLoginReward(req, res);
    return;
  }
  if (requestUrl.pathname === "/claim/daily-task" && req.method === "POST") {
    handleClaimDailyTask(req, res);
    return;
  }
  if (requestUrl.pathname === "/gacha/draw" && req.method === "POST") {
    handleGachaDraw(req, res);
    return;
  }
  if (requestUrl.pathname === "/claim/sign-in" && req.method === "POST") {
    handleClaimSignIn(req, res);
    return;
  }
  if (requestUrl.pathname === "/commerce/orders/create" && req.method === "POST") {
    handleCreateCommerceOrder(req, res);
    return;
  }
  if (requestUrl.pathname === "/commerce/checkout/session" && req.method === "POST") {
    handleCreateCheckoutSession(req, res);
    return;
  }
  if (requestUrl.pathname === "/commerce/orders/simulate" && req.method === "POST") {
    handleSimulateCommerceOrder(req, res);
    return;
  }
  if (requestUrl.pathname === "/commerce/payment/callback" && req.method === "POST") {
    handlePaymentCallback(req, res);
    return;
  }
  if (requestUrl.pathname === "/analytics/track" && req.method === "POST") {
    handleAnalyticsTrack(req, res);
    return;
  }
  if (requestUrl.pathname === "/ops/first-purchase/activate" && req.method === "POST") {
    handleActivateFirstPurchase(req, res);
    return;
  }
  if (requestUrl.pathname === "/ops/monthly-card/activate" && req.method === "POST") {
    handleActivateMonthlyCard(req, res);
    return;
  }
  if (requestUrl.pathname === "/ops/monthly-card/claim" && req.method === "POST") {
    handleClaimMonthlyCard(req, res);
    return;
  }
  if (requestUrl.pathname === "/activity/redeem" && req.method === "POST") {
    handleActivityRedeem(req, res);
    return;
  }
  if (requestUrl.pathname === "/gear/equip" && req.method === "POST") {
    handleGearEquip(req, res);
    return;
  }
  if (requestUrl.pathname === "/gear/enhance" && req.method === "POST") {
    handleGearEnhance(req, res);
    return;
  }
  if (requestUrl.pathname === "/boss/report" && req.method === "POST") {
    handleBossReport(req, res);
    return;
  }
  if (requestUrl.pathname === "/leaderboard/power" && req.method === "GET") {
    handlePowerLeaderboard(req, res);
    return;
  }
  if (requestUrl.pathname === "/leaderboard/daily-boss" && req.method === "GET") {
    handleDailyBossLeaderboard(req, res);
    return;
  }

  serveStatic(requestUrl.pathname, res);
});

server.listen(PORT, function () {
  console.log("life-rpg server listening on http://localhost:" + PORT);
});

function handlePlayerState(req, res) {
  const store = readStore();
  const playerId = getPlayerId(req);
  const context = touchPlayer(store, playerId);
  const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
  sendJson(res, 200, {
    ok: true,
    playerId: playerId,
    playerState: playerState
  });
}

function handlePlayerSync(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);

    syncFromRequest(context.player, body, context.today, context.dailyBoss);
    context.player.updatedAt = new Date().toISOString();
    sendJson(res, 200, {
      ok: true,
      status: "synced",
      playerState: buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss)
    });
  });
}

function handleClaimLoginReward(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);

    syncFromRequest(context.player, body, context.today, context.dailyBoss);
    if (context.player.dailyState.specialClaims.loginReward) {
      const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: true,
        status: "already_claimed",
        playerState: playerState
      });
      return;
    }

    context.player.dailyState.specialClaims.loginReward = true;
    context.player.dailyState.specialClaimTimes.loginReward = new Date().toISOString();
    applyDailyMetrics(context.player.dailyState);
    grantPlayerReward(context.player, DAILY_LOGIN_REWARD, {
      kind: "grant",
      context: "daily_login",
      source: "login_reward",
      reason: "每日登录奖励",
      title: "每日登录奖励已到账",
      detail: "主城登录补给"
    });
    context.player.updatedAt = new Date().toISOString();
    const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
    sendJson(res, 200, {
      ok: true,
      status: "claimed",
      reward: DAILY_LOGIN_REWARD,
      feedback: {
        context: "daily_login",
        title: "每日登录奖励已到账",
        detail: "主城登录补给"
      },
      playerState: playerState
    });
  });
}

function handleClaimDailyTask(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);
    const taskId = body.taskId;
    const task = DAILY_TASKS[taskId];

    syncFromRequest(context.player, body, context.today, context.dailyBoss);

    if (taskId === SPECIAL_DAILY_TASK_ID) {
      if (!context.player.bossState.records[context.today].firstClearAchieved) {
        const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
        sendJson(res, 200, {
          ok: false,
          status: "ineligible",
          message: "今日 Boss 首通尚未达成",
          playerState: playerState
        });
        return;
      }
      if (context.player.dailyState.specialClaims.dailyBossFirstClear) {
        const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
        sendJson(res, 200, {
          ok: true,
          status: "already_claimed",
          playerState: playerState
        });
        return;
      }
      context.player.dailyState.specialClaims.dailyBossFirstClear = true;
      context.player.dailyState.specialClaimTimes.dailyBossFirstClear = new Date().toISOString();
      applyDailyMetrics(context.player.dailyState);
      grantPlayerReward(context.player, DAILY_BOSS_FIRST_CLEAR_REWARD, {
        kind: "grant",
        context: "daily_boss",
        source: "boss_first_clear",
        reason: "今日 Boss 首通奖励",
        title: (context.dailyBoss && context.dailyBoss.boss ? context.dailyBoss.boss.name : "今日 Boss") + " 首通奖励已到账",
        detail: "首通结算"
      });
      context.player.updatedAt = new Date().toISOString();
      const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: true,
        status: "claimed",
        reward: DAILY_BOSS_FIRST_CLEAR_REWARD,
        feedback: {
          context: "daily_boss",
          title: (context.dailyBoss && context.dailyBoss.boss ? context.dailyBoss.boss.name : "今日 Boss") + " 首通奖励已到账",
          detail: "首通结算"
        },
        playerState: playerState
      });
      return;
    }

    if (!task) {
      sendJson(res, 400, { ok: false, message: "未知任务" });
      return;
    }
    if (Number(context.player.dailyState.progress[taskId] || 0) < task.target) {
      const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: false,
        status: "ineligible",
        message: "任务进度不足",
        playerState: playerState
      });
      return;
    }
    if (context.player.dailyState.claimed[taskId]) {
      const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: true,
        status: "already_claimed",
        playerState: playerState
      });
      return;
    }

    context.player.dailyState.claimed[taskId] = true;
    context.player.dailyState.claimTimes[taskId] = new Date().toISOString();
    applyDailyMetrics(context.player.dailyState);
    grantPlayerReward(context.player, task.reward, {
      kind: "grant",
      context: "task",
      source: "daily_task",
      reason: task.id,
      title: "每日任务已领取 · " + task.label,
      detail: "任务奖励入袋"
    });
    context.player.updatedAt = new Date().toISOString();
    const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
    sendJson(res, 200, {
      ok: true,
      status: "claimed",
      reward: task.reward,
      feedback: {
        context: "task",
        title: "每日任务已领取 · " + task.label,
        detail: "任务奖励入袋"
      },
      playerState: playerState
    });
  });
}

function handleGachaDraw(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);
    const pool = findGachaPool(body.poolId);
    const requestedCount = Number(body.drawCount || 1);
    const drawCount = Math.max(1, Math.min(10, Number.isFinite(requestedCount) ? requestedCount : 1));
    const options = {
      source: body.source || "normal",
      note: body.note || ""
    };
    let results;

    if (!pool) {
      sendJson(res, 400, { ok: false, message: "未知卡池" });
      return;
    }

    syncFromRequest(context.player, body, context.today, context.dailyBoss);
    if (options.source === "daily_free") {
      if (context.player.dailyState.specialClaims.freeDraw) {
        const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
        sendJson(res, 200, {
          ok: true,
          status: "already_claimed",
          playerState: playerState
        });
        return;
      }
      context.player.dailyState.specialClaims.freeDraw = true;
      context.player.dailyState.specialClaimTimes.freeDraw = new Date().toISOString();
    } else if (!spendPlayerWallet(context.player, { drawTickets: drawCount }, {
      kind: "spend",
      context: "gacha",
      source: "gacha_draw_cost",
      reason: pool.id + ":" + drawCount,
      title: pool.name + " x" + drawCount + " 已消耗抽卡券",
      detail: options.note || pool.name
    })) {
      const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: false,
        status: "insufficient_funds",
        message: "抽卡券不足",
        playerState: playerState
      });
      return;
    }

    results = rollGachaResults(pool, options.source === "daily_free" ? 1 : drawCount, options, context.player.gachaState, context.player);
    context.player.gachaState.history = results.concat(context.player.gachaState.history).slice(0, 60);
    context.player.gachaState.inventory = results.concat(context.player.gachaState.inventory);
    context.player.gachaState.lastResult = results[results.length - 1] || null;
    context.player.dailyState.progress.gacha = Math.max(Number(context.player.dailyState.progress.gacha || 0), 1);
    context.player.activityState = syncActivityState(context.player.activityState, context.today, context.dailyBoss, context.player.bossState);
    applyDailyMetrics(context.player.dailyState);
    recordRewardEntry(context.player, Object.assign({}, buildGachaFeedback(results, pool, options), {
      kind: "gacha",
      source: options.source === "daily_free" ? "daily_free_draw" : "gacha_draw",
      reason: pool.id + ":" + (options.source === "daily_free" ? 1 : drawCount)
    }));
    context.player.updatedAt = new Date().toISOString();
    const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
    sendJson(res, 200, {
      ok: true,
      status: "drawn",
      results: results,
      feedback: buildGachaFeedback(results, pool, options),
      playerState: playerState
    });
  });
}

function handleClaimSignIn(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);
    let state;
    let rewardConfig;
    let previousDate;

    syncFromRequest(context.player, body, context.today, context.dailyBoss);
    state = normalizeSignInState(context.player.signInState, context.today);
    context.player.signInState = state;
    if (!state.canClaimToday) {
      const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: true,
        status: "already_claimed",
        playerState: playerState
      });
      return;
    }

    rewardConfig = SIGN_IN_REWARDS[state.currentDayIndex - 1];
    if (!rewardConfig) {
      sendJson(res, 400, { ok: false, message: "签到奖励配置缺失" });
      return;
    }

    previousDate = state.lastClaimDate;
    state.claimedDays[state.currentDayIndex] = true;
    state.cycleProgress = state.currentDayIndex;
    state.lastClaimDate = context.today;
    state.totalClaimed = Number(state.totalClaimed || 0) + 1;
    state.streakCount = previousDate && diffDaysBetween(previousDate, context.today) === 1
      ? Number(state.streakCount || 0) + 1
      : 1;
    if (state.currentDayIndex >= SIGN_IN_REWARDS.length) {
      state.completedCycles = Number(state.completedCycles || 0) + 1;
    }
    context.player.signInState = normalizeSignInState(state, context.today);
    grantPlayerReward(context.player, rewardConfig.reward, {
      kind: "grant",
      context: "sign_in",
      source: "sign_in",
      reason: "day_" + rewardConfig.day,
      title: "第 " + rewardConfig.day + " 天签到达成",
      detail: rewardConfig.title + (rewardConfig.rewardHint ? " · " + rewardConfig.rewardHint : "")
    });
    context.player.updatedAt = new Date().toISOString();
    const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
    sendJson(res, 200, {
      ok: true,
      status: "claimed",
      reward: rewardConfig.reward,
      feedback: {
        context: "sign_in",
        title: "第 " + rewardConfig.day + " 天签到达成",
        detail: rewardConfig.title + (rewardConfig.rewardHint ? " · " + rewardConfig.rewardHint : "")
      },
      playerState: playerState
    });
  });
}

function handleActivateFirstPurchase(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);
    let creation;
    let result;

    syncFromRequest(context.player, body, context.today, context.dailyBoss);
    context.player.opsState = normalizeOpsState(context.player.opsState, context.player, context.today);
    creation = createCommerceOrder(context.player, {
      offerId: "first_purchase",
      entryPoint: "兼容首购快捷入口",
      note: "兼容旧首购快捷入口，已改走正式订单状态机。"
    }, context.today);
    if (!creation.ok) {
      sendJson(res, 200, {
        ok: creation.ok,
        status: creation.status,
        message: creation.message,
        order: creation.order || null,
        playerState: buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss)
      });
      return;
    }
    result = simulateCommerceOrder(context.player, creation.order.orderId, "pay_success", context.today);
    context.player.updatedAt = new Date().toISOString();

    sendJson(res, 200, {
      ok: result.ok,
      status: result.status,
      order: result.order,
      reward: result.reward || FIRST_PURCHASE_REWARD,
      feedback: result.feedback,
      playerState: buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss)
    });
  });
}

function handleCreateCommerceOrder(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);
    let result;

    syncFromRequest(context.player, body, context.today, context.dailyBoss);
    result = createCommerceOrder(context.player, body || {}, context.today);
    context.player.updatedAt = new Date().toISOString();

    sendJson(res, 200, {
      ok: result.ok,
      status: result.status,
      message: result.message || "",
      order: result.order || null,
      feedback: result.feedback || null,
      playerState: buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss)
    });
  });
}

function handleSimulateCommerceOrder(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);
    const payload = body || {};
    let result;

    syncFromRequest(context.player, body, context.today, context.dailyBoss);
    result = simulateCommerceOrder(context.player, payload.orderId, payload.action, context.today);
    context.player.updatedAt = new Date().toISOString();

    sendJson(res, 200, {
      ok: result.ok,
      status: result.status,
      message: result.message || "",
      order: result.order || null,
      reward: result.reward || null,
      feedback: result.feedback || null,
      playerState: buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss)
    });
  });
}

function handleCreateCheckoutSession(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);
    const payload = body || {};
    let result;

    syncFromRequest(context.player, body, context.today, context.dailyBoss);
    result = createCheckoutSessionForOrder(context.player, payload.orderId, payload, context.today);
    context.player.updatedAt = new Date().toISOString();

    sendJson(res, 200, {
      ok: result.ok,
      status: result.status,
      message: result.message || "",
      order: result.order || null,
      checkoutSession: result.checkoutSession || null,
      feedback: result.feedback || null,
      playerState: buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss)
    });
  });
}

function handlePaymentCallback(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);
    let result;

    syncFromRequest(context.player, body, context.today, context.dailyBoss);
    result = processPaymentCallback(context.player, body || {}, context.today);
    context.player.updatedAt = new Date().toISOString();

    sendJson(res, 200, {
      ok: result.ok,
      status: result.status,
      message: result.message || "",
      order: result.order || null,
      callback: result.callback || null,
      checkoutSession: result.checkoutSession || null,
      reward: result.reward || null,
      feedback: result.feedback || null,
      playerState: buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss)
    });
  });
}

function handleAnalyticsTrack(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);
    const payload = body || {};
    const events = Array.isArray(payload.events) ? payload.events : [payload];
    const recorded = [];

    events.forEach(function (entry) {
      const event = recordAnalyticsEvent(context.player, Object.assign({}, entry, {
        source: entry && entry.source ? entry.source : "client",
        timestamp: entry && entry.timestamp ? entry.timestamp : new Date().toISOString()
      }));
      if (event) {
        recorded.push(event);
      }
    });
    context.player.updatedAt = new Date().toISOString();

    sendJson(res, 200, {
      ok: true,
      status: "recorded",
      recordedCount: recorded.length,
      events: recorded,
      playerState: buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss)
    });
  });
}

function handleActivateMonthlyCard(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);
    let creation;
    let result;

    syncFromRequest(context.player, body, context.today, context.dailyBoss);
    context.player.opsState = normalizeOpsState(context.player.opsState, context.player, context.today);
    creation = createCommerceOrder(context.player, {
      offerId: "monthly_card",
      entryPoint: "兼容月卡快捷入口",
      note: "兼容旧月卡快捷入口，已改走正式订单状态机。"
    }, context.today);
    if (!creation.ok) {
      sendJson(res, 200, {
        ok: creation.ok,
        status: creation.status,
        message: creation.message,
        order: creation.order || null,
        playerState: buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss)
      });
      return;
    }
    result = simulateCommerceOrder(context.player, creation.order.orderId, "pay_success", context.today);
    context.player.updatedAt = new Date().toISOString();

    sendJson(res, 200, {
      ok: result.ok,
      status: result.status,
      order: result.order,
      reward: result.reward || MONTHLY_CARD_CONFIG.activationReward,
      feedback: result.feedback,
      playerState: buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss)
    });
  });
}

function handleClaimMonthlyCard(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);
    let monthlyEntitlement;

    syncFromRequest(context.player, body, context.today, context.dailyBoss);
    context.player.opsState = normalizeOpsState(context.player.opsState, context.player, context.today);
    context.player.commerceState = normalizeCommerceState(context.player.commerceState, context.player, context.today);
    monthlyEntitlement = context.player.commerceState.entitlements.ent_monthly_card;
    if (!monthlyEntitlement || monthlyEntitlement.status !== "active") {
      const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: false,
        status: "inactive",
        message: "月卡未开通",
        playerState: playerState
      });
      return;
    }
    if (monthlyEntitlement.lastClaimDate === context.today) {
      const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: true,
        status: "already_claimed",
        playerState: playerState
      });
      return;
    }

    context.player.opsState.monthlyCard.lastClaimDate = context.today;
    context.player.commerceState.entitlements.ent_monthly_card.lastClaimDate = context.today;
    grantPlayerReward(context.player, MONTHLY_CARD_CONFIG.dailyReward, {
      kind: "grant",
      context: "monthly_card",
      source: "monthly_card_daily",
      reason: "月卡日常奖励",
      title: "月卡日常奖励已领取",
      detail: "剩余 " + getMonthlyCardRemainingDays(context.player.opsState.monthlyCard, context.today) + " 天"
    });
    recordAnalyticsEvent(context.player, {
      name: "monthly_card_claimed",
      category: "commerce",
      funnelStep: "monthly_claim",
      status: "claimed",
      source: "server",
      offerId: "monthly_card",
      productId: "prod_monthly_card_launch_v1",
      orderId: monthlyEntitlement.lastOrderId || "",
      message: "月卡日常奖励已领取"
    });
    context.player.updatedAt = new Date().toISOString();

    sendJson(res, 200, {
      ok: true,
      status: "claimed",
      reward: MONTHLY_CARD_CONFIG.dailyReward,
      feedback: {
        context: "monthly_card",
        title: "月卡日常奖励已领取",
        detail: "剩余 " + getMonthlyCardRemainingDays(context.player.opsState.monthlyCard, context.today) + " 天"
      },
      playerState: buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss)
    });
  });
}

function handleActivityRedeem(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);
    const eventConfig = findEventConfig(body.eventId);
    let eventState;
    let status;
    let cost;

    syncFromRequest(context.player, body, context.today, context.dailyBoss);
    context.player.activityState = syncActivityState(context.player.activityState, context.today, context.dailyBoss, context.player.bossState);
    if (!eventConfig || !eventConfig.redeem) {
      sendJson(res, 400, { ok: false, message: "未知活动" });
      return;
    }

    status = getEventStatus(eventConfig, context.today);
    if (status.code !== "active") {
      const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: false,
        status: "inactive",
        message: "活动未开启",
        playerState: playerState
      });
      return;
    }

    eventState = getActivityEventState(context.player.activityState, eventConfig.id);
    cost = Math.max(1, Number(eventConfig.redeem.cost || 1));
    if (eventConfig.redeem.oncePerEvent && eventState.claimed) {
      const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: true,
        status: "already_claimed",
        playerState: playerState
      });
      return;
    }
    if (Number(eventState.tokenCount || 0) < cost) {
      const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: false,
        status: "ineligible",
        message: "活动币不足",
        playerState: playerState
      });
      return;
    }

    eventState.tokenCount = Math.max(0, Number(eventState.tokenCount || 0) - cost);
    eventState.claimed = !!eventConfig.redeem.oncePerEvent;
    eventState.claimedAt = new Date().toISOString();
    eventState.redemptionCount = Number(eventState.redemptionCount || 0) + 1;
    context.player.activityState.events[eventConfig.id] = eventState;
    grantPlayerReward(context.player, eventConfig.redeem.reward || {}, {
      kind: "grant",
      context: "event",
      source: "activity_redeem",
      reason: eventConfig.id,
      title: eventConfig.redeem.title + " 已兑换",
      detail: eventConfig.title
    });
    recordAnalyticsEvent(context.player, {
      name: "activity_redeemed",
      category: "activity",
      funnelStep: "activity_redeem",
      status: "claimed",
      source: "server",
      activityId: eventConfig.id,
      message: eventConfig.redeem.title + " 已兑换"
    });
    context.player.updatedAt = new Date().toISOString();
    const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
    sendJson(res, 200, {
      ok: true,
      status: "claimed",
      reward: eventConfig.redeem.reward || {},
      feedback: {
        context: "event",
        title: eventConfig.redeem.title + " 已兑换",
        detail: eventConfig.title
      },
      playerState: playerState
    });
  });
}

function handleBossReport(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);
    const latestBattle = body && body.latestBattle;
    const candidate = latestBattle && latestBattle.mapId ? findBossCandidateByMapId(latestBattle.mapId) : null;
    const ticketState = context.player.bossState.ticketState;
    const todayRecord = context.player.bossState.records[context.today];
    const wasFirstClearAchieved = !!(todayRecord && todayRecord.firstClearAchieved);
    let status = "ignored";
    let feedback = null;

    applyProfileSnapshot(context.player, body.profileSnapshot);
    if (!latestBattle || !latestBattle.timestamp || !isDateKeyMatch(latestBattle.timestamp, context.today) || !candidate) {
      context.player.activityState = syncActivityState(context.player.activityState, context.today, context.dailyBoss, context.player.bossState);
      context.player.opsState = normalizeOpsState(context.player.opsState, context.player, context.today);
      applyDailyMetrics(context.player.dailyState);
      context.player.updatedAt = new Date().toISOString();
      sendJson(res, 200, {
        ok: true,
        status: status,
        playerState: buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss)
      });
      return;
    }

    context.player.dailyState.progress.adventure = Math.max(Number(context.player.dailyState.progress.adventure || 0), 1);
    if (latestBattle.timestamp === context.player.bossState.lastProcessedBattleTimestamp) {
      status = "already_reported";
    } else {
      context.player.bossState.lastProcessedBattleTimestamp = latestBattle.timestamp;
      if (ticketState.remaining > 0) {
        ticketState.used += 1;
        ticketState.remaining = Math.max(0, Number(ticketState.dailyCap || DAILY_BOSS_TICKET_CAP) - ticketState.used);
        context.player.dailyState.progress.boss = Math.max(Number(context.player.dailyState.progress.boss || 0), 1);
        if (context.dailyBoss && latestBattle.mapId === context.dailyBoss.mapId) {
          processDailyBossBattle(todayRecord, latestBattle, context.dailyBoss);
          status = "counted_daily_boss";
        } else {
          status = "counted_practice";
        }
        context.player.bossState.lastChallenge = buildBossChallengeSnapshot(candidate, latestBattle, ticketState, true, status);
        if (status === "counted_daily_boss" && latestBattle.result === "victory" && !wasFirstClearAchieved) {
          recordAnalyticsEvent(context.player, {
            name: "boss_first_clear",
            category: "boss",
            funnelStep: "boss_first_clear",
            status: "achieved",
            source: "server",
            activityId: context.dailyBoss ? context.dailyBoss.bossId : candidate.boss.id,
            message: candidate.boss.name + " 首通已达成"
          });
        }
        recordRewardEntry(context.player, {
          kind: "event",
          context: "boss_challenge",
          source: "boss_report",
          reason: candidate.boss.id,
          title: status === "counted_daily_boss" && latestBattle.result === "victory" && !wasFirstClearAchieved
            ? candidate.boss.name + " 首通已达成"
            : candidate.boss.name + " 记分挑战已结算",
          summary: status === "counted_daily_boss" && latestBattle.result === "victory" && !wasFirstClearAchieved
            ? "首通奖励待领取 · 活动兑换已解锁 · 剩余记分次数 " + ticketState.remaining + "/" + ticketState.dailyCap
            : candidate.map.name + " · 剩余记分次数 " + ticketState.remaining + "/" + ticketState.dailyCap,
          detail: status === "counted_daily_boss" && latestBattle.result === "victory" && !wasFirstClearAchieved
            ? "先回 Boss 页领取首通奖励，再去榜单确认这次追分值不值得继续。"
            : (latestBattle.mapId === (context.dailyBoss && context.dailyBoss.mapId) ? "今日 Boss 计分已更新，建议回榜单复盘差距。" : "非今日 Boss，仅消耗一次记分机会"),
          timestamp: latestBattle.timestamp
        });
        feedback = {
          context: "boss_challenge",
          title: status === "counted_daily_boss" && latestBattle.result === "victory" && !wasFirstClearAchieved
            ? candidate.boss.name + " 首通已达成"
            : candidate.boss.name + " 记分挑战已结算",
          detail: status === "counted_daily_boss" && latestBattle.result === "victory" && !wasFirstClearAchieved
            ? "先领首通奖励，再回榜单看差距。"
            : (status === "counted_daily_boss" ? "今日 Boss 计分已更新，建议回榜单复盘差距。" : "Boss 挑战结果已同步。"),
          timestamp: latestBattle.timestamp
        };
      } else {
        ticketState.practiceAttempts += 1;
        status = "practice_only";
        context.player.bossState.lastChallenge = buildBossChallengeSnapshot(candidate, latestBattle, ticketState, false, status);
        recordRewardEntry(context.player, {
          kind: "event",
          context: "boss_challenge",
          source: "boss_report",
          reason: candidate.boss.id + ":practice",
          title: candidate.boss.name + " 进入练习挑战",
          summary: "今日记分次数已用完，本次不计榜也不触发首通奖励。",
          detail: candidate.map.name,
          timestamp: latestBattle.timestamp
        });
      }
    }

    context.player.activityState = syncActivityState(context.player.activityState, context.today, context.dailyBoss, context.player.bossState);
    context.player.opsState = normalizeOpsState(context.player.opsState, context.player, context.today);
    applyDailyMetrics(context.player.dailyState);
    context.player.updatedAt = new Date().toISOString();
    const playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
    sendJson(res, 200, {
      ok: true,
      status: status,
      feedback: feedback,
      playerState: playerState
    });
  });
}

function handleGearEnhance(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);
    const slot = typeof body.slot === "string" ? body.slot : "";
    let slotState;
    let nextLevel;
    let cost;
    let playerState;

    syncFromRequest(context.player, body, context.today, context.dailyBoss);
    context.player.equipmentState = normalizeEquipmentState(context.player.equipmentState, context.player.profile);
    if (EQUIPMENT_SLOTS.indexOf(slot) === -1) {
      sendJson(res, 400, { ok: false, message: "未知装备槽位" });
      return;
    }

    slotState = context.player.equipmentState.slots[slot];
    if (!slotState) {
      playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: false,
        status: "no_item",
        message: "当前槽位没有装备",
        playerState: playerState
      });
      return;
    }

    nextLevel = clampEnhancementLevel(Number(slotState.enhancementLevel || 0) + 1);
    if (Number(slotState.enhancementLevel || 0) >= ENHANCEMENT_MAX_LEVEL) {
      playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: true,
        status: "already_max",
        message: "当前装备已到 +10",
        playerState: playerState
      });
      return;
    }

    cost = buildEnhancementCost(nextLevel);
    if (!spendPlayerWallet(context.player, cost, {
      kind: "spend",
      context: "enhancement",
      source: "gear_enhance",
      reason: slotState.name + " 强化到 +" + nextLevel,
      title: slotState.name + " 强化 +" + nextLevel,
      detail: (slotState.slot || slot) + " 槽位"
    })) {
      playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: false,
        status: "insufficient_resource",
        message: "资源不足",
        cost: cost,
        playerState: playerState
      });
      return;
    }

    context.player.equipmentState.slots[slot].enhancementLevel = nextLevel;
    updateInventoryItemEnhancement(context.player.gachaState, slotState.itemKey, nextLevel);
    context.player.equipmentState = normalizeEquipmentState(context.player.equipmentState, context.player.profile);
    context.player.updatedAt = new Date().toISOString();
    playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
    sendJson(res, 200, {
      ok: true,
      status: "enhanced",
      slot: slot,
      nextLevel: nextLevel,
      cost: cost,
      feedback: {
        context: "enhancement",
        title: slotState.name + " 已强化到 +" + nextLevel,
        detail: "装备强度与总战力已更新"
      },
      playerState: playerState
    });
  });
}

function handleGearEquip(req, res) {
  withJsonBody(req, res, function (body) {
    const store = readStore();
    const playerId = getPlayerId(req);
    const context = touchPlayer(store, playerId);
    const itemKey = typeof body.itemKey === "string" ? body.itemKey : "";
    let inventoryItem;
    let currentSlotItem;
    let beforeSummary;
    let beforeSetBonus;
    let now;
    let nextSlotState;
    let playerState;
    let slotLabel;
    let powerDelta;
    let summaryText;
    let detailText;

    syncFromRequest(context.player, body, context.today, context.dailyBoss);
    context.player.gachaState = normalizeGachaState(context.player.gachaState);
    context.player.equipmentState = normalizeEquipmentState(context.player.equipmentState, context.player.profile);

    if (!itemKey) {
      sendJson(res, 400, { ok: false, message: "缺少命器 itemKey" });
      return;
    }

    inventoryItem = findInventoryItemByKey(context.player.gachaState, itemKey);
    if (!inventoryItem || !inventoryItem.slot) {
      playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: false,
        status: "not_equipable",
        message: "该抽卡结果当前不可装备",
        playerState: playerState
      });
      return;
    }

    currentSlotItem = context.player.equipmentState.slots[inventoryItem.slot];
    if (currentSlotItem && currentSlotItem.itemKey === inventoryItem.itemKey) {
      playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
      sendJson(res, 200, {
        ok: true,
        status: "already_equipped",
        message: "当前命器已经穿戴中",
        slot: inventoryItem.slot,
        playerState: playerState
      });
      return;
    }

    beforeSummary = cloneObject(context.player.equipmentState.summary);
    beforeSetBonus = cloneObject(context.player.equipmentState.setBonus);
    now = new Date().toISOString();
    slotLabel = EQUIPMENT_SLOT_LABELS[inventoryItem.slot] || inventoryItem.slot;

    context.player.equipmentState = Object.assign({}, context.player.equipmentState, {
      source: "phase2_gacha_equip",
      lastSyncedAt: now,
      slots: Object.assign({}, context.player.equipmentState.slots)
    });
    context.player.equipmentState.slots[inventoryItem.slot] = Object.assign({}, inventoryItem, {
      manualEquip: true,
      equippedAt: now
    });
    context.player.equipmentState = normalizeEquipmentState(context.player.equipmentState, context.player.profile);
    nextSlotState = context.player.equipmentState.slots[inventoryItem.slot];
    updateInventoryItemEnhancement(context.player.gachaState, inventoryItem.itemKey, Number(nextSlotState && nextSlotState.enhancementLevel || 0));

    powerDelta = Number(context.player.equipmentState.summary.totalPower || 0) - Number(beforeSummary && beforeSummary.totalPower || 0);
    summaryText = "总战力 " + formatSignedNumber(powerDelta) + " · " +
      Number(beforeSummary && beforeSummary.totalPower || 0) + " → " + Number(context.player.equipmentState.summary.totalPower || 0);
    detailText = slotLabel + "槽位 · " +
      (currentSlotItem ? (currentSlotItem.name + " → ") : "空槽 → ") + inventoryItem.name +
      " · " + ((beforeSetBonus && beforeSetBonus.label) || "未激活套装") + " → " + context.player.equipmentState.setBonus.label;
    recordRewardEntry(context.player, {
      kind: "event",
      context: "gear_equip",
      source: "gear_equip",
      reason: inventoryItem.name + " 穿戴",
      title: inventoryItem.name + " 已换上",
      summary: summaryText,
      detail: detailText,
      timestamp: now
    });

    context.player.updatedAt = now;
    playerState = buildAndPersistPlayerState(store, playerId, context.player, context.today, context.dailyBoss);
    sendJson(res, 200, {
      ok: true,
      status: "equipped",
      slot: inventoryItem.slot,
      itemKey: inventoryItem.itemKey,
      replacedItem: currentSlotItem ? {
        itemKey: currentSlotItem.itemKey,
        name: currentSlotItem.name,
        rarity: currentSlotItem.rarity
      } : null,
      powerChange: {
        before: Number(beforeSummary && beforeSummary.totalPower || 0),
        after: Number(context.player.equipmentState.summary.totalPower || 0),
        delta: powerDelta
      },
      setChange: {
        before: beforeSetBonus ? beforeSetBonus.label : "未激活套装",
        after: context.player.equipmentState.setBonus.label
      },
      feedback: {
        context: "gear_equip",
        title: inventoryItem.name + " 已换上",
        summary: summaryText,
        detail: detailText,
        timestamp: now
      },
      playerState: playerState
    });
  });
}

function handlePowerLeaderboard(req, res) {
  const store = readStore();
  const playerId = getPlayerId(req);
  const context = touchPlayer(store, playerId);
  const targetDayMaster = context.player.profile.dayMasterElement || "无";
  const rows = Object.keys(store.players || {}).map(function (entryPlayerId) {
    const normalized = normalizePlayer(store.players[entryPlayerId], context.today, context.dailyBoss);
    return buildPowerLeaderboardRow(entryPlayerId, normalized, playerId);
  }).filter(Boolean);
  const totalRows = decorateLeaderboardRows(rows, {
    boardName: "总战力榜",
    scoreLabel: "总战力"
  });
  const sameDayMasterRows = decorateLeaderboardRows(rows.filter(function (row) {
    return row.dayMaster === targetDayMaster;
  }), {
    boardName: targetDayMaster + "日主榜",
    scoreLabel: "总战力"
  });

  sendJson(res, 200, {
    ok: true,
    dayMaster: targetDayMaster,
    totalRows: totalRows,
    sameDayMasterRows: sameDayMasterRows
  });
}

function handleDailyBossLeaderboard(req, res) {
  const store = readStore();
  const playerId = getPlayerId(req);
  const today = dateKey(new Date());
  const dailyBoss = buildDailyBoss(today);
  const rows = decorateLeaderboardRows(Object.keys(store.players || {}).map(function (entryPlayerId) {
    const player = store.players[entryPlayerId];
    const normalized = normalizePlayer(player, today, dailyBoss);
    const record = ensureBossRecord(normalized.bossState.records[today], dailyBoss, today);
    if (!record.bestScore) {
      return null;
    }
    return buildDailyBossLeaderboardRow(entryPlayerId, normalized, record, playerId, dailyBoss);
  }).filter(Boolean), {
    boardName: (dailyBoss && dailyBoss.boss ? dailyBoss.boss.name : "今日 Boss") + " 榜",
    scoreLabel: "Boss 分"
  });

  sendJson(res, 200, {
    ok: true,
    date: today,
    boss: dailyBoss
      ? { dateKey: dailyBoss.dateKey, bossId: dailyBoss.bossId, bossName: dailyBoss.boss.name, mapId: dailyBoss.mapId }
      : null,
    rows: rows
  });
}

function buildPlayerState(playerId, player, today, dailyBoss) {
  const normalized = normalizePlayer(player, today, dailyBoss);
  const mapAdvice = buildAdventureAdvice(normalized.profile);
  const adventureFocus = mapAdvice.length ? {
    recommendedMapId: mapAdvice[0].mapId,
    recommendedMapName: mapAdvice[0].mapName,
    verdict: mapAdvice[0].verdict,
    reasonText: mapAdvice[0].reasonText
  } : null;
  return {
    playerId: playerId,
    serverDate: today,
    profile: normalized.profile,
    dailyState: normalized.dailyState,
    bossState: normalized.bossState,
    gachaState: normalized.gachaState,
    signInState: normalized.signInState,
    activityState: normalized.activityState,
    walletState: normalized.walletState,
    opsState: normalized.opsState,
    commerceState: normalized.commerceState,
    equipmentState: normalized.equipmentState,
    productCatalog: buildProductCatalog(),
    launchPrepConfig: cloneObject(LAUNCH_PREP_CONFIG),
    analyticsState: buildAnalyticsState(normalized),
    mapAdvice: mapAdvice,
    adventureAdvice: adventureFocus,
    rewardState: buildRewardState(normalized.rewardLedger),
    rewardLedger: normalized.rewardLedger,
    dailyBoss: dailyBoss
      ? {
        dateKey: dailyBoss.dateKey,
        bossId: dailyBoss.bossId,
        bossName: dailyBoss.boss.name,
        mapId: dailyBoss.mapId,
        map: dailyBoss.map,
        boss: dailyBoss.boss,
        recommendedPower: dailyBoss.recommendedPower,
        rewardFocus: dailyBoss.rewardFocus,
        description: dailyBoss.description,
        tendency: dailyBoss.tendency,
        counterElement: dailyBoss.counterElement,
        fateAdvice: buildMapFateAdvice(normalized.profile, dailyBoss.map, Number(normalized.profile.powerScore || 0))
      }
      : null
  };
}

function buildAndPersistPlayerState(store, playerId, player, today, dailyBoss) {
  const playerState = buildPlayerState(playerId, player, today, dailyBoss);
  persistStore(store);
  return playerState;
}

function normalizePlayer(player, today, dailyBoss) {
  const normalized = player || {};
  normalized.profile = normalizeProfile(normalized.profile);
  normalized.dailyState = normalizeDailyState(normalized.dailyState, today);
  normalized.bossState = normalizeBossState(normalized.bossState, dailyBoss, today);
  normalized.gachaState = normalizeGachaState(normalized.gachaState);
  normalized.signInState = normalizeSignInState(normalized.signInState, today);
  normalized.activityState = syncActivityState(normalizeActivityState(normalized.activityState), today, dailyBoss, normalized.bossState);
  normalized.walletState = normalizeWalletState(normalized.walletState, DEFAULT_WALLET);
  normalized.opsState = normalizeOpsState(normalized.opsState, normalized, today);
  normalized.commerceState = normalizeCommerceState(normalized.commerceState, normalized, today);
  normalized.equipmentState = normalizeEquipmentState(normalized.equipmentState, normalized.profile);
  normalized.rewardLedger = normalizeRewardLedger(normalized.rewardLedger);
  normalized.analyticsState = normalizeAnalyticsState(normalized.analyticsState);
  normalized.createdAt = normalized.createdAt || new Date().toISOString();
  normalized.updatedAt = normalized.updatedAt || normalized.createdAt;
  return normalized;
}

function touchPlayer(store, playerId) {
  const today = dateKey(new Date());
  const dailyBoss = buildDailyBoss(today);
  const existing = store.players[playerId] || {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profile: {},
    dailyState: null,
    bossState: null,
    gachaState: null,
    signInState: null,
    activityState: null,
    walletState: null,
    opsState: null,
    commerceState: null,
    equipmentState: null,
    rewardLedger: null,
    analyticsState: null
  };
  const player = normalizePlayer(existing, today, dailyBoss);
  store.players[playerId] = player;
  return {
    store: store,
    player: player,
    today: today,
    dailyBoss: dailyBoss
  };
}

function syncFromRequest(player, body, today, dailyBoss) {
  const payload = body || {};
  const latestBattle = payload.latestBattle;
  const record = player.bossState.records[today];

  applyProfileSnapshot(player, payload.profileSnapshot);
  if (latestBattle && latestBattle.timestamp && isDateKeyMatch(latestBattle.timestamp, today)) {
    player.dailyState.progress.adventure = Math.max(Number(player.dailyState.progress.adventure || 0), 1);
    if (latestBattle.timestamp !== player.bossState.lastProcessedBattleTimestamp) {
      player.bossState.lastProcessedBattleTimestamp = latestBattle.timestamp;
      if (dailyBoss && latestBattle.mapId === dailyBoss.mapId) {
        processDailyBossBattle(record, latestBattle, dailyBoss);
        player.dailyState.progress.boss = Math.max(Number(player.dailyState.progress.boss || 0), 1);
      }
    }
  }
  if (Number(payload.gachaCountToday || 0) > 0) {
    player.dailyState.progress.gacha = Math.max(Number(player.dailyState.progress.gacha || 0), 1);
  }
  if (payload.taskId && DAILY_TASKS[payload.taskId] && Number(payload.progressHint || 0) > 0) {
    player.dailyState.progress[payload.taskId] = Math.max(Number(player.dailyState.progress[payload.taskId] || 0), Number(payload.progressHint || 0));
  }
  if (record.attempts > 0) {
    player.dailyState.progress.boss = Math.max(Number(player.dailyState.progress.boss || 0), 1);
  }
  player.activityState = syncActivityState(player.activityState, today, dailyBoss, player.bossState);
  player.opsState = normalizeOpsState(player.opsState, player, today);
  applyDailyMetrics(player.dailyState);
}

function normalizeProfile(raw) {
  const profile = raw || {};
  return {
    displayName: profile.displayName || "未命名道友",
    className: profile.className || "未开局",
    dayMasterElement: profile.dayMasterElement || "无",
    powerScore: Math.max(0, Number(profile.powerScore || 0)),
    strength: profile.strength || "",
    usefulGods: Array.isArray(profile.usefulGods) ? profile.usefulGods.slice(0, 5) : [],
    tabooGod: profile.tabooGod || "",
    recommendedBuild: profile.recommendedBuild || "",
    baseStats: normalizeStatMap(profile.baseStats),
    currentStats: normalizeStatMap(profile.currentStats),
    snapshotTimestamp: profile.snapshotTimestamp || "",
    snapshotSource: profile.snapshotSource || ""
  };
}

function applyProfileSnapshot(player, snapshot) {
  const existing = normalizeProfile(player.profile);
  if (!snapshot) {
    return;
  }
  player.profile = {
    displayName: snapshot.className ? snapshot.className + "道友" : existing.displayName,
    className: snapshot.className || existing.className,
    dayMasterElement: snapshot.dayMasterElement || existing.dayMasterElement,
    powerScore: Math.max(0, Number(snapshot.powerScore != null ? snapshot.powerScore : existing.powerScore)),
    strength: snapshot.strength || existing.strength,
    usefulGods: Array.isArray(snapshot.usefulGods) ? snapshot.usefulGods.slice(0, 5) : existing.usefulGods,
    tabooGod: snapshot.tabooGod || existing.tabooGod,
    recommendedBuild: snapshot.recommendedBuild || existing.recommendedBuild,
    baseStats: snapshot.baseStats ? normalizeStatMap(snapshot.baseStats) : existing.baseStats,
    currentStats: snapshot.currentStats ? normalizeStatMap(snapshot.currentStats) : existing.currentStats,
    snapshotTimestamp: snapshot.timestamp || existing.snapshotTimestamp,
    snapshotSource: snapshot.source || existing.snapshotSource
  };
  if (snapshot.equipped || snapshot.currentStats || snapshot.baseStats || snapshot.powerScore != null) {
    player.equipmentState = syncEquipmentStateFromSnapshot(player.equipmentState, snapshot, player.profile);
  }
}

function syncEquipmentStateFromSnapshot(rawState, snapshot, profile) {
  const previous = normalizeEquipmentState(rawState, profile);
  const next = {
    source: snapshot.source || previous.source || "",
    lastSyncedAt: snapshot.timestamp || previous.lastSyncedAt || "",
    basePower: Math.max(0, Number(snapshot.powerScore != null ? snapshot.powerScore : previous.basePower || profile.powerScore || 0)),
    baseStats: cloneObject(snapshot.baseStats || previous.baseStats || profile.baseStats || {}),
    currentStats: cloneObject(snapshot.currentStats || previous.currentStats || profile.currentStats || {}),
    baselineSlots: {},
    slots: {}
  };

  EQUIPMENT_SLOTS.forEach(function (slot) {
    const incoming = normalizeEquippedSlot(slot, snapshot.equipped && snapshot.equipped[slot]);
    const prev = normalizeEquippedSlot(slot, previous.slots && previous.slots[slot]);

    next.baselineSlots[slot] = incoming;

    if (prev && prev.manualEquip && (!incoming || prev.itemKey !== incoming.itemKey)) {
      next.slots[slot] = cloneObject(prev);
      return;
    }
    if (incoming && prev && prev.itemKey === incoming.itemKey) {
      incoming.enhancementLevel = clampEnhancementLevel(prev.enhancementLevel);
      incoming.manualEquip = !!prev.manualEquip;
      incoming.equippedAt = prev.equippedAt || incoming.equippedAt || "";
    }
    next.slots[slot] = incoming;
  });

  return normalizeEquipmentState(next, Object.assign({}, profile, {
    powerScore: next.basePower,
    baseStats: next.baseStats,
    currentStats: next.currentStats,
    snapshotSource: next.source,
    snapshotTimestamp: next.lastSyncedAt
  }));
}

function normalizeEquipmentState(raw, profile) {
  const state = raw || {};
  const resolvedProfile = normalizeProfile(profile);
  const slots = {};
  const baselineSlots = {};
  const baseStats = normalizeStatMap(state.baseStats || resolvedProfile.baseStats);
  const currentStats = normalizeStatMap(state.currentStats || resolvedProfile.currentStats);
  const basePower = Math.max(0, Number(state.basePower != null ? state.basePower : resolvedProfile.powerScore || 0));
  let summary;

  EQUIPMENT_SLOTS.forEach(function (slot) {
    slots[slot] = normalizeEquippedSlot(slot, state.slots && state.slots[slot]);
    baselineSlots[slot] = normalizeEquippedSlot(slot,
      state.baselineSlots && Object.prototype.hasOwnProperty.call(state.baselineSlots, slot)
        ? state.baselineSlots[slot]
        : state.slots && state.slots[slot]
    );
  });
  summary = buildEquipmentSummary(slots, baselineSlots, {
    powerScore: basePower,
    dayMasterElement: resolvedProfile.dayMasterElement,
    usefulGods: resolvedProfile.usefulGods,
    tabooGod: resolvedProfile.tabooGod
  });

  return {
    source: state.source || resolvedProfile.snapshotSource || "",
    lastSyncedAt: state.lastSyncedAt || resolvedProfile.snapshotTimestamp || "",
    basePower: basePower,
    baseStats: baseStats,
    currentStats: currentStats,
    baselineSlots: baselineSlots,
    slots: summary.slots,
    setBonus: summary.setBonus,
    summary: summary.summary
  };
}

function normalizeEquippedSlot(slot, raw) {
  const item = raw || null;
  const setMeta = resolveSetDefinition(item && item.element);

  if (!item || !item.name) {
    return null;
  }
  return {
    slot: item.slot || slot,
    name: item.name,
    rarity: item.rarity || "R",
    element: item.element || "无",
    stats: normalizeStatMap(item.stats),
    baseGearScore: Math.max(0, Number(item.baseGearScore != null ? item.baseGearScore : item.gearScore || 0)),
    enhancementLevel: clampEnhancementLevel(item.enhancementLevel),
    itemKey: item.itemKey || buildEquipmentItemKey(item.slot || slot, item),
    setId: item.setId || setMeta.id,
    setName: item.setName || setMeta.name,
    setFocus: item.setFocus || setMeta.focus,
    manualEquip: !!item.manualEquip,
    equippedAt: item.equippedAt || ""
  };
}

function buildEquipmentSummary(slots, baselineSlots, profile) {
  const statBonus = createEmptyStats();
  const setCounter = {};
  const resolvedSlots = {};
  const basePower = Math.max(0, Number(profile.powerScore || 0));
  let baselineLoadoutPower = 0;
  let currentLoadoutPower = 0;
  let baseGearScore = 0;
  let enhancedGearScore = 0;
  let totalEnhancementLevel = 0;
  let equippedCount = 0;
  let setBonus;

  EQUIPMENT_SLOTS.forEach(function (slot) {
    const item = normalizeEquippedSlot(slot, slots[slot]);
    const baselineItem = normalizeEquippedSlot(slot, baselineSlots && baselineSlots[slot]);
    let enhancedStats;
    let perItemStatBonus;
    let enhancedScore;
    let baselineStats;
    let baselineScore;

    if (baselineItem) {
      baselineStats = scaleStats(baselineItem.stats, 1 + baselineItem.enhancementLevel * ENHANCEMENT_STAT_SCALE_PER_LEVEL);
      baselineScore = Math.round(baselineItem.baseGearScore * (1 + baselineItem.enhancementLevel * ENHANCEMENT_GEAR_SCORE_SCALE_PER_LEVEL));
      baselineLoadoutPower += calculateStatPower(baselineStats) + baselineScore;
    }

    if (!item) {
      resolvedSlots[slot] = null;
      return;
    }

    equippedCount += 1;
    totalEnhancementLevel += item.enhancementLevel;
    baseGearScore += item.baseGearScore;
    if (!setCounter[item.setId]) {
      setCounter[item.setId] = {
        count: 0,
        meta: resolveSetDefinition(item.element)
      };
    }
    setCounter[item.setId].count += 1;
    enhancedStats = scaleStats(item.stats, 1 + item.enhancementLevel * ENHANCEMENT_STAT_SCALE_PER_LEVEL);
    perItemStatBonus = diffStats(enhancedStats, item.stats);
    enhancedScore = Math.round(item.baseGearScore * (1 + item.enhancementLevel * ENHANCEMENT_GEAR_SCORE_SCALE_PER_LEVEL));
    currentLoadoutPower += calculateStatPower(item.stats) + item.baseGearScore;
    enhancedGearScore += enhancedScore;
    addStats(statBonus, perItemStatBonus);
    resolvedSlots[slot] = Object.assign({}, item, {
      enhancedStats: enhancedStats,
      statBonus: perItemStatBonus,
      enhancedGearScore: enhancedScore,
      gearScoreBonus: enhancedScore - item.baseGearScore,
      nextEnhanceCost: item.enhancementLevel >= ENHANCEMENT_MAX_LEVEL ? null : buildEnhancementCost(item.enhancementLevel + 1)
    });
  });

  setBonus = buildGearSetBonus(profile, setCounter, enhancedGearScore);
  return {
    slots: resolvedSlots,
    setBonus: setBonus,
    summary: {
      basePower: basePower,
      totalPower: Math.max(0, Math.round(basePower + (currentLoadoutPower - baselineLoadoutPower) + calculateStatPower(statBonus) + Math.max(0, enhancedGearScore - baseGearScore) + setBonus.powerBonus)),
      gearSwapPower: Math.round(currentLoadoutPower - baselineLoadoutPower),
      enhancementPower: Math.round(calculateStatPower(statBonus) + Math.max(0, enhancedGearScore - baseGearScore)),
      setBonusPower: setBonus.powerBonus,
      buildTag: equippedCount === 0 ? "未配装" : (setBonus.active ? setBonus.label : "散搭养成"),
      equippedCount: equippedCount,
      totalEnhancementLevel: totalEnhancementLevel,
      baseGearScore: baseGearScore,
      enhancedGearScore: enhancedGearScore
    }
  };
}

function buildGearSetBonus(profile, setCounter, enhancedGearScore) {
  const top = Object.keys(setCounter || {}).reduce(function (best, setId) {
    const entry = setCounter[setId] || {};
    const count = Number(entry.count || 0);
    if (!best || count > best.count) {
      return {
        setId: setId,
        count: count,
        meta: entry.meta || resolveSetDefinition("")
      };
    }
    return best;
  }, null);
  const usefulGods = Array.isArray(profile.usefulGods) ? profile.usefulGods : [];
  let tier;
  let rate;
  let nextTierCount;
  let powerBonus;

  if (!top || top.count < SET_BONUS_MIN_COUNT) {
    return {
      active: false,
      setId: "",
      setName: "",
      element: "",
      count: 0,
      tier: 0,
      focus: "先从命器池或刷图凑同套 2 件",
      rate: 0,
      powerBonus: 0,
      label: "未激活套装",
      detail: "同一五行套装 2 件激活基础效果，4 件升级核心效果",
      progressText: "0/2",
      nextStep: "优先补齐同一套的 2 件起步效果"
    };
  }

  tier = top.count >= SET_BONUS_CORE_COUNT ? SET_BONUS_CORE_COUNT : SET_BONUS_MIN_COUNT;
  rate = tier === SET_BONUS_CORE_COUNT ? SET_BONUS_TIER_FOUR_RATE : SET_BONUS_TIER_TWO_RATE;
  nextTierCount = top.count >= SET_BONUS_CORE_COUNT ? 0 : SET_BONUS_CORE_COUNT;
  if (profile.dayMasterElement === top.meta.element) {
    rate += SET_BONUS_MATCH_RATE;
  }
  if (usefulGods.indexOf(top.meta.element) >= 0) {
    rate += SET_BONUS_MATCH_RATE;
  }
  if (profile.tabooGod === top.meta.element) {
    rate = Math.max(0.05, rate - SET_BONUS_TABOO_PENALTY);
  }
  powerBonus = Math.round(enhancedGearScore * rate) + (tier === SET_BONUS_CORE_COUNT ? 24 : 0);

  return {
    active: true,
    setId: top.setId,
    setName: top.meta.name,
    element: top.meta.element,
    count: top.count,
    tier: tier,
    focus: top.meta.focus,
    rate: rate,
    powerBonus: powerBonus,
    label: top.meta.name + " " + tier + "件套",
    detail: (tier === SET_BONUS_CORE_COUNT ? "4件套已成型" : "2件套已激活") + "，路线偏向 " + top.meta.focus +
      "；当前套装战力 +" + powerBonus + (nextTierCount ? "；再凑 " + (nextTierCount - top.count) + " 件升级 4 件套" : "；当前已到 MVP 核心档"),
    progressText: top.count + "/" + (nextTierCount || SET_BONUS_CORE_COUNT),
    nextStep: nextTierCount
      ? "再补 " + (nextTierCount - top.count) + " 件 " + top.meta.name + " 升到 4 件套"
      : "继续强化主武器 / 核心，把套装倍率转成实战战力"
  };
}

function buildEnhancementCost(nextLevel) {
  const level = clampEnhancementLevel(Number(nextLevel || 0));
  return {
    spiritStone: ENHANCEMENT_SPIRIT_STONE_COSTS[level] || ENHANCEMENT_SPIRIT_STONE_COSTS[ENHANCEMENT_SPIRIT_STONE_COSTS.length - 1],
    materials: ENHANCEMENT_MATERIAL_COSTS[level] || ENHANCEMENT_MATERIAL_COSTS[ENHANCEMENT_MATERIAL_COSTS.length - 1]
  };
}

function collectEquippedElementCounts(equipmentState) {
  const counts = {};

  EQUIPMENT_SLOTS.forEach(function (slot) {
    const item = equipmentState && equipmentState.slots ? equipmentState.slots[slot] : null;
    if (!item || !item.element) {
      return;
    }
    counts[item.element] = (counts[item.element] || 0) + 1;
  });

  return counts;
}

function resolvePreferredChaseElement(profile, equipmentState) {
  const counts = collectEquippedElementCounts(equipmentState);
  const ranked = Object.keys(counts).sort(function (a, b) {
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

function buildGachaEntryWeight(pool, entry, player, gachaState) {
  const profile = player && player.profile ? player.profile : {};
  const equipmentState = player && player.equipmentState ? player.equipmentState : null;
  const inventory = gachaState && Array.isArray(gachaState.inventory) ? gachaState.inventory : [];
  const preferredElement = resolvePreferredChaseElement(profile, equipmentState);
  let weight = 1;

  if (pool.id === "artifact") {
    if (entry.slot && !(equipmentState && equipmentState.slots && equipmentState.slots[entry.slot])) {
      weight += 1.55;
    }
    if (preferredElement && entry.element === preferredElement) {
      weight += 1.2;
    }
    if (Array.isArray(profile.usefulGods) && profile.usefulGods.indexOf(entry.element) >= 0) {
      weight += 0.8;
    }
    if (profile.dayMasterElement && profile.dayMasterElement === entry.element) {
      weight += 0.35;
    }
    if (entry.slot === "weapon" || entry.slot === "core") {
      weight += getRarityRank(entry.rarity) >= getRarityRank("SSR") ? 0.55 : 0.2;
    }
    if (profile.tabooGod && profile.tabooGod === entry.element) {
      weight -= 0.45;
    }
    if (hasInventoryDuplicate(inventory, entry)) {
      weight -= 0.3;
    }
  } else if (pool.id === "skill") {
    if (Array.isArray(profile.usefulGods) && profile.usefulGods.indexOf(entry.element) >= 0) {
      weight += 0.7;
    }
    if (profile.dayMasterElement && profile.dayMasterElement === entry.element) {
      weight += 0.3;
    }
    if (profile.tabooGod && profile.tabooGod === entry.element) {
      weight -= 0.35;
    }
    if (hasInventoryDuplicate(inventory, entry)) {
      weight -= 0.15;
    }
  }

  return Math.max(0.05, weight);
}

function resolvePoolPityThreshold(pool, rawThreshold) {
  return Math.max(1, Number(rawThreshold || (pool && pool.ssrThreshold) || GACHA_PITY_SSR_THRESHOLD));
}

function buildEquipmentItemKey(slot, item) {
  return [slot || "", item.name || "", item.rarity || "", item.element || "", Number(item.gearScore || item.baseGearScore || 0)].join("|");
}

function resolveSetDefinition(element) {
  return SET_DEFINITIONS[element] || {
    id: "misc",
    name: "散件路线",
    element: element || "无",
    focus: "混搭补位"
  };
}

function createEmptyStats() {
  return STAT_KEYS.reduce(function (acc, key) {
    acc[key] = 0;
    return acc;
  }, {});
}

function normalizeStatMap(raw) {
  const stats = createEmptyStats();
  STAT_KEYS.forEach(function (key) {
    stats[key] = Math.max(0, Number(raw && raw[key] != null ? raw[key] : 0));
  });
  return stats;
}

function scaleStats(stats, multiplier) {
  const scaled = createEmptyStats();
  STAT_KEYS.forEach(function (key) {
    scaled[key] = Math.round(Number(stats[key] || 0) * multiplier);
  });
  return scaled;
}

function diffStats(nextStats, previousStats) {
  const diff = createEmptyStats();
  STAT_KEYS.forEach(function (key) {
    diff[key] = Math.max(0, Number(nextStats[key] || 0) - Number(previousStats[key] || 0));
  });
  return diff;
}

function addStats(target, delta) {
  STAT_KEYS.forEach(function (key) {
    target[key] = Number(target[key] || 0) + Number(delta[key] || 0);
  });
  return target;
}

function calculateStatPower(stats) {
  return Math.round(STAT_KEYS.reduce(function (sum, key) {
    return sum + Number(stats[key] || 0) * Number(STAT_POWER_WEIGHTS[key] || 0);
  }, 0));
}

function clampEnhancementLevel(value) {
  return Math.max(0, Math.min(ENHANCEMENT_MAX_LEVEL, Number(value || 0)));
}

function cloneObject(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function formatSignedNumber(value) {
  const number = Number(value || 0);
  return number > 0 ? "+" + number : String(number);
}

function normalizeDailyState(raw, dateValue) {
  const daily = (!raw || raw.date !== dateValue) ? createDefaultDailyState(dateValue) : raw;
  Object.keys(DAILY_TASKS).forEach(function (taskId) {
    daily.progress[taskId] = Number(daily.progress[taskId] || 0);
    daily.claimed[taskId] = !!daily.claimed[taskId];
    daily.claimTimes[taskId] = daily.claimTimes[taskId] || "";
  });
  daily.specialClaims = daily.specialClaims || {};
  daily.specialClaimTimes = daily.specialClaimTimes || {};
  daily.specialClaims.loginReward = !!daily.specialClaims.loginReward;
  daily.specialClaims.freeDraw = !!daily.specialClaims.freeDraw;
  daily.specialClaims.dailyBossFirstClear = !!daily.specialClaims.dailyBossFirstClear;
  daily.specialClaimTimes.loginReward = daily.specialClaimTimes.loginReward || "";
  daily.specialClaimTimes.freeDraw = daily.specialClaimTimes.freeDraw || "";
  daily.specialClaimTimes.dailyBossFirstClear = daily.specialClaimTimes.dailyBossFirstClear || "";
  return applyDailyMetrics(daily);
}

function normalizeGachaState(raw) {
  const state = raw || {};
  state.history = Array.isArray(state.history) ? state.history.map(normalizeGachaEntry).filter(Boolean) : [];
  state.inventory = Array.isArray(state.inventory) ? state.inventory.map(normalizeGachaEntry).filter(Boolean) : [];
  state.lastResult = state.lastResult ? normalizeGachaEntry(state.lastResult) : null;
  state.pity = normalizeGachaPityState(state.pity);
  return state;
}

function normalizeGachaEntry(raw) {
  const entry = raw || {};
  const slot = typeof entry.slot === "string" ? entry.slot : "";
  const setMeta = resolveSetDefinition(entry.element);

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
    gearScore: Math.max(0, Number(entry.gearScore || entry.baseGearScore || 0)),
    stats: normalizeStatMap(entry.stats),
    enhancementLevel: clampEnhancementLevel(entry.enhancementLevel),
    itemKey: entry.itemKey || buildEquipmentItemKey(slot, entry),
    setId: entry.setId || (slot ? setMeta.id : ""),
    setName: entry.setName || (slot ? setMeta.name : ""),
    setFocus: entry.setFocus || (slot ? setMeta.focus : ""),
    source: entry.source || "normal",
    note: entry.note || "",
    pityTriggered: !!entry.pityTriggered,
    pityState: entry.pityState ? {
      sinceLastSsr: Math.max(0, Number(entry.pityState.sinceLastSsr || 0)),
      ssrThreshold: Math.max(1, Number(entry.pityState.ssrThreshold || GACHA_PITY_SSR_THRESHOLD)),
      remaining: Math.max(0, Number(entry.pityState.remaining || 0))
    } : null,
    timestamp: entry.timestamp || ""
  };
}

function findInventoryItemByKey(gachaState, itemKey) {
  const items = gachaState && Array.isArray(gachaState.inventory) ? gachaState.inventory : [];
  let index;

  for (index = 0; index < items.length; index += 1) {
    if (items[index] && items[index].itemKey === itemKey) {
      return items[index];
    }
  }
  return null;
}

function updateInventoryItemEnhancement(gachaState, itemKey, enhancementLevel) {
  const item = findInventoryItemByKey(gachaState, itemKey);

  if (!item || !itemKey) {
    return null;
  }
  item.enhancementLevel = clampEnhancementLevel(enhancementLevel);
  return item;
}

function normalizeGachaPityState(raw) {
  const state = raw || {};

  GACHA_POOLS.forEach(function (pool) {
    state[pool.id] = normalizePoolPityState(state[pool.id], pool);
  });
  return state;
}

function normalizePoolPityState(raw, pool) {
  const state = raw || {};
  const threshold = resolvePoolPityThreshold(pool, state.ssrThreshold);
  const sinceLastSsr = Math.max(0, Math.min(threshold - 1, Number(state.sinceLastSsr || 0)));

  return {
    ssrThreshold: threshold,
    sinceLastSsr: sinceLastSsr,
    remaining: Math.max(0, threshold - sinceLastSsr),
    lastHighRarityAt: state.lastHighRarityAt || "",
    lastPityTriggeredAt: state.lastPityTriggeredAt || "",
    lastDrawAt: state.lastDrawAt || ""
  };
}

function normalizeWalletState(raw, defaults) {
  const fallback = defaults || { spiritStone: 0, drawTickets: 0, materials: 0 };
  const wallet = raw || {};
  return {
    spiritStone: Math.max(0, Number(wallet.spiritStone != null ? wallet.spiritStone : fallback.spiritStone || 0)),
    drawTickets: Math.max(0, Number(wallet.drawTickets != null ? wallet.drawTickets : fallback.drawTickets || 0)),
    materials: Math.max(0, Number(wallet.materials != null ? wallet.materials : fallback.materials || 0))
  };
}

function normalizeRewardPayload(raw) {
  return normalizeWalletState(raw, { spiritStone: 0, drawTickets: 0, materials: 0 });
}

function normalizeSignInState(raw, dateValue) {
  const state = raw || {};
  const rewardCount = SIGN_IN_REWARDS.length;
  let diff;

  state.cycleIndex = Math.max(1, Number(state.cycleIndex || 1));
  state.cycleProgress = Math.max(0, Math.min(rewardCount, Number(state.cycleProgress || 0)));
  state.streakCount = Math.max(0, Number(state.streakCount || 0));
  state.totalClaimed = Math.max(0, Number(state.totalClaimed || 0));
  state.completedCycles = Math.max(0, Number(state.completedCycles || 0));
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

function normalizeActivityState(raw) {
  const state = raw || {};
  state.events = state.events || {};
  EVENT_CONFIGS.forEach(function (eventConfig) {
    const eventState = state.events[eventConfig.id] || {};
    eventState.tokenCount = Math.max(0, Number(eventState.tokenCount || 0));
    eventState.lastTokenDate = normalizeDateKey(eventState.lastTokenDate);
    eventState.claimed = !!eventState.claimed;
    eventState.claimedAt = eventState.claimedAt || "";
    eventState.redemptionCount = Math.max(0, Number(eventState.redemptionCount || 0));
    state.events[eventConfig.id] = eventState;
  });
  return state;
}

function normalizeOpsState(raw, player, dateValue) {
  const state = raw || {};

  state.firstPurchase = state.firstPurchase || { status: "locked", activatedAt: "" };
  state.monthlyCard = state.monthlyCard || {
    status: "inactive",
    activatedAt: "",
    expiresAt: "",
    lastClaimDate: "",
    activationCount: 0
  };

  if (state.firstPurchase.status !== "converted") {
    state.firstPurchase.status = hasBattleProgress(player) ? "available" : "locked";
  }

  state.firstPurchase.activatedAt = state.firstPurchase.activatedAt || "";
  state.monthlyCard.activatedAt = state.monthlyCard.activatedAt || "";
  state.monthlyCard.expiresAt = normalizeDateKey(state.monthlyCard.expiresAt);
  state.monthlyCard.lastClaimDate = normalizeDateKey(state.monthlyCard.lastClaimDate);
  state.monthlyCard.activationCount = Math.max(0, Number(state.monthlyCard.activationCount || 0));

  if (state.monthlyCard.status === "active" && state.monthlyCard.expiresAt && state.monthlyCard.expiresAt < dateValue) {
    state.monthlyCard.status = "expired";
  }
  if (state.monthlyCard.status !== "active" && state.monthlyCard.status !== "expired") {
    state.monthlyCard.status = "inactive";
  }

  return state;
}

function hasBattleProgress(player) {
  if (!player) {
    return false;
  }
  return !!(
    (player.bossState && player.bossState.lastProcessedBattleTimestamp) ||
    (player.dailyState && (Number(player.dailyState.progress.adventure || 0) > 0 || Number(player.dailyState.progress.boss || 0) > 0))
  );
}

function normalizeRewardLedger(raw) {
  return Array.isArray(raw)
    ? raw.map(function (entry) {
      return normalizeRewardEntry(entry);
    }).filter(Boolean).slice(0, 40)
    : [];
}

function buildRewardState(ledger) {
  const history = normalizeRewardLedger(ledger).slice(0, 12);
  return {
    latest: history[0] || null,
    history: history
  };
}

function normalizeRewardEntry(entry) {
  const record = entry || {};
  const reward = normalizeRewardPayload(record.reward);
  const spend = normalizeRewardPayload(record.spend);
  const hasReward = hasResourceValue(reward);
  const hasSpend = hasResourceValue(spend);
  const balanceAfter = normalizeWalletState(record.balanceAfter, { spiritStone: 0, drawTickets: 0, materials: 0 });

  if (!record.timestamp && !hasReward && !hasSpend && !record.summary && !record.title) {
    return null;
  }

  return {
    id: record.id || createLedgerEntryId(),
    kind: record.kind || (hasReward ? "grant" : (hasSpend ? "spend" : "event")),
    context: record.context || "reward",
    source: record.source || record.context || "reward",
    reason: record.reason || record.title || "奖励到账",
    title: record.title || "奖励到账",
    summary: record.summary || buildLedgerSummary(reward, spend),
    detail: record.detail || "",
    reward: reward,
    spend: spend,
    balanceAfter: balanceAfter,
    timestamp: record.timestamp || new Date().toISOString()
  };
}

function recordRewardEntry(player, entry) {
  const normalized = normalizeRewardEntry(Object.assign({}, entry, {
    balanceAfter: Object.assign({}, player.walletState)
  }));

  player.rewardLedger = normalizeRewardLedger(player.rewardLedger);
  if (!normalized) {
    return null;
  }
  player.rewardLedger = [normalized].concat(player.rewardLedger).slice(0, 40);
  return normalized;
}

function applyWalletTransaction(player, options) {
  const config = options || {};
  const reward = normalizeRewardPayload(config.reward);
  const spend = normalizeRewardPayload(config.spend);
  const shouldRecord = !!config.record || hasResourceValue(reward) || hasResourceValue(spend);

  player.walletState = normalizeWalletState(player.walletState, DEFAULT_WALLET);
  if (!canAffordCost(player.walletState, spend)) {
    return false;
  }

  Object.keys(REWARD_LABELS).forEach(function (key) {
    player.walletState[key] = Math.max(0,
      Number(player.walletState[key] || 0) - Number(spend[key] || 0) + Number(reward[key] || 0)
    );
  });

  if (shouldRecord) {
    recordRewardEntry(player, Object.assign({}, config.entry, {
      reward: reward,
      spend: spend
    }));
  }

  return true;
}

function grantPlayerReward(player, reward, entry) {
  return applyWalletTransaction(player, {
    reward: reward,
    entry: entry,
    record: true
  });
}

function spendPlayerWallet(player, cost, entry) {
  return applyWalletTransaction(player, {
    spend: cost,
    entry: entry,
    record: !!entry
  });
}

function canAffordCost(wallet, cost) {
  return Object.keys(REWARD_LABELS).every(function (key) {
    return Number(wallet[key] || 0) >= Number(cost[key] || 0);
  });
}

function hasResourceValue(payload) {
  return Object.keys(REWARD_LABELS).some(function (key) {
    return Number(payload[key] || 0) > 0;
  });
}

function buildLedgerSummary(reward, spend) {
  const rewardText = formatRewardPayload(reward);
  const spendText = formatRewardPayload(spend);

  if (rewardText !== "-" && spendText !== "-") {
    return "获得 " + rewardText + " · 消耗 " + spendText;
  }
  if (rewardText !== "-") {
    return rewardText;
  }
  if (spendText !== "-") {
    return "消耗 " + spendText;
  }
  return "-";
}

function formatRewardPayload(reward) {
  return Object.keys(REWARD_LABELS).filter(function (key) {
    return Number(reward[key] || 0) > 0;
  }).map(function (key) {
    return REWARD_LABELS[key] + " x" + reward[key];
  }).join(" / ") || "-";
}

function createLedgerEntryId() {
  return "ledger-" + Date.now() + "-" + Math.random().toString(16).slice(2, 8);
}

function createAnalyticsEventId() {
  return "analytics-" + Date.now() + "-" + Math.random().toString(16).slice(2, 8);
}

function createCheckoutSessionId(orderId) {
  return "checkout-" + String(orderId || "order") + "-" + Date.now() + "-" + Math.random().toString(16).slice(2, 8);
}

function createExternalTransactionId(orderId) {
  return "txn-" + String(orderId || "order") + "-" + Date.now() + "-" + Math.random().toString(16).slice(2, 8);
}

function createPaymentCallbackId(providerId) {
  return "callback-" + String(providerId || "provider") + "-" + Date.now() + "-" + Math.random().toString(16).slice(2, 8);
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

function normalizeAnalyticsEvent(raw) {
  const event = raw || {};

  if (!event.name && !event.funnelStep && !event.status) {
    return null;
  }
  return {
    id: event.id || createAnalyticsEventId(),
    name: event.name || event.funnelStep || "event_recorded",
    category: event.category || "ops",
    funnelStep: event.funnelStep || event.name || "event_recorded",
    status: event.status || "recorded",
    source: event.source || "server",
    offerId: event.offerId || "",
    productId: event.productId || "",
    activityId: event.activityId || "",
    orderId: event.orderId || "",
    checkoutSessionId: event.checkoutSessionId || "",
    externalTransactionId: event.externalTransactionId || "",
    paymentProvider: event.paymentProvider || "",
    amount: Number(event.amount || 0),
    currency: event.currency || "",
    placementId: event.placementId || "",
    campaignId: event.campaignId || "",
    bucketKey: event.bucketKey || "",
    message: event.message || event.detail || "",
    metadata: cloneObject(event.metadata || {}),
    timestamp: event.timestamp || new Date().toISOString()
  };
}

function normalizeAnalyticsMetric(raw) {
  const metric = raw || {};

  return {
    count: Math.max(0, Number(metric.count || 0)),
    lastAt: metric.lastAt || "",
    lastStatus: metric.lastStatus || "",
    lastOfferId: metric.lastOfferId || "",
    lastOrderId: metric.lastOrderId || ""
  };
}

function normalizeAnalyticsState(raw) {
  const state = raw || {};
  const metricKeys = [
    "productExposed",
    "orderCreated",
    "checkoutSessionCreated",
    "paymentSucceeded",
    "paymentFailed",
    "paymentCancelled",
    "paymentTimedOut",
    "paymentException",
    "entitlementFulfilled",
    "monthlyCardClaimed",
    "bossFirstClear",
    "activityRedeemed",
    "guideStepViewed",
    "guideCtaClicked",
    "returnHookViewed",
    "nextDayPreviewViewed",
    "sessionLoopCompleted",
    "playtestRewardClaimed",
    "playtestGachaCompleted",
    "playtestGearProgressed",
    "playtestAdventureStarted",
    "playtestBossStarted",
    "playtestLeaderboardViewed",
    "playtestHomeReturned"
  ];

  state.events = Array.isArray(state.events)
    ? state.events.map(function (event) {
      return normalizeAnalyticsEvent(event);
    }).filter(Boolean).slice(0, ANALYTICS_EVENT_LIMIT)
    : [];
  state.funnel = state.funnel || {};
  metricKeys.forEach(function (key) {
    state.funnel[key] = normalizeAnalyticsMetric(state.funnel[key]);
  });
  state.monitoring = {
    pendingOrders: Math.max(0, Number(state.monitoring && state.monitoring.pendingOrders || 0)),
    duplicateCallbacksBlocked: Math.max(0, Number(state.monitoring && state.monitoring.duplicateCallbacksBlocked || 0)),
    unverifiedCallbacks: Math.max(0, Number(state.monitoring && state.monitoring.unverifiedCallbacks || 0)),
    callbackExceptions: Math.max(0, Number(state.monitoring && state.monitoring.callbackExceptions || 0)),
    lastPaymentCallbackAt: state.monitoring && state.monitoring.lastPaymentCallbackAt || "",
    lastPaymentSuccessAt: state.monitoring && state.monitoring.lastPaymentSuccessAt || ""
  };
  state.lastUpdatedAt = new Date().toISOString();
  return state;
}

function getAnalyticsMetricKey(eventName) {
  const map = {
    product_exposed: "productExposed",
    order_created: "orderCreated",
    checkout_session_created: "checkoutSessionCreated",
    payment_succeeded: "paymentSucceeded",
    payment_failed: "paymentFailed",
    payment_cancelled: "paymentCancelled",
    payment_timed_out: "paymentTimedOut",
    payment_exception: "paymentException",
    entitlement_fulfilled: "entitlementFulfilled",
    monthly_card_claimed: "monthlyCardClaimed",
    boss_first_clear: "bossFirstClear",
    activity_redeemed: "activityRedeemed",
    guide_step_viewed: "guideStepViewed",
    guide_cta_clicked: "guideCtaClicked",
    return_hook_viewed: "returnHookViewed",
    next_day_preview_viewed: "nextDayPreviewViewed",
    session_loop_completed: "sessionLoopCompleted",
    playtest_reward_claimed: "playtestRewardClaimed",
    playtest_gacha_completed: "playtestGachaCompleted",
    playtest_gear_progressed: "playtestGearProgressed",
    playtest_adventure_started: "playtestAdventureStarted",
    playtest_boss_started: "playtestBossStarted",
    playtest_leaderboard_viewed: "playtestLeaderboardViewed",
    playtest_home_returned: "playtestHomeReturned"
  };

  return map[eventName] || "";
}

function getOfferLaunchConfig(offerId) {
  return cloneObject((LAUNCH_PREP_CONFIG.offers && LAUNCH_PREP_CONFIG.offers.entries && LAUNCH_PREP_CONFIG.offers.entries[offerId]) || {});
}

function getEventLaunchConfig(eventId) {
  return cloneObject((LAUNCH_PREP_CONFIG.events && LAUNCH_PREP_CONFIG.events.entries && LAUNCH_PREP_CONFIG.events.entries[eventId]) || {});
}

function recordAnalyticsEvent(player, entry) {
  const event = normalizeAnalyticsEvent(entry);
  const metricKey = event ? getAnalyticsMetricKey(event.name) : "";
  let offerConfig;
  let eventConfig;
  let metric;

  player.analyticsState = normalizeAnalyticsState(player.analyticsState);
  if (!event) {
    return null;
  }
  if (event.offerId) {
    offerConfig = getOfferLaunchConfig(event.offerId);
    event.placementId = event.placementId || offerConfig.entrySlot || "";
    event.campaignId = event.campaignId || offerConfig.campaignId || "";
    event.bucketKey = event.bucketKey || (offerConfig.rollout ? offerConfig.rollout.bucketKey : "");
  }
  if (event.activityId) {
    eventConfig = getEventLaunchConfig(event.activityId);
    event.placementId = event.placementId || eventConfig.entrySlot || event.placementId;
    event.campaignId = event.campaignId || eventConfig.campaignId || event.campaignId;
    event.bucketKey = event.bucketKey || (eventConfig.rollout ? eventConfig.rollout.bucketKey : event.bucketKey);
  }

  player.analyticsState.events = [event].concat(player.analyticsState.events).slice(0, ANALYTICS_EVENT_LIMIT);
  if (metricKey) {
    metric = normalizeAnalyticsMetric(player.analyticsState.funnel[metricKey]);
    metric.count += 1;
    metric.lastAt = event.timestamp;
    metric.lastStatus = event.status;
    metric.lastOfferId = event.offerId || metric.lastOfferId;
    metric.lastOrderId = event.orderId || metric.lastOrderId;
    player.analyticsState.funnel[metricKey] = metric;
  }
  return event;
}

function buildAnalyticsMonitoring(player, analyticsState) {
  const commerceState = player && player.commerceState ? player.commerceState : { orders: [], paymentCallbacks: [] };
  const callbacks = Array.isArray(commerceState.paymentCallbacks) ? commerceState.paymentCallbacks : [];
  const orders = Array.isArray(commerceState.orders) ? commerceState.orders : [];

  return {
    pendingOrders: orders.filter(function (order) {
      return order.status === "pending_payment" || order.checkoutStatus === "checkout_ready" || order.checkoutStatus === "timed_out" || order.checkoutStatus === "exception";
    }).length,
    duplicateCallbacksBlocked: callbacks.filter(function (entry) {
      return !!entry.duplicate;
    }).length,
    unverifiedCallbacks: callbacks.filter(function (entry) {
      return entry.verificationState && ["unverified", "needs_review"].indexOf(entry.verificationState) >= 0;
    }).length,
    callbackExceptions: callbacks.filter(function (entry) {
      return entry.normalizedStatus === "exception";
    }).length,
    lastPaymentCallbackAt: callbacks[0] ? callbacks[0].receivedAt : "",
    lastPaymentSuccessAt: analyticsState && analyticsState.funnel && analyticsState.funnel.paymentSucceeded
      ? analyticsState.funnel.paymentSucceeded.lastAt
      : ""
  };
}

function buildAnalyticsState(player) {
  const state = normalizeAnalyticsState(player.analyticsState);
  const recentLimit = LAUNCH_PREP_CONFIG.analytics && LAUNCH_PREP_CONFIG.analytics.recentLimit
    ? LAUNCH_PREP_CONFIG.analytics.recentLimit
    : { keyEvents: 6, orders: 4, rewards: 4 };

  state.monitoring = buildAnalyticsMonitoring(player, state);
  state.recent = {
    keyEvents: state.events.slice(0, Number(recentLimit.keyEvents || 6)),
    orders: (player.commerceState && Array.isArray(player.commerceState.orders) ? player.commerceState.orders : []).slice(0, Number(recentLimit.orders || 4)),
    rewards: normalizeRewardLedger(player.rewardLedger).slice(0, Number(recentLimit.rewards || 4))
  };
  return state;
}

function normalizePaymentVerification(raw) {
  const verification = raw || {};

  return {
    state: verification.state || "pending",
    reason: verification.reason || "",
    signaturePresent: !!verification.signaturePresent,
    verifiedAt: verification.verifiedAt || ""
  };
}

function normalizeCheckoutSession(raw) {
  const session = raw || {};

  if (!session.checkoutSessionId && !session.orderId && !session.providerId) {
    return null;
  }
  return {
    checkoutSessionId: session.checkoutSessionId || createCheckoutSessionId(session.orderId || "order"),
    orderId: session.orderId || "",
    providerId: session.providerId || LAUNCH_PREP_CONFIG.payment.defaultProviderId,
    providerLabel: session.providerLabel || ((PAYMENT_PROVIDER_CATALOG[session.providerId] || {}).label || "Provider Placeholder"),
    adapterId: session.adapterId || ((PAYMENT_PROVIDER_CATALOG[session.providerId] || {}).adapterId || "adapter.placeholder"),
    providerSessionId: session.providerSessionId || "",
    status: session.status || "open",
    checkoutUrl: session.checkoutUrl || "",
    expiresAt: session.expiresAt || "",
    externalTransactionId: session.externalTransactionId || "",
    entryPoint: session.entryPoint || "",
    createdAt: session.createdAt || new Date().toISOString(),
    updatedAt: session.updatedAt || session.createdAt || new Date().toISOString()
  };
}

function normalizePaymentCallbackEntry(raw) {
  const callback = raw || {};

  if (!callback.callbackId && !callback.orderId && !callback.normalizedStatus) {
    return null;
  }
  return {
    callbackId: callback.callbackId || createPaymentCallbackId(callback.providerId || "provider"),
    dedupeKey: callback.dedupeKey || "",
    orderId: callback.orderId || "",
    checkoutSessionId: callback.checkoutSessionId || "",
    providerId: callback.providerId || LAUNCH_PREP_CONFIG.payment.defaultProviderId,
    providerSessionId: callback.providerSessionId || "",
    externalTransactionId: callback.externalTransactionId || "",
    eventType: callback.eventType || "payment_callback",
    normalizedStatus: callback.normalizedStatus || "pending",
    verificationState: callback.verificationState || "pending",
    verificationReason: callback.verificationReason || "",
    duplicate: !!callback.duplicate,
    outcome: callback.outcome || "processed",
    payloadSummary: callback.payloadSummary || "",
    receivedAt: callback.receivedAt || new Date().toISOString(),
    payload: cloneObject(callback.payload || {})
  };
}

function getMonthlyCardRemainingDays(monthlyCardState, dateValue) {
  if (!monthlyCardState || monthlyCardState.status !== "active" || !monthlyCardState.expiresAt) {
    return 0;
  }
  return Math.max(0, diffDaysInclusive(dateValue, monthlyCardState.expiresAt));
}

function buildProductCatalog() {
  return PRODUCT_CATALOG.map(function (product) {
    return JSON.parse(JSON.stringify(product));
  });
}

function findProductById(productId) {
  return PRODUCT_CATALOG.find(function (product) {
    return product.id === productId;
  }) || null;
}

function findProductByOfferId(offerId) {
  return PRODUCT_CATALOG.find(function (product) {
    return product.offerId === offerId;
  }) || null;
}

function formatProductGrantPreview(product) {
  const preview = product && Array.isArray(product.grantPreview) ? product.grantPreview : [];

  return preview.map(function (entry) {
    return entry && entry.summary ? entry.summary : "";
  }).filter(Boolean).join(" → ") || "创建订单 → 等待支付 → 支付成功后发放权益";
}

function normalizeCommerceStageEntry(raw) {
  const entry = raw || {};

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
  const history = Array.isArray(order && order.stageHistory) ? order.stageHistory : [];

  if (!history.length) {
    return formatProductGrantPreview(product);
  }
  return history.map(function (entry) {
    return entry.label || entry.stage;
  }).join(" → ");
}

function normalizeCommerceOrder(raw) {
  const order = raw || {};
  const product = findProductById(order.productId) || findProductByOfferId(order.offerId) || {};
  const price = order.price || product.price || {
    amount: Number(order.priceAmount || order.priceValue || product.priceValue || 0) * 100,
    currency: order.currency || product.currency || "CNY",
    label: order.priceLabel || product.priceLabel || "支付占位"
  };
  let history = Array.isArray(order.stageHistory)
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
    fulfillmentCount: Math.max(0, Number(order.fulfillmentCount || 0)),
    duplicateBlocked: !!order.duplicateBlocked,
    paymentProvider: order.paymentProvider || LAUNCH_PREP_CONFIG.payment.defaultProviderId,
    providerAdapter: order.providerAdapter || ((PAYMENT_PROVIDER_CATALOG[order.paymentProvider] || {}).adapterId || PAYMENT_PROVIDER_CATALOG[LAUNCH_PREP_CONFIG.payment.defaultProviderId].adapterId),
    checkoutSessionId: order.checkoutSessionId || "",
    providerSessionId: order.providerSessionId || "",
    providerCheckoutUrl: order.providerCheckoutUrl || "",
    externalTransactionId: order.externalTransactionId || "",
    verificationState: order.verificationState || "pending",
    verificationReason: order.verificationReason || "",
    callbackCount: Math.max(0, Number(order.callbackCount || 0)),
    lastCallbackId: order.lastCallbackId || "",
    lastCallbackStatus: order.lastCallbackStatus || "",
    lastCallbackAt: order.lastCallbackAt || "",
    processedCallbackKeys: Array.isArray(order.processedCallbackKeys) ? order.processedCallbackKeys.slice(0, PAYMENT_CALLBACK_LIMIT) : [],
    channel: order.channel || "mock_checkout",
    price: {
      amount: Number(price.amount || 0),
      currency: price.currency || order.currency || product.currency || "CNY",
      label: price.label || order.priceLabel || product.priceLabel || "支付占位"
    },
    priceLabel: order.priceLabel || price.label || product.priceLabel || "支付占位",
    priceValue: Number(order.priceValue || product.priceValue || 0),
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

function getProductAvailability(product, player, today) {
  const opsState = player && player.opsState ? player.opsState : { firstPurchase: {}, monthlyCard: {} };
  const activityState = normalizeActivityState(player && player.activityState ? player.activityState : null);
  const dailyBoss = buildDailyBoss(today);
  const todayBossRecord = player && player.bossState && player.bossState.records
    ? ensureBossRecord(player.bossState.records[today], dailyBoss, today)
    : ensureBossRecord(null, dailyBoss, today);
  const unlockCondition = product && product.unlockCondition ? product.unlockCondition : "always";
  let eventConfig;
  let eventStatus;

  if (!product) {
    return { available: false, status: "missing", reason: "商品不存在" };
  }

  if (unlockCondition === "first_battle_complete") {
    if (opsState.firstPurchase && opsState.firstPurchase.status === "converted") {
      return { available: false, status: "fulfilled", reason: "首购已到账" };
    }
    if (!(opsState.firstPurchase && opsState.firstPurchase.status === "available")) {
      return { available: false, status: "locked", reason: "首战后解锁" };
    }
  }

  if (unlockCondition === "event_active") {
    eventConfig = findEventConfig(product.eventId);
    eventStatus = eventConfig ? getEventStatus(eventConfig, today) : { code: "ended" };
    if (eventStatus.code !== "active") {
      return { available: false, status: eventStatus.code, reason: eventStatus.code === "upcoming" ? "活动未开启" : "活动已结束" };
    }
    if (activityState && activityState.events && activityState.events[product.eventId]) {
      return { available: true, status: "available", reason: "活动进行中" };
    }
  }

  if (unlockCondition === "boss_attempted" && !hasBattleProgress(player) && Number(todayBossRecord.attempts || 0) <= 0) {
    return { available: false, status: "locked", reason: "完成一次 Boss 尝试后解锁" };
  }

  return { available: true, status: "available", reason: "可创建订单" };
}

function normalizeCommerceEntitlement(raw, product, player, today) {
  const entitlement = raw || {};
  const opsState = player && player.opsState ? player.opsState : { firstPurchase: {}, monthlyCard: {} };
  const firstPurchase = opsState.firstPurchase || {};
  const monthlyCard = opsState.monthlyCard || {};
  const availability = getProductAvailability(product, player, today);

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
  entitlement.remainingDays = Math.max(0, Number(entitlement.remainingDays || 0));
  entitlement.todayClaimable = !!entitlement.todayClaimable;
  entitlement.claimable = !!entitlement.claimable;
  entitlement.claimedToday = !!entitlement.claimedToday;
  entitlement.fulfilled = !!entitlement.fulfilled;
  entitlement.grantCount = Math.max(0, Number(entitlement.grantCount || 0));
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
      : formatRewardPayload(FIRST_PURCHASE_REWARD);
  } else if (product.offerId === "monthly_card") {
    entitlement.status = monthlyCard.status || "inactive";
    entitlement.activatedAt = monthlyCard.activatedAt || entitlement.activatedAt || "";
    entitlement.expiresAt = monthlyCard.expiresAt || "";
    entitlement.lastClaimDate = monthlyCard.lastClaimDate || "";
    if (entitlement.status === "active" && entitlement.expiresAt && entitlement.expiresAt < today) {
      entitlement.status = "expired";
    }
    entitlement.remainingDays = getMonthlyCardRemainingDays(monthlyCard, today);
    entitlement.todayClaimable = entitlement.status === "active" && entitlement.lastClaimDate !== today;
    entitlement.claimable = entitlement.todayClaimable;
    entitlement.claimedToday = entitlement.status === "active" && entitlement.lastClaimDate === today;
    entitlement.fulfilled = entitlement.status === "active" || entitlement.status === "expired";
    entitlement.grantCount = entitlement.fulfilled ? Math.max(1, entitlement.grantCount) : entitlement.grantCount;
    if (entitlement.status === "active") {
      entitlement.currentBenefitText = entitlement.todayClaimable
        ? "月卡进行中，今日日常可领。"
        : "月卡进行中，今日已领，后续可继续补 build。";
      entitlement.remainingValueText = "剩余 " + entitlement.remainingDays + " 天 · 今日" +
        (entitlement.todayClaimable ? "可领 " : "已领 ") + formatRewardPayload(MONTHLY_CARD_CONFIG.dailyReward);
    } else if (entitlement.status === "expired") {
      entitlement.currentBenefitText = "月卡已过期，可重新开通恢复回流收益。";
      entitlement.remainingValueText = "重新开通后每日可领 " + formatRewardPayload(MONTHLY_CARD_CONFIG.dailyReward);
    } else {
      entitlement.currentBenefitText = "支付成功后先发放开通奖励，再激活 30 天权益。";
      entitlement.remainingValueText = "开通奖励 " + formatRewardPayload(MONTHLY_CARD_CONFIG.activationReward) + " · 每日 " + formatRewardPayload(MONTHLY_CARD_CONFIG.dailyReward);
    }
  } else if (product.purchaseType === "consumable") {
    entitlement.status = entitlement.grantCount > 0 ? "repeatable" : "ready";
    entitlement.todayClaimable = true;
    entitlement.claimable = true;
    entitlement.claimedToday = false;
    entitlement.fulfilled = entitlement.grantCount > 0;
    entitlement.currentBenefitText = "每次支付成功后都会立即到账，适合补今天的资源缺口。";
    entitlement.remainingValueText = "已到账 " + entitlement.grantCount + " 次 · 每次 " + formatRewardPayload(CONSUMABLE_SUPPLY_REWARD);
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

function normalizeCommerceState(raw, player, today) {
  const state = raw || {};

  state.catalogVersion = state.catalogVersion || LAUNCH_PREP_CONFIG.version;
  state.orders = Array.isArray(state.orders)
    ? state.orders.map(function (order) {
      return normalizeCommerceOrder(order);
    }).filter(Boolean).slice(0, 20)
    : [];
  state.entitlements = state.entitlements || {};
  state.checkoutSessions = Array.isArray(state.checkoutSessions)
    ? state.checkoutSessions.map(function (session) {
      return normalizeCheckoutSession(session);
    }).filter(Boolean).slice(0, CHECKOUT_SESSION_LIMIT)
    : [];
  state.paymentCallbacks = Array.isArray(state.paymentCallbacks)
    ? state.paymentCallbacks.map(function (entry) {
      return normalizePaymentCallbackEntry(entry);
    }).filter(Boolean).slice(0, PAYMENT_CALLBACK_LIMIT)
    : [];

  PRODUCT_CATALOG.forEach(function (product) {
    state.entitlements[product.entitlementId] = normalizeCommerceEntitlement(
      state.entitlements[product.entitlementId],
      product,
      player,
      today
    );
  });
  state.lastUpdatedAt = new Date().toISOString();

  return state;
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
  const patch = fields || {};
  const nowIso = patch.at || new Date().toISOString();
  const current = Array.isArray(order.stageHistory) ? order.stageHistory : [];
  const latest = current.length ? current[current.length - 1] : null;

  if (!latest || latest.stage !== stage) {
    current.push({ stage: stage, label: label, detail: detail || "", at: nowIso });
  }
  order.stageHistory = current;
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
  if (stage === "cancelled") {
    order.cancelledAt = order.cancelledAt || nowIso;
  }
  if (stage === "failed") {
    order.failedAt = order.failedAt || nowIso;
  }
  if (stage === "timed_out") {
    order.timedOutAt = order.timedOutAt || nowIso;
  }
  if (stage === "exception") {
    order.exceptionAt = order.exceptionAt || nowIso;
  }
  order.stageSummary = buildCommerceStageSummary(order, findProductById(order.productId) || findProductByOfferId(order.offerId));
  return order;
}

function createMockOrderId(seed) {
  return "mock-order-" + String(seed || "product") + "-" + Date.now() + "-" + Math.random().toString(16).slice(2, 8);
}

function createCommerceOrder(player, options, today) {
  const config = options || {};
  const product = config.productId ? findProductById(config.productId) : findProductByOfferId(config.offerId);
  const availability = product ? getProductAvailability(product, player, today) : { available: false, reason: "商品不存在" };
  let entitlement;
  let latestOrder;
  let order;
  const nowIso = new Date().toISOString();

  if (!product) {
    return { ok: false, status: "product_not_found", message: "商品不存在", order: null };
  }

  player.commerceState = normalizeCommerceState(player.commerceState, player, today);
  entitlement = player.commerceState.entitlements[product.entitlementId] || null;
  latestOrder = getLatestCommerceOrderForOffer(player.commerceState, product.offerId);

  if (!availability.available) {
    return { ok: false, status: availability.status || "locked", message: availability.reason || "当前不可购买", order: latestOrder };
  }
  if (latestOrder && latestOrder.status === "pending_payment") {
    return { ok: false, status: "pending_payment", message: "已有待支付订单", order: latestOrder };
  }
  if (product.purchaseType === "subscription-like" && entitlement && entitlement.status === "active") {
    return { ok: false, status: "already_active", message: "月卡已开通", order: latestOrder };
  }
  if (product.purchaseType !== "consumable" && entitlement && entitlement.grantCount > 0 && product.offerId !== "monthly_card") {
    return { ok: false, status: "already_fulfilled", message: "该商品已到账，无需重复购买", order: latestOrder };
  }

  order = normalizeCommerceOrder({
    orderId: createMockOrderId(product.offerId),
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
    paymentProvider: config.paymentProvider || LAUNCH_PREP_CONFIG.payment.defaultProviderId,
    providerAdapter: (PAYMENT_PROVIDER_CATALOG[config.paymentProvider || LAUNCH_PREP_CONFIG.payment.defaultProviderId] || PAYMENT_PROVIDER_CATALOG[LAUNCH_PREP_CONFIG.payment.defaultProviderId]).adapterId,
    channel: config.channel || "mock_checkout",
    price: JSON.parse(JSON.stringify(product.price || {})),
    priceLabel: product.priceLabel,
    priceValue: product.priceValue,
    currency: product.currency,
    orderTemplate: product.orderTemplate,
    entryPoint: config.entryPoint || product.placement || "主城运营位",
    note: config.note || "已创建支付承接订单，下一步可创建 checkout session 并等待 provider callback。",
    createdAt: nowIso,
    updatedAt: nowIso,
    stageHistory: [
      { stage: "created", label: "订单已创建", detail: "商品骨架已生成。", at: nowIso },
      { stage: "pending_payment", label: "待支付", detail: "等待模拟支付结果。", at: nowIso }
    ]
  });

  player.commerceState.orders = [order].concat(player.commerceState.orders || []).slice(0, 20);
  if (player.commerceState.entitlements[product.entitlementId]) {
    player.commerceState.entitlements[product.entitlementId].lastOrderId = order.orderId;
  }
  player.commerceState = normalizeCommerceState(player.commerceState, player, today);
  recordAnalyticsEvent(player, {
    name: "order_created",
    category: "commerce",
    funnelStep: "order_create",
    status: "pending_payment",
    source: "server",
    offerId: product.offerId,
    productId: product.id,
    orderId: order.orderId,
    paymentProvider: order.paymentProvider,
    amount: product.price ? product.price.amount : 0,
    currency: product.currency || "CNY",
    message: product.title + " 订单已创建"
  });
  return {
    ok: true,
    status: "pending_payment",
    order: findCommerceOrderById(player.commerceState, order.orderId),
    feedback: {
      context: "commerce",
      title: "订单已创建",
      summary: product.title + " · " + product.priceLabel,
      detail: "当前订单进入待支付，可继续创建 checkout session 并模拟 provider callback。"
    }
  };
}

function getCheckoutSessionById(commerceState, checkoutSessionId) {
  return (commerceState && Array.isArray(commerceState.checkoutSessions) ? commerceState.checkoutSessions : []).find(function (session) {
    return session.checkoutSessionId === checkoutSessionId;
  }) || null;
}

function getLatestCheckoutSessionForOrder(commerceState, orderId) {
  return (commerceState && Array.isArray(commerceState.checkoutSessions) ? commerceState.checkoutSessions : []).find(function (session) {
    return session.orderId === orderId;
  }) || null;
}

function createCheckoutSessionForOrder(player, orderId, options, today) {
  const config = options || {};
  const nowIso = new Date().toISOString();
  let order;
  let provider;
  let existing;
  let session;

  player.commerceState = normalizeCommerceState(player.commerceState, player, today);
  order = findCommerceOrderById(player.commerceState, orderId);
  if (!order) {
    return { ok: false, status: "order_not_found", message: "订单不存在", order: null, checkoutSession: null };
  }
  if (order.status === "fulfilled" || order.status === "failed" || order.status === "cancelled") {
    return { ok: false, status: "terminal_order", message: "终态订单不能再创建 checkout session", order: order, checkoutSession: null };
  }
  existing = getLatestCheckoutSessionForOrder(player.commerceState, order.orderId);
  if (existing && ["open", "redirect_ready"].indexOf(existing.status) >= 0) {
    return {
      ok: true,
      status: "checkout_ready",
      order: order,
      checkoutSession: existing,
      feedback: {
        context: "commerce",
        title: "Checkout Session 已就绪",
        detail: "沿用已有 checkout session，可继续模拟 provider callback。"
      }
    };
  }

  provider = PAYMENT_PROVIDER_CATALOG[config.providerId || order.paymentProvider || LAUNCH_PREP_CONFIG.payment.defaultProviderId] || PAYMENT_PROVIDER_CATALOG[LAUNCH_PREP_CONFIG.payment.defaultProviderId];
  session = normalizeCheckoutSession({
    checkoutSessionId: createCheckoutSessionId(order.orderId),
    orderId: order.orderId,
    providerId: provider.id,
    providerLabel: provider.label,
    adapterId: provider.adapterId,
    providerSessionId: provider.id + "-session-" + Date.now(),
    status: "redirect_ready",
    checkoutUrl: "/phase2/?tab=home&checkoutSessionId=" + encodeURIComponent(order.orderId),
    expiresAt: new Date(Date.now() + Number(provider.timeoutMinutes || CHECKOUT_SESSION_TTL_MINUTES) * 60000).toISOString(),
    entryPoint: config.entryPoint || order.entryPoint || "主城运营位",
    createdAt: nowIso,
    updatedAt: nowIso
  });

  player.commerceState.checkoutSessions = [session].concat(player.commerceState.checkoutSessions || []).slice(0, CHECKOUT_SESSION_LIMIT);
  order.checkoutSessionId = session.checkoutSessionId;
  order.providerSessionId = session.providerSessionId;
  order.providerCheckoutUrl = session.checkoutUrl;
  order.paymentProvider = provider.id;
  order.providerAdapter = provider.adapterId;
  appendCommerceOrderStage(order, "checkout_ready", "Checkout 已创建", "支付 provider checkout session 已创建，等待回调。", {
    status: "pending_payment",
    checkoutStatus: "checkout_ready",
    deliveryStatus: "awaiting_payment",
    fulfillmentStatus: "pending",
    at: nowIso
  });
  player.commerceState = normalizeCommerceState(player.commerceState, player, today);
  recordAnalyticsEvent(player, {
    name: "checkout_session_created",
    category: "commerce",
    funnelStep: "checkout_session",
    status: "ready",
    source: "server",
    offerId: order.offerId,
    productId: order.productId,
    orderId: order.orderId,
    checkoutSessionId: session.checkoutSessionId,
    paymentProvider: provider.id,
    message: "Checkout session 已创建"
  });
  return {
    ok: true,
    status: "checkout_ready",
    order: findCommerceOrderById(player.commerceState, order.orderId),
    checkoutSession: getCheckoutSessionById(player.commerceState, session.checkoutSessionId),
    feedback: {
      context: "commerce",
      title: "Checkout Session 已创建",
      summary: provider.label,
      detail: "后续真实支付接入时，只需要替换 provider adapter。"
    }
  };
}

function normalizePaymentCallbackStatus(value) {
  const raw = String(value || "pay_success").toLowerCase();

  if (["pay_success", "payment_success", "success", "paid", "succeeded"].indexOf(raw) >= 0) {
    return "success";
  }
  if (["pay_fail", "payment_fail", "failed", "fail"].indexOf(raw) >= 0) {
    return "failed";
  }
  if (["cancel", "cancelled", "payment_cancelled"].indexOf(raw) >= 0) {
    return "cancelled";
  }
  if (["timeout", "timed_out", "expired"].indexOf(raw) >= 0) {
    return "timed_out";
  }
  if (["exception", "error", "payment_exception"].indexOf(raw) >= 0) {
    return "exception";
  }
  return "unknown";
}

function appendPaymentCallback(player, callback) {
  player.commerceState.paymentCallbacks = [callback].concat(player.commerceState.paymentCallbacks || []).slice(0, PAYMENT_CALLBACK_LIMIT);
}

function processPaymentCallback(player, payload, today) {
  const nowIso = new Date().toISOString();
  const orderId = payload.orderId || "";
  let order;
  let product;
  let checkoutSession;
  let normalizedStatus;
  let verification;
  let dedupeKey;
  let callback;
  let reward = null;
  let feedback = null;
  let result;

  player.commerceState = normalizeCommerceState(player.commerceState, player, today);
  order = findCommerceOrderById(player.commerceState, orderId);
  product = order ? (findProductById(order.productId) || findProductByOfferId(order.offerId)) : null;
  checkoutSession = order && order.checkoutSessionId ? getCheckoutSessionById(player.commerceState, order.checkoutSessionId) : null;
  if (!order || !product) {
    return { ok: false, status: "order_not_found", message: "订单不存在", order: null, callback: null, checkoutSession: null };
  }

  normalizedStatus = normalizePaymentCallbackStatus(payload.action || payload.status || payload.eventType || "pay_success");
  verification = normalizePaymentVerification({
    state: payload.verificationState || (payload.signature || payload.simulated ? "verified_placeholder" : "unverified"),
    reason: payload.verificationReason || (payload.signature || payload.simulated ? "placeholder provider 验签通过" : "缺少签名，保留未验证状态"),
    signaturePresent: !!payload.signature,
    verifiedAt: nowIso
  });
  order.paymentProvider = payload.providerId || order.paymentProvider || LAUNCH_PREP_CONFIG.payment.defaultProviderId;
  order.providerAdapter = (PAYMENT_PROVIDER_CATALOG[order.paymentProvider] || PAYMENT_PROVIDER_CATALOG[LAUNCH_PREP_CONFIG.payment.defaultProviderId]).adapterId;
  order.providerSessionId = payload.providerSessionId || order.providerSessionId || (checkoutSession ? checkoutSession.providerSessionId : "");
  order.externalTransactionId = payload.externalTransactionId || order.externalTransactionId || createExternalTransactionId(order.orderId);
  order.verificationState = verification.state;
  order.verificationReason = verification.reason;
  dedupeKey = payload.dedupeKey || [order.paymentProvider, payload.providerEventId || "evt", order.orderId, order.externalTransactionId, normalizedStatus].join(":");
  order.processedCallbackKeys = Array.isArray(order.processedCallbackKeys) ? order.processedCallbackKeys : [];
  callback = normalizePaymentCallbackEntry({
    callbackId: payload.callbackId || createPaymentCallbackId(order.paymentProvider),
    dedupeKey: dedupeKey,
    orderId: order.orderId,
    checkoutSessionId: order.checkoutSessionId,
    providerId: order.paymentProvider,
    providerSessionId: order.providerSessionId,
    externalTransactionId: order.externalTransactionId,
    eventType: payload.eventType || payload.action || normalizedStatus,
    normalizedStatus: normalizedStatus,
    verificationState: verification.state,
    verificationReason: verification.reason,
    duplicate: order.processedCallbackKeys.indexOf(dedupeKey) >= 0 || order.status === "fulfilled" && normalizedStatus === "success",
    outcome: "processed",
    payloadSummary: payload.summary || payload.note || "provider callback",
    receivedAt: nowIso,
    payload: payload
  });
  order.callbackCount = Math.max(0, Number(order.callbackCount || 0)) + 1;
  order.lastCallbackId = callback.callbackId;
  order.lastCallbackStatus = normalizedStatus;
  order.lastCallbackAt = nowIso;
  recordAnalyticsEvent(player, {
    name: "payment_callback_received",
    category: "commerce",
    funnelStep: "payment_callback",
    status: normalizedStatus,
    source: "server",
    offerId: order.offerId,
    productId: order.productId,
    orderId: order.orderId,
    checkoutSessionId: order.checkoutSessionId,
    externalTransactionId: order.externalTransactionId,
    paymentProvider: order.paymentProvider,
    message: "支付回调已收到",
    metadata: { verificationState: verification.state }
  });

  if (callback.duplicate) {
    order.duplicateBlocked = true;
    callback.outcome = "duplicate_ignored";
    appendPaymentCallback(player, callback);
    recordAnalyticsEvent(player, {
      name: normalizedStatus === "success" ? "payment_succeeded" : "payment_" + normalizedStatus,
      category: "commerce",
      funnelStep: "payment_callback_duplicate",
      status: "duplicate_ignored",
      source: "server",
      offerId: order.offerId,
      productId: order.productId,
      orderId: order.orderId,
      checkoutSessionId: order.checkoutSessionId,
      externalTransactionId: order.externalTransactionId,
      paymentProvider: order.paymentProvider,
      message: "重复 callback 已被幂等拦截"
    });
    player.commerceState = normalizeCommerceState(player.commerceState, player, today);
    return {
      ok: true,
      status: "duplicate_ignored",
      order: findCommerceOrderById(player.commerceState, order.orderId),
      callback: callback,
      checkoutSession: order.checkoutSessionId ? getCheckoutSessionById(player.commerceState, order.checkoutSessionId) : null,
      feedback: {
        context: "commerce",
        title: "重复 callback 已拦截",
        summary: product.title,
        detail: "同一订单重复 callback 不会重复 fulfill。"
      }
    };
  }

  order.processedCallbackKeys.push(dedupeKey);
  if (checkoutSession) {
    checkoutSession.externalTransactionId = order.externalTransactionId;
    checkoutSession.updatedAt = nowIso;
  }

  if (normalizedStatus === "success") {
    if (checkoutSession) {
      checkoutSession.status = "paid";
    }
    appendCommerceOrderStage(order, "paid", "支付成功", "provider callback 标记支付成功，准备履约。", {
      status: "paid",
      checkoutStatus: "paid",
      deliveryStatus: "awaiting_fulfillment",
      fulfillmentStatus: "pending",
      at: nowIso
    });
    result = fulfillCommerceOrder(player, order, today);
    reward = result.reward || null;
    feedback = result.feedback || null;
    callback.outcome = result.status || "fulfilled";
    recordAnalyticsEvent(player, {
      name: "payment_succeeded",
      category: "commerce",
      funnelStep: "payment_result",
      status: result.status || "fulfilled",
      source: "server",
      offerId: order.offerId,
      productId: order.productId,
      orderId: order.orderId,
      checkoutSessionId: order.checkoutSessionId,
      externalTransactionId: order.externalTransactionId,
      paymentProvider: order.paymentProvider,
      message: "支付成功"
    });
  } else if (normalizedStatus === "failed") {
    if (checkoutSession) {
      checkoutSession.status = "failed";
    }
    appendCommerceOrderStage(order, "failed", "支付失败", "provider callback 标记支付失败，权益不会发放。", {
      status: "failed",
      checkoutStatus: "failed",
      deliveryStatus: "not_started",
      fulfillmentStatus: "aborted",
      at: nowIso
    });
    feedback = { context: "commerce", title: "支付失败", summary: product.title, detail: "订单停在支付失败，未发放任何权益。" };
    callback.outcome = "failed";
    recordAnalyticsEvent(player, {
      name: "payment_failed",
      category: "commerce",
      funnelStep: "payment_result",
      status: "failed",
      source: "server",
      offerId: order.offerId,
      productId: order.productId,
      orderId: order.orderId,
      checkoutSessionId: order.checkoutSessionId,
      externalTransactionId: order.externalTransactionId,
      paymentProvider: order.paymentProvider,
      message: "支付失败"
    });
  } else if (normalizedStatus === "cancelled") {
    if (checkoutSession) {
      checkoutSession.status = "cancelled";
    }
    appendCommerceOrderStage(order, "cancelled", "支付已取消", "provider callback 标记用户取消支付。", {
      status: "cancelled",
      checkoutStatus: "cancelled",
      deliveryStatus: "not_started",
      fulfillmentStatus: "aborted",
      at: nowIso
    });
    feedback = { context: "commerce", title: "支付已取消", summary: product.title, detail: "订单已取消，可重新创建新订单。" };
    callback.outcome = "cancelled";
    recordAnalyticsEvent(player, {
      name: "payment_cancelled",
      category: "commerce",
      funnelStep: "payment_result",
      status: "cancelled",
      source: "server",
      offerId: order.offerId,
      productId: order.productId,
      orderId: order.orderId,
      checkoutSessionId: order.checkoutSessionId,
      externalTransactionId: order.externalTransactionId,
      paymentProvider: order.paymentProvider,
      message: "支付取消"
    });
  } else if (normalizedStatus === "timed_out") {
    if (checkoutSession) {
      checkoutSession.status = "timed_out";
    }
    appendCommerceOrderStage(order, "timed_out", "支付超时", "provider callback 标记本次 checkout 超时，订单保留待最终结果。", {
      status: "pending_payment",
      checkoutStatus: "timed_out",
      deliveryStatus: "awaiting_payment",
      fulfillmentStatus: "pending",
      at: nowIso
    });
    feedback = { context: "commerce", title: "支付超时", summary: product.title, detail: "订单保留在待支付，可重开 checkout 或等待最终回调。" };
    callback.outcome = "timed_out";
    recordAnalyticsEvent(player, {
      name: "payment_timed_out",
      category: "commerce",
      funnelStep: "payment_result",
      status: "timed_out",
      source: "server",
      offerId: order.offerId,
      productId: order.productId,
      orderId: order.orderId,
      checkoutSessionId: order.checkoutSessionId,
      externalTransactionId: order.externalTransactionId,
      paymentProvider: order.paymentProvider,
      message: "支付超时"
    });
  } else {
    if (checkoutSession) {
      checkoutSession.status = "exception";
    }
    appendCommerceOrderStage(order, "exception", "支付异常", "provider callback 标记异常，进入待人工确认状态。", {
      status: "pending_payment",
      checkoutStatus: "exception",
      deliveryStatus: "awaiting_payment",
      fulfillmentStatus: "needs_review",
      at: nowIso
    });
    feedback = { context: "commerce", title: "支付异常", summary: product.title, detail: "订单未履约，后续真实支付可在 adapter 层补人工复核。" };
    callback.outcome = "exception";
    recordAnalyticsEvent(player, {
      name: "payment_exception",
      category: "commerce",
      funnelStep: "payment_result",
      status: "exception",
      source: "server",
      offerId: order.offerId,
      productId: order.productId,
      orderId: order.orderId,
      checkoutSessionId: order.checkoutSessionId,
      externalTransactionId: order.externalTransactionId,
      paymentProvider: order.paymentProvider,
      message: "支付异常"
    });
  }

  appendPaymentCallback(player, callback);
  player.commerceState = normalizeCommerceState(player.commerceState, player, today);
  return {
    ok: true,
    status: callback.outcome,
    order: findCommerceOrderById(player.commerceState, order.orderId),
    callback: callback,
    checkoutSession: order.checkoutSessionId ? getCheckoutSessionById(player.commerceState, order.checkoutSessionId) : null,
    reward: reward,
    feedback: feedback
  };
}

function markEntitlementFulfilled(entitlement, orderId, grantedAt) {
  entitlement.fulfilled = true;
  entitlement.lastOrderId = orderId;
  entitlement.lastGrantedAt = grantedAt;
  entitlement.grantCount = Math.max(0, Number(entitlement.grantCount || 0)) + 1;
  entitlement.fulfilledOrderIds = Array.isArray(entitlement.fulfilledOrderIds) ? entitlement.fulfilledOrderIds : [];
  if (entitlement.fulfilledOrderIds.indexOf(orderId) === -1) {
    entitlement.fulfilledOrderIds.push(orderId);
  }
}

function fulfillCommerceOrder(player, order, today) {
  const product = findProductById(order.productId) || findProductByOfferId(order.offerId);
  const entitlement = product && player.commerceState && player.commerceState.entitlements
    ? player.commerceState.entitlements[product.entitlementId]
    : null;
  const nowIso = new Date().toISOString();
  let reward = null;
  let feedback;

  if (!product || !entitlement) {
    return { ok: false, status: "product_not_found", message: "商品或权益不存在", order: order };
  }
  if (order.status === "fulfilled") {
    order.duplicateBlocked = true;
    return {
      ok: true,
      status: "fulfilled",
      order: order,
      feedback: {
        context: "commerce",
        title: "重复履约已拦截",
        summary: product.title,
        detail: "该订单已完成履约，本次不会重复到账。"
      }
    };
  }
  if (order.orderStage !== "paid") {
    return { ok: false, status: "invalid_transition", message: "只有 paid 订单才能履约", order: order };
  }

  if (product.offerId === "first_purchase") {
    reward = FIRST_PURCHASE_REWARD;
    player.opsState.firstPurchase.status = "converted";
    player.opsState.firstPurchase.activatedAt = nowIso;
    entitlement.status = "fulfilled";
    entitlement.activatedAt = nowIso;
    entitlement.claimable = false;
    entitlement.todayClaimable = false;
    entitlement.claimedToday = true;
    markEntitlementFulfilled(entitlement, order.orderId, nowIso);
    feedback = {
      kind: "grant",
      context: "first_purchase",
      source: "first_purchase",
      reason: "首购礼包",
      title: "首购礼包已到账",
      detail: "订单支付成功后已完成履约"
    };
  } else if (product.offerId === "monthly_card") {
    reward = MONTHLY_CARD_CONFIG.activationReward;
    player.opsState.monthlyCard.status = "active";
    player.opsState.monthlyCard.activatedAt = nowIso;
    player.opsState.monthlyCard.expiresAt = shiftDateKey(today, Number(MONTHLY_CARD_CONFIG.durationDays || 30) - 1);
    player.opsState.monthlyCard.lastClaimDate = "";
    player.opsState.monthlyCard.activationCount = Number(player.opsState.monthlyCard.activationCount || 0) + 1;
    entitlement.status = "active";
    entitlement.activatedAt = nowIso;
    entitlement.expiresAt = player.opsState.monthlyCard.expiresAt;
    entitlement.lastClaimDate = "";
    entitlement.claimable = true;
    entitlement.todayClaimable = true;
    entitlement.claimedToday = false;
    markEntitlementFulfilled(entitlement, order.orderId, nowIso);
    feedback = {
      kind: "grant",
      context: "monthly_card",
      source: "monthly_card_activation",
      reason: "月卡开通奖励",
      title: "月卡权益已生效",
      detail: "开通奖励已到账，今日月卡收益可领取"
    };
  } else if (product.offerId === "event_bundle") {
    reward = EVENT_BUNDLE_REWARD;
    entitlement.status = "fulfilled";
    entitlement.claimable = false;
    entitlement.todayClaimable = false;
    markEntitlementFulfilled(entitlement, order.orderId, nowIso);
    feedback = {
      kind: "grant",
      context: "event_bundle",
      source: "event_bundle",
      reason: "活动礼包",
      title: "活动礼包已到账",
      detail: "本期活动礼包已完成履约"
    };
  } else if (product.offerId === "combat_supply_bundle") {
    reward = CONSUMABLE_SUPPLY_REWARD;
    entitlement.status = "repeatable";
    entitlement.claimable = true;
    entitlement.todayClaimable = true;
    markEntitlementFulfilled(entitlement, order.orderId, nowIso);
    feedback = {
      kind: "grant",
      context: "combat_supply_bundle",
      source: "combat_supply_bundle",
      reason: "战备补给箱",
      title: "战备补给已到账",
      detail: "消耗型商品已到账，可继续重复购买"
    };
  } else if (product.offerId === "boss_rush_bundle") {
    reward = BOSS_RUSH_REWARD;
    entitlement.status = "fulfilled";
    entitlement.claimable = false;
    entitlement.todayClaimable = false;
    markEntitlementFulfilled(entitlement, order.orderId, nowIso);
    feedback = {
      kind: "grant",
      context: "boss_rush_bundle",
      source: "boss_rush_bundle",
      reason: "Boss 冲刺礼包",
      title: "Boss 冲刺礼包已到账",
      detail: "一次性冲刺包已完成履约"
    };
  }

  if (reward) {
    grantPlayerReward(player, reward, feedback);
  }
  order.fulfillmentCount = Math.max(0, Number(order.fulfillmentCount || 0)) + 1;
  appendCommerceOrderStage(
    order,
    "fulfilled",
    product.purchaseType === "subscription-like" ? "权益已生效" : "奖励已到账",
    feedback && feedback.detail ? feedback.detail : "订单已完成履约。",
    {
      status: "fulfilled",
      checkoutStatus: "paid",
      deliveryStatus: product.purchaseType === "subscription-like" ? "entitled" : "delivered",
      fulfillmentStatus: "fulfilled",
      at: nowIso
    }
  );
  player.commerceState = normalizeCommerceState(player.commerceState, player, today);
  recordAnalyticsEvent(player, {
    name: "entitlement_fulfilled",
    category: "commerce",
    funnelStep: "entitlement",
    status: "fulfilled",
    source: "server",
    offerId: order.offerId,
    productId: order.productId,
    orderId: order.orderId,
    checkoutSessionId: order.checkoutSessionId,
    externalTransactionId: order.externalTransactionId,
    paymentProvider: order.paymentProvider,
    message: feedback && feedback.title ? feedback.title : "权益已到账"
  });
  return {
    ok: true,
    status: "fulfilled",
    order: findCommerceOrderById(player.commerceState, order.orderId),
    reward: reward,
    feedback: feedback
  };
}

function simulateCommerceOrder(player, orderId, action, today) {
  const normalizedAction = action || "pay_success";
  let order;
  let product;

  player.commerceState = normalizeCommerceState(player.commerceState, player, today);
  order = findCommerceOrderById(player.commerceState, orderId);
  product = order ? (findProductById(order.productId) || findProductByOfferId(order.offerId)) : null;

  if (!order || !product) {
    return { ok: false, status: "order_not_found", message: "订单不存在", order: null };
  }
  if (normalizedAction === "pay_success") {
    if (order.status === "fulfilled") {
      order.duplicateBlocked = true;
      return {
        ok: true,
        status: "fulfilled",
        order: order,
        feedback: {
          context: "commerce",
          title: "重复履约已拦截",
          summary: product.title,
          detail: "订单已经完成履约，不会重复发放权益。"
        }
      };
    }
    if (order.status === "failed" || order.status === "cancelled") {
      return { ok: false, status: "invalid_transition", message: "失败或取消订单不能直接支付成功", order: order };
    }
    appendCommerceOrderStage(order, "paid", "支付成功", "模拟支付成功，准备进入履约。", {
      status: "paid",
      checkoutStatus: "paid",
      deliveryStatus: "awaiting_fulfillment",
      fulfillmentStatus: "pending"
    });
    order.externalTransactionId = order.externalTransactionId || createExternalTransactionId(order.orderId);
    order.verificationState = order.verificationState || "verified_placeholder";
    order.verificationReason = order.verificationReason || "本地模拟支付成功";
    return fulfillCommerceOrder(player, order, today);
  }
  if (normalizedAction === "pay_fail") {
    if (order.status === "fulfilled") {
      return { ok: false, status: "invalid_transition", message: "已履约订单不能改成失败", order: order };
    }
    if (order.status === "failed" || order.status === "cancelled") {
      return { ok: false, status: "invalid_transition", message: "终态订单不能重复改写失败/取消状态", order: order };
    }
    appendCommerceOrderStage(order, "failed", "支付失败", "模拟支付失败，权益不会发放。", {
      status: "failed",
      checkoutStatus: "failed",
      deliveryStatus: "not_started",
      fulfillmentStatus: "aborted"
    });
    player.commerceState = normalizeCommerceState(player.commerceState, player, today);
    return {
      ok: true,
      status: "failed",
      order: findCommerceOrderById(player.commerceState, order.orderId),
      feedback: {
        context: "commerce",
        title: "支付失败",
        summary: product.title,
        detail: "订单停在支付失败，未发放任何权益。"
      }
    };
  }
  if (normalizedAction === "cancel") {
    if (order.status === "fulfilled") {
      return { ok: false, status: "invalid_transition", message: "已履约订单不能取消", order: order };
    }
    if (order.status === "failed" || order.status === "cancelled") {
      return { ok: false, status: "invalid_transition", message: "终态订单不能重复改写失败/取消状态", order: order };
    }
    appendCommerceOrderStage(order, "cancelled", "已取消", "模拟用户取消支付，订单不再继续履约。", {
      status: "cancelled",
      checkoutStatus: "cancelled",
      deliveryStatus: "not_started",
      fulfillmentStatus: "aborted"
    });
    player.commerceState = normalizeCommerceState(player.commerceState, player, today);
    return {
      ok: true,
      status: "cancelled",
      order: findCommerceOrderById(player.commerceState, order.orderId),
      feedback: {
        context: "commerce",
        title: "支付已取消",
        summary: product.title,
        detail: "订单已取消，可重新创建新订单。"
      }
    };
  }

  return { ok: false, status: "invalid_action", message: "不支持的订单模拟动作", order: order };
}

function syncActivityState(state, dateValue, dailyBoss, bossState) {
  const resolved = normalizeActivityState(state);
  EVENT_CONFIGS.forEach(function (eventConfig) {
    const status = getEventStatus(eventConfig, dateValue);
    const eventState = getActivityEventState(resolved, eventConfig.id);
    const redeem = eventConfig.redeem;
    let todayRecord;

    if (!redeem || status.code !== "active" || (redeem.oncePerEvent && eventState.claimed)) {
      resolved.events[eventConfig.id] = eventState;
      return;
    }

    if (redeem.trigger === "daily_boss_first_clear") {
      todayRecord = ensureBossRecord(bossState.records[dateValue], dailyBoss, dateValue);
      if (todayRecord.firstClearAchieved && eventState.lastTokenDate !== dateValue) {
        eventState.tokenCount = Math.min(
          Number(redeem.tokenCap || 1),
          Number(eventState.tokenCount || 0) + Number(redeem.tokenGrant || 1)
        );
        eventState.lastTokenDate = dateValue;
      }
    }

    resolved.events[eventConfig.id] = eventState;
  });
  return resolved;
}

function getActivityEventState(activityState, eventId) {
  const state = activityState || { events: {} };
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

function applyDailyMetrics(daily) {
  daily.completedCount = Object.keys(DAILY_TASKS).filter(function (taskId) {
    return Number(daily.progress[taskId] || 0) >= DAILY_TASKS[taskId].target;
  }).length;
  daily.claimedCount = Object.keys(DAILY_TASKS).filter(function (taskId) {
    return !!daily.claimed[taskId];
  }).length;
  return daily;
}

function normalizeBossState(raw, dailyBoss, dateValue) {
  const state = raw || { lastProcessedBattleTimestamp: "", records: {} };
  state.records = state.records || {};
  state.ticketState = normalizeBossTicketState(state.ticketState, dateValue);
  state.lastChallenge = normalizeBossChallengeSnapshot(state.lastChallenge);
  state.records[dateValue] = ensureBossRecord(state.records[dateValue], dailyBoss, dateValue);
  return state;
}

function normalizeBossTicketState(raw, dateValue) {
  const state = raw || {};
  if (normalizeDateKey(state.date) !== dateValue) {
    return {
      date: dateValue,
      dailyCap: DAILY_BOSS_TICKET_CAP,
      used: 0,
      remaining: DAILY_BOSS_TICKET_CAP,
      practiceAttempts: 0
    };
  }
  state.date = dateValue;
  state.dailyCap = Math.max(1, Number(state.dailyCap || DAILY_BOSS_TICKET_CAP));
  state.used = Math.max(0, Number(state.used || 0));
  state.practiceAttempts = Math.max(0, Number(state.practiceAttempts || 0));
  state.remaining = Math.max(0, state.dailyCap - state.used);
  return state;
}

function normalizeBossChallengeSnapshot(raw) {
  const state = raw || {};
  return {
    mapId: state.mapId || "",
    mapName: state.mapName || "",
    bossId: state.bossId || "",
    bossName: state.bossName || "",
    result: state.result || "",
    counted: !!state.counted,
    status: state.status || "",
    rewardFocus: state.rewardFocus || "",
    mechanicSummary: state.mechanicSummary || "",
    timestamp: state.timestamp || ""
  };
}

function ensureBossRecord(record, dailyBoss, dateValue) {
  const base = record || {
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
  base.attempts = Number(base.attempts || 0);
  base.victories = Number(base.victories || 0);
  base.bestScore = Number(base.bestScore || 0);
  base.lastScore = Number(base.lastScore || 0);
  base.firstClearAchieved = !!base.firstClearAchieved;
  base.lastMechanicSummary = base.lastMechanicSummary || "";
  base.lastFateSummary = base.lastFateSummary || "";
  return base;
}

function processDailyBossBattle(record, latestBattle, dailyBoss) {
  const score = calculateBossBattleScore(latestBattle, dailyBoss);
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

function findGachaPool(poolId) {
  let index;
  for (index = 0; index < GACHA_POOLS.length; index += 1) {
    if (GACHA_POOLS[index].id === poolId) {
      return GACHA_POOLS[index];
    }
  }
  return null;
}

function rollGachaResults(pool, drawCount, options, gachaState, player) {
  const results = [];
  const pityState = gachaState && gachaState.pity ? gachaState.pity[pool.id] : null;
  let index;

  for (index = 0; index < drawCount; index += 1) {
    const guaranteeSsr = pityState ? pityState.sinceLastSsr >= pityState.ssrThreshold - 1 : false;
    const rarity = guaranteeSsr ? pickGuaranteedRarity(pool.rarityWeights, "SSR") : pickRarity(pool.rarityWeights);
    let candidates = pool.entries.filter(function (entry) {
      return entry.rarity === rarity;
    });
    let picked;
    let timestamp;
    let setMeta;

    if (!candidates.length) {
      candidates = pool.entries;
    }
    picked = cloneObject(pickByWeight(candidates.map(function (entry) {
      return [entry, buildGachaEntryWeight(pool, entry, player, gachaState)];
    }))) || cloneObject(candidates[0]);
    timestamp = new Date().toISOString();
    setMeta = picked.element ? resolveSetDefinition(picked.element) : null;

    if (pityState) {
      if (isHighRarity(rarity)) {
        pityState.sinceLastSsr = 0;
        pityState.lastHighRarityAt = timestamp;
        if (guaranteeSsr) {
          pityState.lastPityTriggeredAt = timestamp;
        }
      } else {
        pityState.sinceLastSsr += 1;
      }
      pityState.lastDrawAt = timestamp;
      pityState.remaining = Math.max(0, pityState.ssrThreshold - pityState.sinceLastSsr);
    }

    results.push(normalizeGachaEntry({
      poolId: pool.id,
      poolName: pool.name,
      type: picked.type,
      name: picked.name,
      rarity: picked.rarity,
      element: picked.element || "",
      slot: picked.slot || "",
      gearScore: Math.max(0, Number(picked.gearScore || 0)),
      stats: normalizeStatMap(picked.stats),
      enhancementLevel: 0,
      itemKey: buildGachaItemKey(pool.id, picked, timestamp, index),
      setId: setMeta ? setMeta.id : "",
      setName: setMeta ? setMeta.name : "",
      setFocus: setMeta ? setMeta.focus : "",
      source: options.source || "normal",
      note: options.note || "",
      pityTriggered: guaranteeSsr,
      pityState: pityState ? {
        sinceLastSsr: pityState.sinceLastSsr,
        ssrThreshold: pityState.ssrThreshold,
        remaining: pityState.remaining
      } : null,
      timestamp: timestamp
    }));
  }

  return results;
}

function buildGachaItemKey(poolId, entry, timestamp, index) {
  return [
    poolId || "",
    entry.slot || "",
    entry.name || "",
    entry.rarity || "",
    entry.element || "",
    Number(entry.gearScore || 0),
    timestamp || "",
    Number(index || 0)
  ].join("|");
}

function pickRarity(weights) {
  return pickByWeight(Object.keys(weights || {}).map(function (key) {
    return [key, Number(weights[key] || 0)];
  }));
}

function pickGuaranteedRarity(weights, minimumRarity) {
  const minimumRank = getRarityRank(minimumRarity);
  const filtered = Object.keys(weights || {}).filter(function (key) {
    return getRarityRank(key) >= minimumRank;
  }).map(function (key) {
    return [key, Number(weights[key] || 0)];
  });

  return pickByWeight(filtered.length ? filtered : [[minimumRarity, 1]]);
}

function pickByWeight(entries) {
  const total = entries.reduce(function (sum, entry) {
    return sum + entry[1];
  }, 0);
  const roll = Math.random() * total;
  let acc = 0;
  let index;

  for (index = 0; index < entries.length; index += 1) {
    acc += entries[index][1];
    if (roll <= acc) {
      return entries[index][0];
    }
  }
  return entries.length ? entries[entries.length - 1][0] : "R";
}

function isHighRarity(rarity) {
  return rarity === "SSR" || rarity === "UR";
}

function buildGachaFeedback(results, pool, options) {
  let highest = null;
  const setNames = [];
  const pityTriggered = results.some(function (entry) {
    return !!entry.pityTriggered;
  });

  if (!results || !results.length) {
    return null;
  }

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

function calculateBossBattleScore(latestBattle, dailyBoss) {
  if (!latestBattle) {
    return 0;
  }
  const hpPart = Math.round(Number(latestBattle.hpRatio || 0) * 500);
  const lootPart = latestBattle.lootSummary ? Number(latestBattle.lootSummary.total || 0) * 60 : 0;
  const winPart = latestBattle.result === "victory" ? 220 : 40;
  const mapPart = dailyBoss && latestBattle.mapId === dailyBoss.mapId ? 120 : 0;
  const mechanic = latestBattle.bossMechanicSummary || {};
  const fateImpact = latestBattle.fateImpact || {};
  const mechanicPart = Number(mechanic.successfulBreaks || 0) * 70 + Number(mechanic.bonusTurns || 0) * 25 - Number(mechanic.penaltyTurns || 0) * 25;
  const fatePart = fateImpact.tier === "favored" ? 35 : (fateImpact.tier === "risky" ? -20 : 0);
  return Math.max(120, hpPart + lootPart + winPart + mapPart + mechanicPart + fatePart);
}

function buildDailyBoss(dateValue) {
  const normalizedDate = normalizeDateKey(dateValue) || dateKey(new Date());
  if (!BOSS_CANDIDATES.length) {
    return null;
  }
  const candidate = BOSS_CANDIDATES[hashString(normalizedDate + "|daily-boss") % BOSS_CANDIDATES.length];
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
  const parts = [];
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
  } else if (Array.isArray(boss.mechanics) && boss.mechanics[0]) {
    parts.push(boss.mechanics[0]);
  }
  if (boss.signatureReward && boss.signatureReward.note) {
    parts.push(boss.signatureReward.note);
  }
  return parts.join(" · ") || "按 build 克制调整节奏";
}

function getCounterElement(targetElement) {
  const counters = { 木: "金", 火: "水", 土: "木", 金: "火", 水: "土" };
  return counters[targetElement] || "木";
}

function summarizeBossMechanic(summary) {
  const mechanics = summary && Array.isArray(summary.mechanics) ? summary.mechanics : [];
  if (!summary || !summary.name) {
    return "";
  }
  let text;
  if (mechanics.length) {
    text = mechanics.map(function (entry) {
      return entry.name + " · 触发" + Number(entry.triggers || 0) + "次 / 顺势" + Number(entry.successfulBreaks || 0) + "次 / 受压" + Number(entry.penaltyTurns || 0) + "次";
    }).join("；");
  } else {
    text = summary.name + " · 触发" + Number(summary.triggers || 0) + "次 / 破势" + Number(summary.successfulBreaks || 0) + "次 / 受压" + Number(summary.penaltyTurns || 0) + "次";
  }
  return summary.rewardShiftText ? text + " / " + summary.rewardShiftText : text;
}

function findBossCandidateByMapId(mapId) {
  let index;
  for (index = 0; index < BOSS_CANDIDATES.length; index += 1) {
    if (BOSS_CANDIDATES[index].map.id === mapId) {
      return BOSS_CANDIDATES[index];
    }
  }
  return null;
}

function buildBossChallengeSnapshot(candidate, latestBattle, ticketState, counted, status) {
  return {
    mapId: candidate.map.id,
    mapName: candidate.map.name,
    bossId: candidate.boss.id,
    bossName: candidate.boss.name,
    result: latestBattle.result || "defeat",
    counted: !!counted,
    status: status,
    rewardFocus: candidate.map.dropFocus || "装备/材料",
    mechanicSummary: summarizeBossMechanic(latestBattle.bossMechanicSummary),
    fateSummary: latestBattle.fateImpact ? latestBattle.fateImpact.verdict + " · " + latestBattle.fateImpact.rewardText : "",
    timestamp: latestBattle.timestamp,
    remaining: ticketState.remaining
  };
}

function buildAdventureAdvice(profile) {
  return (GAME_CONFIG.maps || []).map(function (map) {
    return buildMapFateAdvice(profile, map, Number(profile.powerScore || 0));
  }).sort(function (a, b) {
    return b.score - a.score;
  });
}

function buildMapFateAdvice(profile, map, playerPower) {
  const resolvedProfile = profile || {};
  const usefulGods = uniqueElements(Array.isArray(resolvedProfile.usefulGods) ? resolvedProfile.usefulGods : []);
  const alignedElements = uniqueElements(usefulGods.concat(resolvedProfile.dayMasterElement ? [resolvedProfile.dayMasterElement] : []));
  const boss = map && GAME_CONFIG.bosses ? GAME_CONFIG.bosses[map.bossId] : null;
  const dropElements = map && map.dropTable && Array.isArray(map.dropTable.preferredElements) ? map.dropTable.preferredElements : [];
  const rewardElements = dropElements.filter(function (element) {
    return alignedElements.indexOf(element) >= 0;
  });
  const positive = [];
  const risky = [];
  const powerGap = Number(map && map.recommendedPower || 0) - Number(playerPower || 0);
  let score = 0;
  let tier;
  let rewardBonusRate;
  let difficultyPressure;

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
  if (playerPower > 0 && powerGap <= 0) {
    score += 2;
    positive.push("当前战力已达推荐值");
  } else if (playerPower > 0 && powerGap > 360) {
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
    bossId: boss ? boss.id : "",
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
  const rate = Math.round(Number(value || 0) * 100);
  return (rate > 0 ? "+" : "") + rate + "%";
}

function uniqueElements(list) {
  const seen = {};
  return (list || []).filter(function (item) {
    if (!item || seen[item]) {
      return false;
    }
    seen[item] = true;
    return true;
  });
}

function findEventConfig(eventId) {
  let index;
  for (index = 0; index < EVENT_CONFIGS.length; index += 1) {
    if (EVENT_CONFIGS[index].id === eventId) {
      return EVENT_CONFIGS[index];
    }
  }
  return null;
}

function getEventStatus(eventConfig, dateValue) {
  const start = normalizeDateKey(eventConfig.activeFrom);
  const end = normalizeDateKey(eventConfig.activeTo);
  if (start && dateValue < start) {
    return { code: "upcoming" };
  }
  if (end && dateValue > end) {
    return { code: "ended" };
  }
  return { code: "active" };
}

function buildDisplayName(profile, playerId) {
  if (profile && profile.displayName) {
    return profile.displayName;
  }
  return "道友-" + String(playerId || "anon").slice(0, 6);
}

function buildLeaderboardTag(profile, equipmentState) {
  const data = profile || {};
  const buildTag = equipmentState && equipmentState.summary ? equipmentState.summary.buildTag : "";
  return (data.dayMasterElement || "无") + "·" + (data.className || "未开局") + (buildTag ? " · " + buildTag : "");
}

function buildLeaderboardBuildSummary(player) {
  const profile = player && player.profile ? player.profile : {};
  const equipmentState = player && player.equipmentState ? player.equipmentState : null;
  const summary = equipmentState && equipmentState.summary ? equipmentState.summary : {};
  const setBonus = equipmentState && equipmentState.setBonus ? equipmentState.setBonus : {};
  const slots = equipmentState && equipmentState.slots ? equipmentState.slots : {};
  const weapon = slots.weapon ? slots.weapon.name : "";
  const core = slots.core ? slots.core.name : "";

  return {
    className: profile.className || "未开局",
    dayMaster: profile.dayMasterElement || "无",
    buildTag: summary.buildTag || "未配装",
    totalPower: Number(summary.totalPower || 0),
    basePower: Number(summary.basePower || 0),
    gearSwapPower: Number(summary.gearSwapPower || 0),
    enhancementPower: Number(summary.enhancementPower || 0),
    setBonusPower: Number(summary.setBonusPower || 0),
    totalEnhancementLevel: Number(summary.totalEnhancementLevel || 0),
    equippedCount: Number(summary.equippedCount || 0),
    baseGearScore: Number(summary.baseGearScore || 0),
    enhancedGearScore: Number(summary.enhancedGearScore || 0),
    setActive: !!setBonus.active,
    setLabel: setBonus.label || "未激活套装",
    setDetail: setBonus.detail || "同一套装 2 件激活，4 件升级核心效果",
    setCount: Number(setBonus.count || 0),
    setTier: Number(setBonus.tier || 0),
    setFocus: setBonus.focus || "",
    setNextStep: setBonus.nextStep || "优先补齐同套 2 件",
    mainWeapon: weapon,
    coreItem: core,
    scoreBreakdown: "基础 " + Number(summary.basePower || 0) +
      " + 换装 " + formatSignedNumber(summary.gearSwapPower || 0) +
      " + 强化 +" + Number(summary.enhancementPower || 0) +
      " + 套装 +" + Number(summary.setBonusPower || 0)
  };
}

function buildLeaderboardShareCard(boardName, scoreLabel, row, summary, detailLine) {
  const resolvedSummary = summary || {};
  const heroLine = (resolvedSummary.dayMaster || "无") + "命 · " + (resolvedSummary.className || "未开局");
  const highlight = resolvedSummary.mainWeapon
    ? "主武器 " + resolvedSummary.mainWeapon
    : (resolvedSummary.setLabel || detailLine || "继续优化 build");
  const caption = detailLine || resolvedSummary.setDetail || resolvedSummary.setNextStep || "继续追榜";

  return {
    boardName: boardName,
    scoreLabel: scoreLabel,
    heroLine: heroLine,
    buildLabel: row.tag || resolvedSummary.buildTag || "命格 build",
    highlight: highlight,
    caption: caption,
    cta: "测测你的命格能冲到第几"
  };
}

function decorateLeaderboardRows(rows, options) {
  const boardName = options && options.boardName ? options.boardName : "榜单";
  const scoreLabel = options && options.scoreLabel ? options.scoreLabel : "分数";

  return sortLeaderboardRows(rows.filter(Boolean)).map(function (row, index) {
    const rank = index + 1;
    const shareCard = Object.assign(
      {},
      buildLeaderboardShareCard(boardName, scoreLabel, row, row.summary || {}, row.detail || ""),
      row.shareCard || {}
    );

    shareCard.boardName = boardName;
    shareCard.rank = rank;
    shareCard.rankText = "第 " + rank + " 名";
    shareCard.scoreLabel = shareCard.scoreLabel || scoreLabel;
    shareCard.scoreValue = Number(row.score || 0);
    shareCard.copy = shareCard.copy || (
      "我在" + boardName + "冲到第 " + rank + " 名，当前" + shareCard.scoreLabel + " " + Number(row.score || 0) +
      "，" + (row.tag || shareCard.buildLabel || "命格 build") + "。" + (shareCard.cta || "测测你的命格能冲到第几")
    );

    return Object.assign({}, row, {
      rank: rank,
      summary: row.summary || {},
      shareCard: shareCard
    });
  });
}

function buildPowerLeaderboardRow(entryPlayerId, player, activePlayerId) {
  const summary = player && player.equipmentState ? player.equipmentState.summary : null;
  const setBonus = player && player.equipmentState ? player.equipmentState.setBonus : null;
  const buildSummary = buildLeaderboardBuildSummary(player);
  const totalPower = Math.max(
    Number(summary && summary.totalPower || 0),
    Number(player && player.profile && player.profile.powerScore || 0)
  );

  if (totalPower <= 0) {
    return null;
  }

  return {
    name: entryPlayerId === activePlayerId ? "你" : buildDisplayName(player.profile, entryPlayerId),
    tag: buildLeaderboardTag(player.profile, player.equipmentState),
    score: totalPower,
    isYou: entryPlayerId === activePlayerId,
    dayMaster: player.profile.dayMasterElement || "无",
    detail: "基础 " + Number(summary && summary.basePower || 0) +
      " · 强化 +" + Number(summary && summary.totalEnhancementLevel || 0) +
      " · " + (setBonus && setBonus.active ? setBonus.label : "未激活共鸣"),
    summary: buildSummary,
    shareCard: {
      heroLine: (player.profile.dayMasterElement || "无") + "命 · " + (player.profile.className || "未开局"),
      buildLabel: buildSummary.buildTag,
      highlight: buildSummary.mainWeapon ? "主武器 " + buildSummary.mainWeapon : buildSummary.setLabel,
      caption: buildSummary.scoreBreakdown + " · " + buildSummary.setNextStep
    }
  };
}

function buildDailyBossLeaderboardRow(entryPlayerId, player, record, activePlayerId, dailyBoss) {
  const buildSummary = buildLeaderboardBuildSummary(player);
  const statusLine = "胜利 " + Number(record.victories || 0) + " / 挑战 " + Number(record.attempts || 0) +
    (record.firstClearAchieved ? " · 已首通" : " · 待首通");
  const focusLine = [record.lastFateSummary, record.lastMechanicSummary, record.rewardFocus].filter(Boolean)[0] || "继续追更高分";

  return {
    name: entryPlayerId === activePlayerId ? "你" : buildDisplayName(player.profile, entryPlayerId),
    tag: buildLeaderboardTag(player.profile, player.equipmentState),
    detail: statusLine,
    score: record.bestScore,
    isYou: entryPlayerId === activePlayerId,
    summary: {
      bossName: record.bossName || (dailyBoss && dailyBoss.boss ? dailyBoss.boss.name : "今日 Boss"),
      rewardFocus: record.rewardFocus || (dailyBoss ? dailyBoss.rewardFocus : "Boss 追分"),
      victories: Number(record.victories || 0),
      attempts: Number(record.attempts || 0),
      bestScore: Number(record.bestScore || 0),
      lastScore: Number(record.lastScore || 0),
      firstClearAchieved: !!record.firstClearAchieved,
      lastResult: record.lastResult || "",
      lastMechanicSummary: record.lastMechanicSummary || "",
      lastFateSummary: record.lastFateSummary || "",
      className: buildSummary.className,
      dayMaster: buildSummary.dayMaster,
      buildTag: buildSummary.buildTag,
      totalEnhancementLevel: buildSummary.totalEnhancementLevel,
      setLabel: buildSummary.setLabel,
      mainWeapon: buildSummary.mainWeapon
    },
    shareCard: {
      heroLine: (record.bossName || (dailyBoss && dailyBoss.boss ? dailyBoss.boss.name : "今日 Boss")) + " · 今日 Boss 榜",
      buildLabel: buildLeaderboardTag(player.profile, player.equipmentState),
      highlight: focusLine,
      caption: statusLine + " · " + (buildSummary.mainWeapon ? "主武器 " + buildSummary.mainWeapon : buildSummary.setLabel),
      scoreLabel: "Boss 分"
    }
  };
}

function sortLeaderboardRows(rows) {
  return rows.slice().sort(function (a, b) {
    return b.score - a.score;
  });
}

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (err) {
    return { players: {} };
  }
}

function persistStore(store) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmpFile = DATA_FILE + ".tmp";
  fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2));
  fs.renameSync(tmpFile, DATA_FILE);
}

function withJsonBody(req, res, handler) {
  const chunks = [];
  req.on("data", function (chunk) {
    chunks.push(chunk);
  });
  req.on("end", function () {
    let parsed = {};
    try {
      parsed = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
    } catch (err) {
      sendJson(res, 400, { ok: false, message: "请求体不是合法 JSON" });
      return;
    }
    handler(parsed || {});
  });
  req.on("error", function () {
    sendJson(res, 500, { ok: false, message: "读取请求失败" });
  });
}

function getPlayerId(req) {
  const headerId = req.headers["x-player-id"];
  return typeof headerId === "string" && headerId.trim() ? headerId.trim() : "dev-default-player";
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function serveStatic(pathname, res) {
  let target = resolveStaticPath(pathname);
  if (!target || target.indexOf(ROOT_DIR) !== 0 || target.indexOf(DATA_DIR) === 0) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  if (!fs.existsSync(target)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  if (fs.statSync(target).isDirectory()) {
    target = path.join(target, "index.html");
  }
  if (!fs.existsSync(target)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": MIME_TYPES[path.extname(target)] || "application/octet-stream" });
  fs.createReadStream(target).pipe(res);
}

function resolveStaticPath(pathname) {
  const cleanPath = decodeURIComponent(pathname || "/");
  if (cleanPath === "/") {
    return path.join(ROOT_DIR, "index.html");
  }
  if (cleanPath === "/phase1" || cleanPath === "/phase1/") {
    return path.join(ROOT_DIR, "phase1", "index.html");
  }
  if (cleanPath === "/phase2" || cleanPath === "/phase2/") {
    return path.join(ROOT_DIR, "phase2", "index.html");
  }
  if (cleanPath === "/phase3" || cleanPath === "/phase3/") {
    return path.join(ROOT_DIR, "phase3", "index.html");
  }
  return path.join(ROOT_DIR, cleanPath.replace(/^\/+/, ""));
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Player-Id");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

function loadGameConfig() {
  const context = { window: {} };
  const file = path.join(ROOT_DIR, "phase1", "game-config.js");
  vm.runInNewContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  return context.window.LifeRpgConfig || { maps: [], bosses: {} };
}

function normalizeDateKey(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "";
  }
  const date = new Date(value + "T00:00:00");
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return dateKey(date);
}

function diffDaysBetween(fromDateKey, toDateKey) {
  const from = new Date(fromDateKey + "T00:00:00");
  const to = new Date(toDateKey + "T00:00:00");

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return 0;
  }
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function diffDaysInclusive(fromDateKey, toDateKey) {
  return diffDaysBetween(fromDateKey, toDateKey) + 1;
}

function shiftDateKey(dateValue, offsetDays) {
  const base = new Date(dateValue + "T00:00:00");
  if (Number.isNaN(base.getTime())) {
    return dateValue;
  }
  base.setDate(base.getDate() + Number(offsetDays || 0));
  return dateKey(base);
}

function dateKey(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function isDateKeyMatch(value, targetDateKey) {
  if (!value) {
    return false;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return dateKey(date) === targetDateKey;
}

function hashString(input) {
  let hash = 2166136261;
  let index;
  for (index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0);
}
