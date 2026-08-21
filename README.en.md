# dsh-balance-by-token

A DeepSeek Harness plugin (dual-face: host + browser) for watching your DeepSeek
account **balance** and estimating **token-based costs**, with prices configured
per **model × peak/off-peak period** online. Everything lives in a unified modal
(opened from the sidebar-footer **Balance** button); a **session-header** button
shows a live "Session ≈xx CNY | Balance xx CNY". UI copy is bilingual
(Chinese / English, following the host UI language).

[中文文档](README.md)

## Features

### Balance tab

- Enumerates every DeepSeek provider:
  - entries from the host `llm-pi-ai` settings whose `baseURL` points at DeepSeek,
  - the official `llm-deepseek` route,
  - manually attached **extra API keys** (see below).
- For each provider the plugin resolves the configured `apiKeyEnv` via the host
  `credentials` service and calls the official
  `GET https://api.deepseek.com/user/balance` (proxied by the host — keys never
  reach the browser). Each row shows `total_balance` / `granted_balance`
  (+ topped-out flag) or the failure reason. Results are cached in memory for 60s;
  "Refresh" bypasses the cache.
- **Extra API keys**: keys outside any providers config can be attached directly
  from the modal (label + key, masked echo), persisted to
  `$DSH_HOME/settings.yaml`.

### Cost tab — stacked-bar charts

- Four cards: **Last turn / This session / Today · this project / Today · all**,
  each with amount + a stacked bar + legend (input / cache read / cache write /
  output — pure divs, no chart library).
- **Token usage from all providers/models is counted**; **only DeepSeek official
  requests (API domain api.deepseek.com) are billed** — other providers (e.g.
  OpenRouter) are counted but not billed.
- **Official and non-official are shown separately**: one bar for official (four
  legend buckets), and a **list per non-official provider** (each with its own
  mini bar + inline four-bucket counts, never merged).
- Official detection: the `provider` field of `request/context` events → that
  provider's baseURL in host settings → hostname equals `api.deepseek.com`
  (trailing slash / case normalized; lookalike domains such as
  `api.deepseek.com.xx.com` are not official).
- Last turn / session: in-memory event folding (same (turn,step)
  last-value-wins semantics as the official `tokenUsage` projection). Today
  entries: on-demand scan of `dshHomePath('sessions')` logs (`.jsonl` and
  `.jsonl.zstd`, frame-wise zstd decode, per-file memoized).

### Price settings tab — official pricing-table layout

- Strictly mirrors the official price table: `模型版本` (colspan=3) + one column
  per model; `价格` (rowspan=6) + three metric groups (input cache-hit / cache-miss
  / output, each rowspan=2) + off-peak/peak rows; **only the price cells are input
  boxes** (peak red, off-peak green).
- Each model has **peak and off-peak** sets of four prices (per million tokens:
  input / cache read / cache write / output, CNY).
- **Periods are configurable**: peak windows (cross-midnight supported) + a
  **timezone-offset slider** (UTC-12..+12, shown as 东八区 / 西五区 / 零时区).
  Official default: Beijing 9:00–12:00 & 14:00–18:00 are peak; off-peak = peak × 0.5.
- Ships with the official V4 tiers (`deepseek-v4-flash` / `deepseek-v4-pro` /
  `deepseek-v4-flash-vision-exp`) and "restore official defaults". Old flat-format
  config migrates automatically on first read (legacy built-in defaults upgrade to
  the official three tiers).

### Session-header live button

- Registered on `conversation.session.header.utilities`, showing
  **Session ≈xx CNY | Balance xx CNY** (amounts green).
- **Clicking the button refreshes once**; auto-refreshes at the configured interval;
  refreshes on session switch.

### Entry button (sidebar footer)

- `sidebar.footer.action` **Balance** button in a pin-shape layout (left
  "余额", right two lines: amount + period). It shows **高峰时段** (red) or
  **空闲时段 半价** (green) depending on the current time; the amount comes from
  the balance API.

### Auto refresh

- A **定时更新** button (left of the Refresh button in the modal header) opens a
  config dialog: set the interval (seconds) → Start/Stop. While running, the input
  and the Start button are disabled; stopping re-enables them.
- At each interval, balance & cost refresh automatically (the modal when open, the
  header button otherwise). The interval is persisted to
  `$DSH_HOME/settings.yaml` (`autoRefreshJson`) and survives restarts.

### Config / packaging

- Schemastery `Config` + a settings namespace (`dsh-balance`): extra keys,
  price config and auto-refresh interval persist to `$DSH_HOME/settings.yaml`.
- `dsh.bundle` + `dsh.client`(web) manifests; the official
  `deepseek-harness` project is never modified — everything rides existing slots
  and the HTTP / command channel.

## Layout

```
├── src/host/*.ts       # host half: index.ts, providers.ts (enum + official check),
│                       # balance.ts, cost.ts (fold + today scan + period pricing +
│                       # official filter), ops.ts, fence.ts, types.ts
├── src/client/*        # browser half: plugin.tsx (slots + timer), BalanceModal.tsx,
│                       # HeaderButton.tsx, FooterButton.tsx, rpc.ts, store.ts,
│                       # i18n.ts, styles.ts, logo.ts
├── lib/index.js        # host bundle (tsdown ESM), committed for git installs
├── lib/client.js       # browser bundle (__ModuleLoader__ factory), committed
├── lib/types/          # declarations (tsc -b)
├── scripts/            # verify-client.mjs
├── tsdown.config.ts    # tsdown config (host + client banner wrap)
├── tsconfig.json       # solution: tsconfig.host.json / tsconfig.client.json
├── cordis.patch.yml    # bundle patch
├── package.json        # dsh.bundle + dsh.client(web) manifests + peerDependencies
├── README.md           # Chinese (default)
└── README.en.md        # this file
```

## Install

```sh
# local development
dsh plugin --profile web add ./dsh-balance-by-token

# published: npm / tarball / GitHub
dsh plugin --profile web add dsh-balance-by-token
dsh plugin --profile web add ./dsh-balance-by-token-0.1.0.tgz
dsh plugin --profile web add github:you/dsh-balance-by-token#<sha>

dsh --profile web --dump-config   # inspect the plugin layer
dsh --profile web                 # start (host-half changes need a restart)
```

> **Local dev deps**: the host loads `index.js` as native Node ESM, so
> `@deepseek-ai/schemastery`, `@deepseek-ai/dsh-tools`,
> `@deepseek-ai/dsh-settings`, `@deepseek-ai/dsh-home-paths` must resolve from
> the plugin directory (run `pnpm install` there; `node_modules` is gitignored).

No static config required: extra keys, price config and the auto-refresh interval
are edited in the modal and persisted to `$DSH_HOME/settings.yaml`.

## Release

Toolchain: **tsc + tsdown** (no vite): `tsc -b` type-checks and emits
declarations; `tsdown` (Rolldown core) bundles the host half
(`lib/index.js`, ESM) and the browser half (`lib/client.js`, single-file CJS
`__ModuleLoader__` factory). Dependency manager: **pnpm 10**.

```sh
pnpm install     # per pnpm-lock.yaml
pnpm run build   # clean lib → tsc -b (types + declarations) → tsdown (both halves)
pnpm run verify  # simulate the host seed to validate lib/client.js (optional)
pnpm publish     # or pnpm pack / git push origin main (lib/ committed → git installs need no build)
```

### Auto publish (GitHub Actions)

Pushing a `v*` tag (`pnpm run release` bumps the patch version, rebuilds and
tags) triggers [`.github/workflows/publish.yml`](.github/workflows/publish.yml):

- **release job**: Setup Node → `pnpm install --frozen-lockfile` →
  `pnpm run check` → `pnpm run build` → `pnpm pack` → create GitHub Release;
- **publish-npm job**: publish to npm — requires the `NPM_TOKEN` repo secret.

## Development

Requirements: **Node ≥ 26 + pnpm 10** (pinned via the `packageManager` field).

```sh
pnpm install           # devDependencies: typescript, tsdown, @types/react, @deepseek-ai/* type packages…
pnpm run check         # full-tree TypeScript check (tsc -b)
pnpm run build         # rebuild both bundles after source changes (tsc -b && tsdown)
pnpm run verify        # validate lib/client.js against a simulated host seed
```

- Host half lives in `src/host/`; browser half in `src/client/`;
- The `window.__ModuleLoader__.load` factory wrap of `lib/client.js` is generated
  by tsdown's banner/intro/footer; external deps (`react` etc.) resolve through the
  host module table (seed) at runtime.

## Implementation notes

- **Browser ↔ host**: HTTP route `/dsh-balance/api` (POST JSON, host
  `webServer` + trust fence) with a `ctx.remote.commands.execute` fallback;
  errors carry a `code` that the client localizes.
- **Credentials**: the `credentials` service is looked up lazily per request
  (not captured at apply time), avoiding a "no credential" state when the host
  service starts late; the providers op returns `credentialsPresent` and per-entry
  `keySource` diagnostics.
- **Pricing**: `(uncachedInput × p_input + cacheRead × p_cacheRead +
  cacheWrite × p_cacheWrite + output × p_output) / 1e6` per million tokens, priced
  by each event's time (peak/off-peak).
- **Official filter**: `request/context` `provider` → baseURL in host settings →
  hostname == `api.deepseek.com`; non-official tokens are counted only
  (per-provider four buckets), never billed.
- **Today aggregation**: `dshHomePath('sessions')/<projectKey>/<sessionId>/session.jsonl(.zstd)`,
  decoded frame-wise via `zstdDecompressSync` from `node:zlib`.
- Peer deps (`@deepseek-ai/cordis`, dsh-tools, schemastery, dsh-settings,
  dsh-commands, dsh-session, dsh-api-remotes, client runtime / ui-slots /
  ui-settings / cordis-client-runner, `react`) are resolved by the host at install.
- The official `deepseek-harness` project is **never modified**; everything uses
  existing slots (`sidebar.footer.action`, `shell.overlay`,
  `conversation.session.header.utilities`) and the HTTP / command channel.
