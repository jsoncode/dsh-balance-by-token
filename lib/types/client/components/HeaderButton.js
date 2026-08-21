import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-balance-by-token —— 会话头部工具区按钮（conversation.session.header.utilities）：
 * 【当前会话xxCNY/余额xxxCNY】—— 实时显示当前会话费用与账户余额。
 * 点击按钮立即刷新一次；启用「定时更新」后按设定间隔自动刷新。
 */
import { useCallback, useEffect, useState } from 'react';
import { fmtAmount, t } from "../i18n.js";
export function HeaderButton({ sessionId, run, useTick }) {
    const tick = useTick();
    const [costText, setCostText] = useState('--');
    const [balText, setBalText] = useState('--');
    const refresh = useCallback(async () => {
        try {
            const costRes = await run(sessionId, { op: 'cost', sessionId });
            const cost = costRes.cost;
            if (cost?.session?.amount !== undefined)
                setCostText(fmtAmount(cost.session.amount));
        }
        catch {
            // 保持上一次值。
        }
        try {
            const res = await run('', { op: 'balance', refresh: false });
            const list = res.balances;
            const first = Array.isArray(list)
                ? list.find((b) => b.ok === true && Array.isArray(b.balance_infos) && b.balance_infos.length > 0)
                : undefined;
            const info = first?.balance_infos?.[0];
            if (info !== undefined)
                setBalText(info.total_balance);
        }
        catch {
            // 保持上一次值。
        }
    }, [run, sessionId]);
    // 挂载 / 会话切换 / 自动刷新 tick 变化时刷新；点击按钮手动刷新一次。
    useEffect(() => {
        void refresh();
    }, [refresh, tick]);
    const title = t('headerBtnPrefix') + '≈' + costText + ' CNY' + t('headerBtnMid') + balText + ' CNY';
    return (_jsxs("button", { type: "button", className: "dshb-header-btn", title: title, "aria-label": title, onClick: () => void refresh(), children: [_jsx("span", { children: t('headerBtnPrefix') }), _jsxs("span", { className: "dshb-header-amount", children: ["\u2248", costText, " CNY"] }), _jsx("span", { children: t('headerBtnMid') }), _jsxs("span", { className: "dshb-header-amount", children: [balText, " CNY"] })] }));
}
