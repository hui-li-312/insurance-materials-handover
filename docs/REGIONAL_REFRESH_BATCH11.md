# 第十一批来源目录整合候选

此文记录可复现源码候选，不代表已部署；实际部署状态只见 CURRENT_DEPLOYMENT.json。

## 范围和计数

固定接入 41 个已审公开元数据文件：菲律宾 24 个、印尼原快照 13 个和语言缺口后继 4 个。五个 feed 新增 218 条类型观察，合计 5,720 条混合观察、35 个 feed descriptors，PH199、ID90。不是独立产品、合同或当前在售 SKU 数。

- MCBL24：10 product、2 plan、7 group、5 rider。MCBL 与 Manulife Philippines 不合并。
- BPI AIA45：7 product、1 group、7 plan 变体、30 rider。BPI AIA 与 AIA Philippines、分销银行分别保留。
- Pru Life PH72：20 product、50 rider_context、2 benefit_context。内置保障不计独立合同。
- AIA Indonesia50／Generali Indonesia27：77 个命名来源聚类，82 条详情路线；来源角色45 product、14 rider、18 group。

新增182条未读材料引用（PH47／ID135），总17,370条，其中45条历史隐藏引用另列。印尼135条引用对应134个唯一URL和144个页面关联；不能当作已下载文件数。全部发布／生效日期未知仍为null。原目录2360、正式原件4713、严格核验426不变；新增正式原件／核验SKU均为0。

## 不可越过的证据边界

所有新增实际合同承保人均未核。菲律宾自有网页公司身份与监管原文、实际保单合同分别核验，不能把源字段 issuer 直接当已核承保结论。印尼共享AIA页脚出现两家公司，不继承到每个产品；Optima Accident Protection 的 diterbitkan oleh 仅是本页 issued-by 声明，不是 underwritten-by 或合同全文核验。

仅连接精确父来源ID。MCBL Critical Illness 的 Base Protect／Base Protect Plus 是共享页面关系，不能证明适用于任一或全部计划。BPI计划变体、可选附加险及Pru内置保障进入组件筛选，不继承父材料、不跨父计划合并。历史URL、标签或旧PDF审读重合也不授权合同合并。

MCBL Wealth Guarantee 保留 HTTP200但可见404，只有相关卡片证据；FutureBoost详情未闭合。BPI动态目录壳和重定向目标、Pru结构化名称及投资目录缺口仍列出。客户章程是另列来源资料，不算保单材料。

印尼AIA Nura Care的员工专属标题与家庭／渠道语境冲突未解；Term Life锚点指向Inspire文件名原样保留，不猜测改URL；Generali传统／Syariah共享RIPLAY不合并合同；Optima不同路线保留。六个旧301不是已请求目标404，四个DPLK非保险项目不计产品。

语言缺口后继与77条冻结观察分开：Generali42条队列有1次工具报告403，41条未请求，0成功新页；原站HTTP状态未知，AIA不受该阻塞影响。保留旧42条未请求冻结记录作为历史，而非改成41次失败或已闭合。

## 复现与检查

website/scripts/ph-major-catalog-adapter.mjs 与 id-two-catalog-adapter.mjs 只读取固定SHA256允许列表。运行 npm test 和 npm run build。新增测试验证旧5502条逐字节重建、精确父ID、材料空值、角色筛选、有限证据与DOM导航；离线测试不是浏览器像素或PDF审读。实际浏览器和发布结果另记当前交付状态，不能由本候选推断。

来源正文、原始PDF、私有抓取文件与控制记录均不进入本批源码。原件Release、既有历史与较新六份当前部署文档保持原样。
