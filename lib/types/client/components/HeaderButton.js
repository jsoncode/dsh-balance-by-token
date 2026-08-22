import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-balance-by-token —— 会话头部工具区按钮（conversation.session.header.utilities）：
 * 【当前会话 ≈xx CNY】—— 只实时显示当前会话的预估费用。
 * 点击按钮立即刷新一次；启用「定时更新」后按设定间隔自动刷新。
 */
import { useCallback, useEffect, useState } from 'react';
import { fmtAmount, t } from "../i18n.js";
export function HeaderButton({ sessionId, run, useTick }) {
    const tick = useTick();
    const [costText, setCostText] = useState('--');
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
    }, [run, sessionId]);
    // 挂载 / 会话切换 / 自动刷新 tick 变化时刷新；点击按钮手动刷新一次。
    useEffect(() => {
        void refresh();
    }, [refresh, tick]);
    const title = t('headerBtnPrefix') + '≈' + costText + ' CNY';
    return (_jsxs("button", { type: "button", className: "dshb-header-btn", title: title, "aria-label": title, onClick: () => void refresh(), children: [_jsx("span", { children: t('headerBtnPrefix') }), _jsxs("span", { className: "dshb-header-amount", children: ["\u2248", costText, " CNY"] })] }));
}
