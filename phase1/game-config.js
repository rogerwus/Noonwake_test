(function () {
  "use strict";

  var bosses = {
    tai_sui: {
      id: "tai_sui",
      name: "太岁冲命",
      element: "土",
      viceElement: "金",
      hp: 980,
      atk: 80,
      def: 32,
      mechanic01: {
        id: "guard_cycle",
        name: "土甲压制",
        triggerEvery: 3,
        breakElement: "木",
        damagePenalty: 0.35,
        breakBonus: 0.18,
        bossAtkBonus: 0.08,
        summary: "每 3 回合张开土甲；木系/木向 build 可破甲，其他 build 输出被压制。"
      },
      mechanic04: {
        id: "spoils_window",
        name: "护匣共鸣",
        triggerEvery: 4,
        favoredElements: ["土", "木"],
        rewardBonusRate: 0.06,
        bonusBossDropChance: 0.12,
        summary: "每 4 回合判定护匣共鸣；土/木贴合或 2 件同向 build 可抬高额外 Boss 奖励机会。"
      },
      signatureReward: {
        title: "镇命护匣",
        loot: ["厚土镇脉核", "麒麟镇岳佩", "青龙归元符"],
        note: "木 / 土贴合或偏生存 build 更容易拿到护身核心件与起步 4 件套锚点。"
      },
      mechanics: [
        "每3回合土甲压制：非木向 build 伤害下降，木向可破甲反打",
        "每4回合护匣共鸣：土/木向更容易抬高额外 Boss 掉落机会",
        "Boss 额外追件：镇命护匣偏掉护身核心与青龙 / 麒麟起步件",
        "土主金副：被木克制，吃金系穿透"
      ],
      challengeValue: "新手关机制教学 Boss"
    },
    po_cai_sha: {
      id: "po_cai_sha",
      name: "破财煞",
      element: "金",
      viceElement: "火",
      hp: 1280,
      atk: 108,
      def: 45,
      mechanic01: {
        id: "guard_cycle",
        name: "聚财金幕",
        triggerEvery: 4,
        breakElement: "水",
        damagePenalty: 0.28,
        breakBonus: 0.22,
        bossAtkBonus: 0.12,
        summary: "每 4 回合聚起金幕；水系/水向 build 更容易穿幕并追回输出。"
      },
      mechanic02: {
        id: "fate_pressure",
        name: "偏财追缴",
        triggerEvery: 2,
        favoredElements: ["水", "金"],
        alignedBonus: 0.14,
        penaltyOutgoing: 0.12,
        penaltyIncoming: 0.16,
        summary: "每 2 回合判定命格贴合；日主/喜用贴水金者更稳，撞忌神时更容易被追缴节奏。"
      },
      mechanic04: {
        id: "spoils_window",
        name: "藏锋追匣",
        triggerEvery: 5,
        favoredElements: ["金", "水", "火"],
        rewardBonusRate: 0.08,
        bonusBossDropChance: 0.14,
        summary: "每 5 回合开启追匣；金/水贴合或火向爆发 build 可抬高额外 Boss 奖励机会。"
      },
      signatureReward: {
        title: "藏锋金库",
        loot: ["白虎裂甲衣", "锐金破军珏", "朱雀焚心符"],
        note: "水 / 金顺势时更容易抬高白虎输出签名件权重，火向 build 也能追朱雀爆发锚点。"
      },
      mechanics: [
        "每4回合聚财金幕：非水向 build 输出吃亏，水向可打穿护幕",
        "每2回合偏财追缴：喜水/金或日主贴合者更稳，撞忌神时压力更高",
        "每5回合藏锋追匣：顺势或爆发 build 更容易抬高额外 Boss 掉落机会",
        "Boss 额外追件：藏锋金库偏掉白虎武器 / 护甲与朱雀爆发件",
        "金主火副：水系与土系生存更稳"
      ],
      challengeValue: "基础 farm 图的进阶 Boss"
    },
    qi_sha_ya_ding: {
      id: "qi_sha_ya_ding",
      name: "七杀压顶",
      element: "水",
      viceElement: "金",
      hp: 1760,
      atk: 142,
      def: 58,
      mechanic01: {
        id: "guard_cycle",
        name: "杀势断命",
        triggerEvery: 3,
        breakElement: "土",
        damagePenalty: 0.32,
        breakBonus: 0.2,
        bossAtkBonus: 0.16,
        summary: "每 3 回合抬高杀势；土系/土向 build 更稳，其他 build 更容易被压节奏。"
      },
      mechanic02: {
        id: "fate_pressure",
        name: "杀印夺势",
        triggerEvery: 4,
        favoredElements: ["土", "金"],
        alignedBonus: 0.16,
        penaltyOutgoing: 0.1,
        penaltyIncoming: 0.18,
        summary: "每 4 回合判定喜用/日主是否贴土金；贴合可稳住杀势，撞忌神更容易断节奏。"
      },
      mechanic03: {
        id: "reward_window",
        name: "命匣开阖",
        triggerEvery: 5,
        favoredElements: ["水", "金"],
        rewardBonusRate: 0.12,
        rewardPenaltyRate: 0.06,
        summary: "每 5 回合开启命匣；水/金向或贴命格者可抬高 Boss 掉落档位，逆势时奖励更保守。"
      },
      mechanic04: {
        id: "spoils_window",
        name: "劫匣偏转",
        triggerEvery: 4,
        favoredElements: ["水", "土", "金"],
        rewardBonusRate: 0.1,
        bonusBossDropChance: 0.18,
        summary: "每 4 回合判定劫匣偏转；水/土成型或贴金 build 可抬高额外 Boss 奖励机会。"
      },
      signatureReward: {
        title: "劫星命匣",
        loot: ["劫星命盘", "玄武覆潮甲", "北渊镇煞核"],
        note: "水 / 金成型 build 更容易命中 Boss 毕业件，也更适合补玄武 4 件套护甲位。"
      },
      mechanics: [
        "每3回合杀势断命：非土向 build 节奏被压，土向可稳住回合交换",
        "每4回合杀印夺势：土/金向更稳，撞忌神时更容易被断回合",
        "每5回合命匣开阖：水/金向可把 Boss 奖励抬到更高档",
        "每4回合劫匣偏转：水/土成型 build 更容易抬高额外 Boss 掉落机会",
        "Boss 额外追件：劫星命匣偏掉玄武核心 / 护甲与 Boss 毕业件",
        "水主金副：喜土玩家容错更高"
      ],
      challengeValue: "流年劫关核心挑战 Boss"
    }
  };

  var maps = [
    {
      id: "minggong_trial",
      name: "命宫试炼（新手图）",
      type: "trial",
      recommendedPower: 520,
      element: "土",
      dropFocus: "R/SR 生存底子 · 青龙续航 / 麒麟稳血",
      purpose: "开荒起步图，先补生存件和第一轮强化底子。",
      buildFocus: "更适合身弱、土木向、生存型 build 稳定过图。",
      description: "开局教学图，验证命格、配装、首个 Boss 挑战。",
      dropTable: {
        label: "土木生存件",
        preferredElements: ["土", "木"],
        preferredSlots: ["armor", "core", "talisman"],
        preview: ["土/木防具", "命盘核心", "青龙/麒麟起步件"],
        identity: "先补护身件、命盘核心和 +1~+3 的强化底子，再决定要不要继续追套装。",
        rewardRhythm: "稳定 2 件过渡掉落；打赢太岁后再看 1 次偏防具/核心的 Boss 档位，适合立住生存底子。",
        featuredLoot: ["青萝护命衣", "厚土镇脉核", "青龙归元符"],
        bossSignatureLoot: ["厚土镇脉核", "麒麟镇岳佩", "青龙归元符"],
        routeChoices: [
          {
            name: "护身线",
            focus: "优先补土系防具 / 核心，先把血线和减伤立起来。",
            targets: ["麒麟皮甲", "厚土镇脉核", "麒麟镇岳佩"]
          },
          {
            name: "续命线",
            focus: "优先补木系续航件，顺手追青龙 2~4 件。",
            targets: ["青萝护命衣", "青龙归元符", "命盘核心·初"]
          }
        ],
        setTargets: ["青龙套 4件续航", "麒麟套 2件稳血"],
        phase2Chase: {
          whoShouldFarm: "适合刚开荒、身弱或缺防具 / 核心 / 护符位的玩家。",
          targets: ["青龙归元符", "麒麟镇岳佩", "厚土镇脉核"],
          whyNow: "先在这里补齐 2 件青龙 / 麒麟起步件和 +1~+3 强化底子，再去五行秘境追输出。"
        },
        farmPlan: "当你还没把主力件抬到 +3、或缺防具/核心时先刷这里；缺血线走护身线，缺续航走续命线。",
        bossRewardHint: "能处理太岁土甲或踩中护匣共鸣时，更稳拿到镇命护匣里的土/木向护身核心件。",
        clearMobDropCount: 2,
        bossDropCount: 1,
        lossDropChance: 0.45,
        mobRarityWeights: { R: 0.64, SR: 0.26, SSR: 0.09, UR: 0.01 },
        bossRarityWeights: { SR: 0.66, SSR: 0.26, UR: 0.08 }
      },
      waves: [
        [
          { name: "泥影小怪", element: "土", hp: 220, atk: 42, def: 15 },
          { name: "泥影小怪", element: "土", hp: 220, atk: 42, def: 15 }
        ],
        [
          { name: "金煞游魂", element: "金", hp: 260, atk: 48, def: 16 }
        ],
        [
          { name: "守关精英", element: "土", hp: 460, atk: 62, def: 22 }
        ]
      ],
      bossId: "tai_sui"
    },
    {
      id: "wuxing_realm",
      name: "五行秘境（基础 farm 图）",
      type: "farm",
      recommendedPower: 940,
      element: "金",
      dropFocus: "SR/SSR 输出追件 · 白虎穿透 / 朱雀爆发",
      purpose: "中段 farm 图，拉起主力输出件与更明确的 build 方向。",
      buildFocus: "更适合喜金/火、暴击/爆发流，补主武器和饰品收益最高。",
      description: "基础 farm 图，强调刷怪掉装与 build 调整。",
      dropTable: {
        label: "金火输出件",
        preferredElements: ["金", "火"],
        preferredSlots: ["weapon", "accessory"],
        preview: ["金系武器/护甲", "火系爆发命符", "白虎/朱雀追件"],
        identity: "稳定刷输出主件，把 build 从能打推进到有明显爆发手感，并承接 +3~+5 的中段强化。",
        rewardRhythm: "每次胜利稳定 3 件常规掉落；Boss 档位更偏武器/饰品/护甲，是中段补输出件最快的图。",
        featuredLoot: ["金羽裂锋", "白虎裂甲衣", "朱雀焚心符"],
        bossSignatureLoot: ["白虎裂甲衣", "锐金破军珏", "朱雀焚心符"],
        routeChoices: [
          {
            name: "裂锋线",
            focus: "白虎武器 / 命符 / 护甲优先，补穿透与斩杀。",
            targets: ["金羽裂锋", "白虎裂甲衣", "锐金破军珏"]
          },
          {
            name: "焚命线",
            focus: "朱雀主武器 / 命符优先，补爆发回合。",
            targets: ["赤焰法杖", "朱雀焚心符", "流年天符"]
          }
        ],
        setTargets: ["朱雀套 4件爆发", "白虎套 4件穿透"],
        phase2Chase: {
          whoShouldFarm: "适合已经站稳前一图、准备补主输出位并追 4 件朱雀 / 白虎的玩家。",
          targets: ["白虎裂甲衣", "朱雀焚心符", "锐金破军珏"],
          whyNow: "这是中段最直接的输出成型图，先把主武器 / 命符 / 护甲补齐，再去 Boss 把分数兑现出来。"
        },
        farmPlan: "当你已经有开荒底子、准备补主武器/饰品并把主力件抬到 +3~+5 时，优先刷这张图；爆发不够走焚命线，斩杀不够走裂锋线。",
        bossRewardHint: "顺势打穿聚财金幕或踩中藏锋追匣时，更容易命中藏锋金库里的白虎 / 朱雀签名件。",
        clearMobDropCount: 3,
        bossDropCount: 1,
        lossDropChance: 0.35,
        mobRarityWeights: { R: 0.36, SR: 0.41, SSR: 0.18, UR: 0.05 },
        bossRarityWeights: { SR: 0.42, SSR: 0.38, UR: 0.20 }
      },
      waves: [
        [
          { name: "金羽妖兵", element: "金", hp: 360, atk: 66, def: 22 },
          { name: "火纹傀儡", element: "火", hp: 330, atk: 70, def: 18 }
        ],
        [
          { name: "秘境巡守", element: "金", hp: 520, atk: 84, def: 26 }
        ],
        [
          { name: "五行执事", element: "火", hp: 760, atk: 96, def: 32 }
        ]
      ],
      bossId: "po_cai_sha"
    },
    {
      id: "liunian_tribulation",
      name: "流年劫关（Boss 图）",
      type: "boss",
      recommendedPower: 1400,
      element: "水",
      dropFocus: "SSR/UR Boss 成型件 · 玄武控场 / 白虎斩杀",
      purpose: "成型验证图，拿高稀有核心件并检验是否能处理 Boss 机制。",
      buildFocus: "更适合喜水/金、技能/爆发流，用来冲榜或补最终成型件。",
      description: "高压 Boss 图，验证配装成型与机制应对。",
      dropTable: {
        label: "水金成型件",
        preferredElements: ["水", "金"],
        preferredSlots: ["core", "weapon", "talisman"],
        preview: ["SSR/UR 核心", "高端武器", "Boss 毕业命符"],
        identity: "专门刷 Boss 成型件与高稀有核心，适合把 build 从成型推进到冲榜。",
        rewardRhythm: "常规只给 2 件，但打赢 Boss 会额外开 2 个高稀有格，专门承担成型冲刺与榜单毕业件。",
        featuredLoot: ["玄冥断潮刃", "玄武覆潮甲", "劫星命盘"],
        bossSignatureLoot: ["劫星命盘", "玄武覆潮甲", "北渊镇煞核"],
        routeChoices: [
          {
            name: "镇煞线",
            focus: "玄武核心 / 护甲先成型，先把控场与容错拉满。",
            targets: ["北渊镇煞核", "玄武覆潮甲", "劫星命盘"]
          },
          {
            name: "断潮线",
            focus: "白虎 / 玄武混搭冲榜，优先补武器与命符。",
            targets: ["玄冥断潮刃", "七杀号令", "太岁断章"]
          }
        ],
        setTargets: ["玄武套 4件控场", "白虎/玄武 混搭冲榜"],
        phase2Chase: {
          whoShouldFarm: "适合主力件已到 +5 左右、准备冲榜或补 Boss 毕业件的中后段玩家。",
          targets: ["玄武覆潮甲", "劫星命盘", "北渊镇煞核"],
          whyNow: "当前两图已经把底子和输出立住后，这里负责把玄武 4 件与高稀有 Boss 件一次性兑现。"
        },
        farmPlan: "当你已经能稳定刷前两图、主力件接近 +5、并准备拿高稀有核心或冲榜件时再来这里；缺核心走镇煞线，冲榜走断潮线。",
        bossRewardHint: "命匣判定顺势或踩中劫匣偏转时，更容易命中劫星命匣里的 Boss 毕业件。",
        clearMobDropCount: 2,
        bossDropCount: 2,
        lossDropChance: 0.22,
        mobRarityWeights: { R: 0.20, SR: 0.32, SSR: 0.32, UR: 0.16 },
        bossRarityWeights: { SR: 0.24, SSR: 0.46, UR: 0.30 }
      },
      waves: [
        [
          { name: "流年劫影", element: "水", hp: 520, atk: 96, def: 26 },
          { name: "劫火残念", element: "火", hp: 500, atk: 102, def: 24 }
        ],
        [
          { name: "命劫精英", element: "金", hp: 880, atk: 120, def: 36 }
        ],
        [
          { name: "劫关镇守", element: "水", hp: 1180, atk: 134, def: 44 }
        ]
      ],
      bossId: "qi_sha_ya_ding"
    }
  ];

  window.LifeRpgConfig = {
    maps: maps,
    mapOrder: maps.map(function (m) { return m.id; }),
    bosses: bosses
  };
})();
