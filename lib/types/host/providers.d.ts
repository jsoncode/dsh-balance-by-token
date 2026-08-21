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
import type { ExtraKey, ProviderEntry } from './types.ts';
/** 官方 DeepSeek API 地址（baseURL 缺省值与过滤参照）。 */
export declare const DEEPSEEK_DEFAULT_BASE_URL = "https://api.deepseek.com";
/** 宿主 settings 服务最小视图。 */
export interface SettingsService {
    get(ns: unknown): unknown;
    register(namespace: unknown, schema: unknown, options?: Record<string, unknown>): unknown;
}
/** 宿主 credentials 服务最小视图。 */
export interface CredentialsService {
    resolve(ref: string): Promise<{
        value: string;
        source?: string;
    } | undefined>;
}
/** settings namespace 注册返回的 owner scope 最小视图。 */
export interface SettingsScope {
    get(): Record<string, unknown>;
    update(value: Record<string, unknown>): Promise<void> | void;
}
/** 脱敏一个 API key：保留头 5 与尾 4，过短全掩。 */
export declare function maskApiKey(key: string): string;
/** 解析一个凭据引用：返回真实 key 及其来源层；未配置 / 服务缺失 / 异常返回 undefined。 */
export declare function resolveApiKey(credentials: CredentialsService | undefined, apiKeyEnv: string | undefined): Promise<{
    value: string;
    source?: string;
} | undefined>;
/**
 * 枚举全部 providers 路由 → baseURL 映射（含非 deepseek 路由与官方 llm-deepseek
 * 段），供费用统计按「接口域名为官方地址」判定并过滤非官方请求的 token。
 * @param settings - 宿主 settings 服务（可能缺失）。
 * @param nsOf - namespace 品牌化函数（settingsNamespace）。
 * @returns provider key -> baseURL。
 */
export declare function listProviderBaseUrls(settings: SettingsService | undefined, nsOf: (name: string) => unknown): Record<string, string>;
/**
 * 枚举全部 DeepSeek 服务商条目（含 key 解析）。
 * @param settings - 宿主 settings 服务（可能缺失）。
 * @param nsOf - namespace 品牌化函数（settingsNamespace）。
 * @param credentials - 宿主 credentials 服务（可能缺失）。
 * @param extraKeys - 插件 settings 段的附加 key 列表。
 * @returns 去重后的服务商列表。
 */
export declare function listDeepseekProviders(settings: SettingsService | undefined, nsOf: (name: string) => unknown, credentials: CredentialsService | undefined, extraKeys: readonly ExtraKey[]): Promise<ProviderEntry[]>;
//# sourceMappingURL=providers.d.ts.map