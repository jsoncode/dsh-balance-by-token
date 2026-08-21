# dsh-balance-by-token

DeepSeek Harness（dsh）双面插件（宿主 + 浏览器半边）：查看 DeepSeek 账户**余额**，
按 token 用量估算**费用**，价格按**模型 × 高峰/空闲时段**在线配置。所有能力收敛在
统一弹框中（侧边栏底部「余额」入口），另在**会话头部**提供实时
「当前会话 ≈xx CNY | 余额 xx CNY」按钮。界面中英双语（跟随宿主 UI 语言）。

[English](README.en.md)

## 功能总览

| 功能 | 入口 | 说明 |
| --- | --- | --- |
| 余额查询 | 弹框 · 余额 Tab | 枚举全部 DeepSeek 服务商（`llm-pi-ai` 深链条目 / 官方 `llm-deepseek` 路由 / 附加 Key），经宿主 `credentials` 解析 key 调用官方 `/user/balance`；每行独立展示余额状态或失败原因 |
| 费用估算 | 弹框 · 费用 Tab | 最近一次提问 / 本会话 / 今日·本项目 / 今日·全部 四卡；**叠加柱状图 + 图例**（输入/缓存命中/缓存写入/输出）；所有服务商统计数量，**仅官方（api.deepseek.com）计费**；官方与非官方分开显示，非官方按服务商逐条列表 |
| 价格设置 | 弹框 · 价格 Tab | **官方价格表式排版**；模型 × 高峰/空闲双时段单价；时段窗口 + 时区滑块可配置；内置 V4 三档，一键恢复默认，旧配置自动迁移 |
| 会话头部按钮 | 会话头部 utilities | 实时「**当前会话 ≈xx CNY \| 余额 xx CNY**」（金额绿色）；点击即刷新 |
| 侧边栏入口 | footer.action | 品字形「余额」按钮：金额 + 高峰（红）/ 空闲半价（绿）动态文案 |
| 定时更新 | 弹框右上「定时更新」 | 按设定秒数自动刷新余额与费用；配置弹框（启动/停止互斥、输入框禁用）；间隔持久化 |
| 附加 API Key | 弹框 · 余额 Tab 底部 | 手动添加不在 providers 配置中的 key，脱敏回显，持久化到 `$DSH_HOME/settings.yaml` |

## 计费与判定口径

| 项 | 规则 |
| --- | --- |
| 官方判定 | 会话 `request/context` 的 `provider` → 宿主设置中 baseURL → **域名 == `api.deepseek.com`**（尾斜杠/大小写归一；`api.deepseek.com.xx.com` 等伪装域名判为非官方） |
| 计费 | 仅官方请求：四桶 × 单价 ÷ 1e6（每百万 tokens），按事件发生时刻匹配高峰/空闲单价 |
| 统计 | 所有服务商/模型的 token 均统计数量；非官方按服务商逐条四桶展示、互不合并 |
| 时段 | 默认北京 9:00–12:00、14:00–18:00 为高峰，其余为空闲；空闲 = 高峰 × 0.5 |
| 迁移 | 旧版扁平单价与旧内置默认档首次读取自动升级为官方 V4 三档 |

## 交互刷新路径

| 触发 | 效果 |
| --- | --- |
| 点击会话头部按钮 | 当前会话费用 + 余额刷新一次 |
| 点击弹框【刷新】 | 余额刷新（绕过 60s 缓存） |
| 点击弹框【定时更新】 | 打开配置弹框，按设定秒数周期自动刷新（弹框与头部按钮均生效） |

## 结构

```
├── src/host/*.ts       # 宿主半边：index.ts（入口）、providers.ts（服务商枚举、
│                       #   官方域判定）、balance.ts、cost.ts（折叠 + 今日扫描 +
│                       #   峰谷定价 + 官方过滤）、ops.ts（op 分发）、fence.ts、types.ts
├── src/client/*        # 浏览器半边：plugin.tsx（slots 注册 + 定时器）、
│                       #   BalanceModal.tsx（三 tab 弹框）、HeaderButton.tsx
│                       #   （会话头部按钮）、FooterButton.tsx（footer 入口）、
│                       #   rpc.ts、store.ts、i18n.ts、styles.ts、logo.ts
├── lib/index.js        # 宿主半边产物（tsdown，ESM），提交 git 以支持 git 安装
├── lib/client.js       # 浏览器半边产物（__ModuleLoader__ 工厂），提交 git
├── lib/types/          # 类型声明（tsc -b 生成）
├── scripts/            # verify-client.mjs（模拟宿主 seed 校验）
├── tsdown.config.ts    # tsdown 构建配置（宿主半边 + 客户端 banner 包装）
├── tsconfig.json       # solution：引用 tsconfig.host.json / tsconfig.client.json
├── cordis.patch.yml    # Bundle patch：按包名引用插件行
├── package.json        # dsh.bundle + dsh.client(web) manifest + peerDependencies
├── README.md           # 本文件（中文，默认）
└── README.en.md        # English
```

## 安装

```sh
# 本地开发
dsh plugin --profile web add ./dsh-balance-by-token

# 已发布：npm / tarball / GitHub
dsh plugin --profile web add dsh-balance-by-token
dsh plugin --profile web add ./dsh-balance-by-token-0.1.0.tgz
dsh plugin --profile web add github:you/dsh-balance-by-token#<sha>

dsh --profile web --dump-config   # 检查插件层
dsh --profile web                 # 启动（宿主半边改动需重启）
```

> **本地开发依赖**：宿主以原生 Node ESM 加载 `index.js`，因此
> `@deepseek-ai/schemastery`、`@deepseek-ai/dsh-tools`、
> `@deepseek-ai/dsh-settings`、`@deepseek-ai/dsh-home-paths` 必须可从插件目录
> 解析（`node_modules` 已被 gitignore）。在插件目录内执行 `pnpm install` 即可。

插件无需静态配置；附加 key、价格档与定时间隔均在弹框内编辑并持久化到
`$DSH_HOME/settings.yaml`。

## 发布

构建工具链为 **tsc + tsdown**（无 vite）：`tsc -b` 类型检查并生成声明文件，
`tsdown`（Rolldown 内核）打包宿主半边（`lib/index.js`，ESM）与浏览器半边
（`lib/client.js`，单文件 CJS `__ModuleLoader__` 工厂）。依赖管理使用 **pnpm 10**：

```sh
pnpm install     # 按 pnpm-lock.yaml 安装
pnpm run build   # 清理 lib → tsc -b（类型 + 声明）→ tsdown（双面产物）
pnpm run verify  # 模拟宿主模块表校验 lib/client.js（可选）
pnpm publish     # 或 pnpm pack / git push origin main（lib/ 已提交，git 安装免构建）
```

### 自动发布（GitHub Actions）

推送 `v*` tag（`pnpm run release` 自动 bump patch 版本、重建产物并打 tag）触发
[`.github/workflows/publish.yml`](.github/workflows/publish.yml)：

- **release job**：Setup Node → `pnpm install --frozen-lockfile` →
  `pnpm run check` → `pnpm run build` → `pnpm pack` → 创建 GitHub Release；
- **publish-npm job**：发布到 npm —— 需要仓库 secret `NPM_TOKEN`。

## 开发

要求：**Node ≥ 26 + pnpm 10**（`package.json` 的 `packageManager` 字段锁定版本）。

```sh
pnpm install           # devDependencies：typescript、tsdown、@types/react、@deepseek-ai/* 类型包等
pnpm run check         # 全树 TypeScript 类型检查（tsc -b）
pnpm run build         # 改完源码后重建双面产物（tsc -b && tsdown）
pnpm run verify        # 模拟宿主 seed 表校验 lib/client.js 可加载
```

- 宿主半边位于 `src/host/`；浏览器半边位于 `src/client/`；
- `lib/client.js` 的 `window.__ModuleLoader__.load` 工厂包装由 tsdown 的
  banner/intro/footer 选项生成；外部依赖（`react` 等）保持 external，运行时经
  宿主模块表（seed）解析。

## 实现说明

- **浏览器 ↔ 宿主通信**：HTTP 路由 `/dsh-balance/api`（POST JSON，宿主
  `webServer` + 信任围栏），兜底 `ctx.remote.commands.execute`；错误携带
  `code`，客户端本地化。
- **凭据解析**：`credentials` 服务按请求**懒取**（不捕获于 apply 时），规避宿主
  服务晚启动导致的「未配置凭据」；providers op 返回 `credentialsPresent` 与每条
  `keySource`（env / file / project-env / user-env）诊断信息。
- **计费公式**：`(uncachedInput × p_input + cacheRead × p_cacheRead +
  cacheWrite × p_cacheWrite + output × p_output) / 1e6`，单价为每百万 tokens，
  按事件发生时刻匹配高峰/空闲单价。
- **官方过滤**：`request/context` 的 `provider` → 宿主设置中的 baseURL →
  域名 == `api.deepseek.com`；非官方 token 仅计数（逐服务商四桶），不参与金额。
- **今日聚合**：`dshHomePath('sessions')/<projectKey>/<sessionId>/session.jsonl(.zstd)`；
  zstd 经 `node:zlib` 的 `zstdDecompressSync` 逐帧解码。
- peer 依赖（`@deepseek-ai/cordis`、dsh-tools、schemastery、dsh-settings、
  dsh-commands、dsh-session、dsh-api-remotes、client runtime / ui-slots /
  ui-settings / cordis-client-runner、`react`）由宿主在安装时解析。
- **不修改**官方 `deepseek-harness` 项目；全部功能使用既有插槽
  （`sidebar.footer.action`、`shell.overlay`、`conversation.session.header.utilities`）
  与 HTTP / 命令通道。
