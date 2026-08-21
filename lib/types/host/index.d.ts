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
import type { Context } from '@deepseek-ai/cordis';
import type { OpRequest } from './types.ts';
export declare const name = "dsh-balance-by-token";
export declare const inject: string[];
export declare const Config: Schema<Schemastery.ObjectS<{}>, Schemastery.ObjectT<{}>>;
export declare function apply(ctx: Context, _config: Record<string, never>): void;
export type { OpRequest };
//# sourceMappingURL=index.d.ts.map