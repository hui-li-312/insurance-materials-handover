# 网站启动、构建、部署与接续开发

## 1. 运行环境与启动

从仓库根目录进入 `website/`。需要 Node.js 24（已实测 24.22.1）及附带 npm；无第三方包、无后端、无数据库。`npm ci --ignore-scripts --offline` 验证锁文件后无需联网安装。`.env.example` 只有非秘密的可选本地服务器端口，应用不自动读取 `.env`，也无需创建它。

```bash
cd website
npm ci --ignore-scripts --offline
npm test
npm start
# 打开 http://127.0.0.1:8080；Ctrl+C 停止
```

端口冲突时：`npm start -- --port 8082`。只有确有局域网展示需求时才使用 `npm start -- --host 0.0.0.0`，这会让网络内其他设备访问，且没有鉴权。

## 2. 构建与普通静态托管

```bash
npm run build
npm run preview -- --port 8081
# 打开 http://127.0.0.1:8081；Ctrl+C 停止
```

原站没有转译/打包过程。新加 `build` 先检查数据和脚本，再把 `public/` 原样复制到 `dist/`；它不是原来私有资料审查流水线的替身。`dist/` 是唯一应交给普通静态托管商的发布目录，**不要上传整个 GitHub 仓库、原件归档、`catalog/` 或审计材料**。

静态托管的常规配置：

| 设置 | 值 |
|---|---|
| 项目根目录 | `website` |
| Node 版本 | `24` |
| 安装命令 | `npm ci --ignore-scripts --offline` |
| 构建命令 | `npm test && npm run build` |
| 发布目录 | `dist`（相对于项目根） |
| 首页 | `index.html` |
| 后端/环境秘密 | 不需要 |

使用托管平台的正常静态文件上传或 Git 集成即可。必须能以正确 MIME 提供 `.js`/`.mjs`（JavaScript）、`.json`（JSON）和 CSS；不要把 JSON 请求重写为首页。路由使用查询参数，不需要 SPA 全路径重写。子目录托管保留相对资源结构，并使用以 `/` 结尾的目录地址。

如需交给已有 Web 服务器管理员，可在构建成功后打包：

```bash
tar -czf ../insurance-website.tar.gz -C dist .
tar -tzf ../insurance-website.tar.gz
```

解压内容应直接位于网站 document root，不能多嵌套一层 `dist/`。上面的构建、服务与打包是本地命令；新托管账号、DNS、HTTPS、访问控制及远程发布仍需目标平台授权。本次没有创建新托管、改 DNS 或重新部署原站。普通托管的登录/权限不会从 GitHub 公开仓库自动继承；必须单独检查目标网站可见性。

发布检查：主页返回 200；`product-library.json` 是 JSON；搜索、地区切换、展开/收起、前进/后退及 `legacy.html` 均可用；检查手机布局与浏览器控制台。保存发布所用 Git 提交和产物校验值，回滚时重新构建并发布上一个确认过的提交，不手工混合两个版本的 JSON。

## 3. 继续维护原有 ChatGPT Sites（单独授权）

原项目 ID、精确提交及配置见 [来源清单](../manifests/website-source.json)。它当前是公开 Site，GitHub 仓库也已公开；两者的可见性及写入/发布权限仍分别管理。

原 Sites 的所有权、编辑权、发布权限不随 GitHub 源码转移。接手人必须通过原项目拥有者授予的正常权限维护；不能通过本仓库绕过登录。不要新建一个同名项目冒充原项目。

有权限的维护者应使用当时受支持的 Sites 工作流：读取当前原生项目/部署状态 → 在原项目源 checkout 更新 `dist/` → 验证 → 通过官方源工作流提交与打包 → 保存版本 → 在原公开受众下部署 → 等待原生状态 `succeeded`。使用该环境安装的 Sites 技能获取具体工具和命令，不能把本机插件缓存路径当作通用 CLI。原配置的 `static.directory` 为 `dist`。本仓库把原配置放在非激活的 `config/*.reference.json`，防止复制后误发到旧站。

如果只修改本仓库并在普通静态平台部署，完全不需要 Sites 授权；但这不会更新原 URL。没有凭据被存放在仓库中。

## 4. 前端修改

修改 `website/public/`。纯行为函数集中在 `library-core.mjs`，DOM 交互在 `library-app.js`，样式在 `library.css`。目前主页没有新闻、自动采集服务或账号系统。每次修改运行 `npm test && npm run build`；JS 单元/DOM stub 测试不能代替真实浏览器视觉、可访问性与移动端检查。

## 5. 可移植数据更新：本次新增的显式流程

### 数据关系

- `catalog/*.jsonl` 是归档材料接手台账；`public/product-library.json` 是公开导航投影。它们的记录粒度、排除规则和计数不同，不可直接覆盖或简单拼接。
- 主页投影以 `schemaVersion: 1` 标识；字段约束的可执行定义在 `website/scripts/catalog-model.mjs`。
- `products[].id` 是稳定目录 ID，不是“保险市场上独立产品”的证明；保留原 ID，不按相似产品名自动合并。
- `products[].materials[].id` 是材料 ID，同一材料可出现在多个产品下。共享材料除关联说明 `note` 和派生标记 `shared` 外的事实必须一致。不能把不同语言、版本、发行人或渠道直接合并。
- `regions` 表示地区；`materials` 按 `brochure/main/rider/support/pending` 分组。`status` 是取得原件状态，`reviewStatus` 是内容审查状态，二者独立。
- `counts.sourceRecords` 是上游已纳入公开投影的来源记录总数，必须由维护者根据证据确认；不是市场产品总数，也不是归档 ZIP 成员数。其余可派生计数由工具重算。`independentProducts`、`currentOnSaleProducts` 保持 `null`，不凭材料数量推算。

### 具体操作

以下命令在 `website/` 执行。导出目标必须不存在，以免误覆盖：

```bash
npm run catalog:export -- /tmp/insurance-catalog-edit.json
# 用文本编辑器或自己的审查程序编辑此 JSON，并保留证据与变更说明。
# 示例：只改文字说明时，已确认的 sourceRecords 仍为基线 4760。
npm run catalog:import -- /tmp/insurance-catalog-edit.json \
  --snapshot 2026-10-27-reviewed-update --source-records 4760
npm test
npm run build
git diff -- public/product-library.json
```

Windows 用户换成存在且可写的本机临时目录。日期标签只是例子，应换成本次真实审查标签。新增/移除材料时必须重新核对 `sourceRecords`，不能照抄 `4760`。

导入工具先验证完整结构、ID、地区、共享事实、计数语义、安全链接和核验旗标，再重算派生字段并原子替换主页 JSON；校验失败不改文件。它可接收维护者审查好的新增/修改/移除目录与材料，但**不会爬网、获取 PDF、核定产品身份、证明全文已读或授权转载**。当前 schema 不接受未知字段；需要新增字段时先更新模型及测试。

导入成功只更新主页目录，**不会同步修改 `legacy.html` 使用的其他 JSON 或归档台账**。若只维护新版目录，应把 legacy 页面明确保留为原快照，并在更新说明中写清新的主页范围；若需要全站统计同步，要先逐一迁移相应生成规则并增加一致性测试，不能静默改旧计数。`data.json`、`sea.json`、`full-audit-progress.json` 等仍是原部署的可运行历史快照。

### 最小字段约定

`product` 必需字符串：`id, region, name, insurer, category, identityKind, identityStatus, identityNote, scope`；`identityStatus` 为 `confirmed/provisional/candidate/unresolved`。`materials` 是数组；三个产品层计数字段由工具重算。

`material` 字符串：`id,title,role,roleLabel,language,version,variant,status,statusLabel,reviewStatus,url,sourceUrl,note,fileFormat,publicationDate,effectiveDate`；布尔：`allPagesReviewed,fullContentReviewComplete,referenceOnly,shared`；可选布尔：`mainCandidate`。不明确的版本/语言/身份应保留待核，不补造答案。普通 HTTP(S) 官方来源链接可以保留；禁止秘密、签名存储 URL、内部路径与原件正文。

`verified` 必须同时是 `downloaded` 且两个全文旗标都为真；`fullContentReviewComplete` 不能在 `allPagesReviewed` 为假时为真。`needs_review` 即使读完整件也表示问题未解决。保存候选主条款不等于确认归类的主条款，更不等于完整个人保单、在售或法律适用结论。

新增材料/提高审查状态前：核对合法获取与阅读权限 → 保存有权保留的原件与 SHA-256 → 确认地区/发行人/文件角色/语言/版本 → 完成相应范围审读并记录未决项 → 独立复核变更 → 更新归档台账与公开最小投影 → 测试 → 单独授权发布。不要对访问拒绝或文件权限限制使用规避方案。

## 6. 独立补采视图更新

`coverage.html` 首次随原站 Site 128 部署，后续持续更新，与原已收录目录分开。当前发布证据见 [CURRENT_DEPLOYMENT.json](CURRENT_DEPLOYMENT.json)。正常启动方式不变；`npm run build` 现在还会校验批准输入和已生成投影是否逐字节一致，失败时不会继续构建。

```bash
npm run coverage:import
npm run coverage:check
npm test
npm run build
```

完整仓库的 `coverage/` 是离线生成输入；不要只复制 `website/` 后声称可以重建数据。静态发布仍只使用 `website/dist/`。每个地区的补采 JSON 按需加载；不能把 JSON 请求改写为 HTML。不要把新材料引用自动导入原目录的 `main` 或 `downloaded` 状态，也不要累加到正式原件总数。

新批次必须先获得独立公开安全核对，再明确更新 `coverage/LATEST.json`、`config/coverage-approved-inputs.json` 和 `scripts/coverage.mjs` 的已支持文件／字段映射。未知 feed、输入哈希改变、找不到明确父记录或遗漏替换规则都会失败；不得用猜测字段、模糊名称合并或扫描工作区来绕过。细节见 [补采视图手册](REGIONAL_VIEW.md)。
