/**
 * dsh-balance-by-token —— 侧边栏底部入口（sidebar.footer.action）：
 * 常驻的「余额」按钮（footer.action 区），点击打开统一弹框
 * （余额 / 费用 / 价格设置 三个 tab）。
 *
 * 按钮文案随当前时段动态变化：处于配置的高峰时段内显示「余额（高峰时段）」
 * （括号红色），否则显示「余额（空闲时段 半价）」（括号绿色）。
 * 时段判定与宿主一致（时区偏移 + 高峰窗口，按当前时间），每 60 秒刷新，
 * 弹框关闭（保存价格后）也会立即刷新。
 */

import { useCallback, useEffect, useState } from 'react'
import { t } from '../i18n.ts'
import { BALANCE_LOGO } from '../logo.ts'
import type { RunFn } from '../rpc.ts'

interface PeakWindowView {
  start: string
  end: string
}

interface PriceConfigView {
  timezoneOffsetMinutes?: number
  peakWindows?: PeakWindowView[]
}

interface BalanceInfoView {
  currency: string
  total_balance: string
}

interface BalanceEntryView {
  providerId: string
  ok: boolean
  balance_infos?: BalanceInfoView[]
}

/** 解析 'HH:MM' 为当日分钟数；非法返回 undefined（与宿主 cost.ts 同规则）。 */
function parseClock(value: string): number | undefined {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim())
  if (m === null) return undefined
  const h = Number(m[1])
  const min = Number(m[2])
  if (h < 0 || h > 23 || min < 0 || min > 59) return undefined
  return h * 60 + min
}

/** 判定一个时刻是否处于高峰时段（与宿主 isPeakTime 同逻辑）。 */
function isPeakNow(config: PriceConfigView, nowMs: number): boolean {
  const offset = typeof config.timezoneOffsetMinutes === 'number' ? config.timezoneOffsetMinutes : 480
  const local = new Date(nowMs + offset * 60_000)
  const minutes = local.getUTCHours() * 60 + local.getUTCMinutes()
  for (const window of config.peakWindows ?? []) {
    const start = parseClock(window.start)
    const end = parseClock(window.end)
    if (start === undefined || end === undefined) continue
    // 支持跨午夜的窗口：start <= end 时取 [start, end)；start > end 时取 [start, 1440) ∪ [0, end)。
    if (start <= end) {
      if (minutes >= start && minutes < end) return true
    } else if (minutes >= start || minutes < end) {
      return true
    }
  }
  return false
}

export interface FooterButtonProps {
  /** 打开统一「余额」弹框。 */
  onOpen(): void
  /** 上报当前会话 id（供费用查询经宿主读取内存会话）。 */
  reportSession?: (sessionId: string) => void
  wide?: boolean
  useSessions?: (selector: (s: { current?: string }) => unknown) => unknown
  /** 宿主 op 通道（pricesGet 取时段配置）。 */
  run: RunFn
  /** 弹框开合状态（关闭后刷新按钮时段文案）。 */
  useOpen(): boolean
}

export function FooterButton({ onOpen, reportSession, wide = false, useSessions, run, useOpen }: FooterButtonProps) {
  const currentSessionId = useSessions
    ? (useSessions((s) => s && s.current) as string | undefined)
    : null
  if (reportSession && currentSessionId) reportSession(currentSessionId)

  const open = useOpen()
  const [peak, setPeak] = useState<boolean | null>(null)
  const [bal, setBal] = useState<{ total: string; currency: string } | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await run('', { op: 'pricesGet' })
      const config = res.config as PriceConfigView | undefined
      if (config !== undefined) setPeak(isPeakNow(config, Date.now()))
    } catch {
      // 网络/路由异常时保持上一次状态，不闪断。
    }
    try {
      // refresh:false 命中宿主 60s 余额缓存，不触发真实请求。
      const res = await run('', { op: 'balance', refresh: false })
      const balances = res.balances as BalanceEntryView[] | undefined
      const first = Array.isArray(balances)
        ? balances.find((b) => b.ok === true && Array.isArray(b.balance_infos) && b.balance_infos.length > 0)
        : undefined
      const info = first?.balance_infos?.[0]
      if (info !== undefined) setBal({ total: info.total_balance, currency: info.currency })
    } catch {
      // 余额查询失败时保持上一次状态。
    }
  }, [run])

  // 挂载即查 + 每 60 秒随当前时间刷新；弹框关闭（可能刚保存过价格）立即刷新。
  useEffect(() => {
    void refresh()
    const id = setInterval(() => { void refresh() }, 60_000)
    return () => clearInterval(id)
  }, [refresh])
  useEffect(() => {
    if (!open) void refresh()
  }, [open, refresh])

  const periodSuffix = peak === null
    ? null
    : (
      <span className={'dshb-btn-badge ' + (peak ? 'dshb-period-peak' : 'dshb-period-off')}>
        {peak ? t('btnPeak') : t('btnOffPeak')}
      </span>
    )
  const balText = bal === null ? '' : bal.total + ' ' + bal.currency
  const fullLabel = t('balanceBtn') + balText + (peak === null ? '' : peak ? t('btnPeak') : t('btnOffPeak'))

  return (
    <div className={'dshb-footer-group' + (wide ? '' : ' dshb-footer-rail-group')}>
      <button
        type="button"
        className={'dshb-footer-btn' + (wide ? '' : ' dshb-footer-btn-rail')}
        title={fullLabel}
        aria-label={fullLabel}
        onClick={onOpen}
      >
        <img src={BALANCE_LOGO} alt="" className="dshb-footer-logo" />
        {wide
          ? (
            <span className="dshb-footer-label">
              <span className="dshb-footer-word">{t('balanceBtn')}</span>
              <span className="dshb-footer-right">
                {balText !== '' ? <span className="dshb-footer-balance">{balText}</span> : null}
                {periodSuffix}
              </span>
            </span>
          )
          : null}
      </button>
    </div>
  )
}
