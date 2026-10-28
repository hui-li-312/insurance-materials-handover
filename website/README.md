# 保险产品与条款网站：可运行源码

这里是 **「地区 → 产品 → 材料」资料库** 的可运行交接源码，不是保险新闻日志。它以已部署版本为基线，并包含「本轮补采」独立视图（首轮 Site 128，后续版本以当前部署记录为准）。

- 原站：<https://hong-kong-insurance-library.balabalaniuniu.chatgpt.site>
- 初始交接基线：Site 127，源提交 `29f8a8f21308468f6c5e143676fb12db6627df75`；不是当前版本号。
- 当前公开部署：Site 137（2026-10-27 23:48:14 UTC）；Site 源码 `658be1168a10a96f15d5d03ebd785093b0cb32e4`，GitHub 运行／数据源码 `9899241b0ec85aaae64ed9425f42c75713368fca`。44 个静态文件、43 个来源描述符／39 个贡献行 feed／6,115 条混合观察。
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

当前部署与限定浏览器 QA 见 [CURRENT_DEPLOYMENT.json](../docs/CURRENT_DEPLOYMENT.json)，继续工作见 [采集前沿](../docs/CURRENT_COLLECTION_FRONTIER.md)。Site 137 的 13 组限定生产桌面检查通过（1180×757，DPR 1），未观察到新的 GUI 缺陷。三种新角色各抽查一项，样本、父子跳转、返回／前进、折叠、快速切换筛选及既有 AIA／Tugu／保留引用边界通过代表性检查；18 项角色与 8 项样本对象全部一致性由本地数据对账确认，并非逐项 GUI 验收。机构／范围快速切换各一次保留搜索词，Tugu 仅 Home 深入抽样。移动模拟、触屏与实机未测；未访问外部来源或重读 PDF，不把历史测试或后续正文审读算作本版检查。匿名非浏览器资源曾返回 403，本次未重试，不声称匿名资源字节回读通过。原生归档、GitHub 全树核验与正常浏览器 UI 检查分别计证。 本版已修正 GE 采集分类错误：通用文件名前缀曾被采集规则误当作条款线索的 18 次引用／12 个 URL，现按来源标签与路径分别标为 13 次宣传册候选、4 次利益／费率表候选、1 次使用指南候选。不是保险公司把文件标错，也不是读取这些 PDF 正文后的结论。保留原采集分类、状态与时间，另加材料角色复核层。8 次显式 sample-wording 引用／7 个 URL 保持独立，五年期基础版与 CI 标签共用目标的冲突未被默默合并。 后续另取得并完成 16 份 PDF 的全文审读（GE 7、HLAS 8、UOI 1，共 271 页／17 个来源关联）；其审读元数据仍在独立接入验收中，尚未包含于 Site 137。它们包含样本、不同版本及主附险组合，不能称为 16 个新产品或 16 套完整签发合同；原件未在本次公开重发。
