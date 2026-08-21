/**
 * dsh-balance-by-token —— 浏览器半边：语言与文案（中英双语，跟随主界面语言）。
 */
function resolveLang() {
    if (typeof document !== 'undefined') {
        const host = document.documentElement.lang || navigator.language || 'zh-CN';
        return /^zh/i.test(host) ? 'zh' : 'en';
    }
    return 'zh';
}
export const LANG = resolveLang();
const COPY = {
    zh: {
        balanceBtn: '余额',
        btnPeak: '高峰时段',
        btnOffPeak: '空闲时段 半价',
        headerBtnPrefix: '当前会话',
        headerBtnMid: ' | 余额 ',
        timingBtn: '定时更新',
        timingTitle: '定时更新配置',
        timingHint: '每隔设定秒数自动刷新余额与费用（含顶部按钮与弹框）。',
        timingSeconds: '间隔（秒）',
        timingStart: '启动',
        timingStop: '停止',
        timingActive: '已开启：每 {n} 秒自动刷新',
        timingInvalid: '请输入 1–86400 之间的秒数',
        modalTitle: 'DeepSeek 余额与费用',
        tabBalance: '余额',
        tabCost: '费用',
        tabPrices: '价格设置',
        refreshAll: '全部刷新',
        refresh: '刷新',
        loading: '加载中…',
        close: '关闭',
        save: '保存',
        saved: '已保存',
        saveFailed: '保存失败',
        cancel: '取消',
        add: '添加',
        delete: '删除',
        // 余额 tab
        noProviders: '未发现 DeepSeek 服务商。请在 dsh 设置中配置 llm-pi-ai / llm-deepseek 段，或在下方附加 API Key。',
        sourcePiAi: 'pi-ai 路由',
        sourceDeepseek: '官方路由',
        sourceExtra: '附加 Key',
        noCredential: '未配置凭据',
        balanceTotal: '总余额',
        balanceGranted: '赠送余额',
        toppedOut: '已用完',
        extraKeysTitle: '附加 API Key',
        extraKeysHint: '手动添加不在 dsh providers 配置中的 key（仅用于余额查询，明文保存在 $DSH_HOME/settings.yaml）',
        addKeyBtn: '附加 API Key',
        keyLabel: '备注',
        keyLabelPlaceholder: '选填，如「测试账号」',
        keyInput: 'API Key',
        keyInputPlaceholder: 'sk-…',
        keyRequired: '请填写 API Key',
        // 费用 tab
        costLastTurn: '最近一次提问',
        costSession: '本会话',
        costTodayProject: '今日·本项目',
        costTodayAll: '今日·全部',
        costTier: '当前生效价格档',
        noUsage: '暂无用量',
        tokensUncachedInput: '输入',
        tokensCacheRead: '缓存命中',
        tokensCacheWrite: '缓存写入',
        tokensOutput: '输出',
        costHint: '金额仅按 DeepSeek 官方（api.deepseek.com）请求计费；所有服务商的 token 用量均统计数量。宿主缓存 60 秒；今日两项扫描 ~/.dsh/sessions 日志。',
        officialLabel: '官方（api.deepseek.com）',
        nonOfficialLabel: '非官方（不计费）',
        // 价格 tab
        pricesHint: '单价单位为每百万 tokens；每档分别设置高峰与空闲两套单价；匹配优先级：精确模型 id > 前缀 > * 通配兜底。修改后保存即生效。',
        priceName: '名称',
        priceMatch: '模型匹配',
        priceCurrency: '货币',
        priceInput: '输入',
        priceCacheRead: '缓存命中',
        priceCacheWrite: '缓存写入',
        priceOps: '操作',
        priceModel: '模型版本',
        priceCategory: '价格',
        pricePeriodPeak: '高峰时段',
        pricePeriodOffPeak: '空闲时段',
        priceInputHit: '百万tokens输入\n（缓存命中）',
        priceInputMiss: '百万tokens输入\n（缓存未命中）',
        priceOutput: '百万tokens输出',
        windowTitle: '时段配置',
        windowHint: '高峰时段窗口（其余时间为空闲时段），格式 HH:MM，按下方时区偏移解释。官方默认：北京时间 9:00–12:00、14:00–18:00。',
        windowStart: '开始',
        windowEnd: '结束',
        addWindow: '新增高峰时段',
        windowInvalid: '时段须为 HH:MM 且开始早于结束',
        tzOffset: '时区偏移',
        tzOffsetInvalid: '时区偏移须为数字',
        restoreDefaults: '恢复官方默认',
        confirmRestore: '将丢弃当前价格配置（档位与时段窗口）并恢复 DeepSeek 官方默认，确认？',
        pricesSaved: '价格已保存',
        pricesEmpty: '至少保留一个价格档',
        fallbackHint: '通配档位：匹配所有未在上方列出的模型（match = *）',
        cmdNoResult: '命令未返回结果',
        errors: {
            'auth-failed': '认证失败：API Key 无效或已过期（HTTP 401/403）',
            'no-credential': '未配置凭据（apiKeyEnv 未解析到值）',
            'timeout': '请求超时',
            'network-failed': '网络请求失败',
            'http-error': '官方接口返回错误',
            'op-unknown': '未知操作',
            'params-invalid': '参数需为 JSON',
            'internal-error': '宿主内部错误',
            'forbidden': '请求被信任围栏拒绝',
        },
    },
    en: {
        balanceBtn: 'Balance',
        btnPeak: 'peak hours',
        btnOffPeak: 'off-peak, half price',
        headerBtnPrefix: 'Session ',
        headerBtnMid: ' | Balance ',
        timingBtn: 'Auto',
        timingTitle: 'Auto refresh',
        timingHint: 'Refresh balance & cost every N seconds (header button and modal).',
        timingSeconds: 'Interval (s)',
        timingStart: 'Start',
        timingStop: 'Stop',
        timingActive: 'Active: every {n}s',
        timingInvalid: 'Enter seconds between 1 and 86400',
        modalTitle: 'DeepSeek Balance & Cost',
        tabBalance: 'Balance',
        tabCost: 'Cost',
        tabPrices: 'Prices',
        refreshAll: 'Refresh all',
        refresh: 'Refresh',
        loading: 'Loading…',
        close: 'Close',
        save: 'Save',
        saved: 'Saved',
        saveFailed: 'Save failed',
        cancel: 'Cancel',
        add: 'Add',
        delete: 'Delete',
        // balance tab
        noProviders: 'No DeepSeek providers found. Configure llm-pi-ai / llm-deepseek in dsh settings, or attach an API key below.',
        sourcePiAi: 'pi-ai route',
        sourceDeepseek: 'official route',
        sourceExtra: 'extra key',
        noCredential: 'No credential',
        balanceTotal: 'Total',
        balanceGranted: 'Granted',
        toppedOut: 'used up',
        extraKeysTitle: 'Extra API Keys',
        extraKeysHint: 'Manually attach keys not in dsh providers config (balance query only; stored as plain text in $DSH_HOME/settings.yaml)',
        addKeyBtn: 'Attach API Key',
        keyLabel: 'Label',
        keyLabelPlaceholder: 'Optional, e.g. "test account"',
        keyInput: 'API Key',
        keyInputPlaceholder: 'sk-…',
        keyRequired: 'API key is required',
        // cost tab
        costLastTurn: 'Last question',
        costSession: 'This session',
        costTodayProject: 'Today · project',
        costTodayAll: 'Today · all',
        costTier: 'Active price tier',
        noUsage: 'No usage yet',
        tokensUncachedInput: 'Input',
        tokensCacheRead: 'Cache hit',
        tokensCacheWrite: 'Cache write',
        tokensOutput: 'Output',
        costHint: 'Only DeepSeek official (api.deepseek.com) requests are billed; token usage from all providers is counted. Host caches 60s; today entries scan ~/.dsh/sessions logs.',
        officialLabel: 'Official (api.deepseek.com)',
        nonOfficialLabel: 'Non-official (not billed)',
        // prices tab
        pricesHint: 'Prices are per million tokens; each tier has peak and off-peak rates; match priority: exact model id > prefix > * fallback. Save to apply.',
        priceName: 'Name',
        priceMatch: 'Model match',
        priceCurrency: 'Currency',
        priceInput: 'Input',
        priceCacheRead: 'Cache hit',
        priceCacheWrite: 'Cache write',
        priceOps: 'Actions',
        priceModel: 'Model version',
        priceCategory: 'Price',
        pricePeriodPeak: 'Peak',
        pricePeriodOffPeak: 'Off-peak',
        priceInputHit: 'Input\n(cache hit)',
        priceInputMiss: 'Input\n(cache miss)',
        priceOutput: 'Output',
        windowTitle: 'Time windows',
        windowHint: 'Peak windows (the rest is off-peak), format HH:MM, interpreted in the timezone offset below. Official default: Beijing 9:00-12:00, 14:00-18:00.',
        windowStart: 'Start',
        windowEnd: 'End',
        addWindow: 'Add peak window',
        windowInvalid: 'Windows must be HH:MM and start before end',
        tzOffset: 'Timezone offset',
        tzOffsetInvalid: 'Timezone offset must be a number',
        restoreDefaults: 'Restore defaults',
        confirmRestore: 'Discard the current price config (tiers and windows) and restore DeepSeek official defaults?',
        pricesSaved: 'Prices saved',
        pricesEmpty: 'Keep at least one price tier',
        fallbackHint: 'Wildcard tier: matches any model not listed above (match = *)',
        cmdNoResult: 'Command returned no result',
        errors: {
            'auth-failed': 'Authentication failed: invalid or expired API key (HTTP 401/403)',
            'no-credential': 'No credential configured (apiKeyEnv resolved to nothing)',
            'timeout': 'Request timed out',
            'network-failed': 'Network request failed',
            'http-error': 'Official API returned an error',
            'op-unknown': 'Unknown operation',
            'params-invalid': 'Parameters must be JSON',
            'internal-error': 'Host internal error',
            'forbidden': 'Rejected by the trust fence',
        },
    },
};
const dict = (COPY[LANG] || COPY.zh);
/** 取文案并替换 {var} 占位符。 */
export const t = (key, vars) => {
    let s = dict[key] !== undefined ? dict[key] : String(key);
    if (vars) {
        for (const k of Object.keys(vars)) {
            s = s.split('{' + k + '}').join(String(vars[k]));
        }
    }
    return s;
};
/** 宿主错误通过 code 映射为本地化文本，未知错误回退原文。 */
export const tErr = (res, fallback) => {
    if (res && res.code) {
        const local = dict.errors[res.code];
        if (local !== undefined) {
            const zh = LANG === 'zh';
            if (res.code === 'network-failed' || res.code === 'timeout' || res.code === 'http-error') {
                const detail = res.error ? String(res.error).trim() : '';
                return local + (detail ? (zh ? '：' : ': ') + detail : '');
            }
            return local;
        }
    }
    return (res && res.error) || fallback || '';
};
/** 金额格式化（保留合理小数位）。 */
export const fmtAmount = (amount) => {
    if (amount === undefined || !Number.isFinite(amount))
        return '—';
    if (amount === 0)
        return '0';
    if (amount < 0.001)
        return amount.toExponential(2);
    if (amount < 1)
        return amount.toFixed(4);
    return amount.toFixed(2);
};
/** token 数量格式化（千分位）。 */
export const fmtTokens = (n) => {
    if (n === undefined || !Number.isFinite(n))
        return '0';
    return Math.round(n).toLocaleString('en-US');
};
