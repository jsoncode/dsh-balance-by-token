/**
 * dsh-balance-by-token —— 浏览器半边：语言与文案（中英双语，跟随主界面语言）。
 */
export declare const LANG: "zh" | "en";
/** 取文案并替换 {var} 占位符。 */
export declare const t: (key: string, vars?: Record<string, string | number>) => string;
/** 宿主错误通过 code 映射为本地化文本，未知错误回退原文。 */
export declare const tErr: (res: {
    code?: string;
    error?: string;
} | null | undefined, fallback?: string) => string;
/** 金额格式化（保留合理小数位）。 */
export declare const fmtAmount: (amount: number | undefined) => string;
/** token 数量格式化（千分位）。 */
export declare const fmtTokens: (n: number | undefined) => string;
//# sourceMappingURL=i18n.d.ts.map