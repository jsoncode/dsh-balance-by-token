/**
 * dsh-balance-by-token —— 宿主半边：op 分发。
 *
 * HTTP 路由（/dsh-balance/api）与命令通道（dsh-balance）共用同一入口 runOp：
 * providers / balance / cost / pricesGet / pricesSave / keysGet / keysSave。
 * 返回值恒为 OpResult 形状（ok=false 带 code/error），由调用方包信封。
 */
import type { CredentialsService, SettingsScope, SettingsService } from './providers.ts';
import type { SessionLike } from './cost.ts';
import type { ExtraKey, OpRequest, OpResult, PriceConfig } from './types.ts';
/** 宿主 sessions 服务最小视图。 */
export interface SessionsService {
    get(id: string): SessionLike | undefined;
}
/** runOp 的全部依赖（由 index.ts 的 apply 注入）。 */
export interface OpDeps {
    settings?: SettingsService;
    nsOf: (name: string) => unknown;
    scope: SettingsScope | null;
    /** 按请求懒取 credentials 服务：apply 时刻不可用也能在请求时拿到（服务晚启动兜底）。 */
    getCredentials?: () => CredentialsService | undefined;
    sessions?: SessionsService;
}
/** 读取用户附加 key 列表。 */
export declare function readExtraKeys(deps: OpDeps): ExtraKey[];
/** 读取完整价格配置：用户已保存 > 内置默认；旧版扁平档位数组自动迁移。 */
export declare function readPriceConfig(deps: OpDeps): PriceConfig;
/** 读取定时自动刷新间隔（秒，0 = 关闭）。 */
export declare function readAutoSeconds(deps: OpDeps): number;
/**
 * 执行一个 op。
 * @param deps - apply 注入的宿主依赖。
 * @param request - OpRequest（HTTP 与命令通道共用形状）。
 * @returns OpResult 形状载荷（不抛异常；内部错误映射为 ok:false）。
 */
export declare function runOp(deps: OpDeps, request: OpRequest): Promise<OpResult>;
//# sourceMappingURL=ops.d.ts.map