# 第十批：公开来源目录与一条有限文档审读

## 基线与交付状态

本地源码候选基于已验证的 GitHub HEAD `0ba0a6765cad5d4433d900db6afb6a085d009de8`（518 文件、107,171,115 字节）。该基线只在 batch9 HEAD `f8aa7620b03ff7994af1beea60277abd5ce9928d` 上更新六份 Site 133 部署说明；这六份说明原样保留。它们记录的是已发布 Site 133，不是本批候选已经部署的证明。

本批尚未发布或部署。源码、运行时验证与浏览器／部署验收分开；后续发布须重新核验真实目标和读回结果。

## 数量和边界

- 新增 129 条 MY 两来源类型观察，以及 272 条 GE 类型观察（SG126／MY146）；原 5,101 条来源观察全部保留，只有一条既有材料增加 AIA 独立审读层。
- 合计 **5,502 条混合来源观察**；SG 1,049、MY 1,609。30 个 active feed descriptors 中 26 个实际贡献观察行；不是 30 个产品目录，也不是 5,502 个独立 SKU。
- 材料引用 17,188 次：普通展示 17,143、源码隐藏另列 45；其中有公开 URL 的引用 17,107，真实 HOLD 69、未解决目标 11。引用次数不是不同文件数。
- 原目录 2,360、正式原件 4,713、严格核验 426 不变；本批新增正式原件和核验 SKU 均为 0。
- 准入源文件严格为 **42 个**：AIA 3、MY 11、GE 28。冻结元数据之外不添加 PDF、OCR、原始页面正文、私有清单内容或历史工作区。

## AIA Cambodia：独立审读，不改写来源历史

输入目录：`coverage/2026-10-27/batch-10/aia-kh-document-review/`。

保留原始 `material_ref_id` 后，先在原始区域记录中要求材料 ID、完整文件 URL、父观察 ID、issuer ID 唯一且一致，再绑定已审 PDF SHA `4b414b3c8f4df54fd38b15069402ca2cd358672fae61ad83cb7e3465aa34c02a`。缺失、冲突或重复均失败关闭；不以运行时 `reference-3`、标题、相似名称或旧产品分组兜底。既有通用 ID 不变，仅目标材料新增 `originalMaterialRefId` 和 `documentReview`。

来源分类、`size_limit_not_retained` 获取／C4 状态、原时间和原核验标志不变。独立可见审读层说明文件含基本／主保单条款、健康附加险及服务条款，并给出物理页证据。91 页视觉查看、41 页英文 OCR／语义审读，不等于高棉文逐条法律翻译、双语等同性或全文安全审查完成。第 64 页的高棉文优先规则保留；法律生效／版本日期、当前在售、个人完整签发包未确认。

相同 URL／SHA 已存在于旧 `sea.json`：只作为原件去重证据，不合并或重认产品，不继承旧审读状态，不授权重托管原件。输入中的 candidate/pending 文本保留其冻结时点原文。

## MY 两来源：类型、父关系与非产品语境分离

使用纠正版 T1934Z 的 11 个固定文件，manifest SHA `548975cfaf4a1a14fed80543b28c38334329b5f7c865b02a842b3af8a69d79c3`；不使用较早 T1923Z。

129 行包括 27 product、13 group_product、80 rider、2 package、5 variant、2 unknown。20 条来源语境和 95 条来源级未读文件引用保留在地区说明中，不额外形成产品行。所有观察 `materials` 为空；合同主体字段为 null，两个来源发布者分别保留。

64 个不同 selector memberships／63 个 origin+raw-link 对不是额外产品；共享 PRUMan／PRULady 卡片在两条命名观察中保留，同一 hub 不成为第三产品。PRUMy Critical Care 仍为语境；PRUGrowth 不成为产品或父关系。Spouse／Parent Waiver 自己的 PRUGrowth 目标未暴露且未读，不能套用另一 PRUWaiver 页的链接证据。

10 个浏览器 JSON 可见文本、116 个 web 文本观察与 23 个既有 HTML 来源分别保留。浏览器可见文本哈希不是原始 HTTP 字节，未知 HTTP 状态不猜测。DamaiGenZ CMS、不可用详情、术语冲突、未命名变体、语言与正文缺口保留；空 master-policy selector 组件不证明没有 master products。

## GE：官网主体证据不等同实际合同核验

使用 public-v4 的 28 个固定文件，2,150,034 字节，manifest SHA `5ee33f778f1f406e626974aa698a1cc4b6f8aaf3776b3019a8a33cdd94e15c55`。不补回较早导出中的执行审批或内部控制记录。

- **6 个官网 underwritten-by 声明**：保留源 issuer／issuer_id，并按既有 Care Secure 的字段语义投影为 `legalIssuer`／`issuerId`。此字段在该视图可表示官网明确主体 claim，不能解释成实际合同已读；界面明确显示“官网产品页承保声明；实际合同未核验”。
- **58 个官网 policy-issuer 声明**：独立保留签发主体及页证据，不自动等同 underwriter；通用 `legalIssuer`／`issuerId` 仍为 null。
- **其余 208 行**：没有以上两类直接主体证据。148 个子观察（MY79）不继承父材料或主体，未设置实际合同核验通过标志。

544 个来源关联／357 个 URL 未读正文；文件索引不再计观察。141 个 rider 与 10 个 package 关联不计父主条款。GREAT Business Care 是 SME 组合方案系列，五个命名变体不因 URL 的 group 路径变成已核团体合同或独立 SKU。

91 个 as-of 标签来自 90 页；另 5 个评级、保障变更、活动或分销期限日期各有范围。它们不转换成通用发布／生效日、PDF 版本或子观察独立日期。158 次历史 GET 事件及响应状态是来源事实，不是新的抓取授权。旧资料 SG17 行／14 页、MY13 行／4 页的重合仅用于溯源，不合并旧产品、不复用 PDF 审读结果。

公开导出保留限定的离线安全扫描聚合结果：对该版本已知清单扫描零命中，并保留整体清单 fingerprint；不包含清单中的个体值、URL 或原件定位符。零命中不证明没有未知风险，也不构成完整隐私、权利或再利用许可。此聚合扫描文件不进入网站运行时展示。

## 离线复现与验证

无需依赖安装或外部网络：

```sh
node website/scripts/coverage.mjs --check
node website/tests/document-review.mjs
node website/tests/my-two-catalog.mjs
node website/tests/great-eastern.mjs
node website/tests/coverage-ui.mjs
node website/scripts/build.mjs
```

完整检查还运行 `check`、catalog、ui、search、http、coverage、regional-refresh、batch6／7／8／9-refresh；均用直接 Node 命令。新增 AIA 6、MY 6、GE 8 组专测，以及 70 条 DOM-stub 行为检查覆盖精确绑定、缺失／重复／错误键、源哈希漂移、HOLD/null、父子关系、日期、过滤、深链、重复开合、Back/Forward 与重试。检查所有原 5,101 行及九个无关地区输出，原冻结源文件和六份部署文档不变。

构建仅将 public 字节复制至 dist：44 个静态文件。相对于 Site 133 的 43 个静态文件，36 个逐字节不变、7 个修改、新增 `document-review.mjs`；没有嵌入或请求新增原件。DOM-stub 不是浏览器像素、移动端或线上 QA，本批没有声称这些验证完成。

交接包用显式文件清单构造，排除 dist、缓存、私有 QA 和工作目录；完整源码、相对实际 HEAD 的增量、44 静态文件分别有字节数和 SHA-256 manifest。静态文件包不是已部署证明，也不自动包含托管平台的第 45 个配置文件。
