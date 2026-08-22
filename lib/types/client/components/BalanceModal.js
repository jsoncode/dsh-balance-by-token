import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { Fragment, useCallback, useEffect, useState } from 'react';
import { fmtAmount, fmtTokens, LANG, t, tErr } from "../i18n.js";
const sourceChipKey = {
    'llm-pi-ai': 'sourcePiAi',
    'llm-deepseek': 'sourceDeepseek',
    'extra': 'sourceExtra',
};
/** 严格对齐官方价格表：仅三组指标（输入-缓存命中 / 输入-缓存未命中 / 输出）。 */
const METRIC_GROUPS = [
    { labelKey: 'priceInputHit', field: 'cacheRead' },
    { labelKey: 'priceInputMiss', field: 'input' },
    { labelKey: 'priceOutput', field: 'output' },
];
/** 叠加柱状图四段：输入 / 缓存命中 / 缓存写入 / 输出（纯 div，无交互）。 */
const TOKEN_SEGMENTS = [
    { key: 'uncachedInput', labelKey: 'tokensUncachedInput', color: '#1668e3' },
    { key: 'cacheRead', labelKey: 'tokensCacheRead', color: '#13c2c2' },
    { key: 'cacheWrite', labelKey: 'tokensCacheWrite', color: '#fa8c16' },
    { key: 'output', labelKey: 'tokensOutput', color: '#722ed1' },
];
/** 四桶 token 总数。 */
function totalTokensView(b) {
    return b.uncachedInput + b.cacheRead + b.cacheWrite + b.output;
}
/** 中文数字（用于「东八区」式时区名）。 */
const CN_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
/** 把 UTC 偏移小时数格式化为时区名：东八区 / 西五区 / 零时区（中文），UTC+8（英文）。 */
function formatTimezone(offsetHours) {
    const h = Math.round(offsetHours);
    if (LANG === 'zh') {
        if (h === 0)
            return '零时区';
        const n = CN_NUM[Math.abs(h)] ?? String(Math.abs(h));
        return h > 0 ? '东' + n + '区' : '西' + n + '区';
    }
    if (h === 0)
        return 'UTC±0';
    return h > 0 ? 'UTC+' + h : 'UTC' + h;
}
export function BalanceModal({ run, useOpen, close, getSession, useTick, useAutoSeconds, setAutoSeconds }) {
    const open = useOpen();
    const tick = useTick();
    const autoSeconds = useAutoSeconds();
    const [tab, setTab] = useState('balance');
    // 定时更新配置弹框
    const [timingOpen, setTimingOpen] = useState(false);
    const [timingInput, setTimingInput] = useState('');
    const [timingErr, setTimingErr] = useState('');
    // 余额 tab
    const [providers, setProviders] = useState(null);
    const [balances, setBalances] = useState({});
    const [balLoading, setBalLoading] = useState(false);
    const [balError, setBalError] = useState('');
    // 附加 key
    const [keys, setKeys] = useState([]);
    const [keyFormOpen, setKeyFormOpen] = useState(false);
    const [keyLabel, setKeyLabel] = useState('');
    const [keyValue, setKeyValue] = useState('');
    const [keyErr, setKeyErr] = useState('');
    // 费用 tab
    const [cost, setCost] = useState(null);
    const [costLoading, setCostLoading] = useState(false);
    // 价格 tab
    const [prices, setPrices] = useState(null);
    const [windowCfg, setWindowCfg] = useState({ timezoneOffsetMinutes: 480, peakWindows: [] });
    const [priceMsg, setPriceMsg] = useState('');
    /** 余额查询：providers 与 balances 一并回填。 */
    const loadBalances = useCallback(async (refresh) => {
        setBalLoading(true);
        setBalError('');
        try {
            const provRes = await run(getSession(), { op: 'providers' });
            if (provRes.ok && Array.isArray(provRes.providers)) {
                setProviders(provRes.providers);
            }
            const res = await run(getSession(), { op: 'balance', refresh });
            if (res.ok && Array.isArray(res.balances)) {
                const map = {};
                for (const b of res.balances)
                    map[b.providerId] = b;
                setBalances(map);
            }
            else {
                setBalError(tErr(res, t('saveFailed')));
            }
        }
        finally {
            setBalLoading(false);
        }
    }, [run, getSession]);
    const loadKeys = useCallback(async () => {
        const res = await run(getSession(), { op: 'keysGet' });
        if (res.ok && Array.isArray(res.keys))
            setKeys(res.keys);
    }, [run, getSession]);
    const loadCost = useCallback(async () => {
        setCostLoading(true);
        try {
            const res = await run(getSession(), { op: 'cost', sessionId: getSession() });
            if (res.ok && res.cost !== undefined)
                setCost(res.cost);
        }
        finally {
            setCostLoading(false);
        }
    }, [run, getSession]);
    const loadPrices = useCallback(async () => {
        const res = await run(getSession(), { op: 'pricesGet' });
        if (res.ok) {
            const config = res.config;
            if (Array.isArray(config?.tiers))
                setPrices(config.tiers);
            if (config !== undefined) {
                setWindowCfg({
                    timezoneOffsetMinutes: typeof config.timezoneOffsetMinutes === 'number' ? config.timezoneOffsetMinutes : 480,
                    peakWindows: Array.isArray(config.peakWindows) ? config.peakWindows : [],
                });
            }
        }
    }, [run, getSession]);
    // 弹框打开时全量拉取；切换 tab 也保证数据新鲜（轻量：宿主有缓存）。
    useEffect(() => {
        if (!open)
            return;
        void loadBalances(false);
        void loadKeys();
        void loadCost();
        void loadPrices();
    }, [open, tab, loadBalances, loadKeys, loadCost, loadPrices]);
    // 定时自动刷新：宿主定时器到点 bump tick，这里刷新余额与费用（tick 初始 0 跳过）。
    useEffect(() => {
        if (!open || tick <= 0)
            return;
        void loadBalances(false);
        void loadCost();
    }, [tick, open, loadBalances, loadCost]);
    /* ── 定时更新配置 ── */
    const saveAutoSeconds = async (seconds) => {
        try {
            const res = await run('', { op: 'autoRefreshSave', seconds });
            if (res.ok && typeof res.seconds === 'number') {
                setAutoSeconds(res.seconds);
                setTimingErr('');
                return true;
            }
            setTimingErr(tErr(res, t('saveFailed')));
            return false;
        }
        catch {
            setTimingErr(tErr(null, t('saveFailed')));
            return false;
        }
    };
    const openTimingDialog = () => {
        setTimingInput(autoSeconds > 0 ? String(autoSeconds) : '60');
        setTimingErr('');
        setTimingOpen(true);
    };
    if (!open)
        return null;
    /* ── 附加 key 操作 ── */
    const saveKeys = async (next) => {
        const res = await run(getSession(), { op: 'keysSave', keys: next });
        if (res.ok) {
            await loadKeys();
            void loadBalances(true);
        }
        else {
            setKeyErr(tErr(res, t('saveFailed')));
        }
    };
    const submitKey = () => {
        const value = keyValue.trim();
        if (value.length === 0) {
            setKeyErr(t('keyRequired'));
            return;
        }
        setKeyErr('');
        setKeyFormOpen(false);
        setKeyValue('');
        setKeyLabel('');
        void saveKeys([...keys.map((k) => ({ id: k.id, label: k.label, apiKey: '' })), { label: keyLabel.trim(), apiKey: value }]);
    };
    const removeKey = (id) => {
        void saveKeys(keys.filter((k) => k.id !== id).map((k) => ({ id: k.id, label: k.label, apiKey: '' })));
    };
    /* ── 价格档操作 ── */
    const updatePrice = (index, patch) => {
        setPrices((prev) => {
            if (prev === null)
                return prev;
            const next = prev.slice();
            next[index] = { ...next[index], ...patch };
            return next;
        });
    };
    /** 更新某档某个时段的单项单价。 */
    const updateRate = (index, period, field, value) => {
        setPrices((prev) => {
            if (prev === null)
                return prev;
            const next = prev.slice();
            const tier = next[index];
            next[index] = { ...tier, [period]: { ...tier[period], [field]: value } };
            return next;
        });
    };
    const savePrices = async (list, windowCfgNext) => {
        if (list.length === 0) {
            setPriceMsg(t('pricesEmpty'));
            return;
        }
        const cfg = windowCfgNext ?? windowCfg;
        const res = await run(getSession(), {
            op: 'pricesSave',
            config: { tiers: list, timezoneOffsetMinutes: cfg.timezoneOffsetMinutes, peakWindows: cfg.peakWindows },
        });
        if (res.ok) {
            const config = res.config;
            if (Array.isArray(config?.tiers))
                setPrices(config.tiers);
            if (config !== undefined) {
                setWindowCfg({
                    timezoneOffsetMinutes: typeof config.timezoneOffsetMinutes === 'number' ? config.timezoneOffsetMinutes : 480,
                    peakWindows: Array.isArray(config.peakWindows) ? config.peakWindows : [],
                });
            }
            setPriceMsg(t('pricesSaved'));
            void loadCost();
        }
        else {
            setPriceMsg(tErr(res, t('saveFailed')));
        }
    };
    /* ── 渲染 ── */
    const balanceOf = (id) => balances[id];
    /**
     * 单个服务商条目（API key）的今日消耗：从 cost.todayAll.byKey 按
     * 服务商路由匹配（pi-ai:<route> / llm-deepseek:<route> / label）。
     * 无用量时返回 undefined，展示为 ≈0.00 CNY。
     */
    const todayCostOf = (p) => {
        const list = cost?.todayAll?.byKey ?? [];
        return list.find((k) => 'pi-ai:' + k.provider === p.id || 'llm-deepseek:' + k.provider === p.id || k.provider === p.id || k.provider === p.label);
    };
    const renderBalanceTab = () => (_jsxs("div", { children: [providers === null
                ? _jsx("div", { className: "dshb-spinner" })
                : providers.length === 0
                    ? _jsx("div", { className: "dshb-empty", children: t('noProviders') })
                    : (_jsx("div", { className: "dshb-prov-list", children: providers.map((p) => {
                            const b = balanceOf(p.id);
                            const infos = b?.ok ? (b.balance_infos ?? []) : [];
                            return (_jsxs("div", { className: "dshb-prov", children: [_jsxs("div", { className: "dshb-prov-main", children: [_jsxs("div", { className: "dshb-prov-name-row", children: [_jsx("span", { className: "dshb-prov-name", children: p.label }), _jsx("span", { className: 'dshb-chip' + (p.source === 'extra' ? ' dshb-chip-brand' : ''), children: t(sourceChipKey[p.source]) }), !p.hasKey
                                                        ? (_jsxs("span", { className: "dshb-chip", title: p.keySource !== undefined ? 'source: ' + p.keySource : undefined, children: [t('noCredential'), p.apiKeyEnv !== undefined ? ' · ' + p.apiKeyEnv : ''] }))
                                                        : null] }), _jsxs("div", { className: "dshb-prov-meta", children: [p.baseUrl, p.apiKeyMasked ? ` · ${p.apiKeyMasked}` : ''] })] }), _jsx("div", { className: "dshb-prov-side", children: b === undefined
                                            ? (balLoading ? _jsx("div", { className: "dshb-spinner", style: { margin: '4px 0 4px auto' } }) : _jsx("span", { className: "dshb-prov-sub", children: "\u2014" }))
                                            : b.ok
                                                ? infos.length === 0
                                                    ? _jsx("span", { className: "dshb-prov-sub", children: "\u2014" })
                                                    : infos.map((info, i) => {
                                                        const kc = todayCostOf(p);
                                                        const kcCurrency = kc !== undefined && kc.currency !== '' ? kc.currency : 'CNY';
                                                        return (_jsxs("div", { children: [_jsxs("div", { className: "dshb-prov-costline", children: [_jsx("span", { children: t('summaryTodayCost') }), _jsxs("span", { className: "dshb-balance-num", children: ["\u2248", fmtAmount(kc?.amount ?? 0), " ", kcCurrency] }), _jsx("span", { className: "dshb-balance-sep", children: "|" }), _jsx("span", { children: t('summaryBalance') }), _jsxs("span", { className: "dshb-balance-num", children: [info.total_balance, " ", info.currency] })] }), _jsxs("div", { className: 'dshb-prov-sub' + (info.topped_out ? ' dshb-topped' : ''), children: [t('balanceGranted'), " ", info.granted_balance, info.topped_out ? ` · ${t('toppedOut')}` : ''] })] }, i));
                                                    })
                                                : _jsx("div", { className: "dshb-prov-err", children: tErr(b) }) })] }, p.id));
                        }) })), balError !== '' ? _jsx("p", { className: "dshb-err", children: balError }) : null, _jsxs("div", { className: "dshb-keys", children: [_jsx("div", { className: "dshb-keys-title", children: t('extraKeysTitle') }), _jsx("p", { className: "dshb-hint", children: t('extraKeysHint') }), keys.map((k) => (_jsxs("div", { className: "dshb-key-row", children: [_jsx("span", { className: "dshb-chip", children: k.label !== '' ? k.label : t('sourceExtra') }), _jsx("span", { className: "dshb-key-mask", children: k.apiKeyMasked }), _jsx("button", { type: "button", className: "dshb-btn dshb-btn-small dshb-btn-danger", onClick: () => removeKey(k.id), children: t('delete') })] }, k.id))), keyFormOpen
                        ? (_jsxs("div", { className: "dshb-key-form", children: [_jsx("input", { className: "dshb-input", value: keyLabel, placeholder: t('keyLabelPlaceholder'), "aria-label": t('keyLabel'), onChange: (e) => setKeyLabel(e.target.value) }), _jsx("input", { className: "dshb-input", value: keyValue, placeholder: t('keyInputPlaceholder'), "aria-label": t('keyInput'), onChange: (e) => setKeyValue(e.target.value) }), _jsx("button", { type: "button", className: "dshb-btn dshb-btn-small dshb-btn-primary", onClick: submitKey, children: t('add') }), _jsx("button", { type: "button", className: "dshb-btn dshb-btn-small", onClick: () => { setKeyFormOpen(false); setKeyErr(''); }, children: t('cancel') })] }))
                        : _jsxs("button", { type: "button", className: "dshb-btn dshb-btn-small", onClick: () => setKeyFormOpen(true), children: ["+ ", t('addKeyBtn')] }), keyErr !== '' ? _jsx("p", { className: "dshb-err", children: keyErr }) : null] })] }));
    /** 服务商路由 key → 展示信息（label + 脱敏 key）；用余额 tab 已加载的 providers 列表匹配。 */
    const providerMeta = (provider) => {
        const hit = (providers ?? []).find((p) => p.id === 'pi-ai:' + provider || p.id === 'llm-deepseek:' + provider || p.id === provider || p.label === provider);
        if (hit !== undefined)
            return { label: hit.label !== '' ? hit.label : provider, ...hit.apiKeyMasked !== undefined && hit.apiKeyMasked !== '' ? { masked: hit.apiKeyMasked } : {} };
        return { label: provider };
    };
    /** 一条 token 四段柱状图（纯 div）。 */
    const usageBar = (buckets, small) => {
        const total = totalTokensView(buckets);
        return (_jsx("div", { className: 'dshb-bar' + (small ? ' dshb-bar-sm' : ''), role: "img", "aria-label": TOKEN_SEGMENTS.map((s) => t(s.labelKey) + ': ' + fmtTokens(buckets[s.key])).join(', '), children: total > 0
                ? TOKEN_SEGMENTS.map((seg) => {
                    const v = buckets[seg.key];
                    return v > 0
                        ? (_jsx("div", { className: "dshb-bar-seg", style: { width: (v / total * 100) + '%', background: seg.color }, title: t(seg.labelKey) + ': ' + fmtTokens(v) }, seg.key))
                        : null;
                })
                : null }));
    };
    const costCard = (label, entry) => {
        const byKey = entry?.byKey ?? [];
        const total = entry?.buckets ?? { uncachedInput: 0, cacheRead: 0, cacheWrite: 0, output: 0 };
        const totalTokens = totalTokensView(total);
        return (_jsxs("div", { className: "dshb-cost-card", children: [_jsx("div", { className: "dshb-cost-label", children: label }), entry === undefined
                    ? _jsx("div", { className: "dshb-spinner" })
                    : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "dshb-cost-amount", children: [fmtAmount(entry.amount), _jsx("span", { className: "dshb-cost-currency", children: entry.currency })] }), totalTokens > 0
                                ? usageBar(total, false)
                                : _jsx("div", { className: "dshb-bar dshb-bar-empty", children: t('noUsage') }), _jsx("div", { className: "dshb-bar-legend", children: TOKEN_SEGMENTS.map((seg) => (_jsxs("span", { children: [_jsxs("span", { className: "dshb-bar-legend-name", children: [_jsx("i", { style: { background: seg.color } }), t(seg.labelKey)] }), _jsx("b", { children: fmtTokens(total[seg.key]) })] }, seg.key))) }), byKey.length > 0
                                ? (_jsxs("div", { className: "dshb-key-cost-list", children: [_jsx("div", { className: "dshb-nonofficial-title", children: t('costByKeyTitle') }), byKey.map((k) => {
                                            const meta = providerMeta(k.provider);
                                            return (_jsxs("div", { className: "dshb-key-cost", children: [_jsxs("div", { className: "dshb-key-cost-head", children: [_jsx("span", { className: "dshb-key-cost-name", title: k.provider, children: meta.label }), meta.masked !== undefined ? _jsx("span", { className: "dshb-key-cost-mask", children: meta.masked }) : null, _jsx("span", { className: 'dshb-chip' + (k.official ? ' dshb-chip-brand' : ''), children: k.official ? t('chipOfficial') : t('chipNonOfficial') }), k.official
                                                                ? _jsxs("span", { className: "dshb-key-cost-amount", children: ["\u2248", fmtAmount(k.amount), " ", k.currency] })
                                                                : _jsx("span", { className: "dshb-chip", children: t('notBilled') })] }), usageBar(k.buckets, true), _jsx("div", { className: "dshb-key-cost-counts", children: TOKEN_SEGMENTS.map((seg) => t(seg.labelKey) + ' ' + fmtTokens(k.buckets[seg.key])).join(' · ') })] }, k.provider));
                                        })] }))
                                : null] }))] }));
    };
    const renderCostTab = () => (_jsxs("div", { children: [_jsx("p", { className: "dshb-hint", children: t('costHint') }), _jsxs("div", { className: "dshb-cost-grid", children: [costCard(t('costLastTurn'), cost?.lastTurn), costCard(t('costSession'), cost?.session), costCard(t('costTodayProject'), cost?.todayProject), costCard(t('costTodayAll'), cost?.todayAll)] }), cost?.sessionTier !== undefined
                ? _jsxs("div", { className: "dshb-cost-tier", children: [t('costTier'), "\uFF1A", _jsx("b", { children: cost.sessionTier })] })
                : null] }));
    const renderPricesTab = () => (_jsxs("div", { children: [_jsx("p", { className: "dshb-hint", children: t('pricesHint') }), prices === null
                ? _jsx("div", { className: "dshb-spinner" })
                : (_jsxs("div", { children: [_jsxs("div", { className: "dshb-window-box", children: [_jsx("div", { className: "dshb-window-title", children: t('windowTitle') }), _jsx("p", { className: "dshb-hint", children: t('windowHint') }), _jsx("div", { className: "dshb-window-list", children: windowCfg.peakWindows.map((w, wi) => (_jsxs("div", { className: "dshb-window-row", children: [_jsx("input", { className: "dshb-input dshb-cur", value: w.start, "aria-label": t('windowStart'), placeholder: "09:00", onChange: (e) => {
                                                    const next = windowCfg.peakWindows.map((x, j) => j === wi ? { ...x, start: e.target.value } : x);
                                                    setWindowCfg({ ...windowCfg, peakWindows: next });
                                                } }), _jsx("span", { children: "\u2013" }), _jsx("input", { className: "dshb-input dshb-cur", value: w.end, "aria-label": t('windowEnd'), placeholder: "12:00", onChange: (e) => {
                                                    const next = windowCfg.peakWindows.map((x, j) => j === wi ? { ...x, end: e.target.value } : x);
                                                    setWindowCfg({ ...windowCfg, peakWindows: next });
                                                } }), _jsx("button", { type: "button", className: "dshb-btn dshb-btn-small dshb-btn-danger dshb-window-del", onClick: () => setWindowCfg({ ...windowCfg, peakWindows: windowCfg.peakWindows.filter((_, j) => j !== wi) }), children: t('delete') })] }, wi))) }), _jsxs("div", { className: "dshb-window-actions", children: [_jsxs("button", { type: "button", className: "dshb-btn dshb-btn-small", onClick: () => setWindowCfg({ ...windowCfg, peakWindows: [...windowCfg.peakWindows, { start: '09:00', end: '12:00' }] }), children: ["+ ", t('addWindow')] }), _jsxs("label", { className: "dshb-window-tz", children: [_jsx("span", { children: t('tzOffset') }), _jsx("input", { className: "dshb-range", type: "range", min: -12, max: 12, step: 1, value: Math.round(windowCfg.timezoneOffsetMinutes / 60), "aria-label": t('tzOffset'), onChange: (e) => setWindowCfg({ ...windowCfg, timezoneOffsetMinutes: Number(e.target.value) * 60 }) }), _jsx("b", { className: "dshb-window-tz-label", children: formatTimezone(windowCfg.timezoneOffsetMinutes / 60) })] })] })] }), _jsx("div", { className: "dshb-price-scroll", children: _jsxs("table", { className: "dshb-table dshb-price-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "dshb-price-corner", colSpan: 2, children: t('priceModel') }), prices.map((tier, i) => (_jsx("th", { className: "dshb-price-head-cell", children: _jsx("span", { className: "dshb-price-model-name", title: tier.match === '*' ? t('fallbackHint') : undefined, children: tier.name || tier.match }) }, tier.id)))] }) }), _jsx("tbody", { children: METRIC_GROUPS.map((group) => (_jsxs(Fragment, { children: [_jsxs("tr", { children: [_jsx("th", { rowSpan: 2, className: "dshb-price-metric", children: t(group.labelKey) }), _jsx("td", { className: "dshb-price-period dshb-period-off", children: t('pricePeriodOffPeak') }), prices.map((tier, i) => (_jsx("td", { className: "dshb-price-cell", children: _jsx("input", { className: "dshb-input dshb-num", type: "number", step: "any", min: 0, value: tier.offPeak[group.field], "aria-label": t(group.labelKey) + ' · ' + t('pricePeriodOffPeak'), onChange: (e) => updateRate(i, 'offPeak', group.field, Number(e.target.value) || 0) }) }, tier.id)))] }), _jsxs("tr", { children: [_jsx("td", { className: "dshb-price-period dshb-period-peak", children: t('pricePeriodPeak') }), prices.map((tier, i) => (_jsx("td", { className: "dshb-price-cell", children: _jsx("input", { className: "dshb-input dshb-num", type: "number", step: "any", min: 0, value: tier.peak[group.field], "aria-label": t(group.labelKey) + ' · ' + t('pricePeriodPeak'), onChange: (e) => updateRate(i, 'peak', group.field, Number(e.target.value) || 0) }) }, tier.id)))] })] }, group.field))) })] }) })] })), _jsx("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }, children: _jsx("button", { type: "button", className: "dshb-btn dshb-btn-small dshb-btn-primary", disabled: prices === null, onClick: () => { if (prices !== null)
                        void savePrices(prices); }, children: t('save') }) }), priceMsg !== '' ? _jsx("p", { className: 'dshb-' + (priceMsg === t('pricesSaved') ? 'ok' : 'err'), children: priceMsg }) : null] }));
    return (_jsxs("div", { className: "dshb-backdrop", onClick: (e) => { if (e.target === e.currentTarget)
            close(); }, children: [_jsxs("div", { className: "dshb-modal", role: "dialog", "aria-modal": "true", children: [_jsxs("div", { className: "dshb-modal-header", children: [_jsx("div", { className: "dshb-modal-title", children: t('modalTitle') }), _jsxs("div", { className: "dshb-head-ops", children: [_jsxs("button", { type: "button", className: "dshb-btn dshb-btn-small", onClick: openTimingDialog, children: [t('timingBtn'), autoSeconds > 0 ? '·' + autoSeconds + 's' : ''] }), tab === 'balance'
                                        ? _jsx("button", { type: "button", className: "dshb-btn dshb-btn-small", disabled: balLoading, onClick: () => void loadBalances(true), children: balLoading ? t('loading') : t('refreshAll') })
                                        : null, tab === 'cost'
                                        ? _jsx("button", { type: "button", className: "dshb-btn dshb-btn-small", disabled: costLoading, onClick: () => void loadCost(), children: costLoading ? t('loading') : t('refresh') })
                                        : null, _jsx("button", { type: "button", className: "dshb-close", "aria-label": t('close'), onClick: close, children: "\u2715" })] })] }), _jsxs("div", { className: "dshb-tabs", children: [_jsx("button", { type: "button", className: 'dshb-tab' + (tab === 'balance' ? ' dshb-tab-active' : ''), onClick: () => setTab('balance'), children: t('tabBalance') }), _jsx("button", { type: "button", className: 'dshb-tab' + (tab === 'cost' ? ' dshb-tab-active' : ''), onClick: () => setTab('cost'), children: t('tabCost') }), _jsx("button", { type: "button", className: 'dshb-tab' + (tab === 'prices' ? ' dshb-tab-active' : ''), onClick: () => setTab('prices'), children: t('tabPrices') })] }), _jsx("div", { className: "dshb-modal-body", children: tab === 'balance' ? renderBalanceTab() : tab === 'cost' ? renderCostTab() : renderPricesTab() })] }), timingOpen
                ? (_jsx("div", { className: "dshb-timing-backdrop", onClick: (e) => { if (e.target === e.currentTarget)
                        setTimingOpen(false); }, children: _jsxs("div", { className: "dshb-timing-dialog", role: "dialog", "aria-modal": "true", children: [_jsx("div", { className: "dshb-timing-title", children: t('timingTitle') }), _jsx("p", { className: "dshb-hint", children: t('timingHint') }), _jsxs("label", { className: "dshb-timing-field", children: [t('timingSeconds'), _jsx("input", { className: "dshb-input", type: "number", min: 1, max: 86400, value: timingInput, placeholder: "60", disabled: autoSeconds > 0, onChange: (e) => setTimingInput(e.target.value) })] }), autoSeconds > 0
                                ? _jsx("div", { className: "dshb-timing-active", children: t('timingActive', { n: String(autoSeconds) }) })
                                : null, timingErr !== '' ? _jsx("p", { className: "dshb-err", children: timingErr }) : null, _jsxs("div", { className: "dshb-timing-actions", children: [_jsx("button", { type: "button", className: "dshb-btn dshb-btn-small dshb-btn-primary", disabled: autoSeconds > 0, onClick: () => {
                                            const n = Number(String(timingInput).trim());
                                            if (!Number.isFinite(n) || n <= 0 || n > 86400) {
                                                setTimingErr(t('timingInvalid'));
                                                return;
                                            }
                                            void saveAutoSeconds(Math.round(n)).then((ok) => {
                                                if (!ok)
                                                    return;
                                                // 启动成功立即刷新一次，让效果可见；弹框保持打开。
                                                void loadBalances(false);
                                                void loadCost();
                                            });
                                        }, children: t('timingStart') }), _jsx("button", { type: "button", className: "dshb-btn dshb-btn-small", disabled: autoSeconds <= 0, onClick: () => {
                                            void saveAutoSeconds(0);
                                        }, children: t('timingStop') }), _jsx("button", { type: "button", className: "dshb-btn dshb-btn-small", onClick: () => setTimingOpen(false), children: t('close') })] })] }) }))
                : null] }));
}
