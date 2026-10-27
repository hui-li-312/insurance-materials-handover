# 第六批来源观察刷新（本地源码候选）

## 结果与边界

在已验证的 370 文件 GitHub 基线 `b5a933e8862b7f628f0f403375b2329224973f47` 上，仅接纳两份独立 READY 清单的 **66 个固定元数据文件 / 8,777,142 字节**。本任务没有公开写入、原件下载、安装、网络采集或 Sites 部署；当前线上版本仍由既有部署记录说明。本候选不把此前 Site 129 的桌面验证冒充自己的浏览器验证。

- Etiqa SG v3：127 条目录观察 + 58 条单独材料目录记录，共 185 条，仅导入一次。实际 active 435 条前驱中无 Etiqa 观察；未导入未发布的旧 47 条候选。399 条关联 / 268 个源唯一引用 / 266 个公开唯一 URL / 2 个 HOLD。58 条目录观察不是当前在售产品。
- Etiqa SG intake：按精确观察 ID + 精确非空材料 URL 补充 4 个既有引用，不新增观察。43 页仅指定 8 页视觉审查，未宣称全文、完整合同、隐私或再分发通过。四项身份修正已在 v3 目录中；intake 的早期 proposed 文字不逆转目录修正。
- Etiqa MY v2：89 条目录观察，273 条关联 / 166 个不同 URL。166 条文件索引是这些关联的另一索引，不追加 166 张产品卡。4 条法定主体映射、85 条未解决。7 份 intake 仅丰富精确关联的已有引用；91 页仅窄页审查。
- VN v2：933 条混合语境观察，其中 **368 条仅资料语境** 进入“材料目录”筛选，不计独立产品。1,997 条关联 / 1,696 个源唯一引用 / 1,695 个公开唯一 URL / 1 个 HOLD。另 1,335 条 source-only 材料观察保留在源 JSONL，不伪造产品卡。60 个身份候选替换旧 VN 队列背景，不额外增加 60 行。

合并后 **4,636 条混合来源观察 / 24 feeds**，不是 4,636 个独立产品。16,200 条材料关联包含 45 条隐藏源码候选；普通材料区 16,155 条。16,130 次公开元数据定位符出现（含隐藏候选），69 次 HOLD 直链仍为 null，另有原有 1 次非 HTTP 无效引用。引用次数、不同 URL、私有抓取、正式原件及核验通过不可混用。原 **2,360 条目录 / 4,713 份正式原件 / 426 份严格核验**、18 个历史原件包和全部原目录字节不变。

## 显式适配与展示规则

1. 只读取 `website/config/coverage-approved-inputs.json` 的固定路径、字节数和 SHA-256。未支持的 active feed 直接失败；不自动猜测新 schema，不把未知 feed 当完成。新文件均在 `coverage/2026-10-27/batch-6/` 下的 `etiqa-sg/`、`etiqa-sg-intake/`、`etiqa-my/`、`vn/`。
2. SG 29 条全断点隐藏引用沿用独立、默认折叠的“源码隐藏链接候选”区；1 个隐藏组件及 5 条隐藏目录行归“未列出／隐藏”筛选。隐藏并非机密或访问禁令，29 个非 HOLD URL 仍可点击。源码隐藏状态不证明当前展示、在售或组件附属关系。既有 16 条 GGI 隐藏引用保持。
3. BOSS 的 Complimentary Home Insurance 弹窗是不同提供项，不是 BOSS 主条款；命名组件引用不归父产品专属材料。5 次 pre-contract 引用中，4 处有本轮明确零主条款修正；所有 pre-contract 角色均标注非主条款。Enrich aspire VII 的隐藏 FULLY SUBSCRIBED 字样不据以宣称当前停售。
4. SG 发布者证据不升级为合同承保人：79 条 own-page 主体声明 + 4 条精确政策定义页证据保留；另外 102 条包括材料目录行继续标注承保人待核。MY 8 条汽车相关／可选／不同方案引用保留 URL 与原类型，显式标注不计父产品主条款或完整合同。
5. VN 按原始 issuer ID、inventory ID 保留每个语境；不把 MVI、Manulife、不同 FWD 主体或 MB 品牌名作模糊合并。MB Life 品牌不替换 MB Ageas 法定名。Cathay 的 14 条成功详情记录保留，目录计数差异和未遍历标签仍未闭合；28 个嵌入字段对应 14 份重复 PDF，不增加原件。
6. 日期仅保留已批准源字段：未知发布日保持 null。适用日期、明确更新日和版本标签保存在独立来源事实；两份 MY 费率表明示的 2026-06-01 生效日保留，不能变成产品上线日。ePROTECT mortgage 的正文 V1.25 与 URL v1.23 差异保留。
7. 资料角色、样本标志、私有抓取状态、窄页审查和正式完整合同各自独立。14 条 VN 个人资料保护引用及运营／重要信息摘要／疾病表／付款申请表均按源分类，不冒充主条款。HOLD null 不从 source_url、文件索引、正文证据或其他 URL 回填。
8. 页面只保留必要来源事实，不嵌入原件、base64、私有路径、联系人、原始 HTML、私有注册表或大段抓取日志。源 README 的 pending 描述是固定快照原文；独立 READY 准入与本入口明确其接受范围，不重写历史源字节。

## 复现与回归（不需要安装）

在仓库 `website/` 内，使用 Node 24+，直接运行：

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
node scripts/build.mjs
```

`node scripts/coverage.mjs` 可从固定公开输入再生 JSON，`--check` 比较逐字节一致；构建仅将 `public/` 43 个文件逐字节复制到 `dist/`。不使用 npm / npx / 包安装或外网。HTTP 测试仅为本地自动测试 fixture，不是浏览器或公开预览。

本轮覆盖 17 组原适配回归、29 组区域 UI 行为、9 组前批回归、12 组第六批专项；另保留全部原目录、搜索、安全、HTTP 和移动 CSS 结构测试。检验包括精确 hash/关联、重复计数、hidden vs HOLD、相关材料零覆盖、身份边界、发布日期、恶意标题/标签文本化、URL scheme/userinfo/敏感 query、noopener/noreferrer、重复展开/收起、Back/Forward、加载失败、快速切换地区竞态。Node DOM 模拟只证明行为，不宣称像素、真实浏览器、读屏或实际手机验证。**本候选新浏览器 QA 未运行**；未重试此前失败的 managed preview，也未绕过为独立 Chromium/截图路线。

仅新增本说明与专项测试。采集协议的 8 文件基线、CURRENT_DEPLOYMENT 及既有状态文档、历史 20-feed / 区域刷新证明保持不变。独立交付差异清单记录每个修改文件的基线 hash，合并前必须匹配；不得盲覆写新的状态记录。排除四区 v7a 872、TH live、Hong Leong、Bowtie、Blue Cross、GE 和其他未独立批准队列。
