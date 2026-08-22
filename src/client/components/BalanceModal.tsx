/**
 * dsh-balance-by-token —— 统一「余额」弹框（余额 / 费用 / 价格设置 三 tab）。
 *
 * 所有余额相关的显示与设置都收敛在此弹框：
 * 1. 余额：DeepSeek 服务商列表（来源标签、脱敏 key、总/赠送余额），
 *    每行独立状态；底部「附加 API Key」管理不在 providers 配置中的 key；
 * 2. 费用：四卡片 —— 最近一次提问 / 本会话 / 今日·本项目 / 今日·全部，
 *    金额 + 四桶 token 明细 + 当前生效价格档；
 * 3. 价格设置：价格档行内编辑 + 增删。
 */

import { Fragment, useCallback, useEffect, useState } from 'react'
import type { RunFn } from '../rpc.ts'
import { fmtAmount, fmtTokens, LANG, t, tErr } from '../i18n.ts'

/* ── 宿主载荷的最小读取形状 ───────────────────────────────── */

interface ProviderView {
  id: string
  label: string
  baseUrl: string
  source: 'llm-pi-ai' | 'llm-deepseek' | 'extra'
  apiKeyEnv?: string
  apiKeyMasked?: string
  keySource?: string
  hasKey: boolean
}

interface BalanceInfoView {
  currency: string
  total_balance: string
  granted_balance: string
  topped_out: boolean
}

interface BalanceView {
  providerId: string
  ok: boolean
  error?: string
  code?: string
  balance_infos?: BalanceInfoView[]
}

interface BucketsView {
  uncachedInput: number
  cacheRead: number
  cacheWrite: number
  output: number
}

/** 单个 API Key 的用量与费用明细（token 不区分官方与否；费用只对官方计算）。 */
interface KeyCostEntryView {
  provider: string
  buckets: BucketsView
  official: boolean
  amount: number
  currency: string
}

interface CostEntryView {
  amount: number
  currency: string
  buckets: BucketsView
  /** 按 API Key（服务商条目）分组的明细，token 总数降序。 */
  byKey: KeyCostEntryView[]
}

interface CostResultView {
  lastTurn: CostEntryView
  session: CostEntryView
  todayProject: CostEntryView
  todayAll: CostEntryView
  sessionTier?: string
}

/** 一个时段（高峰 / 空闲）的四项单价。 */
interface RatesView {
  input: number
  cacheRead: number
  cacheWrite: number
  output: number
}

interface PriceView {
  id: string
  name: string
  currency: string
  match: string
  peak: RatesView
  offPeak: RatesView
}

interface TimeWindowView {
  start: string
  end: string
}

interface PriceWindowView {
  timezoneOffsetMinutes: number
  peakWindows: TimeWindowView[]
}

interface KeyView {
  id: string
  label: string
  apiKeyMasked: string
}

type Tab = 'balance' | 'cost' | 'prices'

export interface BalanceModalProps {
  run: RunFn
  useOpen(): boolean
  close(): void
  /** 当前会话 id（footer 入口上报），费用查询随请求上传。 */
  getSession(): string
  /** 自动刷新 tick（到点触发余额/费用刷新）。 */
  useTick(): number
  /** 当前定时刷新间隔（秒，0 = 关闭）。 */
  useAutoSeconds(): number
  /** 更新定时刷新间隔（秒）。 */
  setAutoSeconds(seconds: number): void
}

const sourceChipKey: Record<ProviderView['source'], string> = {
  'llm-pi-ai': 'sourcePiAi',
  'llm-deepseek': 'sourceDeepseek',
  'extra': 'sourceExtra',
}

/** 严格对齐官方价格表：仅三组指标（输入-缓存命中 / 输入-缓存未命中 / 输出）。 */
const METRIC_GROUPS: Array<{ labelKey: string; field: 'input' | 'cacheRead' | 'output' }> = [
  { labelKey: 'priceInputHit', field: 'cacheRead' },
  { labelKey: 'priceInputMiss', field: 'input' },
  { labelKey: 'priceOutput', field: 'output' },
]

/** 叠加柱状图四段：输入 / 缓存命中 / 缓存写入 / 输出（纯 div，无交互）。 */
const TOKEN_SEGMENTS: Array<{ key: keyof BucketsView; labelKey: string; color: string }> = [
  { key: 'uncachedInput', labelKey: 'tokensUncachedInput', color: '#1668e3' },
  { key: 'cacheRead', labelKey: 'tokensCacheRead', color: '#13c2c2' },
  { key: 'cacheWrite', labelKey: 'tokensCacheWrite', color: '#fa8c16' },
  { key: 'output', labelKey: 'tokensOutput', color: '#722ed1' },
]

/** 四桶 token 总数。 */
function totalTokensView(b: BucketsView): number {
  return b.uncachedInput + b.cacheRead + b.cacheWrite + b.output
}

/** 中文数字（用于「东八区」式时区名）。 */
const CN_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']

/** 把 UTC 偏移小时数格式化为时区名：东八区 / 西五区 / 零时区（中文），UTC+8（英文）。 */
function formatTimezone(offsetHours: number): string {
  const h = Math.round(offsetHours)
  if (LANG === 'zh') {
    if (h === 0) return '零时区'
    const n = CN_NUM[Math.abs(h)] ?? String(Math.abs(h))
    return h > 0 ? '东' + n + '区' : '西' + n + '区'
  }
  if (h === 0) return 'UTC±0'
  return h > 0 ? 'UTC+' + h : 'UTC' + h
}

export function BalanceModal({ run, useOpen, close, getSession, useTick, useAutoSeconds, setAutoSeconds }: BalanceModalProps) {
  const open = useOpen()
  const tick = useTick()
  const autoSeconds = useAutoSeconds()
  const [tab, setTab] = useState<Tab>('balance')
  // 定时更新配置弹框
  const [timingOpen, setTimingOpen] = useState(false)
  const [timingInput, setTimingInput] = useState('')
  const [timingErr, setTimingErr] = useState('')

  // 余额 tab
  const [providers, setProviders] = useState<ProviderView[] | null>(null)
  const [balances, setBalances] = useState<Record<string, BalanceView>>({})
  const [balLoading, setBalLoading] = useState(false)
  const [balError, setBalError] = useState('')
  // 附加 key
  const [keys, setKeys] = useState<KeyView[]>([])
  const [keyFormOpen, setKeyFormOpen] = useState(false)
  const [keyLabel, setKeyLabel] = useState('')
  const [keyValue, setKeyValue] = useState('')
  const [keyErr, setKeyErr] = useState('')
  // 费用 tab
  const [cost, setCost] = useState<CostResultView | null>(null)
  const [costLoading, setCostLoading] = useState(false)
  // 价格 tab
  const [prices, setPrices] = useState<PriceView[] | null>(null)
  const [windowCfg, setWindowCfg] = useState<PriceWindowView>({ timezoneOffsetMinutes: 480, peakWindows: [] })
  const [priceMsg, setPriceMsg] = useState('')

  /** 余额查询：providers 与 balances 一并回填。 */
  const loadBalances = useCallback(async (refresh: boolean): Promise<void> => {
    setBalLoading(true)
    setBalError('')
    try {
      const provRes = await run(getSession(), { op: 'providers' })
      if (provRes.ok && Array.isArray(provRes.providers)) {
        setProviders(provRes.providers as ProviderView[])
      }
      const res = await run(getSession(), { op: 'balance', refresh })
      if (res.ok && Array.isArray(res.balances)) {
        const map: Record<string, BalanceView> = {}
        for (const b of res.balances as BalanceView[]) map[b.providerId] = b
        setBalances(map)
      } else {
        setBalError(tErr(res, t('saveFailed')))
      }
    } finally {
      setBalLoading(false)
    }
  }, [run, getSession])

  const loadKeys = useCallback(async (): Promise<void> => {
    const res = await run(getSession(), { op: 'keysGet' })
    if (res.ok && Array.isArray(res.keys)) setKeys(res.keys as KeyView[])
  }, [run, getSession])

  const loadCost = useCallback(async (): Promise<void> => {
    setCostLoading(true)
    try {
      const res = await run(getSession(), { op: 'cost', sessionId: getSession() })
      if (res.ok && res.cost !== undefined) setCost(res.cost as CostResultView)
    } finally {
      setCostLoading(false)
    }
  }, [run, getSession])

  const loadPrices = useCallback(async (): Promise<void> => {
    const res = await run(getSession(), { op: 'pricesGet' })
    if (res.ok) {
      const config = res.config as { tiers?: PriceView[]; timezoneOffsetMinutes?: number; peakWindows?: TimeWindowView[] } | undefined
      if (Array.isArray(config?.tiers)) setPrices(config.tiers as PriceView[])
      if (config !== undefined) {
        setWindowCfg({
          timezoneOffsetMinutes: typeof config.timezoneOffsetMinutes === 'number' ? config.timezoneOffsetMinutes : 480,
          peakWindows: Array.isArray(config.peakWindows) ? config.peakWindows as TimeWindowView[] : [],
        })
      }
    }
  }, [run, getSession])

  // 弹框打开时全量拉取；切换 tab 也保证数据新鲜（轻量：宿主有缓存）。
  useEffect(() => {
    if (!open) return
    void loadBalances(false)
    void loadKeys()
    void loadCost()
    void loadPrices()
  }, [open, tab, loadBalances, loadKeys, loadCost, loadPrices])

  // 定时自动刷新：宿主定时器到点 bump tick，这里刷新余额与费用（tick 初始 0 跳过）。
  useEffect(() => {
    if (!open || tick <= 0) return
    void loadBalances(false)
    void loadCost()
  }, [tick, open, loadBalances, loadCost])

  /* ── 定时更新配置 ── */

  const saveAutoSeconds = async (seconds: number): Promise<boolean> => {
    try {
      const res = await run('', { op: 'autoRefreshSave', seconds })
      if (res.ok && typeof res.seconds === 'number') {
        setAutoSeconds(res.seconds)
        setTimingErr('')
        return true
      }
      setTimingErr(tErr(res, t('saveFailed')))
      return false
    } catch {
      setTimingErr(tErr(null, t('saveFailed')))
      return false
    }
  }

  const openTimingDialog = (): void => {
    setTimingInput(autoSeconds > 0 ? String(autoSeconds) : '60')
    setTimingErr('')
    setTimingOpen(true)
  }

  if (!open) return null

  /* ── 附加 key 操作 ── */

  const saveKeys = async (next: Array<{ id?: string; label: string; apiKey: string }>): Promise<void> => {
    const res = await run(getSession(), { op: 'keysSave', keys: next })
    if (res.ok) {
      await loadKeys()
      void loadBalances(true)
    } else {
      setKeyErr(tErr(res, t('saveFailed')))
    }
  }

  const submitKey = (): void => {
    const value = keyValue.trim()
    if (value.length === 0) {
      setKeyErr(t('keyRequired'))
      return
    }
    setKeyErr('')
    setKeyFormOpen(false)
    setKeyValue('')
    setKeyLabel('')
    void saveKeys([...keys.map((k) => ({ id: k.id, label: k.label, apiKey: '' })), { label: keyLabel.trim(), apiKey: value }])
  }

  const removeKey = (id: string): void => {
    void saveKeys(keys.filter((k) => k.id !== id).map((k) => ({ id: k.id, label: k.label, apiKey: '' })))
  }

  /* ── 价格档操作 ── */

  const updatePrice = (index: number, patch: Partial<PriceView>): void => {
    setPrices((prev) => {
      if (prev === null) return prev
      const next = prev.slice()
      next[index] = { ...next[index] as PriceView, ...patch }
      return next
    })
  }

  /** 更新某档某个时段的单项单价。 */
  const updateRate = (index: number, period: 'peak' | 'offPeak', field: keyof RatesView, value: number): void => {
    setPrices((prev) => {
      if (prev === null) return prev
      const next = prev.slice()
      const tier = next[index] as PriceView
      next[index] = { ...tier, [period]: { ...tier[period], [field]: value } }
      return next
    })
  }

  const savePrices = async (list: PriceView[], windowCfgNext?: PriceWindowView): Promise<void> => {
    if (list.length === 0) {
      setPriceMsg(t('pricesEmpty'))
      return
    }
    const cfg = windowCfgNext ?? windowCfg
    const res = await run(getSession(), {
      op: 'pricesSave',
      config: { tiers: list, timezoneOffsetMinutes: cfg.timezoneOffsetMinutes, peakWindows: cfg.peakWindows },
    })
    if (res.ok) {
      const config = res.config as { tiers?: PriceView[]; timezoneOffsetMinutes?: number; peakWindows?: TimeWindowView[] } | undefined
      if (Array.isArray(config?.tiers)) setPrices(config.tiers as PriceView[])
      if (config !== undefined) {
        setWindowCfg({
          timezoneOffsetMinutes: typeof config.timezoneOffsetMinutes === 'number' ? config.timezoneOffsetMinutes : 480,
          peakWindows: Array.isArray(config.peakWindows) ? config.peakWindows as TimeWindowView[] : [],
        })
      }
      setPriceMsg(t('pricesSaved'))
      void loadCost()
    } else {
      setPriceMsg(tErr(res, t('saveFailed')))
    }
  }

  /* ── 渲染 ── */

  const balanceOf = (id: string): BalanceView | undefined => balances[id]

  /**
   * 单个服务商条目（API key）的今日消耗：从 cost.todayAll.byKey 按
   * 服务商路由匹配（pi-ai:<route> / llm-deepseek:<route> / label）。
   * 无用量时返回 undefined，展示为 ≈0.00 CNY。
   */
  const todayCostOf = (p: ProviderView): KeyCostEntryView | undefined => {
    const list = cost?.todayAll?.byKey ?? []
    return list.find((k) =>
      'pi-ai:' + k.provider === p.id || 'llm-deepseek:' + k.provider === p.id || k.provider === p.id || k.provider === p.label)
  }

  const renderBalanceTab = () => (
    <div>
      {providers === null
        ? <div className="dshb-spinner" />
        : providers.length === 0
          ? <div className="dshb-empty">{t('noProviders')}</div>
          : (
            <div className="dshb-prov-list">
              {providers.map((p) => {
                const b = balanceOf(p.id)
                const infos = b?.ok ? (b.balance_infos ?? []) : []
                return (
                  <div className="dshb-prov" key={p.id}>
                    <div className="dshb-prov-main">
                      <div className="dshb-prov-name-row">
                        <span className="dshb-prov-name">{p.label}</span>
                        <span className={'dshb-chip' + (p.source === 'extra' ? ' dshb-chip-brand' : '')}>{t(sourceChipKey[p.source])}</span>
                        {!p.hasKey
                          ? (
                            <span className="dshb-chip" title={p.keySource !== undefined ? 'source: ' + p.keySource : undefined}>
                              {t('noCredential')}{p.apiKeyEnv !== undefined ? ' · ' + p.apiKeyEnv : ''}
                            </span>
                          )
                          : null}
                      </div>
                      <div className="dshb-prov-meta">
                        {p.baseUrl}
                        {p.apiKeyMasked ? ` · ${p.apiKeyMasked}` : ''}
                      </div>
                    </div>
                    <div className="dshb-prov-side">
                      {b === undefined
                        ? (balLoading ? <div className="dshb-spinner" style={{ margin: '4px 0 4px auto' }} /> : <span className="dshb-prov-sub">—</span>)
                        : b.ok
                          ? infos.length === 0
                            ? <span className="dshb-prov-sub">—</span>
                            : infos.map((info, i) => {
                              const kc = todayCostOf(p)
                              const kcCurrency = kc !== undefined && kc.currency !== '' ? kc.currency : 'CNY'
                              return (
                                <div key={i}>
                                  <div className="dshb-prov-costline">
                                    <span>{t('summaryTodayCost')}</span>
                                    <span className="dshb-balance-num">≈{fmtAmount(kc?.amount ?? 0)} {kcCurrency}</span>
                                    <span className="dshb-balance-sep">|</span>
                                    <span>{t('summaryBalance')}</span>
                                    <span className="dshb-balance-num">{info.total_balance} {info.currency}</span>
                                  </div>
                                  <div className={'dshb-prov-sub' + (info.topped_out ? ' dshb-topped' : '')}>
                                    {t('balanceGranted')} {info.granted_balance}
                                    {info.topped_out ? ` · ${t('toppedOut')}` : ''}
                                  </div>
                                </div>
                              )
                            })
                          : <div className="dshb-prov-err">{tErr(b)}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
      {balError !== '' ? <p className="dshb-err">{balError}</p> : null}

      {/* 附加 API Key 区 */}
      <div className="dshb-keys">
        <div className="dshb-keys-title">{t('extraKeysTitle')}</div>
        <p className="dshb-hint">{t('extraKeysHint')}</p>
        {keys.map((k) => (
          <div className="dshb-key-row" key={k.id}>
            <span className="dshb-chip">{k.label !== '' ? k.label : t('sourceExtra')}</span>
            <span className="dshb-key-mask">{k.apiKeyMasked}</span>
            <button type="button" className="dshb-btn dshb-btn-small dshb-btn-danger" onClick={() => removeKey(k.id)}>{t('delete')}</button>
          </div>
        ))}
        {keyFormOpen
          ? (
            <div className="dshb-key-form">
              <input className="dshb-input" value={keyLabel} placeholder={t('keyLabelPlaceholder')} aria-label={t('keyLabel')} onChange={(e) => setKeyLabel(e.target.value)} />
              <input className="dshb-input" value={keyValue} placeholder={t('keyInputPlaceholder')} aria-label={t('keyInput')} onChange={(e) => setKeyValue(e.target.value)} />
              <button type="button" className="dshb-btn dshb-btn-small dshb-btn-primary" onClick={submitKey}>{t('add')}</button>
              <button type="button" className="dshb-btn dshb-btn-small" onClick={() => { setKeyFormOpen(false); setKeyErr('') }}>{t('cancel')}</button>
            </div>
          )
          : <button type="button" className="dshb-btn dshb-btn-small" onClick={() => setKeyFormOpen(true)}>+ {t('addKeyBtn')}</button>}
        {keyErr !== '' ? <p className="dshb-err">{keyErr}</p> : null}
      </div>
    </div>
  )

  /** 服务商路由 key → 展示信息（label + 脱敏 key）；用余额 tab 已加载的 providers 列表匹配。 */
  const providerMeta = (provider: string): { label: string; masked?: string } => {
    const hit = (providers ?? []).find((p) =>
      p.id === 'pi-ai:' + provider || p.id === 'llm-deepseek:' + provider || p.id === provider || p.label === provider)
    if (hit !== undefined) return { label: hit.label !== '' ? hit.label : provider, ...hit.apiKeyMasked !== undefined && hit.apiKeyMasked !== '' ? { masked: hit.apiKeyMasked } : {} }
    return { label: provider }
  }

  /** 一条 token 四段柱状图（纯 div）。 */
  const usageBar = (buckets: BucketsView, small: boolean) => {
    const total = totalTokensView(buckets)
    return (
      <div
        className={'dshb-bar' + (small ? ' dshb-bar-sm' : '')}
        role="img"
        aria-label={TOKEN_SEGMENTS.map((s) => t(s.labelKey) + ': ' + fmtTokens(buckets[s.key])).join(', ')}
      >
        {total > 0
          ? TOKEN_SEGMENTS.map((seg) => {
            const v = buckets[seg.key]
            return v > 0
              ? (
                <div
                  key={seg.key}
                  className="dshb-bar-seg"
                  style={{ width: (v / total * 100) + '%', background: seg.color }}
                  title={t(seg.labelKey) + ': ' + fmtTokens(v)}
                />
              )
              : null
          })
          : null}
      </div>
    )
  }

  const costCard = (label: string, entry: CostEntryView | undefined) => {
    const byKey: KeyCostEntryView[] = entry?.byKey ?? []
    const total: BucketsView = entry?.buckets ?? { uncachedInput: 0, cacheRead: 0, cacheWrite: 0, output: 0 }
    const totalTokens = totalTokensView(total)
    return (
      <div className="dshb-cost-card">
        <div className="dshb-cost-label">{label}</div>
        {entry === undefined
          ? <div className="dshb-spinner" />
          : (
            <>
              <div className="dshb-cost-amount">
                {fmtAmount(entry.amount)}
                <span className="dshb-cost-currency">{entry.currency}</span>
              </div>

              {/* ── 合计：全部 API Key 的 token 柱状图 + 图例（不区分官方与否） ── */}
              {totalTokens > 0
                ? usageBar(total, false)
                : <div className="dshb-bar dshb-bar-empty">{t('noUsage')}</div>}
              <div className="dshb-bar-legend">
                {TOKEN_SEGMENTS.map((seg) => (
                  <span key={seg.key}>
                    <span className="dshb-bar-legend-name">
                      <i style={{ background: seg.color }} />
                      {t(seg.labelKey)}
                    </span>
                    <b>{fmtTokens(total[seg.key])}</b>
                  </span>
                ))}
              </div>

              {/* ── 按 API Key 分行：token 各自统计；费用仅官方 Key（api.deepseek.com）计算 ── */}
              {byKey.length > 0
                ? (
                  <div className="dshb-key-cost-list">
                    <div className="dshb-nonofficial-title">{t('costByKeyTitle')}</div>
                    {byKey.map((k) => {
                      const meta = providerMeta(k.provider)
                      return (
                        <div className="dshb-key-cost" key={k.provider}>
                          <div className="dshb-key-cost-head">
                            <span className="dshb-key-cost-name" title={k.provider}>{meta.label}</span>
                            {meta.masked !== undefined ? <span className="dshb-key-cost-mask">{meta.masked}</span> : null}
                            <span className={'dshb-chip' + (k.official ? ' dshb-chip-brand' : '')}>
                              {k.official ? t('chipOfficial') : t('chipNonOfficial')}
                            </span>
                            {k.official
                              ? <span className="dshb-key-cost-amount">≈{fmtAmount(k.amount)} {k.currency}</span>
                              : <span className="dshb-chip">{t('notBilled')}</span>}
                          </div>
                          {usageBar(k.buckets, true)}
                          <div className="dshb-key-cost-counts">
                            {TOKEN_SEGMENTS.map((seg) => t(seg.labelKey) + ' ' + fmtTokens(k.buckets[seg.key])).join(' · ')}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
                : null}
            </>
          )}
      </div>
    )
  }

  const renderCostTab = () => (
    <div>
      <p className="dshb-hint">{t('costHint')}</p>
      <div className="dshb-cost-grid">
        {costCard(t('costLastTurn'), cost?.lastTurn)}
        {costCard(t('costSession'), cost?.session)}
        {costCard(t('costTodayProject'), cost?.todayProject)}
        {costCard(t('costTodayAll'), cost?.todayAll)}
      </div>
      {cost?.sessionTier !== undefined
        ? <div className="dshb-cost-tier">{t('costTier')}：<b>{cost.sessionTier}</b></div>
        : null}
    </div>
  )

  const renderPricesTab = () => (
    <div>
      <p className="dshb-hint">{t('pricesHint')}</p>
      {prices === null
        ? <div className="dshb-spinner" />
        : (
          <div>
            <div className="dshb-window-box">
              <div className="dshb-window-title">{t('windowTitle')}</div>
              <p className="dshb-hint">{t('windowHint')}</p>
              <div className="dshb-window-list">
                {windowCfg.peakWindows.map((w, wi) => (
                  <div className="dshb-window-row" key={wi}>
                    <input className="dshb-input dshb-cur" value={w.start} aria-label={t('windowStart')} placeholder="09:00"
                      onChange={(e) => {
                        const next = windowCfg.peakWindows.map((x, j) => j === wi ? { ...x, start: e.target.value } : x)
                        setWindowCfg({ ...windowCfg, peakWindows: next })
                      }}
                    />
                    <span>–</span>
                    <input className="dshb-input dshb-cur" value={w.end} aria-label={t('windowEnd')} placeholder="12:00"
                      onChange={(e) => {
                        const next = windowCfg.peakWindows.map((x, j) => j === wi ? { ...x, end: e.target.value } : x)
                        setWindowCfg({ ...windowCfg, peakWindows: next })
                      }}
                    />
                    <button type="button" className="dshb-btn dshb-btn-small dshb-btn-danger dshb-window-del"
                      onClick={() => setWindowCfg({ ...windowCfg, peakWindows: windowCfg.peakWindows.filter((_, j) => j !== wi) })}
                    >{t('delete')}</button>
                  </div>
                ))}
              </div>
              <div className="dshb-window-actions">
                <button type="button" className="dshb-btn dshb-btn-small"
                  onClick={() => setWindowCfg({ ...windowCfg, peakWindows: [...windowCfg.peakWindows, { start: '09:00', end: '12:00' }] })}
                >+ {t('addWindow')}</button>
                <label className="dshb-window-tz">
                  <span>{t('tzOffset')}</span>
                  <input
                    className="dshb-range"
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={Math.round(windowCfg.timezoneOffsetMinutes / 60)}
                    aria-label={t('tzOffset')}
                    onChange={(e) => setWindowCfg({ ...windowCfg, timezoneOffsetMinutes: Number(e.target.value) * 60 })}
                  />
                  <b className="dshb-window-tz-label">{formatTimezone(windowCfg.timezoneOffsetMinutes / 60)}</b>
                </label>
              </div>
            </div>

            <div className="dshb-price-scroll">
              <table className="dshb-table dshb-price-table">
                <thead>
                  <tr>
                    <th className="dshb-price-corner" colSpan={2}>{t('priceModel')}</th>
                    {prices.map((tier, i) => (
                      <th key={tier.id} className="dshb-price-head-cell">
                        <span className="dshb-price-model-name" title={tier.match === '*' ? t('fallbackHint') : undefined}>
                          {tier.name || tier.match}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {METRIC_GROUPS.map((group) => (
                    <Fragment key={group.field}>
                      <tr>
                        <th rowSpan={2} className="dshb-price-metric">{t(group.labelKey)}</th>
                        <td className="dshb-price-period dshb-period-off">{t('pricePeriodOffPeak')}</td>
                        {prices.map((tier, i) => (
                          <td key={tier.id} className="dshb-price-cell">
                            <input className="dshb-input dshb-num" type="number" step="any" min={0}
                              value={tier.offPeak[group.field]}
                              aria-label={t(group.labelKey) + ' · ' + t('pricePeriodOffPeak')}
                              onChange={(e) => updateRate(i, 'offPeak', group.field, Number(e.target.value) || 0)}
                            />
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="dshb-price-period dshb-period-peak">{t('pricePeriodPeak')}</td>
                        {prices.map((tier, i) => (
                          <td key={tier.id} className="dshb-price-cell">
                            <input className="dshb-input dshb-num" type="number" step="any" min={0}
                              value={tier.peak[group.field]}
                              aria-label={t(group.labelKey) + ' · ' + t('pricePeriodPeak')}
                              onChange={(e) => updateRate(i, 'peak', group.field, Number(e.target.value) || 0)}
                            />
                          </td>
                        ))}
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <button type="button" className="dshb-btn dshb-btn-small dshb-btn-primary" disabled={prices === null}
          onClick={() => { if (prices !== null) void savePrices(prices) }}>{t('save')}</button>
      </div>
      {priceMsg !== '' ? <p className={'dshb-' + (priceMsg === t('pricesSaved') ? 'ok' : 'err')}>{priceMsg}</p> : null}
    </div>
  )

  return (
    <div className="dshb-backdrop" onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="dshb-modal" role="dialog" aria-modal="true">
        <div className="dshb-modal-header">
          <div className="dshb-modal-title">{t('modalTitle')}</div>
          <div className="dshb-head-ops">
            {/* 定时更新：位于刷新按钮左侧 */}
            <button type="button" className="dshb-btn dshb-btn-small" onClick={openTimingDialog}>
              {t('timingBtn')}{autoSeconds > 0 ? '·' + autoSeconds + 's' : ''}
            </button>
            {tab === 'balance'
              ? <button type="button" className="dshb-btn dshb-btn-small" disabled={balLoading} onClick={() => void loadBalances(true)}>{balLoading ? t('loading') : t('refreshAll')}</button>
              : null}
            {tab === 'cost'
              ? <button type="button" className="dshb-btn dshb-btn-small" disabled={costLoading} onClick={() => void loadCost()}>{costLoading ? t('loading') : t('refresh')}</button>
              : null}
            <button type="button" className="dshb-close" aria-label={t('close')} onClick={close}>✕</button>
          </div>
        </div>
        <div className="dshb-tabs">
          <button type="button" className={'dshb-tab' + (tab === 'balance' ? ' dshb-tab-active' : '')} onClick={() => setTab('balance')}>{t('tabBalance')}</button>
          <button type="button" className={'dshb-tab' + (tab === 'cost' ? ' dshb-tab-active' : '')} onClick={() => setTab('cost')}>{t('tabCost')}</button>
          <button type="button" className={'dshb-tab' + (tab === 'prices' ? ' dshb-tab-active' : '')} onClick={() => setTab('prices')}>{t('tabPrices')}</button>
        </div>
        <div className="dshb-modal-body">
          {tab === 'balance' ? renderBalanceTab() : tab === 'cost' ? renderCostTab() : renderPricesTab()}
        </div>
      </div>
      {timingOpen
        ? (
          <div className="dshb-timing-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setTimingOpen(false) }}>
            <div className="dshb-timing-dialog" role="dialog" aria-modal="true">
              <div className="dshb-timing-title">{t('timingTitle')}</div>
              <p className="dshb-hint">{t('timingHint')}</p>
              <label className="dshb-timing-field">
                {t('timingSeconds')}
                <input
                  className="dshb-input"
                  type="number"
                  min={1}
                  max={86400}
                  value={timingInput}
                  placeholder="60"
                  disabled={autoSeconds > 0}
                  onChange={(e) => setTimingInput(e.target.value)}
                />
              </label>
              {autoSeconds > 0
                ? <div className="dshb-timing-active">{t('timingActive', { n: String(autoSeconds) })}</div>
                : null}
              {timingErr !== '' ? <p className="dshb-err">{timingErr}</p> : null}
              <div className="dshb-timing-actions">
                <button
                  type="button"
                  className="dshb-btn dshb-btn-small dshb-btn-primary"
                  disabled={autoSeconds > 0}
                  onClick={() => {
                    const n = Number(String(timingInput).trim())
                    if (!Number.isFinite(n) || n <= 0 || n > 86400) {
                      setTimingErr(t('timingInvalid'))
                      return
                    }
                    void saveAutoSeconds(Math.round(n)).then((ok) => {
                      if (!ok) return
                      // 启动成功立即刷新一次，让效果可见；弹框保持打开。
                      void loadBalances(false)
                      void loadCost()
                    })
                  }}
                >{t('timingStart')}</button>
                <button
                  type="button"
                  className="dshb-btn dshb-btn-small"
                  disabled={autoSeconds <= 0}
                  onClick={() => {
                    void saveAutoSeconds(0)
                  }}
                >{t('timingStop')}</button>
                <button type="button" className="dshb-btn dshb-btn-small" onClick={() => setTimingOpen(false)}>{t('close')}</button>
              </div>
            </div>
          </div>
        )
        : null}
    </div>
  )
}
