/**
 * dsh-balance-by-token —— 宿主半边：费用计算。
 *
 * 两条数据链：
 * 1. 内存会话（ctx.sessions.get）：遍历 session.events，复刻官方 tokenUsage
 *    投影的折叠语义 —— 'assistant/chunk'(chunk.type==='usage') 提供早期样本，
 *    'assistant/message' 提供同一 (turn,step) 的最终样本，后值覆盖前值，
 *    不重复计费；'request/context' 追踪当前模型与服务商用于匹配价格档。
 * 2. 今日磁盘聚合：扫描 dshHomePath('sessions')/<project>/<sessionId>/
 *    session.jsonl(.zstd)，mtime >= 今日零点粗筛 → zstd 解压（整包优先、
 *    多帧按魔数切分兜底）→ 首行 header 取 cwd → 只取 'assistant/message'
 *    且 time >= 今日零点的事件 → 按 (文件路径,mtime,size,今日零点) 记忆化。
 *
 * 按 API key（服务商条目）分组统计：每个 provider（会话事件中的服务商路由，
 * 对应一个 API key）各自累计 token 四桶 —— 不区分官方与否，一律只统计数量；
 * 费用只对官方 key（baseURL 域名 == api.deepseek.com）按 模型 × 高峰/空闲时段
 * 计费，非官方 key 金额恒为 0（展示为「不计费」）。
 *
 * 计费口径（每百万 tokens 单价）：时段判定：事件时间 → 配置时区偏移后的本地
 * HH:MM → 是否落在任一高峰窗口；其余时间为空闲时段。同一模型两套单价分别用于
 * 对应时段。(uncachedInput*input + cacheRead*cacheRead + cacheWrite*cacheWrite
 * + output*output) / 1e6
 */
import type { CostResult, PriceConfig, PricePeriodPrices, PriceTier, TimeWindow } from './types.ts';
/** 默认时区偏移：北京时间 UTC+8（分钟）。 */
export declare const DEFAULT_TIMEZONE_OFFSET_MINUTES = 480;
/** 默认高峰时段窗口（官方口径：北京时间 9:00–12:00、14:00–18:00；其余为空闲）。 */
export declare const DEFAULT_PEAK_WINDOWS: readonly TimeWindow[];
/**
 * 内置默认价格档（DeepSeek 官方指导价，CNY / 每百万 tokens；2026 现行 V4 系列）。
 * 与官方价目表一致：仅三档模型，名称用官方模型版本号；无「兜底」档。
 * 高峰：北京时间 9:00–12:00、14:00–18:00；空闲 = 高峰 × 0.5。
 */
export declare const DEFAULT_PRICES: PriceTier[];
/** 内置默认完整价格配置。 */
export declare const DEFAULT_PRICE_CONFIG: PriceConfig;
/** 会话事件的最小读取视图（结构化声明，不依赖完整类型链）。 */
export interface SessionLike {
    events?: readonly SessionEventLike[];
    header?: {
        cwd?: string;
    };
}
export interface SessionEventLike {
    type: string;
    time?: number;
    data?: {
        turn?: number;
        step?: number;
        usage?: UsageLike;
        model?: string;
        /** 该请求实际走的服务商（request/context 的 provider，如 deepseek-official）。 */
        provider?: string;
        chunk?: {
            type?: string;
            usage?: UsageLike;
        };
    };
}
interface UsageLike {
    inputTokens?: number;
    outputTokens?: number;
    cacheReadTokens?: number;
    cacheWriteTokens?: number;
}
/** DeepSeek 官方接口域名（判断是否官方服务商的唯一标准）。 */
export declare const OFFICIAL_API_HOST = "api.deepseek.com";
/**
 * 判定一个 provider（会话事件中的服务商 key，如 deepseek-official / openrouter）
 * 是否走 DeepSeek 官方接口：provider 的 baseURL 域名必须为 api.deepseek.com。
 * provider 缺失或未在配置中登记 → 非官方，过滤。
 */
export declare function isOfficialProvider(provider: string | undefined, providerBaseUrls: Record<string, string>): boolean;
/**
 * 把任意存储值规范化为 PriceConfig：
 * - 新版对象 { tiers, timezoneOffsetMinutes?, peakWindows? }；
 * - 旧版扁平数组（迁移：单一时段单价 → 高峰/空闲同价，窗口用默认值）；
 * - 旧版内置默认档（deepseek-chat / deepseek-reasoner / 兜底）→ 直接升级为当前官方三档；
 * - 其它（缺失/非法）→ 默认配置。
 */
export declare function normalizePriceConfig(raw: unknown): PriceConfig;
/**
 * 判定一个时刻是否处于高峰时段。
 * @param timeMs - 事件时间（ms）。
 * @param config - 价格配置（含时区偏移与高峰窗口）。
 */
export declare function isPeakTime(timeMs: number, config: PriceConfig): boolean;
/** 取某档在指定时刻生效的单价集合。 */
export declare function periodPricesOf(tier: PriceTier, timeMs: number, config: PriceConfig): PricePeriodPrices;
/**
 * 价格档匹配：精确模型 id > 模型 id 前缀 > '*' 通配兜底。
 * @param model - 当前模型 id（可为空）。
 * @param prices - 价格档列表（空列表返回 undefined）。
 */
export declare function matchTier(model: string | undefined, prices: readonly PriceTier[]): PriceTier | undefined;
/**
 * 计算一个内存会话的四项费用（最近一次提问 / 本会话 / 今日·本项目 / 今日·全部）。
 * @param session - 当前会话（可能为 undefined：实时两项归零）。
 * @param config - 完整价格配置。
 * @param currentCwd - 「本项目」判定的 cwd（缺省 process.cwd()）。
 */
export declare function computeCosts(session: SessionLike | undefined, config: PriceConfig, currentCwd: string, providerBaseUrls?: Record<string, string>): Promise<CostResult>;
export {};
//# sourceMappingURL=cost.d.ts.map