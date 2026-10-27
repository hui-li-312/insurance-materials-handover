# 第八批：Prudential Singapore 与 AIA Philippines 有界来源目录

本地源码／运行时整合候选，未发布或部署。基于第七批实际 GitHub HEAD `90e6a05d4794fcb752ba136c8342500f6d72cec7`，456 文件 / 103,816,818 字节已逐项回读验证，与预期重基树完全一致。保留 Site 130 六个状态文档；不含后续 Site 131 状态更新，也不得用整包覆盖更新的状态文档。

## 准入与计数

接受两个独立 QA 固定源，共 35 文件 / 845,298 字节。Prudential SG 修正 v3：24 文件 / 647,315 字节；源 manifest SHA-256 `ee8dbe85db33150042fe8919dede049fa972c37e7c4602796b80dcfbe2c0d5e2`。所有输入逐项锁定在 `website/config/coverage-approved-inputs.json`，原始批准字节不修改。

- 128 条来源观察仅新增一次；49 张 selector 卡和 69 条文档索引为同一目录／关联的证据，不作为第二个 feed 或额外产品行。
- 32 个产品名称观察、3 个产品系列、2 个组合计划、其他混合系列分别标注；76 个补充计划／保障／团体组件／附加险及选项进入组件筛选，10 个类别与信息语境不列作提供项。全部均未确认独立 SKU 或当前在售。
- 75 次材料关联 / 69 个公开唯一 URL；未请求 PDF 正文。宣传册、问答、费率、促销、未分类与条款候选各守其来源角色。
- 全站 4,986 条混合观察 / 26 feeds；16,526 次材料关联，其中普通材料区 16,481 条，隐藏候选 45 条；公开 URL 出现 16,445 次，HOLD null 69 次、未暴露目标 URL 的普通标签引用 11 次（不是 HOLD），另有既存非 HTTP 引用 1 次。不是产品数或文件数。
- 原目录 2,360 条、正式原件 4,713 份、严格核验 426 份不变；新增正式原件／核验 SKU／公开原始文件全部 0。AIA Philippines v4 仅按本批独立批准的 11 文件导入；其他待审队列不导入。

## 精确语义与来源边界

Care Secure 唯一明示 Income Insurance Limited 承保／签发、Prudential 分销；目录采集归属 Prudential。该跨分销观察不证明 Prudential 承保，也不代表 Income 自有目录已遍历。另 127 条法律承保主体未决，不从页脚猜测。

74 个父观察 ID 均精确解析并提供父观察导航；父材料不复制到组件。Group Pre-Crisis Guard 附着于 Group Crisis Cover，后者为 Group Term Life 的附加险，非独立主险。

保留 DIRECT - PRUProtect Term 5 精确名称、PRUFirst Promise / PRUFirst Gift II 组合角色和 PRUActive Protect Series。Vantage 卡片误链到 Term 页的冲突明确展示，Term 材料不归给 Vantage。PRUTreasures Flexi II 本页最低 2 名员工与父目录 3–200 名员工的冲突未消解，不作资格建议。

46 处 information-as-of 标签经精确 evidence ID 关联至 117 条观察，保留来源 URL、原始 body hash、XPath 和实际 retrieval timestamp。它们只是来源免责声明时点，不是整页发布日期、合同生效日期、PDF 日期或子组件独立日期。PRUExtra 2026／2028 变化和 Ready for 100 的 September 2019 年龄上限说明保持特定范围；已撤回名称不另建当前提供行。

只记录 Prudential 英文零售／企业公开 HTML 与明确匿名 selector 模型的有限来源边界，不等于全渠道、全公司或全市场完成。外域材料目标仅保留确切公开来源引用，未请求、不增加父产品主条款／全文核验计数。

## AIA Philippines v4 独立来源目录

固定 11 文件 / 197,983 字节，freeze manifest SHA-256 `fb28d1e5df7645985da5b7f890071c5c6a79b6abc9cbcd3417b5b543ac562ad4`。保留 56 个精确 source ID：7 个主计划名称观察、3 个团体产品线、6 个父计划配置、35 个父级附加险／补充或内含保障、1 个命名产品变体、1 个币种变体、1 个角色未决医疗提供项、1 个仅卡片提供项及 1 个非保险健康服务。43 个父关联精确解析，同名 rider 不跨计划合并；子组件不继承父宣传册。

AIA 自有品牌、IC 名册关联与合同承保人分别记录。56 条合同承保主体全部 null，不从名册或共享品牌填入，不混入 Thailand 或 BPI AIA。11 个 Download brochure 标签只按精确产品 ID 关联，目标未暴露、URL 保持 null；它们不是隐私 HOLD、没有猜测下载链接。PDF／正式原件／核验 SKU 新增均为 0。

来源为 crawled page-text：30 次 web 工具操作、29 个不同请求 URL、29 个文本捕获加 1 个缓存缺失；底层 HTTP 请求数及实时状态未知。9 处目录壳缺口仍开放；缓存缺失不是拒绝或零产品。旧 crawl 标签不换算为发布日期。原始 `checked_at` 与来源 hash 不修改，extract hash 不是原始 HTML/PDF hash。

Critical Protect Plus 原摘录仅 L0–L753、声明总计 863 行；独立补读保留另一次时间，补全 L754–L862，621 行重叠无冲突。完整的声明文本行合并不证明当前原站、新鲜度或动态目录闭合。AIA Max Protect - Medical 不与 AIA Max Protect 合并；Med Assist 详情转入 Health 目录壳，当前可售未决，不推断停售。

## 离线验证

Node 24+，不安装包、不运行 npm/npx、不访问外网。运行 `node scripts/coverage.mjs --check`、`node scripts/check.mjs`、`node tests/catalog.mjs`、`node tests/ui.mjs`、`node tests/search.mjs`、`node tests/http.mjs`、`node tests/coverage.mjs`、`node tests/coverage-ui.mjs`、`node tests/regional-refresh.mjs`、`node tests/batch6-refresh.mjs`、`node tests/batch7-refresh.mjs`、`node tests/batch8-refresh.mjs` 及 `node scripts/build.mjs`。

构建将 43 个静态文件从 public 逐字节复制至 dist。语义与 DOM-stub 回归包括角色筛选、深链、重复展开／收起、Back／Forward、父关联、来源冲突和转义；真实浏览器、像素、读屏及手机 QA 未运行。公共源码与元数据不包含新增原件正文、私有路径或 held 定位符；已批准的历史 held SHA 身份只留在历史源层，不进入运行时。
