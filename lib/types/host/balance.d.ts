/**
 * dsh-balance-by-token —— 宿主半边：官方余额接口查询。
 *
 * GET https://api.deepseek.com/user/balance（Authorization: Bearer <key>），
 * 返回 { is_available, balance_infos: [{ currency, total_balance, granted_balance, topped_out }] }。
 * 结果按服务商缓存 60 秒，手动刷新（refresh=true）绕过缓存。
 */
import type { ProviderBalance, ProviderEntry } from './types.ts';
/**
 * 批量查询余额（并行）。
 * @param entries - 服务商列表。
 * @param refresh - true 绕过 60s 缓存。
 * @returns 与 entries 等长的结果数组。
 */
export declare function queryBalances(entries: readonly ProviderEntry[], refresh: boolean): Promise<ProviderBalance[]>;
//# sourceMappingURL=balance.d.ts.map