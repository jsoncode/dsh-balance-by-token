/**
 * dsh-balance-by-token —— 宿主半边：DeepSeek 服务商枚举。
 *
 * 来源（三路合并，按 id 去重）：
 * 1. `llm-pi-ai` settings 段的 `providers`：baseURL 含 deepseek（或路由 key 即
 *    deepseek）的条目，凭据引用为其 `apiKeyEnv`；
 * 2. `llm-deepseek` 官方路由插件段（route 固定 deepseek-official），
 *    apiKeyEnv 缺省 DEEPSEEK_API_KEY，baseURL 缺省官方 API；
 * 3. 本插件 settings 段里用户手动附加的 key（extraKeysJson）。
 *
 * 真实 key 经宿主 credentials 服务解析（`resolve(apiKeyEnv)`），解析结果只留在
 * 宿主半边，浏览器侧只见脱敏串。
 */
/** 官方 DeepSeek API 地址（baseURL 缺省值与过滤参照）。 */
export const DEEPSEEK_DEFAULT_BASE_URL = 'https://api.deepseek.com';
/** 脱敏一个 API key：保留头 5 与尾 4，过短全掩。 */
export function maskApiKey(key) {
    const k = String(key || '').trim();
    if (k.length === 0)
        return '';
    if (k.length <= 10)
        return k.slice(0, 2) + '****';
    return k.slice(0, 5) + '…' + k.slice(-4);
}
/** baseURL / 路由 key 是否指向 DeepSeek。 */
function isDeepseekRoute(routeKey, baseUrl) {
    if (routeKey.toLowerCase().includes('deepseek'))
        return true;
    if (baseUrl === undefined)
        return false;
    return baseUrl.toLowerCase().includes('deepseek');
}
/** 解析一个凭据引用：返回真实 key 及其来源层；未配置 / 服务缺失 / 异常返回 undefined。 */
export async function resolveApiKey(credentials, apiKeyEnv) {
    if (credentials === undefined || apiKeyEnv === undefined || apiKeyEnv === '')
        return undefined;
    try {
        const resolved = await credentials.resolve(apiKeyEnv);
        const value = resolved?.value;
        return typeof value === 'string' && value.length > 0
            ? { value, ...typeof resolved?.source === 'string' ? { source: resolved.source } : {} }
            : undefined;
    }
    catch {
        return undefined;
    }
}
/**
 * 枚举全部 providers 路由 → baseURL 映射（含非 deepseek 路由与官方 llm-deepseek
 * 段），供费用统计按「接口域名为官方地址」判定并过滤非官方请求的 token。
 * @param settings - 宿主 settings 服务（可能缺失）。
 * @param nsOf - namespace 品牌化函数（settingsNamespace）。
 * @returns provider key -> baseURL。
 */
export function listProviderBaseUrls(settings, nsOf) {
    const map = {};
    const piAi = settings?.get(nsOf('llm-pi-ai'));
    const providers = piAi?.providers;
    if (providers !== undefined && providers !== null && typeof providers === 'object') {
        for (const [route, section] of Object.entries(providers)) {
            if (section === undefined || section === null || typeof section !== 'object')
                continue;
            if (typeof section.baseURL === 'string' && section.baseURL.length > 0)
                map[route] = section.baseURL;
        }
    }
    const deepseek = settings?.get(nsOf('llm-deepseek'));
    if (deepseek !== undefined && deepseek !== null && typeof deepseek === 'object') {
        map['deepseek-official'] = deepseek.baseURL ?? DEEPSEEK_DEFAULT_BASE_URL;
    }
    return map;
}
/**
 * 枚举全部 DeepSeek 服务商条目（含 key 解析）。
 * @param settings - 宿主 settings 服务（可能缺失）。
 * @param nsOf - namespace 品牌化函数（settingsNamespace）。
 * @param credentials - 宿主 credentials 服务（可能缺失）。
 * @param extraKeys - 插件 settings 段的附加 key 列表。
 * @returns 去重后的服务商列表。
 */
export async function listDeepseekProviders(settings, nsOf, credentials, extraKeys) {
    const entries = [];
    const seen = new Set();
    // 1. llm-pi-ai providers 中指向 deepseek 的路由。
    const piAi = settings?.get(nsOf('llm-pi-ai'));
    const providers = piAi?.providers;
    if (providers !== undefined && providers !== null && typeof providers === 'object') {
        for (const [route, section] of Object.entries(providers)) {
            if (section === undefined || section === null || typeof section !== 'object')
                continue;
            if (!isDeepseekRoute(route, section.baseURL))
                continue;
            const apiKeyEnv = typeof section.apiKeyEnv === 'string' && section.apiKeyEnv.length > 0 ? section.apiKeyEnv : undefined;
            const resolved = await resolveApiKey(credentials, apiKeyEnv);
            const apiKey = resolved?.value;
            entries.push({
                id: `pi-ai:${route}`,
                label: section.displayName ?? route,
                baseUrl: section.baseURL ?? DEEPSEEK_DEFAULT_BASE_URL,
                source: 'llm-pi-ai',
                ...apiKeyEnv === undefined ? {} : { apiKeyEnv },
                ...apiKey === undefined ? {} : { apiKey },
                apiKeyMasked: apiKey === undefined ? '' : maskApiKey(apiKey),
                hasKey: apiKey !== undefined,
                ...apiKey !== undefined && resolved?.source !== undefined ? { keySource: resolved.source } : {},
            });
            seen.add(route);
        }
    }
    // 2. llm-deepseek 官方路由插件（未被上一步覆盖时补入）。
    const deepseek = settings?.get(nsOf('llm-deepseek'));
    if (deepseek !== undefined && deepseek !== null && typeof deepseek === 'object' && !seen.has('deepseek-official')) {
        const apiKeyEnv = typeof deepseek.apiKeyEnv === 'string' && deepseek.apiKeyEnv.length > 0
            ? deepseek.apiKeyEnv
            : 'DEEPSEEK_API_KEY';
        const resolved = await resolveApiKey(credentials, apiKeyEnv);
        const apiKey = resolved?.value;
        entries.push({
            id: 'llm-deepseek:deepseek-official',
            label: 'deepseek-official',
            baseUrl: deepseek.baseURL ?? DEEPSEEK_DEFAULT_BASE_URL,
            source: 'llm-deepseek',
            apiKeyEnv,
            ...apiKey === undefined ? {} : { apiKey },
            apiKeyMasked: apiKey === undefined ? '' : maskApiKey(apiKey),
            hasKey: apiKey !== undefined,
            ...apiKey !== undefined && resolved?.source !== undefined ? { keySource: resolved.source } : {},
        });
    }
    // 3. 用户手动附加的 key（字面量，不经凭据服务）。
    for (const extra of extraKeys) {
        const key = String(extra.apiKey || '').trim();
        entries.push({
            id: `extra:${extra.id}`,
            label: extra.label || extra.id,
            baseUrl: DEEPSEEK_DEFAULT_BASE_URL,
            source: 'extra',
            ...key.length > 0 ? { apiKey: key } : {},
            apiKeyMasked: maskApiKey(key),
            hasKey: key.length > 0,
        });
    }
    return entries;
}
