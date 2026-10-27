# 保险产品与条款网站：可运行源码

这里是 **「地区 → 产品 → 材料」资料库** 的可运行交接源码，不是保险新闻日志。它以已部署版本为基线，并包含「本轮补采」独立视图（首轮 Site 128，后续版本以当前部署记录为准）。

- 原站：<https://hong-kong-insurance-library.balabalaniuniu.chatgpt.site>
- 初始交接基线：Site 127，源提交 `29f8a8f21308468f6c5e143676fb12db6627df75`；不是当前版本号。
- 当前公开部署：Site 134（2026-10-27 20:32:24 UTC），Site 源提交 `43706da4b7700db2ee6f5c33cd90957c5c42f9f9`，对应 GitHub 运行与数据源码 `2497f743372f71872a72d0c3bddbb2897b00d80b`。44 个静态运行文件逐字节一致；30 个来源 feed 描述符（26 个贡献显示行）／5,502 条混合观察，不是独立产品数。
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

当前部署与限定真实浏览器 QA 见 [CURRENT_DEPLOYMENT.json](../docs/CURRENT_DEPLOYMENT.json)，范围见 [第十批历史候选说明](../docs/REGIONAL_REFRESH_BATCH10.md)。Site 134 已完成 20 组限定生产桌面抽样检查（1180×757，DPR 1），覆盖材料审读层、主体证据、父子导航、Back/Forward、HOLD／未解决／隐藏候选回归及桌面显示。不是逐条、外部 PDF 或移动端验收；触屏、实机及本轮旧首页交互未测。AIA 仅新增独立有限审读层，原采集状态不变；MY／GE 网页主体证据不等于实际合同核验。
