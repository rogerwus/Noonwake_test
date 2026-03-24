# 人生副本

一个把八字命盘可视化成 RPG 角色面板，并已推进到“命格 + 战斗 + 掉装 + 配装 + 日运营骨架 + 后端承接”闭环的 Web 原型项目。

## 当前阶段

- 当前仓库主线已经从“先把 MVP 闭环搭起来”进入到 **内容深化 + 调优 + launch-prep** 阶段。
- `Phase 1` 的命格生成、战斗、掉装、配装、Boss 最小闭环已经完成；`Phase 2` 的主城、抽卡、Adventure、Gear、Boss、Rank 主路径也已经可玩。
- 当前 launch / validation target 是：以现有 `Phase 2 + Node 本地后端` 作为主承载版本，做成可小范围试玩、可验证留存/竞争感的微信小游戏式 MVP。
- 现阶段重点不是扩新大系统，而是把现有 `抽卡 → 换装 → 强化 → 刷图 → Boss → 榜单` 做得更厚、更稳、更适合 launch 前验证。
- 2026-03-22 的当前切片是 **《视觉动效首刀包》**：不扩新系统，优先把 `抽卡揭示 / 奖励到账 / 强化成功 / Boss 结算 / Home-Boss-Rank 视觉层级` 做得更像游戏成品。

## 近期待办

- **内容扩充**：继续补地图 / Boss 层次、命器 / 套装池、签名追件与 build 分路。
- **数值调优**：继续校准掉落、强化、保底、每日奖励、Boss 收益与回流节奏。
- **竞争 / 传播**：继续补榜单比较感、冲线提示、真实展示卡、导出预备数据块与“为什么值得晒”的表达。
- **上线 / 商业化准备**：继续收紧首购、月卡、活动入口、配置化与 launch 前承接细节。

## 运行

### 推荐：前后端一起跑（当前默认方式）

项目现在自带一个最小 Node.js 本地服务，同时负责：
- 静态页面托管（旧版 / Phase 1 / Phase 2）
- 本地 JSON 持久化的后端状态
- 每日奖励 / 抽卡 / 签到 / 活动兑换 / 每日 Boss / 今日 Boss 榜接口
- 每日奖励 / 抽卡 / 签到 / 活动兑换 / 装备强化 / 总战力榜 / 同日主榜 / 今日 Boss 榜接口
- 地图价值说明 / 推荐战力匹配 / Boss 记分挑战次数与机制处理反馈

启动：

```bash
npm start
```

默认访问：
- 旧版界面：`http://localhost:8787/`
- Phase 1 单机核心验证版：`http://localhost:8787/phase1/`
- Phase 2 / M3 运营骨架版：`http://localhost:8787/phase2/`
- Phase 3 / Phaser 主城壳：`http://localhost:8787/phase3/`

服务端本地数据会自动写到 `backend/data/state.json`。

如果想隔离本地调试 / smoke 数据，可临时指定：

```bash
LIFE_RPG_DATA_FILE=/tmp/life-rpg-smoke-state.json npm start
```

### 仅跑静态前端（保留旧方式）

```bash
python3 -m http.server 8000
```

此模式下页面仍可打开，但会回退到原有本地 `localStorage` 流程，不会启用新的后端日状态与榜单持久化。

说明：
- 使用 `npm start` 时，Phase 2 默认以本地后端作为主路径。
- 钱包余额、奖励到账历史、首购 / 月卡状态与领奖、抽卡券消耗都会以后端为准。
- 当前已穿戴装备、强化等级、强化消耗、五行套装加成，以及总战力榜 / 同日主榜排名也以后端为准。
- 抽卡主路径现在带有按卡池独立累计的 `SSR/UR` 保底进度；免费单抽与付费抽卡都会进入同一后端累计。
- 仅静态模式下，抽卡、7 日签到、活动兑换才会继续走浏览器本地回退逻辑。

## Phase 1（单机核心验证版）

`phase1/` 提供最小可运行闭环，验证 6 个点：
1. 命格生成（复用 `bazi-engine.js`）
2. 数值结构（职业模板 + 身强弱 + 战力公式）
3. 自动战斗（波次 + 技能触发 + 五行克制）
4. 掉落结算（小怪/Boss 掉率 + 幸运修正）
5. 装备替换（5 槽位 + 背包替换）
6. 第一个 Boss（太岁冲命）+ 第一条可处理机制（按五行/配装破势）

## Phase 2（当前主线 / 可玩 MVP）

`phase2/` 提供微信小游戏风格的壳层结构，当前已接：
1. 主城页面（资源栏 + 动作链提示）
2. Tab 导航（Home / Gacha / Adventure / Gear / Boss / Rank）
3. Adventure 地图配置渲染（3 张 MVP 图，明确用途 / 奖励焦点 / build 倾向 / 推荐战力差）
4. Gear 页读取 Phase 1 快照并回写后端装备态（已穿戴 / 强化 / 套装 / 关键属性），同时可把抽到的命器直接换上
5. Boss 页壳子（含当前地图 Boss 联动、机制提示、每日记分挑战次数）
6. Adventure / Boss 双入口接入 Phase 1 战斗页（`/phase1/?map=...&returnTo=...`）
7. Home / Adventure / Boss 显示“最近一次战斗结果”回传卡片
8. Gacha 抽卡页（命器池 / 神通池，单抽/十连，启用 Node 服务时结果与抽卡券消耗落后端）
9. Leaderboard 榜单页（总战力榜 / 同日主榜 / 今日 Boss 榜，前两者走后端真实战力）
10. 主城每日任务入口（刷图 1 次 / 打 Boss 1 次 / 抽卡 1 次）
11. 动作链快捷跳转（抽卡→配装、配装→刷图、Boss/榜单→回主城）
12. Home 新增 `Today Goals` 面板：把免费抽、签到、日常奖励、Boss、冲榜、活动 / 商品钩子按当前价值排序
13. 首购 / 月卡 / 活动礼包 / 消耗型补给 / 一次性冲刺包卡片补齐价值表达、当前状态、权益说明和最近模拟订单说明
14. 后端新增最小 `productCatalog + commerceState(entitlements/orders)` 承接层，SKU / productType / entitlementType / unlockCondition / price / duration 等字段已规范化，未来真实支付可挂接到这个骨架
15. Home / Boss / Leaderboard 新增“今日回流理由”层，进一步强调今天最值得做什么、做完后该回哪里看结果
16. `launchPrepConfig` 新增最小可调配置位，先承接 Today Goals 排序、运营位露出权重和回流文案，不引入新系统

## 2026-03-22《视觉动效首刀包》

本轮继续不扩新系统，只补玩家最容易感知到的“像游戏”的反馈层，让现有 `抽卡 -> 领奖 -> 强化 -> Boss -> Rank` 更有揭示感、到账感和结算感。

- `抽卡揭示`
  - `phase2/gacha` 新增高亮 reveal 卡：抽出结果后会做轻量 reveal / flip 式入场，结果卡不再只是纯文本落点。
  - `SSR / UR` 会比 `R / SR` 有更强的卡面光效、稀有度 badge 与 toast 强调；十连会突出“本轮最高稀有度”。
  - 抽到可穿戴命器时，会直接把“可换装槽位”做成强提示，继续承接 `去 Gear`。

- `奖励到账 / 强化 / Boss 结算`
  - 全局新增轻量反馈层：奖励到账、抽卡出货、强化成功、Boss 结算都会弹出短时 toast，不引入新框架。
  - 奖励到账会带资源浮层 chips，同时脉冲高亮资源栏，让玩家更容易感知“钱/券/材料真的进账了”。
  - 强化成功会强调 `强化 +N` 与总战力变化，并把“回 Rank 验收”作为下一步提示。
  - Boss 打完后会生成更强的结算 hero；首通奖励到账后，Boss 页和 Rank 页都会继续强调“去领奖 / 去看榜”。

- `Home / Boss / Rank 视觉层级`
  - Home 的 `下一步只点这个`、Boss 的 `今日 Boss`、Rank 的 `当前真实状态` 统一升级为更强 hero 卡，主 CTA / 次级信息层级更清楚。
  - `真实成绩 / 参考样本 / 当前结算 / 日期预览 / 可追榜 / 首通奖可领 / 风险较高` 都改成显式 badge，而不是只靠文字段落解释。
  - 榜单行与展示卡对 `真实成绩 vs 参考样本` 做了更明显的视觉区分，避免用户把样本/预览误读成自己的当前状态。

- `轻量微动效`
  - Tab 切换、CTA、卡片 hover/press、资源 pulse 都补了轻量过渡，控制在纯 HTML/CSS/JS 可维护范围内。
  - 补了 `prefers-reduced-motion` 兜底，避免这轮动效变成负担。

- `验证重点`
  - 重点验证 `phase2/gacha` 的 reveal 卡、`奖励到账` toast + 资源 pulse、`Gear` 强化成功反馈、`Boss` 结算 hero、`Rank` 的真实/样本区分与回榜强调。

## 2026-03-22《移动端细节收边 + Boss/Rank 文案压缩包》

本轮继续不扩新系统，只做玩家一眼能感知到的收口：让 `Boss / Rank` 更像决策面，让手机视角下的首屏更短、更顺手。

- `Boss / Rank 压缩`
  - `Boss` 的 `今日 Boss` 与 `当前准备进的 Boss` 主卡改成统一的三段式决策信息：`我现在在哪 / 先补什么 / 做完回哪`，把长段说明、机制解释、推荐理由压进更短的块里。
  - `Boss` 的候选 Boss 列表也从多段说明文改成短卡：先看当前是否适合打、为什么打、要注意什么，再决定是否切过去。
  - `Rank` 顶部 hero、位置解释卡、下一步卡、展示卡都去掉重复解释，优先只保留 `差距 / 先补什么 / 去哪验收`。
  - `Rank` 默认展示卡从两张压到一张主卡；详细参考 / 分享信息下沉到展开态，避免首屏被样本卡和传播卡抢走主线。

- `移动端收边`
  - 新增通用 `decision-grid` 结构，窄屏下自动改成单列，减少 Boss / Rank / 分享卡在手机上横向拥挤、换行凌乱的问题。
  - 底部 tab 导航进一步降权：更轻、更矮、按钮更紧凑，减少遮挡和“像后台壳层”的视觉重量。
  - 窄屏下统一收紧 `card / tile` padding、按钮组换行、榜单列宽、分享卡 badge 布局和日期切换控件，让 CTA 更容易点，也更少出现一排挤爆。

- `试玩噪音清理`
  - `Boss / Rank` 的 share-ready surface 改成精简版：默认只露出当前位置、先补什么、回哪里验收，详细 flow 与复制文案放到展开态。
  - 继续把 `mock / 运营位` 口吻改成更玩家视角的文案，减少“后台 / 调试页”感觉。

- `验证重点`
  - 重点验证 `Home / Boss / Rank` 在窄屏下的首屏长度、CTA 堆叠、榜单卡换行、分享卡挤压和底部 tab 占用。

## 2026-03-21《试玩前总检修复包》

本轮先修阻塞，再做最小收口，不扩新系统：

- `阻塞修复`
  - 修复了 `phase2/app.js` 里 `buildLeaderboardInsight -> buildCompetitionFocus -> renderHome -> renderAll` 链路对 `challengeState.remaining` 的空引用。
  - 根因是前端本地 / 半同步态下 `bossState.ticketState` 可能缺失，导致 Home 首屏在第一次 `renderAll()` 时直接抛错，表现为“只剩 header + tab，主体几乎空白”。
  - 现在前端会在 `syncBossState`、`getResolvedBossState`、`getBossChallengeState` 统一归一化 Boss 记分票券状态，保证缺字段时也有安全默认值。

- `完整度巡检`
  - 复测并收紧了 `Home -> Gacha -> Gear -> Adventure -> Boss -> Rank -> Home` 主路径，确认六个主 tab 都能稳定渲染主体内容。
  - `Home` 把 `下一步 / Today Goals` 提前，试玩观察面下沉到次级区，减少首屏“信息很多但不知道先点什么”的感觉。
  - `Gacha` 把 `免费抽 -> 结果 -> 去 Gear` 收成首屏双卡，抽完后下一步更直白。
  - `Boss` 把“当前准备进的 Boss”提到主位，并补了更明确的 `进入记分/练习挑战 -> 去榜单复盘 -> 回主城` 路径。

- `页面错误收口`
  - 给 `phase1/` 和 `phase2/` 都补了内联 favicon，避免试玩 smoke path 在浏览器控制台持续出现默认 `favicon.ico` 404 噪音。

- `验证`
  - 通过 `npm run check`。
  - 本地 `http://127.0.0.1:8787/phase2/` 已用无头 Chrome 走通六个主 tab 与主链路烟测：`登录奖励 / 签到 / 免费抽 / 换装 / 强化 / Adventure / Boss / 榜单 / 回主城`。

## 2026-03-21《视觉与试玩信任感修复包》

本轮不扩新系统，只修会直接伤害试玩信任感的视觉与一致性问题：

- `脏输出清理`
  - `phase2/app.js` 新增通用 `formatUiValue()` 兜底，把对象 / 对象数组先转成可读文本，再统一走 `safe()`，避免商品、权益、订单、运营位弹窗把 `[object Object]` 直接暴露给试玩用户。
  - `订单链路 / 月卡链路` 现在都会优先显示人类可读的 grant preview / stage summary，不再把对象数组直接塞进 UI。

- `真实状态 vs 样本预览`
  - 本地 fallback 榜单不再给玩家默认塞 `总战力 900 / Boss 分 520` 这类假成绩；未达入榜条件时会明确保持 `当前尚未入榜`。
  - `Home / Boss / Rank` 的分享卡、样本卡、冲榜回路现在会显式标注 `样本 / 预览 / 当前真实状态`，并把参考卡的用词改成 `参考第 X 名 / 参考成绩`，避免和当前角色成绩打架。
  - 玩家可见导出区已去掉 JSON 调试块，只保留 `复制参考文案 / 复制分享文案` 这类对试玩更自然的文案出口。

- `视觉层级收口`
  - `Home` 首屏改成 `下一步 -> Today Goals -> 当前状态 / 回流提醒 / 冲榜回路 / 明日承接`，分享预览下沉，不再一进来就被样本卡抢注意力。
  - `Boss` 首屏优先露出 `今日 Boss` 和 `当前准备进的 Boss`，把 `最近战斗 / 收获 / 动作链提示` 放到更后面，避免一屏信息过长。
  - `Rank` 顶部改成 `当前真实状态` hero + `当前状态解释 / 下一步怎么追`，样本卡仍保留，但已经作为参考层而不是“你已经冲到第 1 名”的暗示层。
  - 底部 tab 导航降权，样本卡改成更克制的 preview 样式，整体更接近可交给真实玩家试玩的成品感。

## 2026-03-18 launch-prep additions

本轮继续只做 launch-prep，不扩新系统，重点是让当前 MVP 更像可上线验证的产品壳：

- `Home / Today Goals`
  - 顶部新增更产品化的今日目标面板。
  - 把 `免费抽 / 签到 / 登录与日常奖励 / 今日 Boss / 榜单冲线 / 活动与商品入口` 聚合成一屏内最值得点的动作。
- `首购 / 月卡 / 活动入口`
  - 首购和月卡卡片、弹窗说明里现在会同时显示 `当前收益 / 剩余价值 / 为什么今天值得点 / 最近模拟订单 / 订单链路`。
  - 活动卡片会更明确显示 `今天为什么做 / 本期价值 / 兑换奖励 / 当前进度`。
- `商品 / 权益 / 订单占位`
  - 本地后端返回 `productCatalog`、`commerceState` 和最小 `launchPrepConfig`。
  - `productCatalog` 现在多了 `whyToday / entryHooks / grantPreview` 等 launch-prep 字段，方便后续挂真实支付与入口调优。
  - `commerceState` 仍然 **不接真实支付**，但比上一轮更完整：除了 `entitlements / orders` 外，还会带 `catalogVersion / lastUpdatedAt / checkoutStatus / deliveryStatus / stageSummary` 这类轻量落点。
  - 首购 / 月卡的“模拟到账 / 模拟开通”仍会同步写入 mock order，但现在能更清楚看到“创建订单 → 模拟支付 → 奖励/权益生效”的占位链路。
- `回流强化`
  - Home / Boss / Rank 现在会更直接告诉玩家为什么今天还值得回来一轮，以及应该回哪张榜 / 哪个入口确认变化。
  - 月卡、活动和到账播报会更自然地把“回来先领什么、领完再去哪”串起来。

## 2026-03-20 P0《支付与商品完整体》收口

本轮不是接真实 SDK，而是把“接 SDK 前最后一层产品 / 订单 / 权益骨架”收成可交付状态：

- `商品体系`
  - `productCatalog` 统一补齐 `sku / productType / purchaseType / entitlementType / price / currency / duration / unlockCondition / entryHooks / grantPreview`。
  - 当前已覆盖 `首购礼包 / 月卡 / 活动礼包 / 消耗型补给 / 一次性 Boss 冲刺包` 五类商品。
- `订单状态机`
  - 后端和本地 fallback 都统一走 `created → pending_payment → paid → fulfilled / failed / cancelled`。
  - `failed / cancelled` 现在保持终态，不能再互相改写；已 `fulfilled` 订单重复 `pay_success` 会被明确拦截。
- `权益绑定`
  - entitlement 只会在订单真实走到 `fulfilled` 后生效，避免重复 fulfill / 重复到账。
  - `monthly_card` 会把开通奖励和 30 天权益拆开表达；`combat_supply_bundle` 保留可重复购买与累计到账次数；一次性商品到账后会锁定重复购买。
- `UI 承接`
  - Home / 运营位 / 商品弹窗现在会同时显示 `商品骨架 / 解锁条件 / 订单链路 / 阶段轨迹 / 权益状态 / 最近商业化反馈`。
  - 商品卡改成统一两段式：先 `创建订单`，再按待支付订单显示 `模拟支付成功 / 支付失败 / 取消订单`，把真实支付前的承接链路直接露出来。
- `本地验收`
  - 已跑过本地 smoke：`创建首购订单 → 模拟支付成功 → entitlement fulfilled → 重复 pay_success 拦截`。
  - 也验证了 `战备补给箱取消分支 + 终态保护` 和 `活动礼包 pay_fail 分支`，并确认 `/phase2/` 可正常打开。

## 2026-03-20《真支付接线 + 上线数据包》

这次把仓库推进到“离正式上线只差最后一段”的状态，重点不是接某个真实 SDK，而是把 **SDK 前最后一层协议、回调、数据与配置骨架** 收完整。

- `payment integration-ready layer`
  - 后端新增 `checkout session` 承接：订单创建后可单独创建 `checkout session`，保留 `paymentProvider / providerAdapter / checkoutSessionId / providerSessionId / externalTransactionId / verificationState` 等真实接线需要的字段。
  - 新增 `POST /commerce/checkout/session` 与 `POST /commerce/payment/callback`，前者模拟 checkout 创建，后者模拟 webhook / callback 落地。
  - callback 现在能承接 `支付成功 / 失败 / 取消 / 超时 / 异常`，并把状态写回订单链路，而不是把所有结果都硬塞进旧的 `pay_success / pay_fail / cancel`。
  - 同一订单重复 callback 会走幂等保护：重复成功回调不会重复 fulfill，也会记入 callback / analytics 记录里，方便后续接真实 provider 时排查。
  - 真实支付接入的预期路径已经收敛成：`create order -> create checkout session -> provider callback -> fulfillment`，后续应只替换 provider adapter，而不是重写订单状态机。
- `analytics / funnel / monitoring basics`
  - 后端新增最小 `analyticsState`：包含事件流、漏斗计数、监控计数，以及 `recent key events / recent orders / recent rewards` 三个可回看数据块。
  - 当前漏斗已承接：`商品曝光`（Home 商品位客户端上报）、`下单`、`checkout session 创建`、`支付成功 / 失败 / 取消 / 超时 / 异常`、`权益到账`、`月卡领取`、`Boss 首通`、`活动兑换`。
  - `Home` 新增轻量 `上线数据 / 漏斗骨架` debug tile，本地就能看到当前曝光、支付、到账和 callback 监控计数。
  - 当前监控能力是最小上线版：能看 `pending orders / duplicate callbacks blocked / unverified callbacks / callback exceptions`，还没有接外部 dashboard / alerting。
- `launch ops config v1`
  - `launchPrepConfig` 从纯排序参数扩成更像正式上线配置：支持 `payment / analytics / surfaces / offers.entries / events.entries`。
  - 商品位现在可以按配置控制 `enabled / sortWeight / recommendedWeight / entrySlot / campaignId / rollout(bucketKey/bucketPercent/cohort)`，不再只靠前端硬编码顺序。
  - 活动位也可按配置控制 `enabled / sortWeight / entrySlot / campaignId / rollout`，为灰度、活动切换、回流位调度预留字段。
  - `Home` 的 `运营入口总览 / 活动入口 / analytics tile` 也开始走 `surfaces.home.modules` 开关，避免后续为了活动期商品或回流位反复硬改模板。

### 当前已具备的上线前能力

- 能在本地完整演练：`创建订单 -> 创建 checkout session -> 模拟 payment callback -> 验证订单状态 / entitlement / analytics / recent history`。
- 能从 `Home` 直接看到商品位曝光、最近订单、最近奖励、最近关键事件，以及 callback 是否被幂等拦截。
- 能把商品露出、活动露出和回流位排序放进统一 launch config，而不是把“首购 / 活动包 / Boss 冲刺位”写死在 UI 分支里。

## 2026-03-20《新手引导 + 首日留存收口包》

本轮不扩支付、不加重教程系统，只在现有 `Home / Today Goals / Gacha / Gear / Adventure / Boss / Rank` 表面层把“第一次来怎么玩”和“明天为什么回来”说清楚。

- `first-session guidance`
  - `Home` 顶部主引导卡现在会直接写出开局顺序：`登录奖励 / 签到 / 免费单抽 → Gear 换装 → 主武器/核心 +1~+3 → 推荐图 → 今日 Boss → 回榜 / 回主城`。
  - `每日任务奖励` 区的 CTA 不再固定写死成 `抽卡 / 刷图 / 榜单`，而是跟随当前 guide step，优先把玩家推去真正应该做的下一步，减少 CTA 冲突。
  - `Gacha / Gear / Adventure / Boss / Rank` 的动作链提示卡现在都会明确回答两件事：`什么时候该来这页`、`做完后该去哪页`。
  - `Boss` 和 `Rank` 页的主说明进一步压字，优先保留 `为什么现在打 / 看` 与 `打完 / 看完后回哪`。

- `D1 retention hooks`
  - `Home` 新增 `明日承接` 卡，主城会明确回答：`今天还剩什么`、`明天回来能拿什么`、`下次上线最该继续哪一步`。
  - `每日登录 / 7 日签到` tile 现在会直接给出 `明天预告`，并把 `月卡 mock` 的明日收益写明。
  - `Boss` 页会直接提示 `明日 Boss` 与今天先把首通 / build 跑通的价值；`Rank` 页也会补充 `明日承接`，把今天读差距和明天继续补 build 串起来。
  - `明日承接` 文案会把 `次日签到 / 明日 Boss / 活动延续 / 月卡 mock` 一起收进主城，而不是只告诉玩家“今天还能再打一轮”。

- `analytics / playtest readiness`
  - 复用现有 analytics skeleton，新增最小验证事件：`guide_step_viewed`、`guide_cta_clicked`、`return_hook_viewed`、`next_day_preview_viewed`、`session_loop_completed`。
  - `Home` 的 analytics tile 现在会直接显示首会话 / D1 retention 相关计数，方便 5~20 人试玩时判断：玩家有没有看到引导、有没有点引导、有没有看到明日承接、有没有跑通首轮链路。
  - 当前版本的主验证重点改成：`能不能顺着第一次流程走完`、`打完今天一轮后，明天回来理由是否足够清楚`。

- `playtest focus`
  - 推荐首会话顺序：`登录 / 领奖 / 免费抽 / 换装 / 强化 / 推荐图 / 今日 Boss / 回榜 / 回主城`。
  - 试玩观察点：玩家是否还会在 `Gacha / Gear / Adventure / Boss / Rank` 之间迷路；以及回主城时是否能立即读懂 `今天还剩什么 / 明天回来拿什么`。

## 2026-03-21《外部试玩收口包》

这轮继续只做 surgical wrap-up，不扩新系统，目标是把当前版本收成适合 `5~20 人真实试玩` 的状态：更快做决定、更少迷路、更容易观察卡点。

- `首会话主链路再收口`
  - `Home` 顶部主引导卡改成 `下一步只点这个`，CTA 收成 `当前步骤 + 做完后的下一步`，减少第一次看见一屏按钮时的选择压力。
  - `Home` 新增 `试玩观察面`，直接显示 `当前阶段 / 当前卡点 / 最近关键行为 / 最近奖励`，方便本地看玩家到底卡在哪一段。
  - 页面 URL 现在会同步 `tab / map / bossDate`，从 `phase1` 回跳或刷新时更容易接回刚才那一段。

- `Gacha / Gear / Adventure / Boss UX 收口`
  - `Gacha` 把 `每日免费单抽` 前置成第一块 featured tile；首抽阶段把命器池 `单抽` 提升为主 CTA，避免十连抢走第一次点击。
  - `Gear` 的承接按钮改成按当前主链路状态推 `Adventure / Boss / Rank`，不再过早默认把第一次试玩导向冲榜。
  - `Adventure` 与 `Boss` 卡面压缩成几行真正帮助决策的信息：`为什么现在打 / 刷`、`目标掉落`、`适合谁`、`关键机制 / 风险`、`做完后去哪`。

- `analytics / playtest observation`
  - 复用现有 analytics skeleton，新增最小试玩 milestone：`免费收益`、`抽卡`、`Gear 推进`、`Adventure`、`Boss`、`榜单查看`、`回主城`。
  - `Home` 的 analytics tile 现在优先显示这条试玩主路径计数，再显示 commerce / payment skeleton，避免观察时被支付信息抢走注意力。

- `这轮试玩重点看什么反馈`
  - 玩家登录后会不会自然先把 `登录奖励 / 签到 / 免费抽` 收完。
  - 玩家抽到第一件命器后，会不会立刻理解“下一步去 Gear 换上 / 强化”。
  - 玩家在 `Gear -> Adventure -> Boss -> Leaderboard` 之间，是否还能一眼知道自己下一步该去哪里。
  - 打完 Boss / 看完榜后，玩家会不会自然回主城看 `最近奖励 / 当前卡点 / 明日承接`。

### 还没做、因此还不算真上线的部分

- 还没有接入真实第三方支付 SDK / API，也没有真实验签、重试签名、退款、对账与补单流程。
- 还没有外部监控面板、告警、Sentry/日志聚合、支付回调重试队列或死信处理。
- 还没有正式的数据导出 / BI 管道，当前 analytics 仍是本地后端可读骨架。
- 还没有多 provider adapter、真实价格/商品后台、灰度规则执行器；现在只是把字段和接线位先收好。

### 新增接口

- `POST /commerce/checkout/session`：创建 / 复用某个订单的 checkout session。
- `POST /commerce/payment/callback`：模拟 provider webhook / callback 落地。
- `POST /analytics/track`：记录客户端商品曝光等最小事件。

## 2026-03-18 playtest + polish outcomes

本轮按真实主路径做了一次最小 playtest：`Home / 登录奖励 / 签到 / 免费抽 → Gear 换装 → 第一次强化 → 一把推荐图 → 今日 Boss → 榜单 → 回主城`。

- `Playtest audit`
  - `Today Goals` 对免费收益、Boss、榜单提示已经够强，但对 `换装 / 强化 / 第一把推荐图` 这三个真正决定流畅度的中段动作提示偏弱，主线容易被跳过。
  - `Boss` 首通后虽然状态已经写回后端，但“首通奖励可领 / 活动可兑 / 现在该回榜看差距”这条 continuation 不够直白，胜利后的动机容易断掉。
  - “为什么我今天要回来”和“我现在下一步该点什么”在 `Boss / Rank` 页比 `Home` 更清楚，主城本身还不够像回流总控台。
- `This patch`
  - `Home / Today Goals` 现在会补进当前主线路径中的 `换装 / 强化 / 推荐图` CTA，而不只显示福利和终点入口。
  - `Home / Boss / Rank` 在 `今日 Boss` 首通达成但奖励未领时，会更直接露出 `领取首通奖励` CTA。
  - `Home` 现在也会显示“今日回流理由”，把免费收益、首通奖励、活动兑换、榜单回看统一收回主城。
  - `Boss` 结算写入奖励账本时，会明确告诉玩家当前是否刚解锁了 `首通奖励 / 活动兑换 / 榜单复盘`，减少“打完了但不知道接下来做什么”的空档。
- `Current first-session loop`
  - 推荐顺序仍然是：`先收免费收益 → 抽到件就直接换上 → 优先把主武器/核心抬到 +1~+3 → 打一把推荐图 → 进今日 Boss → 回榜单看差距 → 回主城领剩余奖励`。

## 2026-03-18 propagation productization final pack

本轮不扩新系统，只把现有 `Home / Rank / Boss` 的传播面和回流链路做成更接近首发成品的状态：

- `Share / export card`
  - `Leaderboard` 顶部新增可截图传播的 `晒图成品卡`，不再只是占位预览。
  - 卡面会直接给出：`当前名次 / 离前一名差多少 / build 与角色亮点 / 今日 Boss 或当日亮点 / 一句话总结`。
  - 现阶段保留 `复制文案 / 展开卡面` 这类玩家可理解的动作；调试型 JSON 导出已从试玩用户可见层移除，避免页面太像后台。

- `追赶反馈强化`
  - `Home` 现在会直接露出当前最值得回看的榜单与 share-ready surface，明确告诉玩家先去 `Rank` 看差距，再决定去 `Boss` 或 `Adventure`。
  - `Boss` 新增同样的回流成品卡，明确显示 `离前一名差多少 / 最该刷哪张图 / 最该强化哪件装备 / 为什么今天还值得继续打一轮 Boss`。
  - `Rank` 则把这些信息收成一张更完整的成品卡，方便玩家既能理解、也能传播。

- `Home → Rank → Boss → 回榜`
  - `Home`：先看最该追的榜和可晒总结。
  - `Rank`：看清差距后，明确跳去 `Boss / Gear / Adventure`。
  - `Boss`：打前就知道这把值不值得打，打完为什么要立刻回榜确认变化。

- `当前状态`
  - 现在的 Phase 2 已从“排行榜能解释”推进到“有一张拿得出手的可晒卡 + 更顺的回流链路”。
  - 仍然没有接真实外部平台分享，但产品面已经达到可截图、可复制导出文案 / JSON、可用作传播验证的完成度。
  - 如果是回流会话，主城应优先回答两件事：`今天还有什么白拿/高价值收益没收？`、`这次回来最值得继续推哪一步？`；本轮 patch 重点就是把这两句做得更直白。

## 2026-03-19 propagation productization polish

本轮继续不扩新系统，只在现有 `Home / Boss / Rank` 表面层再抬一刀成品感，让“可晒”和“打完会回来看榜”更像首发壳层：

- `share/export card` 再成品化
  - share-ready surface 现在除了榜单 badge、差距和亮点外，还会直接给出 `差距 / 补强 / 刷图 / Boss` 快速条。
  - 晒图正文改成更像晒单卡的结构：一句话 quote、四格重点信息、以及 `看榜 → 补强 → Boss → 回榜` 四步路线，截图时可直接带出回流逻辑。

- `排行榜追赶反馈` 再直白
  - `冲榜回路` 卡现在会额外写出 `最短追赶` 与 `今天还值得继续`，让玩家不用二次理解就知道：离前一名差多少、为什么今天还值得再打一轮 Boss。
  - `最近一次战斗结果` 卡也新增 `回榜看变化 / 去 Gear 补强 / 继续刷图`，把战斗结束后的下一跳做成直接可点的链路。

- `Boss → 回榜` 直接进核心 surface
  - `Boss` 的今日轮换主卡新增 `去榜单复盘`，让玩家在 Boss 页主面板里就能明白打完为什么要立刻回榜。

- `当前状态`
  - 现在的 Phase 2 已经不只是“榜单能解释”，而是有一套可截图、可复制、可带 CTA 回流的本地传播成品面。
  - 仍然没有接真实外部分享平台，但当前完成度已经足够用于分享动机验证、群内传播和回流链路验证。

## 2026-03-19 数值收敛 + 首发验收包

这轮不再扩系统，而是按真实玩家路径做一轮完整首发验收：`登录 / 领奖 / 抽卡 / 换装 / 强化 / 刷图 / Boss / 看榜 / 回主城`。

- `Playtest audit`
  - 真正跑一遍后，发现 `轮值 Boss 讨伐周` 还停在 `2026-03-18`，导致 `2026-03-19` 的今日 Boss 首通虽然能拿榜分和首通奖励，但不会再产生活动兑换价值。
  - `Home / Boss / Rank` 第一屏信息仍偏密，尤其 `Boss` 顶部主卡和 `Rank` 解释卡有“都对，但读起来太慢”的问题，不够像上线前的一屏决策面。
  - 早期强化数值反馈偏弱，`+1~+2` 虽然便宜，但第一次强化带来的“我真的变强了”还不够明显。
  - 免费线现在已经顺跑，反而让 `首购 / 月卡` 的 mock value 看起来偏保守，不够像真实的轻付费加速入口。

- `This patch`
  - 把 `轮值 Boss 讨伐周` 延长到 `2026-03-25`，恢复“今日 Boss 首通 → 活动可兑 → 回榜复盘”的完整回路。
  - `Home / Today Goals` 改成更收口的 5 卡上限，并新增 `先领 / 再补 / 验收` 三段摘要，让主城更直接回答“今天回来干嘛”。
  - `Boss` 顶部主卡压缩成更短的决策信息，并把 `领取首通奖励` 提到 CTA 前排；`Rank` 的解释 / 建议 / 回流卡也同步减字，优先保留差距、先补什么、下一步去哪。
  - 数值上把 `今日 Boss 首通奖励` 提到 `灵石 x260 / 抽卡券 x2 / 材料 x12`，同时把强化前 3 级做得更轻更爽：前段消耗更平滑、每级成长更明显。
  - `首购 / 月卡` 只做价值收敛，不改系统：首购改成更像一次清晰的“首战后加速包”，月卡改成更像“回来先收一笔，再去冲 Boss / 榜单”的稳定承接。

- `离首发候选版还差什么`
  - 还缺真实外部玩家反馈，而不只是本地自测。
  - 还缺更像成品的真分享出口与真实支付链路；当前仍是本地传播面和 mock commerce。
  - 还可以继续做一轮更细的美术 / 动效 / 战斗结算爽感，但这已经属于“最后成品质感”而不是骨架问题。

## 验证建议

推荐使用 `npm start` 跑本地后端后，按下面顺序快速 smoke：

1. 打开 `http://localhost:8787/phase2/`
2. 在 Home 确认 `Today Goals` 是否会优先提示 `免费单抽 / 签到 / 日常奖励 / Boss / 榜单 / 活动或商品位`
3. 确认当主线路径停在 `换装 / 强化 / 推荐图` 时，`Today Goals` 会把这些中段 CTA 提到前面，而不是只剩福利 / Boss / 榜单
4. 触发一次 `今日 Boss` 首通后，确认 `Home / Boss / Rank` 都能看到 `领取首通奖励`，且 `轮值 Boss 讨伐周` 仍处于激活态、可继续承接兑换
5. 回 Home / Boss / Rank，确认“今天回来干嘛”相关卡片都能在一屏内回答：`先领什么 / 先补什么 / 最后去哪验收`
6. 在 Gear 连点 `+1~+3`，确认前 3 级资源消耗更平滑，且总战力反馈比前一版更明显
7. 点击首购 / 月卡卡片的说明，确认价值文案已对齐新的 `首战后加速包 / 回流稳定收益` 表达
8. 在商品卡先 `创建订单`，确认卡面 / 弹窗出现 `待支付 / 订单链路 / 阶段轨迹`，再分别验证 `模拟支付成功 / 支付失败 / 取消订单`
9. 触发一次首购、活动礼包或消耗型礼包后，回 Home 看 `商品状态` 是否刷新 `权益状态 / 最近商业化反馈 / 订单状态`
10. 去活动入口，确认活动卡会显示 `今天为什么做 / 本期价值 / 兑换进度`，并且活动礼包只在活动期可下单
11. 完成一次 Boss 尝试后，确认 `Boss 冲刺礼包` 解锁；取消或失败订单后能重新创建，但终态不会被改写
12. 运行 `npm run check` 做语法检查

## 2026-03-15 调优基线

本轮不是扩新系统，而是给现有闭环做第一刀“可比较的 baseline”调优：

- 经济节奏：
  - 每日 `刷图` 奖励更偏材料，明确服务强化与换装。
  - 每日 `Boss` 继续承担抽卡券入口，让 Boss 成为追卡前的必经动作。
  - 每日 `抽卡` 不再直接返还抽卡券，避免抽卡任务把消耗完全抹平。
  - 登录 / 签到前半段改为更早给材料，周目后半段再集中放抽卡券与高额灵石。
  - 强化成本前几级更平滑，让第一次强化、第一次换装后的反馈更快出现。

- 抽卡追求：
  - `命器池` SSR 保底改为 `36` 抽，作为 build 成型主入口。
  - `神通池` SSR 保底改为 `42` 抽，保留更长一点的 Boss / 榜单向追求。
  - 命器池加入轻度追件修正：优先抬高未补齐槽位、当前套装路线、喜用五行的权重，只做轻度 bias，不做商业化重定向。

- 地图 / Boss 节奏：
  - `命宫试炼`：稳定 `2` 件常规掉落 + `1` 次 Boss 档位，负责补生存底子。
  - `五行秘境`：稳定 `3` 件常规掉落 + `1` 次 Boss 档位，负责刷输出件和中段 build。
  - `流年劫关`：稳定 `2` 件常规掉落，但 Boss 胜利额外再开 `2` 个高稀有格，专门承担成型冲刺。
  - 今日 Boss 首通奖励提高，和地图掉落一起形成“打 Boss 值得去”的日循环。

这轮 baseline 的目的是让后续继续调数值时，有一套清晰可比的默认节奏，而不是继续叠新功能。

## 2026-03-15 第二轮 focused tuning

这一轮继续只收窄在现有 loop，不增加新系统，目标是让 `抽卡 → 换装 → 强化 → 刷图 → Boss → 榜单` 的手感更连贯：

- 经济第二刀：
  - 每日 `刷图` 奖励进一步偏材料，明确让 farm 承担强化燃料。
  - 每日 `Boss` 任务在保留 `抽卡券` 的同时补少量 `灵石`，让 Boss 后更顺手接一次强化。
  - 每日 `抽卡` 任务继续不返券，但补更稳一点的 `灵石 + 材料`，让抽到新件后更容易立刻换装。
  - 每日登录 / 7 日签到前半段继续提前给材料，进一步把 `+1~+3` 的第一次强化窗口做实；周后段再放大追卡与冲榜资源。

- 进度手感第二刀：
  - 强化改成更明确的前轻后重：`+1~+3` 更顺滑，`+6` 之后更依赖 farm / Boss / 日常资源。
  - 强化成长系数小幅上调，让第一次换装与第一次强化的战力反馈更可见。
  - 命器池继续作为 build 主入口，并轻微提高补缺槽位、主武器 / 核心、当前套装路线的命中感。

- 地图 / Boss 节奏第二刀：
  - `命宫试炼`：推荐战力略前置，定位更明确为“护身件 / 核心 / +1~+3 底子图”。
  - `五行秘境`：推荐战力略前置，继续承担“主武器 / 饰品 / +3~+5 输出中段图”。
  - `流年劫关`：继续承担高稀有毕业件，但更明确要求前两图已打稳后再来冲 `SSR/UR`。
  - Boss 奖励节奏继续强调“今日 Boss 首通 + 高稀有档位”这两个峰值，而不是把奖励均摊到所有入口。

- 轻量 UI 基线：
  - `Gacha` 页明确提示命器池当前更偏补槽位、主武器与命盘核心。
  - `Gear` / `Boss` / `Leaderboard` 的动作链文案改成更清楚的地图路由：先底子，再输出，再冲榜件。

这轮调整的基线结论是：
`命宫试炼立底子 → 五行秘境立输出 → 流年劫关拿高稀有件 → 今日 Boss / 榜单检验 build`。

## M3（当前已推进到第三刀）

`phase2/` 当前已补齐两刀运营验证骨架：

### 第一刀
1. 主城今日运势模块（本地 deterministic，按日期 + 当前角色快照计算）
2. Boss 页今日 Boss 轮换（支持按日期预览 / 复用 Phase 1 战斗入口）
3. 每日任务奖励结算（刷图 / Boss / 抽卡三类，含领取状态与本地奖励）
4. 轻量商业化入口（首购 / 十连 / 月卡卡片 + 说明弹层骨架）
5. 活动入口占位

### 第二刀
6. 每日登录奖励 + 免费单抽
7. 今日 Boss 首通奖励 / 挑战记录 / 今日 Boss 榜写回
8. 首购 / 月卡最小状态机（本地模拟开通 / 领取）
9. 活动入口配置化（按活动配置渲染）

### 第三刀
10. 7 日签到 / 累计登录骨架（本地持久化，支持连签、周目、已领状态）
11. 更明确的奖励反馈（登录 / Boss / 抽卡 / 活动兑换统一到账播报）
12. 首购 / 月卡露出策略优化（按首战、日常形成、抽卡心流调整主城与抽卡页露出）
13. 活动奖励兑换骨架（当前至少支持 1 条本地活动兑换路径）
14. 地图掉落身份差异化（开荒生存件 / farm 输出件 / Boss 成型件）
15. Boss 记分挑战最小闭环（每日 2 次记分，超出后仅练习）

### 当前新增的后端承接
14. 抽卡库存 / 历史 / 最近结果改为服务端持久化
15. 7 日签到 / 累计登录改为服务端持久化
16. 活动币 / 兑换状态改为服务端持久化
17. Phase 2 默认优先走后端接口，`localStorage` 只保留轻量回退
18. 资源钱包（灵石 / 抽卡券 / 材料）改为服务端主路径持久化
19. 奖励到账历史统一由后端记录 source / reason / 奖励或消耗（含抽卡券消耗）
20. 首购 / 月卡状态与领奖流程改为服务端主路径
21. 商品目录补齐 `sku / productType / entitlementType / unlockCondition / duration / grantPreview` 等支付前骨架字段
22. commerce 订单状态机扩成 `created / pending_payment / paid / fulfilled / failed / cancelled`，并在服务端与本地 fallback 保持一致
23. entitlement 与订单 fulfillment 严格绑定，重复 fulfill 会被拦截
24. Phase 2 商品卡统一支持 `创建订单 → 模拟支付成功 / 失败 / 取消`，用于承接真实支付前最后一层产品流
25. 当前已穿戴装备 / 强化等级 / 五行套装 2 件 / 4 件 build 评分改为服务端主路径
26. 总战力榜 / 同日主榜改为服务端按真实战力与配装状态计算
27. 抽卡新增最小保底主路径：每个卡池独立累计 SSR 保底，抽到 SSR/UR 后重置
28. 命器池抽到的装备现在带真实槽位 / GS / 属性，可直接从抽卡结果或 Gear 背包换上
29. Gear 页新增最小命器背包对比：显示当前槽位、替换目标、套装追踪与即时换装入口
30. 换装后会立即刷新总战力、套装进度、到账播报与战力榜，形成“抽到 -> 换上 -> 变强 -> 冲榜”闭环
31. 3 张 MVP 图现在都带更具体的刷图身份 / 目标掉落 / 套装目标 / Boss 奖励提示
32. 命器池最小补齐了五行套装的关键追件锚点，`2 件起步 / 4 件成型` 的 chase 更容易被理解
33. `七杀压顶` 新增“命匣开阖”奖励窗口机制，顺势时 Boss 奖励更容易升档
30. Home / Gacha / Gear / Boss / Leaderboard 新增轻量 `What Next` 引导卡，不做重教程，只用当前状态提示免费抽 / 换装 / 强化 / Boss / 看榜下一步
31. 已加入第一轮数值调优基线：资源改成“刷图补材料、Boss 给券、抽卡不再自我返券”的主节奏，方便后续继续比较
32. 命器池 / 神通池的 SSR 保底节奏已拆开：命器池更快、神通池更慢，保持“先成装再追机制”的 MVP 追求顺序
33. 命器池加入轻度追件修正：会优先偏向未补齐槽位、当前套装路线和喜用五行，减少纯随机打散 build 的情况
34. 3 张 MVP 图补齐了明确奖励节奏：命宫试炼稳补底子、五行秘境稳定出件、流年劫关把高稀有奖励集中在 Boss 胜利窗口
35. Boss 首通奖励与前期强化曲线已同步上调 / 拉平，让“打一轮 Boss -> 回 Gear 补强 -> 再冲榜”更顺
36. 榜单页新增最小产品化解释层：显示当前名次、离前一名差距、榜单计分说明，以及基于当前榜单的回流建议
37. 今日 Boss 榜条目补充最小战绩说明，方便玩家理解“为什么他排在我前面”
38. 榜单条目补充最小展示卡数据：总战力榜 / 同日主榜 / 今日 Boss 榜现在都带分享卡预备字段、亮点摘要与展示文案占位
39. 榜单页新增“当前角色卡 / 前一名样本”展示层，可直接预览分享文案占位，不接真实分享系统
40. Home / Gear / Boss 新增“冲榜回路”卡，明确 `看榜 -> 补 build -> 刷图/Boss -> 回榜` 的回流路径
41. 榜单页现在会更明确解释“为什么你排在这里 / 下一步最可能怎么涨名次”，建议直接基于当前 build、套装、强化、Boss 记录给出
42. 命器池追加 `青龙归元符`、`朱雀焚心符`、`麒麟镇岳佩`、`白虎裂甲衣`、`玄武覆潮甲` 五个五行追件锚点
43. 3 张 MVP 图新增 V2 chase 字段：`适合谁刷 / 本轮追件 / 为什么现在`，Adventure / Gear / Boss 统一直接展示
44. 3 只 Boss 新增轻量 `追匣` 机制窗口，顺势时除奖励升档外，还会抬高额外 Boss 掉落机会
45. Leaderboard 榜单卡从“分享卡预备”升级成更像真实产物的 `排名展示卡`：会明确显示榜单名、名次、成绩、差距、领先点与值得晒的 build 亮点
46. 榜单解释层新增更明确的 `冲线提示 / 先补什么 / 下一站去哪刷`，建议直接基于当前 build、套装、强化、Boss 记录和命格贴合给出
47. 榜单页新增最小 `分享卡预览 + 导出数据块`：现在可展开预览卡面文案，并复制结构化卡片数据；仍不接真实社交分享系统
48. Home / Gear / Boss / Leaderboard 的竞争回流提示进一步收紧，会更明确告诉你当前该看哪张榜、差多少、补什么、刷哪里，再回榜确认变化

当前仍未做：
- 真支付系统
- 真正的支付回调或订单系统
- 更完整的多活动并行与真实运营数值调优

地图/Boss 配置放在 `phase1/game-config.js`，Phase 1 与 Phase 2 共同消费。

## 2026-03-15 focused content slice

这次继续只加“内容深度”，不引入新系统，重点是把当前 3 张图和 Boss chase 再做厚一层：

- 命器池追加了 6 个 focused 追件：`命盘核心·初`、`厚土镇脉核`、`金羽裂锋`、`锐金破军珏`、`七杀号令`、`劫星命盘`
- 3 张 MVP 图都新增了配置化 `刷图路线` 与 `Boss 签名追件`
  - `命宫试炼`：护身线 / 续命线
  - `五行秘境`：裂锋线 / 焚命线
  - `流年劫关`：镇煞线 / 断潮线
- 3 个 Boss 现在都带独立 `signatureReward` 追求说明，Boss 不只是给基础掉落，还会承担“这张图最值钱的签名件”定位
- Phase 1 掉落权重补进了 `featuredLoot` 与 `bossSignatureLoot` 偏置，地图 chase 不再只是文案，而会真实影响出货倾向
- Phase 2 的 `Adventure / Gear / Boss` 页都直接展示路线、目标件与 Boss 签名追件，方便玩家立刻行动

## 2026-03-16 内容扩充 V2

这次继续只做 launch-prep 内容加厚，不引入新系统：

- **命器 / 套装池**
  - 新增 `青龙归元符`、`朱雀焚心符`、`麒麟镇岳佩`、`白虎裂甲衣`、`玄武覆潮甲` 五个小体量追件锚点。
  - 重点不是堆数量，而是补足五行套装在关键槽位上的 chase 感，让 `2 件起步 / 4 件成型` 更容易被玩家理解。

- **地图追装 V2**
  - `命宫试炼`：服务开荒 / 身弱 / 缺防具核心玩家，追 `青龙归元符 / 麒麟镇岳佩 / 厚土镇脉核`。
  - `五行秘境`：服务中段输出 build，追 `白虎裂甲衣 / 朱雀焚心符 / 锐金破军珏`。
  - `流年劫关`：服务中后段冲榜 / Boss 毕业件玩家，追 `玄武覆潮甲 / 劫星命盘 / 北渊镇煞核`。

- **Boss 扩充 V2**
  - 3 只 Boss 现在都多一个轻量 `追匣` 窗口：踩中对应五行 / build 时，除了奖励升档，还会抬高额外 Boss 掉落机会。
  - 这层只增加 Boss 重复挑战价值，不改页面骨架，也不引入新系统。

## 本次地图 / Boss 差异化

- `命宫试炼`：开荒起步图，重点掉 `R/SR` 过渡防具 / 核心，适合身弱、土木向生存 build。
- `五行秘境`：基础 farm 图，重点掉 `SR` 主力武器 / 饰品，适合喜金/火的暴击爆发 build。
- `流年劫关`：Boss 成型图，重点掉 `SSR/UR` 核心 / 武器，适合喜水/金的技能爆发 build。
- 地图 / Boss 现在会按 `日主 + 喜用神 + 忌神 + 身强弱` 给出真实的顺命 / 逆势判断，并把结果落到 UI 文案、Boss 评分、掉落倾向与承压修正里。
- 顺命图会提高更贴合命格元素的掉落倾向与高稀有掉落权重；逆势图会抬高承压并降低收益修正。
- Boss `机制 01`：按配置周期触发压制；对应克制元素/配装可“破势”，否则输出被压并吃到额外压力。
- Boss `机制 02`：按命格贴合度判定顺势/逆势；日主/喜用贴合者更稳，撞忌神时会额外吃压制。
- Boss 新增最小记分挑战环：后端模式下每日 `2` 次记分挑战，超出后仍可练习，但不再计入今日 Boss 榜或首通结算。

## 本次命格驱动推荐

- `Adventure` 每张图会显示：命格判断、收益修正、风险/承压、以及为什么这张图适合或不适合当前玩家。
- `Boss` 页会显示：当前 Boss / 今日 Boss 的命格建议、机制 01 / 机制 02、以及最近一次命格反馈。
- 后端 `GET /player/state` 现在会返回 `mapAdvice`、`adventureAdvice`，以及 `dailyBoss.fateAdvice`，用于主路径推荐和解释。
- `POST /boss/report` 的记分会把 `fateImpact` 与 `bossMechanicSummary.bonusTurns` 一起计入，保证“命格贴合”不只是 flavor 文案。

## Phase 1 -> Phase 2 数据回传（localStorage）

Phase 1 战斗结束后会写入：
- `lifeRpg.phase1.latestBattleResult`
  - `mapId`
  - `result` (`victory` / `defeat`)
  - `remainingHp`
  - `hpRatio`
  - `lootSummary`
  - `fateImpact`（顺命 / 逆势判断、收益修正、承压反馈、推荐后续动作）
  - `timestamp`
- `lifeRpg.phase1.profileSnapshot`
  - 职业 / 战力 / 基础属性 / 当前属性
  - 日主五行 / 身强弱
  - 喜用神 / 忌神（更新后的 Phase 1 快照）
  - 已穿戴装备
  - 背包摘要与背包条目预览

Phase 2 当前会写入：
- `lifeRpg.phase2.gachaState`
  - `history`（抽卡历史）
  - `inventory`（抽卡仓库）
  - `lastResult`
  - `pity[poolId]`（每个卡池独立的 `SSR` 保底累计 / 剩余抽数 / 最近触发时间）
- `lifeRpg.phase2.dailyState`
  - `date`
  - `progress`（`adventure` / `boss` / `gacha`）
  - `claimed`
  - `specialClaims`（`loginReward` / `freeDraw` / `dailyBossFirstClear`）
  - `completedCount`
  - `claimedCount`
- `lifeRpg.phase2.walletState`
  - `spiritStone`
  - `drawTickets`
  - `materials`
- `lifeRpg.phase2.equipmentState`
  - `slots[slot]`（当前穿戴装备、强化等级、强化后 GS、下一次强化成本）
  - `setBonus`（当前激活套装、2 件 / 4 件档位、路线说明、下一步追求）
  - `summary`（基础战力 / 总战力 / 强化增益 / 套装增益）
- `lifeRpg.phase2.bossState`
  - `lastProcessedBattleTimestamp`
  - `records[date]`（今日 Boss 挑战次数 / 胜利次数 / 最佳分 / 首通状态）
- `lifeRpg.phase2.opsState`
  - `firstPurchase`
  - `monthlyCard`
  - `tenDrawOffer`
- `lifeRpg.phase2.signInState`
  - `cycleIndex`
  - `cycleProgress`
  - `claimedDays`
  - `streakCount`
  - `totalClaimed`
- `lifeRpg.phase2.activityState`
  - `events[eventId]`
  - `tokenCount`
  - `claimed` / `claimedAt`
  - `redemptionCount`
- `lifeRpg.phase2.rewardState`
  - `latest`
  - `history`
- `lifeRpg.phase2.guideState`
  - `visited`（当前已访问页面 / 是否看过榜单）
  - `completions`（免费抽 / 换装 / 强化 / 刷图 / Boss / 看榜关键动作）
  - `currentStepId`
  - `completedCount`

当走 `npm start` 的后端模式时，上述 `walletState` / `opsState.firstPurchase` / `opsState.monthlyCard` / `rewardState.history`
都会由服务端返回并同步到本地缓存；静态模式下才继续走纯浏览器本地回退。

### 当前已接入后端的最小状态层

当通过 `npm start` 使用内置 Node 服务时，以下链路会走本地后端而不是纯浏览器本地：
- `GET /player/state`：读取玩家当日状态、Boss 记录、跨天重置结果
- `POST /player/sync`：同步 Phase 1 回传的最新角色快照 / 装备 / 战斗结果到后端
- `POST /claim/login-reward`：服务端控制每日登录奖励是否已领
- `POST /claim/daily-task`：服务端控制每日任务奖励 / 今日 Boss 首通奖励是否已领
- `POST /gacha/draw`：服务端持久化抽卡历史 / 仓库 / 免费单抽状态 / 每池 SSR 保底进度
- `POST /claim/sign-in`：服务端控制 7 日签到 / 累计登录状态
- `POST /ops/first-purchase/activate`：服务端控制首购模拟到账与奖励发放
- `POST /ops/monthly-card/activate`：服务端控制月卡模拟开通与开通奖励
- `POST /ops/monthly-card/claim`：服务端控制月卡日常领取
- `POST /activity/redeem`：服务端控制活动币发放与兑换状态
- `POST /gear/equip`：服务端把抽卡仓库中的命器直接穿到对应槽位，保留该命器自身强化等级并刷新战力 / 套装 / 榜单
- `POST /gear/enhance`：服务端校验灵石 / 材料消耗并把当前槽位装备强化到 `+10`，同步刷新套装战力
- `POST /boss/report`：回写 Boss 挑战结果，驱动每日 2 次记分挑战、今日 Boss 记录、机制处理反馈与首通状态
- `GET /leaderboard/power`：按后端当前装备 / 强化 / 共鸣状态计算总战力榜与同日主榜
- `GET /leaderboard/daily-boss`：读取今日 Boss 榜

当前仍保留本地的部分：
- 十连说明查看次数等纯 UI 辅助状态
- 纯静态模式下的回退状态（无 Node 服务时才启用）

## 文件

- `index.html`：旧版剧情 / 展示原型
- `styles.css`：旧版样式
- `app.js`：旧版逻辑
- `bazi-engine.js`：八字计算引擎（核心复用）
- `phase1/index.html`：Phase 1 原型页面
- `phase1/game-config.js`：共享地图 / Boss 配置
- `phase1/styles.css`：Phase 1 样式
- `phase1/app.js`：Phase 1 核心循环逻辑与角色快照写回
- `phase2/index.html`：Phase 2 主城与 Tab 壳子 + M3 第三刀文案
- `phase2/styles.css`：Phase 2 壳层样式 + 签到 / 奖励反馈 / 活动兑换 / 轻量引导与榜单解释卡样式
- `phase2/app.js`：Phase 2 页面流转、7 日签到、活动兑换、奖励反馈、运营状态机逻辑，以及下一步引导 / 榜单解释层

## 校验

```bash
node --check server.js
node --check bazi-engine.js
node --check app.js
node --check phase1/game-config.js
node --check phase1/app.js
node --check phase2/app.js
```

实用 smoke check（需先 `npm start`）：

```bash
curl -H 'X-Player-Id: smoke-check' http://localhost:8787/player/state
curl -X POST -H 'Content-Type: application/json' -H 'X-Player-Id: smoke-check' \
  -d '{}' http://localhost:8787/claim/login-reward
curl -X POST -H 'Content-Type: application/json' -H 'X-Player-Id: smoke-check' \
  -d '{"poolId":"artifact","drawCount":1}' http://localhost:8787/gacha/draw
curl -H 'X-Player-Id: smoke-check' http://localhost:8787/player/state
# 从上一步 player/state 或 gacha/draw 结果里复制一个可穿戴命器的 itemKey
curl -X POST -H 'Content-Type: application/json' -H 'X-Player-Id: smoke-check' \
  -d '{"itemKey":"artifact|weapon|青藤短刃|R|木|48|2026-03-14T09:00:00.000Z|0"}' http://localhost:8787/gear/equip
curl -X POST -H 'Content-Type: application/json' -H 'X-Player-Id: smoke-check' \
  -d '{}' http://localhost:8787/claim/sign-in
curl -X POST -H 'Content-Type: application/json' -H 'X-Player-Id: smoke-check' \
  -d '{}' http://localhost:8787/ops/first-purchase/activate
curl -H 'X-Player-Id: smoke-check' http://localhost:8787/player/state
curl -X POST -H 'Content-Type: application/json' -H 'X-Player-Id: smoke-check' \
  -d '{}' http://localhost:8787/ops/monthly-card/activate
curl -X POST -H 'Content-Type: application/json' -H 'X-Player-Id: smoke-check' \
  -d '{}' http://localhost:8787/ops/monthly-card/claim
curl -H 'X-Player-Id: smoke-check' http://localhost:8787/player/state
curl -X POST -H 'Content-Type: application/json' -H 'X-Player-Id: smoke-check' \
  -d '{"profileSnapshot":{"timestamp":"2026-03-14T08:00:00.000Z","source":"smoke","className":"白虎刺客","dayMasterElement":"金","strength":"身强","usefulGods":["金","水"],"tabooGod":"木","powerScore":1280,"baseStats":{"HP":420,"ATK":98,"DEF":54,"INT":40,"CHA":28,"LUK":36},"currentStats":{"HP":520,"ATK":142,"DEF":82,"INT":52,"CHA":32,"LUK":46},"equipped":{"weapon":{"slot":"weapon","name":"白虎短刃","rarity":"SR","element":"金","gearScore":98,"stats":{"ATK":26,"LUK":8}},"armor":{"slot":"armor","name":"白虎轻甲","rarity":"SR","element":"金","gearScore":84,"stats":{"HP":70,"DEF":18}},"core":{"slot":"core","name":"玄金命核","rarity":"SR","element":"水","gearScore":92,"stats":{"ATK":18,"INT":10}}}}}' http://localhost:8787/player/sync
curl -X POST -H 'Content-Type: application/json' -H 'X-Player-Id: smoke-check' \
  -d '{"slot":"weapon"}' http://localhost:8787/gear/enhance
curl -X POST -H 'Content-Type: application/json' -H 'X-Player-Id: smoke-check' \
  -d '{"latestBattle":{"mapId":"wuxing_realm","result":"victory","remainingHp":188,"hpRatio":0.44,"lootSummary":{"total":3,"byRarity":{"SR":2,"SSR":1}},"bossMechanicSummary":{"name":"聚财金幕 + 偏财追缴","triggers":3,"successfulBreaks":2,"penaltyTurns":1,"bonusTurns":2,"mechanics":[{"name":"聚财金幕","triggers":1,"successfulBreaks":1,"penaltyTurns":0},{"name":"偏财追缴","triggers":2,"successfulBreaks":1,"penaltyTurns":1}]},"fateImpact":{"tier":"favored","verdict":"顺命收益高","rewardText":"掉落更偏向 金/火 系收益，顺势收益 +12%","pressureText":"顺势减压 -8%"},"timestamp":"2026-03-14T09:10:00.000Z"},"profileSnapshot":{"timestamp":"2026-03-14T09:10:00.000Z","source":"smoke","className":"白虎刺客","dayMasterElement":"金","strength":"身强","usefulGods":["金","水"],"tabooGod":"木","powerScore":1280}}' http://localhost:8787/boss/report
curl -H 'X-Player-Id: smoke-check' http://localhost:8787/leaderboard/power
curl -H 'X-Player-Id: smoke-check' http://localhost:8787/player/state
curl -H 'X-Player-Id: smoke-check' http://localhost:8787/leaderboard/daily-boss
```

前端手动 smoke check：

1. 打开 `http://localhost:8787/phase2/`，确认 `Home` 顶部先出现 `下一步只点这个` 和 `试玩观察面`，且能一眼读到 `当前阶段 / 当前卡点 / 最近奖励`。
2. 在 `Home` 先领取 `登录奖励 / 签到 / 免费单抽`，确认页面没有把第一次点击分散到太多 CTA，且 `试玩观察面` / analytics tile 会记录免费收益进度。
3. 进入 `Gacha`，确认 `每日免费单抽` 被前置成 featured tile；首抽阶段命器池 `单抽` 为主 CTA，抽卡结果区会明确提示 `抽到可穿戴件就立刻去 Gear`。
4. 在 `Gear` 完成一次换装和一次强化，确认页面主要承接按钮会把玩家送去 `Adventure` 或 `Boss`，而不是过早只推去冲榜。
5. 在 `Adventure` 选一张图，确认每张卡主要只保留 `奖励焦点 / 目标掉落 / 适合谁刷 / 为什么现在 / 做完后去哪` 这类帮助决策的信息。
6. 打一次 `Boss` 后回到 `phase2/`，确认 `Boss` 页和 `Home` 页都能读到更短更清楚的回流信息：现在为什么继续打、打完后该回榜还是回主城。
7. 打开 `Leaderboard`，确认第一眼能看懂 `你为什么在这里 / 离前一名差多少 / 先补什么 / 下一步去哪`，并且知道看完后该回哪里。
8. 回到 `Home`，确认 `试玩观察面`、`今日资源结算`、`明日承接` 能把这轮试玩收口成：`刚做了什么 / 还卡哪 / 下一次回来继续什么`。

快速验证建议：
- 先在 `phase2/` 顺跑一轮：`登录 / 免费收益 / 抽卡 / 换装 / 强化 / Adventure / Boss / 榜单 / 回主城`
- `phase2/home` 应看到 `试玩观察面` 与 analytics tile 都能回答：`当前阶段是什么、当前卡点是什么、最近关键行为是什么`
- `phase2/gacha` 应看到免费抽前置、首抽阶段单抽优先，以及“抽完立刻去 Gear”的承接提示
- `phase2/gear` 的主要按钮应随主链路变化，第一次配装后优先导向 `Adventure / Boss` 而不是固定推榜单
- `phase2/adventure` 与 `phase2/boss` 的卡面应明显比前一版更短，只保留帮助做决定的几行
- 用同一角色分别看 `命宫试炼` 与 `流年劫关` 时，应能明显感知到“顺命/逆势”导致的收益或压力差异
- 从 `phase2/boss` 进入战斗并回到页面后，后端模式下应消耗 1 次记分挑战；用完后按钮仍可进入练习，但 Boss 页会显示“仅练习”语义
- 领取登录 / 签到 / 每日任务 / 首购 / 月卡后刷新页面，资源栏与“最新到账”应保持一致
- 抽卡页在后端模式下会按单抽 `1` 券、十连 `10` 券扣减；免费单抽不扣券但会进入奖励历史
- 强化前几级应明显更容易接上；若把主武器 / 核心抬到 `+3` 左右，再去 `五行秘境` 会更容易感知中段输出成长
- 抽卡页应看到每个卡池自己的 SSR 保底累计 / 剩余抽数；若触发保底，最近抽卡记录会明确标记
- 抽到命器后，`phase2/gacha` 的“直接换上”按钮应能把该命器穿到对应槽位，并自动跳到 `phase2/gear`
- `phase2/gear` 的命器背包应显示当前槽位对比、替换行为与套装追踪；新增“当前追装路线”卡会明确每张图刷什么以及青龙 / 朱雀 / 玄武 4 件套已可追
- `phase2/adventure` 应看到每张图新增的 `适合谁刷 / 本轮追件 / 为什么现在` 行，且三张图的追装文案明显不同
- `phase2/gear` 的追装路线卡应看到同样的 V2 chase 说明，能直接把地图身份映射到当前配装路线
- `phase2/boss` 的 Boss 卡、当前 Boss 卡、今日 Boss 卡都应出现 `本轮追件 / Boss 追件 / 机制 04` 文案，并对应各自地图的签名件
- 进入 `phase1/` 打 `命宫试炼` / `五行秘境` / `流年劫关` 后，掉落结果应更容易围绕该图 `featuredLoot` 与 `bossSignatureLoot` 收敛
- 从 `phase1/` 调整装备后回到 `phase2/gear`，页面应自动把最新快照同步到后端并显示当前强化状态
- 在 `phase2/gear` 凑出同一五行套装 2 件或 4 件后，`phase2/leaderboard` 的总战力榜与同日主榜应即时反映强化与套装变化
- `phase2/leaderboard` 的晒图成品卡应能看到榜单名、名次、成绩、差距、build 标签、亮点摘要、今日 Boss / 当日亮点、一句话总结，以及清晰区分 `当前真实成绩 / 参考样本` 的可复制文案；当前仍仅做本地导出与截图传播，不做真实外部分享
- `phase2/home` / `phase2/gear` / `phase2/boss` 的“冲榜回路”卡应明确告诉你当前最值得回看的榜单、离下一名还差多少、先补什么、下一站去哪刷
- 若想本地模拟多人榜单，可用不同的 `X-Player-Id` 重复执行 `POST /player/sync`、`POST /gear/equip` 与 `POST /gear/enhance`

## 2026-03-24 Phaser 主城壳首刀

- 新增 `phase3/` Phaser 3 网页游戏壳，并由现有 `server.js` 直接托管到 `/phase3/`。
- 第一屏不再是纯 DOM 卡片流，而是 Phaser 驱动的主城舞台：会直接展示角色 / 命格 / 当前 build / 今日 Boss / 当前主线。
- 新壳内置 4 步新手任务链：`抽卡 -> 换装/强化 -> Adventure/Boss -> Rank 验收`，当前步骤会高亮，并能直接跳转到现有 `phase2` 流程。
- 与现有系统保持最小连接：通过 `/player/state` 消费后端状态，通过 `/analytics/track` 记录榜单验收等引导节点，不推翻旧后端和 `phase2`。
- 为了保持工程轻量，这一刀直接使用 `Phaser 3 UMD` 浏览器入口，不引入额外重型前端框架或构建链。

