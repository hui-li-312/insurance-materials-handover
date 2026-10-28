# 保险产品与条款网站：可运行源码

这里是 **「地区 → 产品 → 材料」资料库** 的可运行交接源码，不是保险新闻日志。它以已部署版本为基线，并包含「本轮补采」独立视图（首轮 Site 128，后续版本以当前部署记录为准）。

- 原站：<https://hong-kong-insurance-library.balabalaniuniu.chatgpt.site>
- 初始交接基线：Site 127，源提交 `29f8a8f21308468f6c5e143676fb12db6627df75`；不是当前版本号。
- 当前公开部署：Site 138（2026-10-28 00:31:34 UTC）；Site 源码 `5f6b210a9258e819490c67d70e963345d74bd8fc`，GitHub 运行／数据源码 `ef96d86b53d96e888f7e6d5e00a7822a3b8b516d`。45 个静态文件、43 个来源描述符／39 个贡献行 feed／6,115 条混合观察。
- 初始 `public/` 的 26 个文件来自上述 Site 127 源提交的 `dist/`。新增补采视图只在原 `index.html` 加导航入口，其他 25 个基线文件逐字节保留。原站是 **buildless 静态应用**，这些 HTML/CSS/JS 就是可编辑源码，不是只有截图或编译后黑盒。
- 不需要数据库、API key、登录、第三方运行依赖或联网安装。使用 Node.js 24；本次实测版本为 **24.22.1 / npm 11.9.0**。`.nvmrc`、`package.json`、`package-lock.json` 固定本次工具约定。

## 五分钟接手

在仓库根目录执行：

```bash
cd website
npm ci --ignore-scripts --offline
npm test
npm run build
npm start
```

浏览器打开 <http://127.0.0.1:8080>。`Ctrl+C` 停止。不要双击 HTML 使用 `file://`，页面需要通过 HTTP 加载 JSON。

构建后的站点在 `website/dist/`。检查构建产物：

```bash
npm run preview -- --port 8081
```

修改 `public/`，不要修改被忽略的 `dist/`；`build` 会重新生成它。`start`/`preview` 是本地检查服务器，不是生产级反向代理或身份验证服务。

## 文件分工

| 路径 | 作用 |
|---|---|
| `public/index.html`、`library-app.js`、`library-core.mjs`、`library.css` | 主页结构、状态/交互、纯函数、响应式样式 |
| `public/product-library.json` | 主页地区、产品/资料组、材料关系及核验状态 |
| `public/legacy.html` 与其他 JS/JSON/CSS | 原有采集覆盖、历史进度及审计概览；保留原站功能 |
| `scripts/` | 本次新加的可移植启动、构建、校验、目录导入/导出工具 |
| `tests/ui.mjs`、`tests/search.mjs` | 从原站测试适配而来；不依赖私有审计附件 |
| `tests/catalog.mjs`、`tests/http.mjs` | 本次新增的数据安全/计数、导入原子性与 HTTP 冒烟测试 |
| `config/existing-sites-hosting.reference.json` | 原有 Sites 配置的非激活参考副本；不是自动部署入口 |

继续工作请读：

1. [启动、部署、回滚及数据更新](../docs/WEBSITE_OPERATIONS.md)
2. [来源与测试边界](../docs/WEBSITE_PROVENANCE.md)
3. [机器可读源文件校验清单](../manifests/website-source.json)

**重要边界：** 本目录可完整运行和修改当前公开站点，但不包含历史私有审计全量工作区，也不伪称能从仓库的 `catalog/*.jsonl` 一键重建全部历史投影。原件归档、全文审查、产品身份确认和公开页面是不同层；更新公开 JSON 不会自动证明这些事实。

## 本轮补采独立视图

打开本地 `/coverage.html`：地区 → 来源机构／共享品牌 → 观察条目 → 材料引用。支持产品／机构／材料名搜索、观察类型筛选、展开／收起、分页及浏览器前进后退。零观察地区明确指向原资料库，不声称当地没有产品。

```bash
# 必须保留完整仓库的 coverage/ 和 website/ 相对位置
npm run coverage:check   # 固定输入 SHA-256 + 输出逐字节复现检查
npm run coverage:import  # 从已批准的固定公开元数据离线生成；无网络
npm test
npm run build
```

不修改原 `product-library.json`、其他既有 JSON 或归档台账。正式原件 4,713 份和严格核验 426 份不变；补采引用不自动增加产品／材料原件。详细字段、替换规则、测试和部署界限见 [补采视图接续手册](../docs/REGIONAL_VIEW.md)。

当前部署与限定浏览器 QA 见 [CURRENT_DEPLOYMENT.json](../docs/CURRENT_DEPLOYMENT.json)，继续工作见 [采集前沿](../docs/CURRENT_COLLECTION_FRONTIER.md)。本版已接入 16 份条款类 PDF 的正文审读元数据（GE 7、HLAS 8、UOI 1），覆盖 271 个物理页、17 个准确来源关联。物理页包括已识别的空白／水印页，不等于每页都有正文；图像细查范围另列。保留原采集分类、状态和时间，以独立审读层展示后来读到的内容、简短原创摘要及未解决事项。样本、不同版本和主附险组合分别标明，不称为 16 个新产品或 16 套完整签发合同；新原件、全文和页图未在本次公开重发。 仍须保留的关键缺口：GE 五年基础版与 CI 来源标签共用同一基础样本，CI 组件匹配尚未证实；LIFE II CI70／85 引用的独立 715／717 表单未附，不能据此声称相关保障不存在。HLAS 版本码不充当发布日期或新旧替代证据；UOI 审读只绑定指定产品材料，不传给独立文件目录。未知发布日期与生效日保持空值，当前适用性及完整签发包仍未核实。 Site 138 的 21 组限定生产桌面检查通过（1180×757，DPR 1），未发现阻断或非阻断缺陷。11 个观察条目中的 17 个审读摘要块均已展开检查；不是全部身份 JSON 面板逐一展开，也不是重新审读 271 页 PDF。样本与主附险范围、历史采集状态与后来正文审读、两个 Maid 版本、UOI 准确产品绑定、Fraud 条款适用主体、同名不继承、父子跳转／返回／前进／折叠及快速筛选保留搜索词均通过有界检查。既有 AIA、Tugu、保留引用仅代表性抽查。移动模拟、触屏、实机和其他视口未测；最近 200 条警告／错误均来自浏览器扩展，不能代表完整会话或网络健康。未打开外部来源或 PDF，既有匿名资源 403 未重试，不声称匿名资源字节回读通过。
