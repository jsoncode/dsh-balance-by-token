/**
 * dsh-balance-by-token —— 侧边栏底部入口（sidebar.footer.action）：
 * 常驻的「余额」按钮（footer.action 区），点击打开统一弹框
 * （余额 / 费用 / 价格设置 三个 tab）。
 *
 * 按钮文案随当前时段动态变化：处于配置的高峰时段内显示「余额（高峰时段）」
 * （括号红色），否则显示「余额（空闲时段 半价）」（括号绿色）。
 * 时段判定与宿主一致（时区偏移 + 高峰窗口，按当前时间），每 60 秒刷新，
 * 弹框关闭（保存价格后）也会立即刷新。
 */
import type { RunFn } from '../rpc.ts';
export interface FooterButtonProps {
    /** 打开统一「余额」弹框。 */
    onOpen(): void;
    /** 上报当前会话 id（供费用查询经宿主读取内存会话）。 */
    reportSession?: (sessionId: string) => void;
    wide?: boolean;
    useSessions?: (selector: (s: {
        current?: string;
    }) => unknown) => unknown;
    /** 宿主 op 通道（pricesGet 取时段配置）。 */
    run: RunFn;
    /** 弹框开合状态（关闭后刷新按钮时段文案）。 */
    useOpen(): boolean;
}
export declare function FooterButton({ onOpen, reportSession, wide, useSessions, run, useOpen }: FooterButtonProps): import("react").JSX.Element;
//# sourceMappingURL=FooterButton.d.ts.map