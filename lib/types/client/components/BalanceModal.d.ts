/**
 * dsh-balance-by-token —— 统一「余额」弹框（余额 / 费用 / 价格设置 三 tab）。
 *
 * 所有余额相关的显示与设置都收敛在此弹框：
 * 1. 余额：DeepSeek 服务商列表（来源标签、脱敏 key、总/赠送余额），
 *    每行独立状态；底部「附加 API Key」管理不在 providers 配置中的 key；
 * 2. 费用：四卡片 —— 最近一次提问 / 本会话 / 今日·本项目 / 今日·全部，
 *    金额 + 四桶 token 明细 + 当前生效价格档；
 * 3. 价格设置：价格档行内编辑 + 增删。
 */
import type { RunFn } from '../rpc.ts';
export interface BalanceModalProps {
    run: RunFn;
    useOpen(): boolean;
    close(): void;
    /** 当前会话 id（footer 入口上报），费用查询随请求上传。 */
    getSession(): string;
    /** 自动刷新 tick（到点触发余额/费用刷新）。 */
    useTick(): number;
    /** 当前定时刷新间隔（秒，0 = 关闭）。 */
    useAutoSeconds(): number;
    /** 更新定时刷新间隔（秒）。 */
    setAutoSeconds(seconds: number): void;
}
export declare function BalanceModal({ run, useOpen, close, getSession, useTick, useAutoSeconds, setAutoSeconds }: BalanceModalProps): import("react").JSX.Element | null;
//# sourceMappingURL=BalanceModal.d.ts.map