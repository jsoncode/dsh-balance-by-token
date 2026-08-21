/**
 * dsh-balance-by-token —— 会话头部工具区按钮（conversation.session.header.utilities）：
 * 【当前会话xxCNY/余额xxxCNY】—— 实时显示当前会话费用与账户余额。
 * 点击按钮立即刷新一次；启用「定时更新」后按设定间隔自动刷新。
 */
import type { RunFn } from '../rpc.ts';
export interface HeaderButtonProps {
    /** 当前会话 id（插槽标准 props）。 */
    sessionId: string;
    /** 宿主 op 通道。 */
    run: RunFn;
    /** 自动刷新 tick（到点变化时触发刷新）。 */
    useTick(): number;
}
export declare function HeaderButton({ sessionId, run, useTick }: HeaderButtonProps): import("react").JSX.Element;
//# sourceMappingURL=HeaderButton.d.ts.map