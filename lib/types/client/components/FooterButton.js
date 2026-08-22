import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-balance-by-token —— 侧边栏底部入口（sidebar.footer.action）：
 * 常驻的「余额」按钮（footer.action 区），点击打开统一弹框
 * （余额 / 费用 / 价格设置 三个 tab）。
 *
 * 右侧文案横排显示：「余额(xxCNY) 高峰时段/空闲时段 半价」——金额括号紧跟
 * 「余额」，时段文案（高峰红色/空闲绿色）随当前时间动态变化。
 * 时段判定与宿主一致（时区偏移 + 高峰窗口，按当前时间），每 60 秒刷新，
 * 弹框关闭（保存价格后）也会立即刷新。
 */
import { useCallback, useEffect, useState } from 'react';
import { t } from "../i18n.js";
import { BALANCE_LOGO } from "../logo.js";
/** 解析 'HH:MM' 为当日分钟数；非法返回 undefined（与宿主 cost.ts 同规则）。 */
function parseClock(value) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());
    if (m === null)
        return undefined;
    const h = Number(m[1]);
    const min = Number(m[2]);
    if (h < 0 || h > 23 || min < 0 || min > 59)
        return undefined;
    return h * 60 + min;
}
/** 判定一个时刻是否处于高峰时段（与宿主 isPeakTime 同逻辑）。 */
function isPeakNow(config, nowMs) {
    const offset = typeof config.timezoneOffsetMinutes === 'number' ? config.timezoneOffsetMinutes : 480;
    const local = new Date(nowMs + offset * 60_000);
    const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
    for (const window of config.peakWindows ?? []) {
        const start = parseClock(window.start);
        const end = parseClock(window.end);
        if (start === undefined || end === undefined)
            continue;
        // 支持跨午夜的窗口：start <= end 时取 [start, end)；start > end 时取 [start, 1440) ∪ [0, end)。
        if (start <= end) {
            if (minutes >= start && minutes < end)
                return true;
        }
        else if (minutes >= start || minutes < end) {
            return true;
        }
    }
    return false;
}
export function FooterButton({ onOpen, reportSession, wide = false, useSessions, run, useOpen }) {
    const currentSessionId = useSessions
        ? useSessions((s) => s && s.current)
        : null;
    if (reportSession && currentSessionId)
        reportSession(currentSessionId);
    const open = useOpen();
    const [peak, setPeak] = useState(null);
    const [bal, setBal] = useState(null);
    const refresh = useCallback(async () => {
        try {
            const res = await run('', { op: 'pricesGet' });
            const config = res.config;
            if (config !== undefined)
                setPeak(isPeakNow(config, Date.now()));
        }
        catch {
            // 网络/路由异常时保持上一次状态，不闪断。
        }
        try {
            // refresh:false 命中宿主 60s 余额缓存，不触发真实请求。
            const res = await run('', { op: 'balance', refresh: false });
            const balances = res.balances;
            const first = Array.isArray(balances)
                ? balances.find((b) => b.ok === true && Array.isArray(b.balance_infos) && b.balance_infos.length > 0)
                : undefined;
            const info = first?.balance_infos?.[0];
            if (info !== undefined)
                setBal({ total: info.total_balance, currency: info.currency });
        }
        catch {
            // 余额查询失败时保持上一次状态。
        }
    }, [run]);
    // 挂载即查 + 每 60 秒随当前时间刷新；弹框关闭（可能刚保存过价格）立即刷新。
    useEffect(() => {
        void refresh();
        const id = setInterval(() => { void refresh(); }, 60_000);
        return () => clearInterval(id);
    }, [refresh]);
    useEffect(() => {
        if (!open)
            void refresh();
    }, [open, refresh]);
    const periodSuffix = peak === null
        ? null
        : (_jsx("span", { className: 'dshb-btn-badge ' + (peak ? 'dshb-period-peak' : 'dshb-period-off'), children: peak ? t('btnPeak') : t('btnOffPeak') }));
    const balText = bal === null ? '' : bal.total + ' ' + bal.currency;
    const periodText = peak === null ? '' : peak ? t('btnPeak') : t('btnOffPeak');
    const fullLabel = t('balanceBtn') + (balText !== '' ? '(' + balText + ')' : '') + (periodText !== '' ? ' ' + periodText : '');
    return (_jsx("div", { className: 'dshb-footer-group' + (wide ? '' : ' dshb-footer-rail-group'), children: _jsxs("button", { type: "button", className: 'dshb-footer-btn' + (wide ? '' : ' dshb-footer-btn-rail'), title: fullLabel, "aria-label": fullLabel, onClick: onOpen, children: [_jsx("img", { src: BALANCE_LOGO, alt: "", className: "dshb-footer-logo" }), wide
                    ? (_jsxs("span", { className: "dshb-footer-label", children: [_jsx("span", { className: "dshb-footer-word", children: t('balanceBtn') }), balText !== '' ? _jsxs("span", { className: "dshb-footer-balance", children: ["(", balText, ")"] }) : null, periodSuffix] }))
                    : null] }) }));
}
