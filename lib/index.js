import Schema from "@deepseek-ai/schemastery";
import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { zstdDecompressSync } from "node:zlib";
import { dshHomePath } from "@deepseek-ai/dsh-home-paths";
//#region src/host/fence.ts
/** 规范化后的 URL hostname 是否指向本地回环（localhost / 127.0.0.0/8 / [::1]）。 */
function isLoopbackHostname(hostname) {
	if (hostname === "localhost" || hostname === "[::1]") return true;
	const parts = hostname.split(".");
	return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}
/** 规范化一个 Host 头 authority 为 URL，解析失败返回 undefined。 */
function parseAuthority(authority) {
	try {
		return new URL(`http://${authority}`);
	} catch {
		return;
	}
}
/** 规范化 authority 形式：hostname，或带端口的 hostname:port。 */
function canonicalAuthority(entry, entryUrl) {
	const port = entryUrl.port !== "" ? entryUrl.port : new URL(`https://${entry}`).port;
	return port === "" ? entryUrl.hostname : `${entryUrl.hostname}:${port}`;
}
/** 请求 authority 是否匹配 trustedHosts 中的一项（精确或省略端口）。 */
function isTrustedAuthority(hostUrl, trustedHosts) {
	return trustedHosts.some((entry) => {
		const entryUrl = parseAuthority(entry);
		if (entryUrl === void 0) return false;
		return canonicalAuthority(entry, entryUrl) === entryUrl.hostname ? entryUrl.hostname === hostUrl.hostname : entryUrl.host === hostUrl.host;
	});
}
/**
* 判定一次 /dsh-balance/api 请求是否可放行。
* @param headers - node HTTP 请求头。
* @param trustedHosts - 部署的非回环受信任主机（webRuntime.trustedHosts，可为空）。
* @returns true 表示 Host 是自有（回环或受信任）且浏览器标记为同源。
*/
function isTrustedApiRequest(headers, trustedHosts) {
	const raw = headers.host;
	if (typeof raw !== "string" || raw === "") return false;
	const hostUrl = parseAuthority(raw);
	if (hostUrl === void 0) return false;
	if (!isLoopbackHostname(hostUrl.hostname) && !isTrustedAuthority(hostUrl, trustedHosts)) return false;
	if (headers["sec-fetch-site"] === "cross-site") return false;
	const origin = headers.origin;
	if (typeof origin !== "string" || origin === "") return true;
	try {
		return new URL(origin).host === hostUrl.host;
	} catch {
		return false;
	}
}
//#endregion
//#region src/host/providers.ts
/** 官方 DeepSeek API 地址（baseURL 缺省值与过滤参照）。 */
const DEEPSEEK_DEFAULT_BASE_URL = "https://api.deepseek.com";
/** 脱敏一个 API key：保留头 5 与尾 4，过短全掩。 */
function maskApiKey(key) {
	const k = String(key || "").trim();
	if (k.length === 0) return "";
	if (k.length <= 10) return k.slice(0, 2) + "****";
	return k.slice(0, 5) + "…" + k.slice(-4);
}
/** baseURL / 路由 key 是否指向 DeepSeek。 */
function isDeepseekRoute(routeKey, baseUrl) {
	if (routeKey.toLowerCase().includes("deepseek")) return true;
	if (baseUrl === void 0) return false;
	return baseUrl.toLowerCase().includes("deepseek");
}
/** 解析一个凭据引用：返回真实 key 及其来源层；未配置 / 服务缺失 / 异常返回 undefined。 */
async function resolveApiKey(credentials, apiKeyEnv) {
	if (credentials === void 0 || apiKeyEnv === void 0 || apiKeyEnv === "") return void 0;
	try {
		const resolved = await credentials.resolve(apiKeyEnv);
		const value = resolved?.value;
		return typeof value === "string" && value.length > 0 ? {
			value,
			...typeof resolved?.source === "string" ? { source: resolved.source } : {}
		} : void 0;
	} catch {
		return;
	}
}
/**
* 枚举全部 providers 路由 → baseURL 映射（含非 deepseek 路由与官方 llm-deepseek
* 段），供费用统计按「接口域名为官方地址」判定并过滤非官方请求的 token。
* @param settings - 宿主 settings 服务（可能缺失）。
* @param nsOf - namespace 品牌化函数（settingsNamespace）。
* @returns provider key -> baseURL。
*/
function listProviderBaseUrls(settings, nsOf) {
	const map = {};
	const providers = (settings?.get(nsOf("llm-pi-ai")))?.providers;
	if (providers !== void 0 && providers !== null && typeof providers === "object") for (const [route, section] of Object.entries(providers)) {
		if (section === void 0 || section === null || typeof section !== "object") continue;
		if (typeof section.baseURL === "string" && section.baseURL.length > 0) map[route] = section.baseURL;
	}
	const deepseek = settings?.get(nsOf("llm-deepseek"));
	if (deepseek !== void 0 && deepseek !== null && typeof deepseek === "object") map["deepseek-official"] = deepseek.baseURL ?? "https://api.deepseek.com";
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
async function listDeepseekProviders(settings, nsOf, credentials, extraKeys) {
	const entries = [];
	const seen = /* @__PURE__ */ new Set();
	const providers = (settings?.get(nsOf("llm-pi-ai")))?.providers;
	if (providers !== void 0 && providers !== null && typeof providers === "object") for (const [route, section] of Object.entries(providers)) {
		if (section === void 0 || section === null || typeof section !== "object") continue;
		if (!isDeepseekRoute(route, section.baseURL)) continue;
		const apiKeyEnv = typeof section.apiKeyEnv === "string" && section.apiKeyEnv.length > 0 ? section.apiKeyEnv : void 0;
		const resolved = await resolveApiKey(credentials, apiKeyEnv);
		const apiKey = resolved?.value;
		entries.push({
			id: `pi-ai:${route}`,
			label: section.displayName ?? route,
			baseUrl: section.baseURL ?? "https://api.deepseek.com",
			source: "llm-pi-ai",
			...apiKeyEnv === void 0 ? {} : { apiKeyEnv },
			...apiKey === void 0 ? {} : { apiKey },
			apiKeyMasked: apiKey === void 0 ? "" : maskApiKey(apiKey),
			hasKey: apiKey !== void 0,
			...apiKey !== void 0 && resolved?.source !== void 0 ? { keySource: resolved.source } : {}
		});
		seen.add(route);
	}
	const deepseek = settings?.get(nsOf("llm-deepseek"));
	if (deepseek !== void 0 && deepseek !== null && typeof deepseek === "object" && !seen.has("deepseek-official")) {
		const apiKeyEnv = typeof deepseek.apiKeyEnv === "string" && deepseek.apiKeyEnv.length > 0 ? deepseek.apiKeyEnv : "DEEPSEEK_API_KEY";
		const resolved = await resolveApiKey(credentials, apiKeyEnv);
		const apiKey = resolved?.value;
		entries.push({
			id: "llm-deepseek:deepseek-official",
			label: "deepseek-official",
			baseUrl: deepseek.baseURL ?? "https://api.deepseek.com",
			source: "llm-deepseek",
			apiKeyEnv,
			...apiKey === void 0 ? {} : { apiKey },
			apiKeyMasked: apiKey === void 0 ? "" : maskApiKey(apiKey),
			hasKey: apiKey !== void 0,
			...apiKey !== void 0 && resolved?.source !== void 0 ? { keySource: resolved.source } : {}
		});
	}
	for (const extra of extraKeys) {
		const key = String(extra.apiKey || "").trim();
		entries.push({
			id: `extra:${extra.id}`,
			label: extra.label || extra.id,
			baseUrl: DEEPSEEK_DEFAULT_BASE_URL,
			source: "extra",
			...key.length > 0 ? { apiKey: key } : {},
			apiKeyMasked: maskApiKey(key),
			hasKey: key.length > 0
		});
	}
	return entries;
}
//#endregion
//#region src/host/balance.ts
/** 单次余额请求超时（毫秒）。 */
const BALANCE_TIMEOUT_MS = 1e4;
/** 缓存存活时间（毫秒）。 */
const CACHE_TTL_MS = 6e4;
const cache = /* @__PURE__ */ new Map();
/** 规范化响应：余额字段一律转字符串（官方为字符串数字）。 */
function normalizeBalance(providerId, body) {
	const infos = Array.isArray(body.balance_infos) ? body.balance_infos : [];
	return {
		providerId,
		ok: true,
		is_available: body.is_available === true,
		balance_infos: infos.map((info) => ({
			currency: typeof info.currency === "string" ? info.currency : "CNY",
			total_balance: String(info.total_balance ?? "0"),
			granted_balance: String(info.granted_balance ?? "0"),
			topped_out: info.topped_out === true
		}))
	};
}
/** 查询一个服务商的余额（带超时）。 */
async function fetchOne(entry) {
	if (entry.apiKey === void 0 || entry.apiKey.length === 0) return {
		providerId: entry.id,
		ok: false,
		code: "no-credential",
		error: "no credential configured"
	};
	const url = "https://api.deepseek.com/user/balance";
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), BALANCE_TIMEOUT_MS);
	try {
		const response = await fetch(url, {
			method: "GET",
			headers: {
				authorization: `Bearer ${entry.apiKey}`,
				accept: "application/json"
			},
			signal: controller.signal
		});
		if (response.status === 401 || response.status === 403) return {
			providerId: entry.id,
			ok: false,
			code: "auth-failed",
			error: `HTTP ${response.status}`
		};
		if (!response.ok) return {
			providerId: entry.id,
			ok: false,
			code: "http-error",
			error: `HTTP ${response.status}`
		};
		const body = await response.json();
		return normalizeBalance(entry.id, body);
	} catch (e) {
		const aborted = e instanceof Error && e.name === "AbortError";
		return {
			providerId: entry.id,
			ok: false,
			code: aborted ? "timeout" : "network-failed",
			error: e instanceof Error ? e.message : String(e)
		};
	} finally {
		clearTimeout(timer);
	}
}
/**
* 批量查询余额（并行）。
* @param entries - 服务商列表。
* @param refresh - true 绕过 60s 缓存。
* @returns 与 entries 等长的结果数组。
*/
async function queryBalances(entries, refresh) {
	const now = Date.now();
	return Promise.all(entries.map(async (entry) => {
		if (!refresh) {
			const cached = cache.get(entry.id);
			if (cached !== void 0 && now - cached.at < CACHE_TTL_MS) return cached.result;
		}
		const result = await fetchOne(entry);
		if (result.ok || result.code === "auth-failed" || result.code === "no-credential") cache.set(entry.id, {
			at: now,
			result
		});
		return result;
	}));
}
/** 默认高峰时段窗口（官方口径：北京时间 9:00–12:00、14:00–18:00；其余为空闲）。 */
const DEFAULT_PEAK_WINDOWS = [{
	start: "09:00",
	end: "12:00"
}, {
	start: "14:00",
	end: "18:00"
}];
/** 内置默认完整价格配置。 */
const DEFAULT_PRICE_CONFIG = {
	tiers: [
		{
			id: "deepseek-v4-flash",
			name: "deepseek-v4-flash",
			currency: "CNY",
			match: "deepseek-v4-flash",
			peak: {
				input: 3,
				cacheRead: .1,
				cacheWrite: 0,
				output: 9
			},
			offPeak: {
				input: 1.5,
				cacheRead: .05,
				cacheWrite: 0,
				output: 4.5
			}
		},
		{
			id: "deepseek-v4-pro",
			name: "deepseek-v4-pro",
			currency: "CNY",
			match: "deepseek-v4-pro",
			peak: {
				input: 9,
				cacheRead: .3,
				cacheWrite: 0,
				output: 27
			},
			offPeak: {
				input: 4.5,
				cacheRead: .15,
				cacheWrite: 0,
				output: 13.5
			}
		},
		{
			id: "deepseek-v4-flash-vision-exp",
			name: "deepseek-v4-flash-vision-exp",
			currency: "CNY",
			match: "deepseek-v4-flash-vision-exp",
			peak: {
				input: 3,
				cacheRead: .1,
				cacheWrite: 0,
				output: 9
			},
			offPeak: {
				input: 1.5,
				cacheRead: .05,
				cacheWrite: 0,
				output: 4.5
			}
		}
	].map((tier) => ({
		...tier,
		peak: { ...tier.peak },
		offPeak: { ...tier.offPeak }
	})),
	timezoneOffsetMinutes: 480,
	peakWindows: DEFAULT_PEAK_WINDOWS.map((w) => ({ ...w }))
};
const zeroBuckets = () => ({
	uncachedInput: 0,
	cacheRead: 0,
	cacheWrite: 0,
	output: 0
});
const numberOr = (v, fallback = 0) => typeof v === "number" && Number.isFinite(v) ? v : fallback;
/** 金额保留 6 位小数（与 token 单价的每百万口径精度匹配）。 */
const round6 = (v) => Math.round(v * 1e6) / 1e6;
/** usage -> 四桶（与官方 bucketsFrom 一致：cacheRead/cacheWrite 缺省 0）。 */
function bucketsFrom(usage) {
	return {
		uncachedInput: numberOr(usage.inputTokens),
		cacheRead: numberOr(usage.cacheReadTokens),
		cacheWrite: numberOr(usage.cacheWriteTokens),
		output: numberOr(usage.outputTokens)
	};
}
function addBuckets(target, next) {
	target.uncachedInput += next.uncachedInput;
	target.cacheRead += next.cacheRead;
	target.cacheWrite += next.cacheWrite;
	target.output += next.output;
}
const numberOrZero = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0;
function normalizePeriod(raw) {
	const obj = raw !== null && typeof raw === "object" ? raw : {};
	return {
		input: numberOrZero(obj["input"]),
		cacheRead: numberOrZero(obj["cacheRead"]),
		cacheWrite: numberOrZero(obj["cacheWrite"]),
		output: numberOrZero(obj["output"])
	};
}
/** 规范化一个档位：新版（peak/offPeak）原样；旧版扁平单价迁移为 高峰=原价、空闲=原价（行为不变）。 */
function normalizeTier(raw, index) {
	const obj = raw !== null && typeof raw === "object" ? raw : {};
	const hasPeriods = obj["peak"] !== void 0 && obj["offPeak"] !== void 0;
	const peak = normalizePeriod(hasPeriods ? obj["peak"] : raw);
	const offPeak = normalizePeriod(hasPeriods ? obj["offPeak"] : raw);
	const id = typeof obj["id"] === "string" && obj["id"].length > 0 ? obj["id"] : "tier-" + index;
	return {
		id,
		name: typeof obj["name"] === "string" ? obj["name"] : id,
		currency: typeof obj["currency"] === "string" && obj["currency"].length > 0 ? obj["currency"] : "CNY",
		match: typeof obj["match"] === "string" && obj["match"].length > 0 ? obj["match"] : "*",
		peak,
		offPeak
	};
}
/** 解析 'HH:MM' 为当日分钟数；非法返回 undefined。 */
function parseClock(value) {
	const m = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());
	if (m === null) return void 0;
	const h = Number(m[1]);
	const min = Number(m[2]);
	if (h < 0 || h > 23 || min < 0 || min > 59) return void 0;
	return h * 60 + min;
}
/** DeepSeek 官方接口域名（判断是否官方服务商的唯一标准）。 */
const OFFICIAL_API_HOST = "api.deepseek.com";
/**
* 判定一个 provider（会话事件中的服务商 key，如 deepseek-official / openrouter）
* 是否走 DeepSeek 官方接口：provider 的 baseURL 域名必须为 api.deepseek.com。
* provider 缺失或未在配置中登记 → 非官方，过滤。
*/
function isOfficialProvider(provider, providerBaseUrls) {
	if (typeof provider !== "string" || provider.length === 0) return false;
	const baseUrl = providerBaseUrls[provider];
	if (typeof baseUrl !== "string" || baseUrl.length === 0) return false;
	try {
		return new URL(baseUrl).hostname.toLowerCase() === OFFICIAL_API_HOST;
	} catch {
		return false;
	}
}
/** 旧版本内置默认档的三档 id（deepseek-chat / deepseek-reasoner / 兜底）。 */
const LEGACY_DEFAULT_TIER_IDS = /* @__PURE__ */ new Set([
	"deepseek-chat",
	"deepseek-reasoner",
	"fallback"
]);
/** 是否恰好是旧版本内置默认档（未自定义过的旧配置）。 */
function isLegacyDefaultTiers(tiers) {
	return tiers.length === 3 && tiers.every((t) => LEGACY_DEFAULT_TIER_IDS.has(t.id));
}
/**
* 把任意存储值规范化为 PriceConfig：
* - 新版对象 { tiers, timezoneOffsetMinutes?, peakWindows? }；
* - 旧版扁平数组（迁移：单一时段单价 → 高峰/空闲同价，窗口用默认值）；
* - 旧版内置默认档（deepseek-chat / deepseek-reasoner / 兜底）→ 直接升级为当前官方三档；
* - 其它（缺失/非法）→ 默认配置。
*/
function normalizePriceConfig(raw) {
	const fallback = () => JSON.parse(JSON.stringify(DEFAULT_PRICE_CONFIG));
	if (Array.isArray(raw)) {
		const tiers = raw.map((item, index) => normalizeTier(item, index));
		if (tiers.length === 0) return fallback();
		if (isLegacyDefaultTiers(tiers)) return fallback();
		return {
			...fallback(),
			tiers
		};
	}
	if (raw !== null && typeof raw === "object") {
		const obj = raw;
		const tiersRaw = obj["tiers"];
		if (!Array.isArray(tiersRaw) || tiersRaw.length === 0) return fallback();
		const tiers = tiersRaw.map((item, index) => normalizeTier(item, index));
		if (isLegacyDefaultTiers(tiers)) return fallback();
		const offset = numberOr(obj["timezoneOffsetMinutes"], 480);
		const windowsRaw = obj["peakWindows"];
		const windows = Array.isArray(windowsRaw) && windowsRaw.length > 0 ? windowsRaw.map((w) => {
			const o = w !== null && typeof w === "object" ? w : {};
			const start = typeof o["start"] === "string" ? o["start"] : "";
			const end = typeof o["end"] === "string" ? o["end"] : "";
			return parseClock(start) !== void 0 && parseClock(end) !== void 0 ? {
				start,
				end
			} : void 0;
		}).filter((w) => w !== void 0) : [];
		return {
			tiers,
			timezoneOffsetMinutes: Math.round(offset),
			peakWindows: windows.length > 0 ? windows : DEFAULT_PEAK_WINDOWS.map((w) => ({ ...w }))
		};
	}
	return fallback();
}
/**
* 判定一个时刻是否处于高峰时段。
* @param timeMs - 事件时间（ms）。
* @param config - 价格配置（含时区偏移与高峰窗口）。
*/
function isPeakTime(timeMs, config) {
	const local = new Date(timeMs + config.timezoneOffsetMinutes * 6e4);
	const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
	for (const window of config.peakWindows) {
		const start = parseClock(window.start);
		const end = parseClock(window.end);
		if (start === void 0 || end === void 0) continue;
		if (start <= end) {
			if (minutes >= start && minutes < end) return true;
		} else if (minutes >= start || minutes < end) return true;
	}
	return false;
}
/** 取某档在指定时刻生效的单价集合。 */
function periodPricesOf(tier, timeMs, config) {
	return isPeakTime(timeMs, config) ? tier.peak : tier.offPeak;
}
/**
* 价格档匹配：精确模型 id > 模型 id 前缀 > '*' 通配兜底。
* @param model - 当前模型 id（可为空）。
* @param prices - 价格档列表（空列表返回 undefined）。
*/
function matchTier(model, prices) {
	if (prices.length === 0) return void 0;
	const m = model ?? "";
	if (m.length > 0) {
		const exact = prices.find((t) => t.match === m);
		if (exact !== void 0) return exact;
		const prefix = prices.find((t) => t.match !== "*" && t.match.length > 0 && m.startsWith(t.match));
		if (prefix !== void 0) return prefix;
	}
	return prices.find((t) => t.match === "*") ?? prices[0];
}
/** 按一组单价计费（每百万 tokens 单价）。 */
function costOf(buckets, period) {
	if (period === void 0) return 0;
	return (buckets.uncachedInput * period.input + buckets.cacheRead * period.cacheRead + buckets.cacheWrite * period.cacheWrite + buckets.output * period.output) / 1e6;
}
/** 一个桶的总 token 数（四桶之和）。 */
function totalTokens(buckets) {
	return buckets.uncachedInput + buckets.cacheRead + buckets.cacheWrite + buckets.output;
}
/**
* 把 per-key 分组折算成 CostEntry：
* token 合计（所有 key，不区分官方与否）+ 计费金额合计（仅官方 key）。
* 全零分组剔除；byKey 按 token 总数降序。
*/
function assembleEntry(groups) {
	const buckets = zeroBuckets();
	let amount = 0;
	let currency = "CNY";
	const byKey = [];
	for (const group of groups) {
		if (totalTokens(group.buckets) <= 0) continue;
		addBuckets(buckets, group.buckets);
		byKey.push({
			provider: group.provider,
			buckets: { ...group.buckets },
			official: group.official,
			amount: group.amount,
			currency: group.currency
		});
		if (group.official) {
			amount += group.amount;
			if (group.currency !== "") currency = group.currency;
		}
	}
	byKey.sort((a, b) => totalTokens(b.buckets) - totalTokens(a.buckets));
	return {
		amount: round6(amount),
		currency,
		buckets,
		byKey
	};
}
/**
* 折叠内存会话事件为 per-(turn,step) 样本表（官方投影语义：后值覆盖前值）。
* 同时追踪每个样本所属模型与服务商（取样本之前最近一次 request/context）与时间。
*/
function foldSessionEvents(events) {
	const samples = /* @__PURE__ */ new Map();
	let currentModel;
	let currentProvider;
	let maxTurn = -1;
	for (const event of events) {
		const data = event.data;
		if (data === void 0) continue;
		if (event.type === "request/context") {
			if (typeof data.model === "string" && data.model.length > 0) currentModel = data.model;
			if (typeof data.provider === "string" && data.provider.length > 0) currentProvider = data.provider;
			continue;
		}
		let usage;
		if (event.type === "assistant/chunk" && data.chunk?.type === "usage") usage = data.chunk.usage;
		else if (event.type === "assistant/message") usage = data.usage;
		if (usage === void 0) continue;
		const turn = numberOr(data.turn);
		const step = numberOr(data.step);
		samples.set(turn + ":" + step, {
			turn,
			buckets: bucketsFrom(usage),
			...currentModel === void 0 ? {} : { model: currentModel },
			...currentProvider === void 0 ? {} : { provider: currentProvider },
			...typeof event.time === "number" && Number.isFinite(event.time) ? { time: event.time } : {}
		});
		if (turn > maxTurn) maxTurn = turn;
	}
	return {
		samples,
		maxTurn
	};
}
/**
* 对一组样本按 API key（provider）分组统计：全部 token 分别累计（不区分官方与否）；
* 官方 key（api.deepseek.com）额外按模型 × 时段计费，非官方金额恒为 0。
*/
function priceSamples(samples, prices, config, modelOnly, providerBaseUrls) {
	const groups = /* @__PURE__ */ new Map();
	for (const sample of samples) {
		const key = typeof sample.provider === "string" && sample.provider.length > 0 ? sample.provider : "unknown";
		let group = groups.get(key);
		if (group === void 0) {
			group = {
				buckets: zeroBuckets(),
				official: isOfficialProvider(sample.provider, providerBaseUrls),
				amount: 0,
				currency: ""
			};
			groups.set(key, group);
		}
		addBuckets(group.buckets, sample.buckets);
		if (group.official) {
			const tier = matchTier(modelOnly !== void 0 ? modelOnly : sample.model, prices);
			if (tier !== void 0) group.currency = tier.currency;
			group.amount += costOf(sample.buckets, tier === void 0 ? void 0 : periodPricesOf(tier, sample.time ?? Date.now(), config));
		}
	}
	return { byKey: [...groups.entries()].map(([provider, g]) => ({
		provider,
		buckets: { ...g.buckets },
		official: g.official,
		amount: round6(g.amount),
		currency: g.currency
	})) };
}
/**
* 计算一个内存会话的四项费用（最近一次提问 / 本会话 / 今日·本项目 / 今日·全部）。
* @param session - 当前会话（可能为 undefined：实时两项归零）。
* @param config - 完整价格配置。
* @param currentCwd - 「本项目」判定的 cwd（缺省 process.cwd()）。
*/
async function computeCosts(session, config, currentCwd, providerBaseUrls = {}) {
	const { samples, maxTurn } = session?.events !== void 0 ? foldSessionEvents(session.events) : {
		samples: /* @__PURE__ */ new Map(),
		maxTurn: -1
	};
	let sessionModel;
	for (const sample of samples.values()) if (sample.model !== void 0) sessionModel = sample.model;
	const sessionPriced = priceSamples(samples.values(), config.tiers, config, void 0, providerBaseUrls);
	const lastTurnPriced = maxTurn >= 0 ? priceSamples([...samples.values()].filter((s) => s.turn === maxTurn), config.tiers, config, sessionModel, providerBaseUrls) : { byKey: [] };
	const today = await scanToday(currentCwd, config, providerBaseUrls);
	const tier = matchTier(sessionModel, config.tiers);
	return {
		lastTurn: assembleEntry(lastTurnPriced.byKey),
		session: assembleEntry(sessionPriced.byKey),
		todayProject: today.project,
		todayAll: today.all,
		...sessionModel === void 0 ? {} : { sessionTier: sessionModel + " → " + (tier?.name ?? "?") }
	};
}
/** zstd 帧魔数（小端 0xFD2FB528）。 */
const ZSTD_MAGIC = [
	40,
	181,
	47,
	253
];
/** 记忆化缓存：文件内容未变（mtime+size）、同一天、且时段/服务商配置未变时不重复扫描。 */
const todayFileCache = /* @__PURE__ */ new Map();
/**
* 解压一个日志文件：zstd 一律按帧魔数切分逐帧解压（zstdDecompressSync
* 对多帧文件会静默丢弃首帧之后的帧，不能整包直解）；明文直接返回。
*/
function decodeLog(path, isZstd) {
	let raw;
	try {
		raw = readFileSync(path);
	} catch {
		return;
	}
	if (isZstd === false) return raw.toString("utf8");
	const starts = [];
	for (let i = 0; i + 4 <= raw.length; i++) if (raw[i] === ZSTD_MAGIC[0] && raw[i + 1] === ZSTD_MAGIC[1] && raw[i + 2] === ZSTD_MAGIC[2] && raw[i + 3] === ZSTD_MAGIC[3]) starts.push(i);
	if (starts.length < 1) return void 0;
	const parts = [];
	for (let i = 0; i < starts.length; i++) {
		const start = starts[i];
		const end = i + 1 < starts.length ? starts[i + 1] : raw.length;
		try {
			parts.push(zstdDecompressSync(raw.subarray(start, end)));
		} catch {
			return;
		}
	}
	return Buffer.concat(parts).toString("utf8");
}
/**
* 解析一个日志文件中今日的用量（header cwd + assistant/message 桶，
* 按 API key 分组、组内按时段拆分）。所有 key 的 token 都统计数量；
* 官方 key（api.deepseek.com）的用量额外进入 billable 按模型计费。
*/
function parseTodayFile(path, isZstd, todayStart, config, providerBaseUrls) {
	const text = decodeLog(path, isZstd);
	if (text === void 0) return void 0;
	const sample = { byProvider: /* @__PURE__ */ new Map() };
	let currentModel;
	let currentProvider;
	let first = true;
	for (const line of text.split("\n")) {
		const trimmed = line.trim();
		if (trimmed.length === 0) continue;
		let parsed;
		try {
			parsed = JSON.parse(trimmed);
		} catch {
			continue;
		}
		if (first) {
			first = false;
			if (parsed.type === "session" && typeof parsed.cwd === "string") sample.cwd = parsed.cwd;
			continue;
		}
		if (parsed.type === "request/context") {
			const data = parsed.data;
			if (typeof data?.model === "string") currentModel = data.model;
			if (typeof data?.provider === "string") currentProvider = data.provider;
			continue;
		}
		if (parsed.type !== "assistant/message") continue;
		if (typeof parsed.time !== "number" || parsed.time < todayStart) continue;
		const usage = parsed.data?.usage;
		if (usage === void 0) continue;
		const model = currentModel ?? "*";
		const providerKey = typeof currentProvider === "string" && currentProvider.length > 0 ? currentProvider : "unknown";
		let provider = sample.byProvider.get(providerKey);
		if (provider === void 0) {
			provider = {
				peak: zeroBuckets(),
				offPeak: zeroBuckets(),
				billable: /* @__PURE__ */ new Map()
			};
			sample.byProvider.set(providerKey, provider);
		}
		const peak = isPeakTime(parsed.time, config);
		const usageBuckets = bucketsFrom(usage);
		addBuckets(peak ? provider.peak : provider.offPeak, usageBuckets);
		if (isOfficialProvider(currentProvider, providerBaseUrls)) {
			const pair = provider.billable.get(model) ?? {
				peak: zeroBuckets(),
				offPeak: zeroBuckets()
			};
			addBuckets(peak ? pair.peak : pair.offPeak, usageBuckets);
			provider.billable.set(model, pair);
		}
	}
	return sample;
}
/** 判断两个路径是否指向同一目录（大小写不敏感的 Windows 友好比较）。 */
function samePath(a, b) {
	const norm = (p) => p.replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
	return norm(a) === norm(b);
}
/** 今日零点（本地时区）。 */
function todayStartMs() {
	const now = /* @__PURE__ */ new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}
/** 把一个文件的 per-provider 聚合并入目标映射（跨文件合并）。 */
function mergeProviderToday(target, source) {
	for (const [provider, pt] of source) {
		const t = target.get(provider) ?? {
			peak: zeroBuckets(),
			offPeak: zeroBuckets(),
			billable: /* @__PURE__ */ new Map()
		};
		addBuckets(t.peak, pt.peak);
		addBuckets(t.offPeak, pt.offPeak);
		for (const [model, pair] of pt.billable) {
			const b = t.billable.get(model) ?? {
				peak: zeroBuckets(),
				offPeak: zeroBuckets()
			};
			addBuckets(b.peak, pair.peak);
			addBuckets(b.offPeak, pair.offPeak);
			t.billable.set(model, b);
		}
		target.set(provider, t);
	}
}
/**
* 扫描今日全部会话日志，聚合「本项目」与「全部」两项费用。
* @param currentCwd - 当前项目 cwd（与 header.cwd 比对区分本项目）。
* @param config - 完整价格配置。
*/
async function scanToday(currentCwd, config, providerBaseUrls) {
	const empty = {
		project: assembleEntry([]),
		all: assembleEntry([])
	};
	const todayStart = todayStartMs();
	let root;
	try {
		root = dshHomePath("sessions");
	} catch {
		return empty;
	}
	let projects;
	try {
		projects = readdirSync(root);
	} catch {
		return empty;
	}
	const allByProvider = /* @__PURE__ */ new Map();
	const projectByProvider = /* @__PURE__ */ new Map();
	for (const project of projects) {
		const projectDirPath = join(root, project);
		let sessionIds;
		try {
			sessionIds = readdirSync(projectDirPath);
		} catch {
			continue;
		}
		for (const sessionId of sessionIds) {
			const dir = join(projectDirPath, sessionId);
			const candidates = [{
				path: join(dir, "session.jsonl.zstd"),
				zstd: true
			}, {
				path: join(dir, "session.jsonl"),
				zstd: false
			}];
			for (const candidate of candidates) {
				let stat;
				try {
					stat = statSync(candidate.path);
				} catch {
					continue;
				}
				if (stat.mtimeMs < todayStart) continue;
				const cacheKey = candidate.path;
				const configKey = JSON.stringify({
					offset: config.timezoneOffsetMinutes,
					windows: config.peakWindows,
					providers: providerBaseUrls
				});
				const cached = todayFileCache.get(cacheKey);
				let sample;
				if (cached !== void 0 && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size && cached.todayStart === todayStart && cached.configKey === configKey) sample = cached.sample;
				else {
					sample = parseTodayFile(candidate.path, candidate.zstd, todayStart, config, providerBaseUrls);
					if (sample !== void 0) todayFileCache.set(cacheKey, {
						mtimeMs: stat.mtimeMs,
						size: stat.size,
						todayStart,
						configKey,
						sample
					});
				}
				if (sample === void 0) continue;
				const isProject = sample.cwd !== void 0 && samePath(sample.cwd, currentCwd);
				mergeProviderToday(allByProvider, sample.byProvider);
				if (isProject) mergeProviderToday(projectByProvider, sample.byProvider);
				break;
			}
		}
	}
	const assemble = (byProvider) => {
		const groups = [];
		for (const [provider, pt] of byProvider) {
			const buckets = zeroBuckets();
			addBuckets(buckets, pt.peak);
			addBuckets(buckets, pt.offPeak);
			const official = isOfficialProvider(provider, providerBaseUrls);
			let amount = 0;
			let currency = "";
			if (official) {
				const now = Date.now();
				for (const [model, pair] of pt.billable) {
					const tier = matchTier(model === "*" ? void 0 : model, config.tiers);
					if (tier !== void 0) currency = tier.currency;
					amount += costOf(pair.peak, tier === void 0 ? void 0 : periodPricesOf(tier, now, config));
					amount += costOf(pair.offPeak, tier === void 0 ? void 0 : tier.offPeak);
				}
			}
			groups.push({
				provider,
				buckets,
				official,
				amount: round6(amount),
				currency
			});
		}
		return assembleEntry(groups);
	};
	return {
		project: assemble(projectByProvider),
		all: assemble(allByProvider)
	};
}
//#endregion
//#region src/host/ops.ts
function readJson(scope, field, fallback) {
	if (scope === null) return fallback;
	const raw = scope.get()?.[field];
	if (typeof raw !== "string" || raw.length === 0) return fallback;
	try {
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}
async function writeJson(scope, field, value) {
	if (scope === null) return;
	await scope.update({ [field]: JSON.stringify(value) });
}
/** 读取用户附加 key 列表。 */
function readExtraKeys(deps) {
	const parsed = readJson(deps.scope, "extraKeysJson", []);
	if (!Array.isArray(parsed)) return [];
	return parsed.filter((item) => item !== null && typeof item === "object").map((item, index) => ({
		id: typeof item.id === "string" && item.id.length > 0 ? item.id : `k${index}`,
		label: typeof item.label === "string" ? item.label : "",
		apiKey: typeof item.apiKey === "string" ? item.apiKey : ""
	}));
}
/** 读取完整价格配置：用户已保存 > 内置默认；旧版扁平档位数组自动迁移。 */
function readPriceConfig(deps) {
	return normalizePriceConfig(readJson(deps.scope, "pricesJson", void 0));
}
/** 读取定时自动刷新间隔（秒，0 = 关闭）。 */
function readAutoSeconds(deps) {
	const raw = readJson(deps.scope, "autoRefreshJson", "0");
	const n = typeof raw === "number" ? raw : Number(String(raw).trim());
	return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
}
/**
* 执行一个 op。
* @param deps - apply 注入的宿主依赖。
* @param request - OpRequest（HTTP 与命令通道共用形状）。
* @returns OpResult 形状载荷（不抛异常；内部错误映射为 ok:false）。
*/
async function runOp(deps, request) {
	try {
		switch (request.op) {
			case "providers": {
				const credentials = deps.getCredentials?.();
				return {
					ok: true,
					providers: (await listDeepseekProviders(deps.settings, deps.nsOf, credentials, readExtraKeys(deps))).map(({ apiKey: _apiKey, ...rest }) => rest),
					credentialsPresent: credentials !== void 0
				};
			}
			case "balance": {
				const credentials = deps.getCredentials?.();
				return {
					ok: true,
					balances: await queryBalances(await listDeepseekProviders(deps.settings, deps.nsOf, credentials, readExtraKeys(deps)), request.refresh === true)
				};
			}
			case "cost": {
				const sessionId = typeof request.sessionId === "string" ? request.sessionId : "";
				const session = sessionId.length > 0 ? deps.sessions?.get(sessionId) : void 0;
				const currentCwd = typeof session?.header?.cwd === "string" && session.header.cwd.length > 0 ? session.header.cwd : process.cwd();
				const providerBaseUrls = listProviderBaseUrls(deps.settings, deps.nsOf);
				return {
					ok: true,
					cost: await computeCosts(session, readPriceConfig(deps), currentCwd, providerBaseUrls)
				};
			}
			case "pricesGet": return {
				ok: true,
				config: readPriceConfig(deps)
			};
			case "pricesSave": {
				const raw = request.config;
				if (raw === void 0 || raw === null || typeof raw !== "object" || !Array.isArray(raw.tiers)) return {
					ok: false,
					code: "params-invalid",
					error: "config.tiers must be an array"
				};
				const config = normalizePriceConfig(raw);
				if (config.tiers.length === 0) return {
					ok: false,
					code: "params-invalid",
					error: "keep at least one price tier"
				};
				await writeJson(deps.scope, "pricesJson", config);
				return {
					ok: true,
					config
				};
			}
			case "keysGet": return {
				ok: true,
				keys: readExtraKeys(deps).map((key) => ({
					id: key.id,
					label: key.label,
					apiKeyMasked: maskKeyForClient(key.apiKey)
				}))
			};
			case "keysSave": {
				if (!Array.isArray(request.keys)) return {
					ok: false,
					code: "params-invalid",
					error: "keys must be an array"
				};
				const previous = readExtraKeys(deps);
				const next = request.keys.map((item, index) => {
					const id = typeof item.id === "string" && item.id.length > 0 ? item.id : `k${Date.now().toString(36)}-${index}`;
					const incoming = typeof item.apiKey === "string" ? item.apiKey.trim() : "";
					const kept = previous.find((p) => p.id === id);
					return {
						id,
						label: typeof item.label === "string" ? item.label : "",
						apiKey: incoming.length > 0 ? incoming : kept?.apiKey ?? ""
					};
				}).filter((key) => key.apiKey.length > 0);
				await writeJson(deps.scope, "extraKeysJson", next);
				return {
					ok: true,
					keys: next.map((key) => ({
						id: key.id,
						label: key.label,
						apiKeyMasked: maskKeyForClient(key.apiKey)
					}))
				};
			}
			case "autoRefreshGet": return {
				ok: true,
				seconds: readAutoSeconds(deps)
			};
			case "autoRefreshSave": {
				const seconds = typeof request.seconds === "number" && Number.isFinite(request.seconds) ? Math.round(request.seconds) : Number(String(request.seconds ?? "").trim());
				if (!Number.isFinite(seconds) || seconds < 0 || seconds > 86400) return {
					ok: false,
					code: "params-invalid",
					error: "seconds must be 0..86400"
				};
				await writeJson(deps.scope, "autoRefreshJson", String(seconds));
				return {
					ok: true,
					seconds
				};
			}
			default: return {
				ok: false,
				code: "op-unknown",
				error: `unknown op: ${String(request.op)}`
			};
		}
	} catch (e) {
		return {
			ok: false,
			code: "internal-error",
			error: e instanceof Error ? e.message : String(e)
		};
	}
}
/** 与 providers.maskApiKey 同规则的客户端脱敏（避免循环依赖，本地小副本）。 */
function maskKeyForClient(key) {
	const k = String(key || "").trim();
	if (k.length === 0) return "";
	if (k.length <= 10) return k.slice(0, 2) + "****";
	return k.slice(0, 5) + "…" + k.slice(-4);
}
//#endregion
//#region src/host/index.ts
const name = "dsh-balance-by-token";
const inject = [
	"shell",
	"settings",
	"commands"
];
const Config = Schema.object({});
/** 运行时 settings namespace：附加 key 与价格档以 JSON 字符串持久化到 $DSH_HOME/settings.yaml。 */
const BalanceSettingsSchema = Schema.object({
	extraKeysJson: Schema.string().default("[]"),
	pricesJson: Schema.string().default(""),
	autoRefreshJson: Schema.string().default("0")
});
const API_BODY_LIMIT = 1 << 20;
function writeApiJson(res, status, body) {
	res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
	res.end(JSON.stringify(body));
}
function apply(ctx, _config) {
	if (ctx.get("shell") === void 0) return;
	const settings = ctx.get("settings");
	const commands = ctx.get("commands");
	const sessions = ctx.get("sessions");
	let scope = null;
	if (settings !== void 0) scope = settings.register(settingsNamespace("dsh-balance"), BalanceSettingsSchema, { base: {
		extraKeysJson: "[]",
		pricesJson: ""
	} });
	const deps = {
		...settings === void 0 ? {} : { settings },
		nsOf: settingsNamespace,
		scope,
		getCredentials: () => ctx.get("credentials"),
		...sessions === void 0 ? {} : { sessions }
	};
	const webServer = ctx.get("webServer");
	const webRuntime = ctx.get("webRuntime");
	if (webServer !== void 0) {
		const fence = (headers) => isTrustedApiRequest(headers, webRuntime?.trustedHosts ?? []);
		try {
			webServer.register({
				kind: "exact",
				path: "/dsh-balance/api",
				handler: async (req, res) => {
					if (!fence(req.headers)) {
						writeApiJson(res, 403, {
							ok: false,
							error: {
								code: "forbidden",
								message: "forbidden"
							}
						});
						return;
					}
					if (req.method !== "POST") {
						writeApiJson(res, 405, {
							ok: false,
							error: {
								code: "method-error",
								message: "method not allowed"
							}
						});
						return;
					}
					const chunks = [];
					let total = 0;
					for await (const chunk of req) {
						const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
						total += buffer.length;
						if (total > API_BODY_LIMIT) {
							writeApiJson(res, 413, {
								ok: false,
								error: {
									code: "body-too-large",
									message: "request body too large"
								}
							});
							return;
						}
						chunks.push(buffer);
					}
					const text = Buffer.concat(chunks).toString("utf8");
					let request = { op: "" };
					if (text.trim().length > 0) try {
						request = JSON.parse(text);
					} catch {
						writeApiJson(res, 400, {
							ok: false,
							error: {
								code: "params-invalid",
								message: "Parameters must be JSON"
							}
						});
						return;
					}
					try {
						writeApiJson(res, 200, {
							ok: true,
							value: await runOp(deps, request)
						});
					} catch (e) {
						writeApiJson(res, 200, {
							ok: true,
							value: {
								ok: false,
								code: "internal-error",
								error: e instanceof Error ? e.message : String(e)
							}
						});
					}
				}
			});
		} catch {}
	}
	if (commands !== void 0) commands.register({
		name: "dsh-balance",
		description: "DeepSeek 余额与费用查询：列出服务商、查询官方余额、计算费用（最近一次提问/本会话/今日·本项目/今日·全部）、管理价格档与附加 API key。Query DeepSeek balances and token costs. 参数为 JSON：{ \"op\": \"providers|balance|cost|pricesGet|pricesSave|keysGet|keysSave\", \"sessionId\": \"...\", \"refresh\": true, ... }。",
		input: { hint: "{\"op\":\"balance\"}" },
		recordInput: true,
		handler: async (invocation) => {
			const raw = (invocation.rawInput ?? "").trim();
			let req = { op: "" };
			if (raw.length > 0) try {
				req = JSON.parse(raw);
			} catch {
				return {
					kind: "error",
					text: JSON.stringify({
						ok: false,
						code: "params-invalid",
						error: "Parameters must be JSON"
					})
				};
			}
			try {
				const payload = await runOp(deps, req);
				return {
					kind: "success",
					text: JSON.stringify(payload)
				};
			} catch (e) {
				return {
					kind: "error",
					text: JSON.stringify({
						ok: false,
						code: "internal-error",
						error: e instanceof Error ? e.message : String(e)
					})
				};
			}
		}
	});
}
//#endregion
export { Config, apply, inject, name };
