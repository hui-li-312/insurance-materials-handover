# 第七批四区域累计刷新（本地源码候选）

## 固定准入与计数

基于公开源码提交 `fa5032a59c302a13e0f4e576e124c109691a6fbe` 的 438 文件快照，单独生成本地候选；没有公开写入或部署。本批只接受独立 QA 234 项全部通过的 **v7c 16 个固定元数据文件 / 3,196,952 字节**。输入清单及 SHA-256 固定于 `website/config/coverage-approved-inputs.json`；源 manifest SHA-256 为 `a7477213c044a80ea8e5fef5a59d1bb5bcbf8f57c123c7f1109539d934a4c197`。

- 四区域 **872 条替代 706 条，净增 166 条**，不把两个累计快照相加。BN 145 / KH 386 / LA 109 / MM 232；89 个发行人或候选记录不是已完成的当前市场分母。
- 1,183 次来源材料关联 / 1,151 次公开定位符出现 / 916 个公开唯一 URL / 32 次 HOLD，HOLD 的 URL 保持 null。939 个源观察定位符与公开 URL 数不同。
- 另 21 条 source-only 材料语境保留在 `source-only-material-observations.jsonl`，不生成额外产品卡或增加产品专属材料覆盖。11 条投保表命名语境和 25 条命名资料语境进入“材料目录”筛选，不是独立产品。
- 全站合计 **4,802 条混合来源观察 / 24 active feeds**，不是 4,802 个产品。16,440 次材料关联含 45 条隐藏候选；普通材料区 16,395 条，公开定位符出现 16,370 次，HOLD 69 次，另有既存 1 次非 HTTP 引用。
- VN 933 条及所有其他区域 feed 保持原输入和逐字节运行时 JSON；原目录 **2,360 条 / 4,713 份正式原件 / 426 份严格核验**及历史原件包不变。新增正式原件、核验 SKU 和公开原始文件均为 0。

## 证据与展示边界

1. `coverage/LATEST.json`、固定输入许可清单、显式适配器及再生运行时同时更新；不发布领先于运行时的 source-only LATEST。保留 batch-5 全部 24 个历史／更正 sidecar，以及更早的源快照。全部 706 个既有 source ID、名称、角色、日期、URL、材料关联和前端 deep-link ID 保留。
2. 新增 166 条保留各自真实 `checked_at`，不是本次投影时间；未知来源发布日仍为 null。语言、同名、版本、资料目录或当前销售／承保关系不作模糊等同。
3. GGI 的 16 条隐藏源码链接仍在独立、默认折叠候选区，零可见／当前提供计数。隐藏不等于隐私 HOLD；安全且非 HOLD 的候选 URL 可点击。
4. Fortune 两个高棉文名称按已缓存 own-page title 与一致的 og:title 修正，不声称由 h1 获得。50 次 PGH 引用保留原批准角色：25 次历史未分类引用、25 次明确配套照护服务活动条款候选；均不冒充已核验保险主条款。v7c 相比 v7b 只改变这一证据说明句与 manifest，其他 14 个 payload 字节不变。
5. CVI 七个 source-only 标签与角色修正保留在源 sidecar，包括投保／理赔服务表、旅行保险规则、International SOS 服务资料，以及源标签和文件名冲突。保留原标签拼写；不按文件扩展名猜测内容，不将 source-only 材料反向归属为产品主条款。
6. C4 严格固定在 **2026-10-27T16:11:11.532978+00:00**：705 个有限队列目标、695 个私有抓取、674 个唯一捕获 SHA 身份，其中 1 个已 HOLD。它包括 source-only 语境，不是产品材料归属通过；完整内容审查 0、正式原件新增 0、公开原始文件 0。后续私有采集不并入本快照。
7. 运行时只投影明确允许的来源事实，不嵌入 PDF、原始 HTML、私有路径、私有注册表、原件 hash 清单或 `private_capture_metadata`。批准的源元数据与运行时公开视图是不同层次。独立准入不会把原源文件中 pending 字样改写成全文或当前版本通过。

## 本地复现与验证

在 `website/` 内使用 Node 24+，无需安装、npm、npx 或外网：

```sh
node scripts/coverage.mjs --check
node scripts/check.mjs
node tests/catalog.mjs
node tests/ui.mjs
node tests/search.mjs
node tests/http.mjs
node tests/coverage.mjs
node tests/coverage-ui.mjs
node tests/regional-refresh.mjs
node tests/batch6-refresh.mjs
node tests/batch7-refresh.mjs
node scripts/build.mjs
```

再生用 `node scripts/coverage.mjs`；构建只将 43 个 `public/` 文件逐字节复制到 `dist/`。旧目录、搜索、HTTP、17 组适配回归、31 组区域 DOM 行为、9 组历史区域回归和 12 组 batch-6 回归保留；新增 11 组 batch-7 专项，覆盖替换非追加、706 个深链身份、held null、GGI hidden、Fortune/CVI 标签、资料语境、真实来源时间、C4 冻结和安全转义。HTTP fixture 仅使用本地测试服务；**真实浏览器、像素、读屏和手机 QA 均未运行**。

本候选不改写当前部署或 Site 130 状态文档。并行的六文件文档更新应先独立合并，再按差异清单的旧 hash 安全重放本批；不以完整旧快照覆盖新状态。未接受其他 HK/TH 等待队列，不重试被拒来源，不增加任何外部动作授权。
