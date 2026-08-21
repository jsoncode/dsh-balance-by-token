/**
 * dsh-balance-by-token —— 宿主半边：共享类型。
 */

/** 计费四桶（与官方 tokenUsage 投影的桶一一对应）。 */
export interface UsageBuckets {
  /** 缓存未命中的输入 tokens（usage.inputTokens）。 */
  uncachedInput: number
  /** 缓存命中读 tokens（usage.cacheReadTokens）。 */
  cacheRead: number
  /** 缓存写入 tokens（usage.cacheWriteTokens）。 */
  cacheWrite: number
  /** 输出 tokens（usage.outputTokens）。 */
  output: number
}

/**
 * 一个时间段（高峰 / 空闲）的四项单价：每百万 tokens（CNY）。
 * 与官方计价口径一致：输入区分缓存命中与未命中，缓存写入恒为 0。
 */
export interface PricePeriodPrices {
  /** 缓存未命中的输入单价。 */
  input: number
  /** 缓存命中读单价。 */
  cacheRead: number
  /** 缓存写入单价（DeepSeek 官方为 0）。 */
  cacheWrite: number
  /** 输出单价。 */
  output: number
}

/**
 * 一档价格配置：同一模型在高峰与空闲两个时段各有一套单价。
 * `match` 为模型匹配串：精确模型 id > 模型 id 前缀 > `*` 通配兜底。
 */
export interface PriceTier {
  id: string
  name: string
  currency: string
  match: string
  /** 高峰时段单价（每百万 tokens）。 */
  peak: PricePeriodPrices
  /** 空闲时段单价（每百万 tokens）。 */
  offPeak: PricePeriodPrices
}

/** 一个高峰时段窗口：`HH:MM`，按配置的时区偏移解释。 */
export interface TimeWindow {
  start: string
  end: string
}

/**
 * 完整价格配置：价格档列表 + 高峰时段窗口（其余时间为空闲时段）。
 * 官方口径：高峰时段为北京时间 9:00–12:00、14:00–18:00（其余为空闲时段）。
 */
export interface PriceConfig {
  tiers: PriceTier[]
  /** 高峰时段窗口所依据的时区偏移（分钟；北京 UTC+8 = 480）。 */
  timezoneOffsetMinutes: number
  peakWindows: TimeWindow[]
}

/** 用户手动附加的 API key（不在 dsh providers 配置中的）。 */
export interface ExtraKey {
  id: string
  label: string
  apiKey: string
}

/** 一个可查余额的 DeepSeek 服务商条目。 */
export interface ProviderEntry {
  id: string
  label: string
  baseUrl: string
  /** 来源：llm-pi-ai providers / llm-deepseek 官方路由 / 插件附加 key。 */
  source: 'llm-pi-ai' | 'llm-deepseek' | 'extra'
  /** 凭据引用（env 名）；extra 来源无。 */
  apiKeyEnv?: string
  /** 解析出的真实 key（仅内部使用，不出宿主）。 */
  apiKey?: string
  /** 脱敏展示用。 */
  apiKeyMasked: string
  hasKey: boolean
  /** 凭据来源层（env / file / project-env / user-env）；未配置时缺省。 */
  keySource?: string
}

/** 官方 /user/balance 的一个币种条目。 */
export interface BalanceInfo {
  currency: string
  total_balance: string
  granted_balance: string
  topped_out: boolean
}

/** 单个服务商的余额查询结果。 */
export interface ProviderBalance {
  providerId: string
  ok: boolean
  error?: string
  code?: string
  is_available?: boolean
  balance_infos?: BalanceInfo[]
}

/** 一项费用统计（金额 + 桶明细 + 生效档位摘要）。 */
export interface CostEntry {
  /** 金额（仅 DeepSeek 官方 api.deepseek.com 请求计费）；无用量时为 0。 */
  amount: number
  currency: string
  /** 全量 token 用量（官方 + 所有非官方服务商，仅统计数量）。 */
  buckets: UsageBuckets
  /** DeepSeek 官方（api.deepseek.com）用量四桶。 */
  official: UsageBuckets
  /** 非官方服务商列表（可能多条）：每个服务商一组四桶，各自展示、互不合并。 */
  nonOfficialByProvider: Array<{ provider: string; buckets: UsageBuckets }>
}

/** cost op 的返回载荷。 */
export interface CostResult {
  lastTurn: CostEntry
  session: CostEntry
  todayProject: CostEntry
  todayAll: CostEntry
  /** 当前会话命中的价格档（展示用）。 */
  sessionTier?: string
}

/** /dsh-balance/api 请求体（HTTP 与命令通道共用）。 */
export interface OpRequest {
  op: 'providers' | 'balance' | 'cost' | 'pricesGet' | 'pricesSave' | 'keysGet' | 'keysSave' | 'autoRefreshGet' | 'autoRefreshSave' | ''
  sessionId?: string
  /** balance：绕过 60s 缓存。 */
  refresh?: boolean
  /** pricesSave：完整价格配置（档位 + 高峰时段窗口）。 */
  config?: PriceConfig
  /** keysSave：完整附加 key 列表。 */
  keys?: ExtraKey[]
  /** autoRefreshSave：定时自动刷新间隔（秒，0 = 关闭）。 */
  seconds?: number
}

/** op 载荷统一形状：ok=false 时带 code/error。 */
export interface OpResult {
  ok: boolean
  code?: string
  error?: string
  [key: string]: unknown
}
