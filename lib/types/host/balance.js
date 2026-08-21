/**
 * dsh-balance-by-token —— 宿主半边：官方余额接口查询。
 *
 * GET https://api.deepseek.com/user/balance（Authorization: Bearer <key>），
 * 返回 { is_available, balance_infos: [{ currency, total_balance, granted_balance, topped_out }] }。
 * 结果按服务商缓存 60 秒，手动刷新（refresh=true）绕过缓存。
 */
/** 单次余额请求超时（毫秒）。 */
const BALANCE_TIMEOUT_MS = 10_000;
/** 缓存存活时间（毫秒）。 */
const CACHE_TTL_MS = 60_000;
const cache = new Map();
/** 规范化响应：余额字段一律转字符串（官方为字符串数字）。 */
function normalizeBalance(providerId, body) {
    const infos = Array.isArray(body.balance_infos) ? body.balance_infos : [];
    return {
        providerId,
        ok: true,
        is_available: body.is_available === true,
        balance_infos: infos.map((info) => ({
            currency: typeof info.currency === 'string' ? info.currency : 'CNY',
            total_balance: String(info.total_balance ?? '0'),
            granted_balance: String(info.granted_balance ?? '0'),
            topped_out: info.topped_out === true,
        })),
    };
}
/** 查询一个服务商的余额（带超时）。 */
async function fetchOne(entry) {
    if (entry.apiKey === undefined || entry.apiKey.length === 0) {
        return { providerId: entry.id, ok: false, code: 'no-credential', error: 'no credential configured' };
    }
    // 官方余额接口固定位于开放平台根域：baseURL 可能是 /v1 形式的兼容端点，
    // 余额查询统一走官方根域（与 key 归属账号一致）。
    const url = 'https://api.deepseek.com/user/balance';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), BALANCE_TIMEOUT_MS);
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { authorization: `Bearer ${entry.apiKey}`, accept: 'application/json' },
            signal: controller.signal,
        });
        if (response.status === 401 || response.status === 403) {
            return { providerId: entry.id, ok: false, code: 'auth-failed', error: `HTTP ${response.status}` };
        }
        if (!response.ok) {
            return { providerId: entry.id, ok: false, code: 'http-error', error: `HTTP ${response.status}` };
        }
        const body = await response.json();
        return normalizeBalance(entry.id, body);
    }
    catch (e) {
        const aborted = e instanceof Error && e.name === 'AbortError';
        return {
            providerId: entry.id,
            ok: false,
            code: aborted ? 'timeout' : 'network-failed',
            error: e instanceof Error ? e.message : String(e),
        };
    }
    finally {
        clearTimeout(timer);
    }
}
/**
 * 批量查询余额（并行）。
 * @param entries - 服务商列表。
 * @param refresh - true 绕过 60s 缓存。
 * @returns 与 entries 等长的结果数组。
 */
export async function queryBalances(entries, refresh) {
    const now = Date.now();
    return Promise.all(entries.map(async (entry) => {
        if (!refresh) {
            const cached = cache.get(entry.id);
            if (cached !== undefined && now - cached.at < CACHE_TTL_MS)
                return cached.result;
        }
        const result = await fetchOne(entry);
        // 成功结果与明确的凭据错误都缓存；网络抖动类错误不缓存，便于重试。
        if (result.ok || result.code === 'auth-failed' || result.code === 'no-credential') {
            cache.set(entry.id, { at: now, result });
        }
        return result;
    }));
}
