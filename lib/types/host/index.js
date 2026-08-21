/**
 * dsh-balance-by-token —— 宿主半边（可发布组合包，无硬编码路径）
 *
 * - settings namespace（dsh-balance）持久化：用户附加的 API key 列表
 *   （extraKeysJson）与价格档位（pricesJson），均以 JSON 字符串存储
 *   （规避 settings 对数组的深冻结 + schemastery 原地改写）；
 * - `/dsh-balance/api` HTTP 路由（webServer 注册 + 信任围栏）：浏览器半边
 *   经 fetch 调用，参数为 JSON（{ op: 'providers|balance|cost|pricesGet|pricesSave|keysGet|keysSave' }），
 *   结果以 JSON 信封回传。请求不进入对话命令通道，页面不会出现 command 节点；
 * - `dsh-balance` 命令：保留兼容（用户/模型在对话中显式执行时可用），
 *   浏览器半边默认不走命令通道。
 *
 * 运行时依赖（@deepseek-ai/*）由 package.json 的 peerDependencies 声明，
 * 安装时由宿主解析，本文件不含任何绝对路径。
 */
import Schema from '@deepseek-ai/schemastery';
import { settingsNamespace } from '@deepseek-ai/dsh-settings';
import { isTrustedApiRequest } from "./fence.js";
import { runOp } from "./ops.js";
export const name = 'dsh-balance-by-token';
export const inject = ['shell', 'settings', 'commands'];
/* ── 配置（cordis.yml config 段；本插件无必填配置）────────── */
export const Config = Schema.object({});
/** 运行时 settings namespace：附加 key 与价格档以 JSON 字符串持久化到 $DSH_HOME/settings.yaml。 */
const BalanceSettingsSchema = Schema.object({
    extraKeysJson: Schema.string().default('[]'),
    pricesJson: Schema.string().default(''),
    autoRefreshJson: Schema.string().default('0'),
});
const API_BODY_LIMIT = 1 << 20;
function writeApiJson(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}
export function apply(ctx, _config) {
    const shell = ctx.get('shell');
    if (shell === undefined)
        return;
    const settings = ctx.get('settings');
    const commands = ctx.get('commands');
    // credentials / sessions 为可选增强：缺失时余额显示「未配置凭据」、
    // 实时费用两项归零（今日两项仍可经磁盘扫描得出），不放入 inject 以免硬依赖。
    // credentials 不在 apply 时抓取，改为每次 op 请求时懒取：宿主的 credentials 服务
    // 可能晚于本插件启动，捕获一次会永久拿不到（resolveApiKey 恒为 undefined）。
    const sessions = ctx.get('sessions');
    // settings namespace：附加 key 与价格档以 JSON 字符串存储。
    let scope = null;
    if (settings !== undefined) {
        scope = settings.register(settingsNamespace('dsh-balance'), BalanceSettingsSchema, {
            base: { extraKeysJson: '[]', pricesJson: '' },
        });
    }
    const deps = {
        ...settings === undefined ? {} : { settings },
        nsOf: settingsNamespace,
        scope,
        getCredentials: () => ctx.get('credentials'),
        ...sessions === undefined ? {} : { sessions },
    };
    // ─── 浏览器 HTTP API（/dsh-balance/api）────────────────────────
    // 浏览器半边（余额弹框）默认经此路由与宿主通信：请求不进入对话命令通道，
    // 因此不会在会话中产生 command 节点 —— 页面不出现调试卡片。
    // 路由带浏览器信任围栏（loopback Host / webRuntime.trustedHosts + 同源标记）。
    // webServer 缺失（如 headless 组合）时静默跳过，客户端自动回退到命令通道。
    const webServer = ctx.get('webServer');
    const webRuntime = ctx.get('webRuntime');
    if (webServer !== undefined) {
        const fence = (headers) => isTrustedApiRequest(headers, webRuntime?.trustedHosts ?? []);
        try {
            webServer.register({
                kind: 'exact',
                path: '/dsh-balance/api',
                handler: async (req, res) => {
                    if (!fence(req.headers)) {
                        writeApiJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } });
                        return;
                    }
                    if (req.method !== 'POST') {
                        writeApiJson(res, 405, { ok: false, error: { code: 'method-error', message: 'method not allowed' } });
                        return;
                    }
                    // 有界读取请求体（防御未绑定的大体）。
                    const chunks = [];
                    let total = 0;
                    for await (const chunk of req) {
                        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                        total += buffer.length;
                        if (total > API_BODY_LIMIT) {
                            writeApiJson(res, 413, { ok: false, error: { code: 'body-too-large', message: 'request body too large' } });
                            return;
                        }
                        chunks.push(buffer);
                    }
                    const text = Buffer.concat(chunks).toString('utf8');
                    let request = { op: '' };
                    if (text.trim().length > 0) {
                        try {
                            request = JSON.parse(text);
                        }
                        catch {
                            writeApiJson(res, 400, { ok: false, error: { code: 'params-invalid', message: 'Parameters must be JSON' } });
                            return;
                        }
                    }
                    try {
                        const payload = await runOp(deps, request);
                        writeApiJson(res, 200, { ok: true, value: payload });
                    }
                    catch (e) {
                        // runOp 内部已兜底大部分分支；此处防御性映射为与命令 handler 相同的错误载荷。
                        writeApiJson(res, 200, {
                            ok: true,
                            value: { ok: false, code: 'internal-error', error: e instanceof Error ? e.message : String(e) },
                        });
                    }
                },
            });
        }
        catch { /* 热重载重复注册（kind,path 冲突）时幂等忽略 */ }
    }
    // ─── 命令入口（保留兼容：用户/模型在对话中显式执行时可用）──────
    if (commands !== undefined) {
        commands.register({
            name: 'dsh-balance',
            description: 'DeepSeek 余额与费用查询：列出服务商、查询官方余额、计算费用（最近一次提问/本会话/今日·本项目/今日·全部）、管理价格档与附加 API key。Query DeepSeek balances and token costs. 参数为 JSON：'
                + '{ "op": "providers|balance|cost|pricesGet|pricesSave|keysGet|keysSave", "sessionId": "...", "refresh": true, ... }。',
            input: { hint: '{"op":"balance"}' },
            recordInput: true,
            handler: async (invocation) => {
                const raw = (invocation.rawInput ?? '').trim();
                let req = { op: '' };
                if (raw.length > 0) {
                    try {
                        req = JSON.parse(raw);
                    }
                    catch {
                        return { kind: 'error', text: JSON.stringify({ ok: false, code: 'params-invalid', error: 'Parameters must be JSON' }) };
                    }
                }
                try {
                    const payload = await runOp(deps, req);
                    return { kind: 'success', text: JSON.stringify(payload) };
                }
                catch (e) {
                    return { kind: 'error', text: JSON.stringify({ ok: false, code: 'internal-error', error: e instanceof Error ? e.message : String(e) }) };
                }
            },
        });
    }
}
