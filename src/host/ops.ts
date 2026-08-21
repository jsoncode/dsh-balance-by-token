/**
 * dsh-balance-by-token —— 宿主半边：op 分发。
 *
 * HTTP 路由（/dsh-balance/api）与命令通道（dsh-balance）共用同一入口 runOp：
 * providers / balance / cost / pricesGet / pricesSave / keysGet / keysSave。
 * 返回值恒为 OpResult 形状（ok=false 带 code/error），由调用方包信封。
 */

import type { CredentialsService, SettingsScope, SettingsService } from './providers.ts'
import { listDeepseekProviders, listProviderBaseUrls } from './providers.ts'
import { queryBalances } from './balance.ts'
import { computeCosts, DEFAULT_PRICE_CONFIG, normalizePriceConfig } from './cost.ts'
import type { SessionLike } from './cost.ts'
import type { ExtraKey, OpRequest, OpResult, PriceConfig, PriceTier } from './types.ts'

/** 宿主 sessions 服务最小视图。 */
export interface SessionsService {
  get(id: string): SessionLike | undefined
}

/** runOp 的全部依赖（由 index.ts 的 apply 注入）。 */
export interface OpDeps {
  settings?: SettingsService
  nsOf: (name: string) => unknown
  scope: SettingsScope | null
  /** 按请求懒取 credentials 服务：apply 时刻不可用也能在请求时拿到（服务晚启动兜底）。 */
  getCredentials?: () => CredentialsService | undefined
  sessions?: SessionsService
}

/* ── settings 段读写（JSON 字符串持久化）──────────────────── */

function readJson<T>(scope: SettingsScope | null, field: string, fallback: T): T {
  if (scope === null) return fallback
  const value = scope.get()
  const raw = value?.[field]
  if (typeof raw !== 'string' || raw.length === 0) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function writeJson(scope: SettingsScope | null, field: string, value: unknown): Promise<void> {
  if (scope === null) return
  await scope.update({ [field]: JSON.stringify(value) })
}

/** 读取用户附加 key 列表。 */
export function readExtraKeys(deps: OpDeps): ExtraKey[] {
  const parsed = readJson<unknown>(deps.scope, 'extraKeysJson', [])
  if (!Array.isArray(parsed)) return []
  return parsed
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
    .map((item, index) => ({
      id: typeof item.id === 'string' && item.id.length > 0 ? item.id : `k${index}`,
      label: typeof item.label === 'string' ? item.label : '',
      apiKey: typeof item.apiKey === 'string' ? item.apiKey : '',
    }))
}

/** 读取完整价格配置：用户已保存 > 内置默认；旧版扁平档位数组自动迁移。 */
export function readPriceConfig(deps: OpDeps): PriceConfig {
  const parsed = readJson<unknown>(deps.scope, 'pricesJson', undefined)
  return normalizePriceConfig(parsed)
}

/** 读取定时自动刷新间隔（秒，0 = 关闭）。 */
export function readAutoSeconds(deps: OpDeps): number {
  const raw = readJson<unknown>(deps.scope, 'autoRefreshJson', '0')
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim())
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0
}

/* ── op 分发 ──────────────────────────────────────────────── */

/**
 * 执行一个 op。
 * @param deps - apply 注入的宿主依赖。
 * @param request - OpRequest（HTTP 与命令通道共用形状）。
 * @returns OpResult 形状载荷（不抛异常；内部错误映射为 ok:false）。
 */
export async function runOp(deps: OpDeps, request: OpRequest): Promise<OpResult> {
  try {
    switch (request.op) {
      case 'providers': {
        // 按请求懒取 credentials：服务晚启动也能在请求时拿到。
        const credentials = deps.getCredentials?.()
        const entries = await listDeepseekProviders(deps.settings, deps.nsOf, credentials, readExtraKeys(deps))
        // 真实 key 不出宿主：只回脱敏串。
        const safe = entries.map(({ apiKey: _apiKey, ...rest }) => rest)
        return { ok: true, providers: safe, credentialsPresent: credentials !== undefined }
      }
      case 'balance': {
        const credentials = deps.getCredentials?.()
        const entries = await listDeepseekProviders(deps.settings, deps.nsOf, credentials, readExtraKeys(deps))
        const balances = await queryBalances(entries, request.refresh === true)
        return { ok: true, balances }
      }
      case 'cost': {
        const sessionId = typeof request.sessionId === 'string' ? request.sessionId : ''
        const session = sessionId.length > 0 ? deps.sessions?.get(sessionId) : undefined
        const currentCwd = typeof session?.header?.cwd === 'string' && session.header.cwd.length > 0
          ? session.header.cwd
          : process.cwd()
        // 服务商 → baseURL 映射：按官方域名（api.deepseek.com）过滤非官方请求的 token。
        const providerBaseUrls = listProviderBaseUrls(deps.settings, deps.nsOf)
        const result = await computeCosts(session, readPriceConfig(deps), currentCwd, providerBaseUrls)
        return { ok: true, cost: result }
      }
      case 'pricesGet': {
        return { ok: true, config: readPriceConfig(deps), defaults: DEFAULT_PRICE_CONFIG }
      }
      case 'pricesSave': {
        const raw = request.config
        if (raw === undefined || raw === null || typeof raw !== 'object' || !Array.isArray((raw as { tiers?: unknown }).tiers)) {
          return { ok: false, code: 'params-invalid', error: 'config.tiers must be an array' }
        }
        const config = normalizePriceConfig(raw)
        if (config.tiers.length === 0) {
          return { ok: false, code: 'params-invalid', error: 'keep at least one price tier' }
        }
        await writeJson(deps.scope, 'pricesJson', config)
        return { ok: true, config }
      }
      case 'keysGet': {
        // 脱敏回显；apiKey 留空表示「保存时保留原值」。
        const keys = readExtraKeys(deps).map((key) => ({
          id: key.id,
          label: key.label,
          apiKeyMasked: maskKeyForClient(key.apiKey),
        }))
        return { ok: true, keys }
      }
      case 'keysSave': {
        if (!Array.isArray(request.keys)) {
          return { ok: false, code: 'params-invalid', error: 'keys must be an array' }
        }
        const previous = readExtraKeys(deps)
        const next: ExtraKey[] = request.keys.map((item, index) => {
          const id = typeof item.id === 'string' && item.id.length > 0 ? item.id : `k${Date.now().toString(36)}-${index}`
          const incoming = typeof item.apiKey === 'string' ? item.apiKey.trim() : ''
          // 空串 = 客户端未改动 key：保留旧值（回显的是脱敏串，不可写回）。
          const kept = previous.find((p) => p.id === id)
          return {
            id,
            label: typeof item.label === 'string' ? item.label : '',
            apiKey: incoming.length > 0 ? incoming : (kept?.apiKey ?? ''),
          }
        }).filter((key) => key.apiKey.length > 0)
        await writeJson(deps.scope, 'extraKeysJson', next)
        return { ok: true, keys: next.map((key) => ({ id: key.id, label: key.label, apiKeyMasked: maskKeyForClient(key.apiKey) })) }
      }
      case 'autoRefreshGet': {
        return { ok: true, seconds: readAutoSeconds(deps) }
      }
      case 'autoRefreshSave': {
        const seconds = typeof request.seconds === 'number' && Number.isFinite(request.seconds)
          ? Math.round(request.seconds)
          : Number(String(request.seconds ?? '').trim())
        if (!Number.isFinite(seconds) || seconds < 0 || seconds > 86400) {
          return { ok: false, code: 'params-invalid', error: 'seconds must be 0..86400' }
        }
        await writeJson(deps.scope, 'autoRefreshJson', String(seconds))
        return { ok: true, seconds }
      }
      default:
        return { ok: false, code: 'op-unknown', error: `unknown op: ${String(request.op)}` }
    }
  } catch (e) {
    return { ok: false, code: 'internal-error', error: e instanceof Error ? e.message : String(e) }
  }
}

/** 与 providers.maskApiKey 同规则的客户端脱敏（避免循环依赖，本地小副本）。 */
function maskKeyForClient(key: string): string {
  const k = String(key || '').trim()
  if (k.length === 0) return ''
  if (k.length <= 10) return k.slice(0, 2) + '****'
  return k.slice(0, 5) + '…' + k.slice(-4)
}
