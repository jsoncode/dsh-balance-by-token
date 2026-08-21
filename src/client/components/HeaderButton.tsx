/**
 * dsh-balance-by-token —— 会话头部工具区按钮（conversation.session.header.utilities）：
 * 【当前会话xxCNY/余额xxxCNY】—— 实时显示当前会话费用与账户余额。
 * 点击按钮立即刷新一次；启用「定时更新」后按设定间隔自动刷新。
 */

import { useCallback, useEffect, useState } from 'react'
import { fmtAmount, t } from '../i18n.ts'
import type { RunFn } from '../rpc.ts'

export interface HeaderButtonProps {
  /** 当前会话 id（插槽标准 props）。 */
  sessionId: string
  /** 宿主 op 通道。 */
  run: RunFn
  /** 自动刷新 tick（到点变化时触发刷新）。 */
  useTick(): number
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

export function HeaderButton({ sessionId, run, useTick }: HeaderButtonProps) {
  const tick = useTick()
  const [costText, setCostText] = useState<string>('--')
  const [balText, setBalText] = useState<string>('--')

  const refresh = useCallback(async () => {
    try {
      const costRes = await run(sessionId, { op: 'cost', sessionId })
      const cost = costRes.cost as { session?: { amount?: number } } | undefined
      if (cost?.session?.amount !== undefined) setCostText(fmtAmount(cost.session.amount))
    } catch {
      // 保持上一次值。
    }
    try {
      const res = await run('', { op: 'balance', refresh: false })
      const list = res.balances as BalanceEntryView[] | undefined
      const first = Array.isArray(list)
        ? list.find((b) => b.ok === true && Array.isArray(b.balance_infos) && b.balance_infos.length > 0)
        : undefined
      const info = first?.balance_infos?.[0]
      if (info !== undefined) setBalText(info.total_balance)
    } catch {
      // 保持上一次值。
    }
  }, [run, sessionId])

  // 挂载 / 会话切换 / 自动刷新 tick 变化时刷新；点击按钮手动刷新一次。
  useEffect(() => {
    void refresh()
  }, [refresh, tick])

  const title = t('headerBtnPrefix') + '≈' + costText + ' CNY' + t('headerBtnMid') + balText + ' CNY'
  return (
    <button
      type="button"
      className="dshb-header-btn"
      title={title}
      aria-label={title}
      onClick={() => void refresh()}
    >
      <span>{t('headerBtnPrefix')}</span>
      <span className="dshb-header-amount">≈{costText} CNY</span>
      <span>{t('headerBtnMid')}</span>
      <span className="dshb-header-amount">{balText} CNY</span>
    </button>
  )
}
