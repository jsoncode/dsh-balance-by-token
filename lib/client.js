window.__ModuleLoader__.load({ id: 'dsh-balance-by-token', factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
let react = require("react");
let react_jsx_runtime = require("react/jsx-runtime");
//#region src/client/styles.ts
/**
* dsh-balance-by-token —— 浏览器半边：样式注入（与 dsh-jenkins 相同的 bundle CSS 注入模式）。
*/
const CSS_ID = "dsh-balance-by-token/settings.css";
const css = [
	".dshb-btn{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 14px;font-size:13px;cursor:pointer}",
	".dshb-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}",
	".dshb-btn:disabled{opacity:.5;cursor:not-allowed}",
	".dshb-btn-primary{background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#1668e3));border-color:transparent;color:var(--dsw-alias-label-primary-foreground,#fff)}",
	".dshb-btn-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover,var(--dsw-alias-brand-primary,#1668e3))}",
	".dshb-btn-small{padding:3px 10px;font-size:12px}",
	".dshb-btn-danger{color:var(--dsw-alias-state-error-primary);border-color:currentColor}",
	".dshb-head-ops{display:flex;align-items:center;gap:8px;flex:none}",
	".dshb-err{color:var(--dsw-alias-state-error-primary,#d33);font-size:12px;margin:4px 0 0}",
	".dshb-ok{color:var(--dsw-alias-state-success-primary,#2a7d3c);font-size:12px;margin:4px 0 0}",
	".dshb-empty{padding:28px 16px;text-align:center;color:var(--dsw-alias-label-secondary,#888);font-size:13px}",
	".dshb-hint{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin:0 0 10px;line-height:1.5}",
	".dshb-input{width:100%;box-sizing:border-box;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#222);border:1px solid var(--dsw-alias-border-l2,#ccc);border-radius:8px;padding:8px 12px;font-size:13px;font-family:inherit;transition:border-color .15s,box-shadow .15s}",
	".dshb-input:hover{border-color:var(--dsw-alias-border-l3,#b8b8b8)}",
	".dshb-input:focus{outline:none;border-color:var(--dsw-alias-brand-primary,#1668e3);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 18%,transparent)}",
	".dshb-input::placeholder{color:var(--dsw-alias-label-tertiary,#aaa)}",
	".dshb-spinner{width:14px;height:14px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2,#ccc);border-top-color:var(--dsw-alias-brand-primary,#1668e3);animation:dshb-spin .8s linear infinite;margin:12px auto}",
	"@keyframes dshb-spin{to{transform:rotate(360deg)}}",
	".dshb-footer-btn{box-sizing:border-box;cursor:pointer;width:calc(100% + 4px);height:42px;color:var(--dsw-alias-label-primary);background:transparent;border:none;border-radius:12px;flex:none;align-items:center;gap:8px;margin:4px -2px;padding:0 10px 0 8px;font-family:inherit;font-size:14px;line-height:22px;display:flex;overflow:hidden}",
	".dshb-footer-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}",
	".dshb-footer-btn-rail{border-radius:50%;justify-content:center;gap:0;width:36px;height:36px;margin:8px 0 10px;padding:0}",
	".dshb-footer-group{width:100%;min-width:0}",
	".dshb-footer-rail-group{width:auto}",
	".dshb-footer-logo{height:28px;width:28px;flex:none;display:block;object-fit:contain;background:var(--dsw-alias-brand-primary,#1668e3);border-radius:50%;padding:5px;box-sizing:border-box}",
	".dshb-footer-label{display:flex;flex-direction:row;align-items:center;gap:6px;min-width:0;white-space:nowrap;overflow:hidden}",
	".dshb-footer-word{font-size:14px;font-weight:500;color:var(--dsw-alias-label-primary,#222)}",
	".dshb-footer-balance{font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#666);white-space:nowrap;flex:none}",
	".dshb-footer-label .dshb-btn-badge{margin-left:0;font-size:11px;line-height:1.2}",
	"div:has(> [data-slot=\"sidebar.footer.action\"]){flex-direction:column}",
	".dshb-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;pointer-events:auto}",
	".dshb-modal{background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,#ddd);border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,.28);width:min(760px,100%);min-height:420px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;color:var(--dsw-alias-label-primary,#222);font-size:14px}",
	".dshb-modal-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);flex:none}",
	".dshb-modal-title{font-size:15px;font-weight:600}",
	".dshb-close{border:none;background:transparent;color:var(--dsw-alias-label-secondary,#888);font-size:16px;cursor:pointer;padding:4px 8px;border-radius:6px}",
	".dshb-close:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.15));color:var(--dsw-alias-label-primary,#222)}",
	".dshb-tabs{display:flex;gap:6px;padding:10px 18px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);overflow-x:auto;flex:none}",
	".dshb-tab{padding:5px 12px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,#666);font-size:13px;cursor:pointer;white-space:nowrap}",
	".dshb-tab:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.1))}",
	".dshb-tab-active{background:var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#1668e3));color:var(--dsw-alias-label-primary-foreground,#fff);border-color:transparent;font-weight:500}",
	".dshb-modal-body{flex:1;overflow-y:auto;padding:16px 18px;min-width:0;min-height:0}",
	".dshb-modal-footer{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:12px 18px;border-top:1px solid var(--dsw-alias-border-l1,#eee);flex:none;flex-wrap:wrap}",
	".dshb-modal-footer .dshb-msg{margin-right:auto;font-size:12px}",
	".dshb-prov-list{display:flex;flex-direction:column;gap:8px}",
	".dshb-prov{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:10px;background:var(--dsw-alias-bg-layer-2,#fafafa)}",
	".dshb-prov-main{min-width:0;flex:1}",
	".dshb-prov-name-row{display:flex;align-items:center;gap:8px;min-width:0;flex-wrap:wrap}",
	".dshb-prov-name{font-size:13px;font-weight:600}",
	".dshb-prov-meta{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:2px;word-break:break-all}",
	".dshb-chip{font-size:11px;color:var(--dsw-alias-label-secondary,#888);background:var(--dsw-alias-bg-base,#fff);border:1px solid var(--dsw-alias-border-l1,#eee);padding:1px 9px;border-radius:999px;white-space:nowrap}",
	".dshb-chip-brand{color:var(--dsw-alias-brand-primary,#1668e3);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary,#1668e3) 35%,transparent)}",
	".dshb-prov-side{flex:none;text-align:right;min-width:250px}",
	".dshb-prov-sub{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:2px}",
	".dshb-prov-err{font-size:12px;color:var(--dsw-alias-state-error-primary,#d33);max-width:220px;word-break:break-all}",
	".dshb-topped{color:var(--dsw-alias-state-warn-primary,#b8860b)}",
	".dshb-prov-costline{display:flex;align-items:center;justify-content:flex-end;gap:5px;font-size:13px;margin-bottom:2px;white-space:nowrap}",
	".dshb-balance-num{font-weight:600;color:#16a34a;font-variant-numeric:tabular-nums}",
	".dshb-balance-sep{color:var(--dsw-alias-label-tertiary,#bbb)}",
	".dshb-keys{margin-top:16px;border-top:1px dashed var(--dsw-alias-border-l3,#bbb);padding-top:12px}",
	".dshb-keys-title{font-size:13px;font-weight:600;margin-bottom:4px}",
	".dshb-key-row{display:flex;align-items:center;gap:8px;padding:6px 0}",
	".dshb-key-row .dshb-chip{flex:none}",
	".dshb-key-mask{flex:1;min-width:0;font-size:12px;color:var(--dsw-alias-label-secondary,#888);font-family:ui-monospace,SFMono-Regular,Consolas,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
	".dshb-key-form{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr) auto auto;gap:8px;align-items:center;margin-top:8px}",
	".dshb-cost-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}",
	".dshb-cost-card{border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:10px;padding:12px 14px;background:var(--dsw-alias-bg-layer-2,#fafafa)}",
	".dshb-cost-label{font-size:12px;color:var(--dsw-alias-label-secondary,#666);font-weight:500}",
	".dshb-cost-amount{font-size:20px;font-weight:600;margin-top:6px}",
	".dshb-cost-currency{font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-left:4px;font-weight:400}",
	".dshb-key-cost-list{margin-top:10px;border-top:1px dashed var(--dsw-alias-border-l1,#e5e5e5);padding-top:8px}",
	".dshb-key-cost{margin-top:8px;border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:8px;padding:8px 10px;background:var(--dsw-alias-bg-layer-1,#fff)}",
	".dshb-key-cost-head{display:flex;align-items:center;gap:6px;min-width:0;flex-wrap:wrap}",
	".dshb-key-cost-name{font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary,#222);min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
	".dshb-key-cost-mask{font-size:11px;color:var(--dsw-alias-label-tertiary,#999);font-family:ui-monospace,SFMono-Regular,Consolas,monospace}",
	".dshb-key-cost-amount{margin-left:auto;flex:none;font-size:12px;font-weight:600;color:#16a34a}",
	".dshb-key-cost-counts{margin-top:4px;font-size:11px;color:var(--dsw-alias-label-secondary,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
	".dshb-bar{display:flex;height:14px;border-radius:7px;overflow:hidden;margin-top:10px;background:var(--dsw-alias-bg-layer-1,#eee)}",
	".dshb-bar-seg{height:100%;min-width:2px}",
	".dshb-bar-empty{display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--dsw-alias-label-secondary,#888)}",
	".dshb-bar-legend{display:flex;flex-direction:column;align-items:stretch;gap:3px;margin-top:8px;font-size:11px;color:var(--dsw-alias-label-secondary,#888)}",
	".dshb-bar-legend span{display:flex;justify-content:space-between;align-items:center;gap:8px;white-space:nowrap;min-width:0}",
	".dshb-bar-legend-name{display:inline-flex;align-items:center;gap:4px}",
	".dshb-bar-legend i{display:inline-block;width:8px;height:8px;border-radius:2px;flex:none;vertical-align:middle}",
	".dshb-bar-legend b{color:var(--dsw-alias-label-primary,#222);font-weight:500;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-variant-numeric:tabular-nums}",
	".dshb-bar-sm{height:10px;margin-top:4px}",
	".dshb-bar-flex{flex:1 1 120px;margin-top:0;min-width:80px}",
	".dshb-nonofficial-title{font-size:11px;color:var(--dsw-alias-label-secondary,#888)}",
	".dshb-header-btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.08));color:var(--dsw-alias-label-primary);border-radius:999px;padding:2px 10px;font-size:11px;font-family:inherit;white-space:nowrap;cursor:pointer;line-height:1.6}",
	".dshb-header-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.16))}",
	".dshb-header-amount{color:#16a34a;font-weight:500}",
	".dshb-timing-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:1200}",
	".dshb-timing-dialog{background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:16px;width:300px;max-width:calc(100vw - 40px);box-shadow:0 8px 30px rgba(0,0,0,.2)}",
	".dshb-timing-title{font-size:14px;font-weight:600;margin-bottom:6px}",
	".dshb-timing-field{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--dsw-alias-label-secondary,#888);margin-top:10px}",
	".dshb-timing-field .dshb-input{width:90px}",
	".dshb-timing-active{margin-top:8px;font-size:11px;color:#16a34a}",
	".dshb-timing-actions{display:flex;gap:8px;margin-top:14px;justify-content:flex-end}",
	".dshb-cost-tier{margin-top:12px;font-size:12px;color:var(--dsw-alias-label-secondary,#888)}",
	".dshb-cost-tier b{color:var(--dsw-alias-label-primary,#222);font-weight:500}",
	".dshb-table{width:100%;border-collapse:collapse;font-size:13px}",
	".dshb-table th{font-size:12px;font-weight:500;color:var(--dsw-alias-label-secondary,#666);text-align:left;padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);white-space:nowrap}",
	".dshb-table td{padding:5px 8px;border-bottom:1px solid var(--dsw-alias-border-l1,#eee);vertical-align:middle}",
	".dshb-table .dshb-input{padding:5px 8px;font-size:12px;border-radius:6px}",
	".dshb-table .dshb-num{width:74px;text-align:right;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}",
	".dshb-table .dshb-cur{width:64px}",
	".dshb-table-ops{white-space:nowrap;text-align:right}",
	".dshb-window-box{border:1px solid var(--dsw-alias-border-l1,#eee);border-radius:10px;padding:10px 12px;margin-bottom:12px}",
	".dshb-window-title{font-size:13px;font-weight:500;color:var(--dsw-alias-label-primary,#222);margin-bottom:4px}",
	".dshb-window-list{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}",
	".dshb-window-row{display:flex;align-items:center;gap:6px;flex:none;white-space:nowrap}",
	".dshb-window-row .dshb-btn{flex:none}",
	".dshb-window-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}",
	".dshb-window-actions .dshb-btn{flex:none}",
	".dshb-window-tz{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--dsw-alias-label-secondary,#888);flex:none}",
	".dshb-window-tz .dshb-range{width:140px;accent-color:var(--dsw-alias-brand-primary,#1668e3);cursor:pointer}",
	".dshb-window-tz-label{font-weight:500;color:var(--dsw-alias-label-primary,#222);font-size:12px;min-width:52px;text-align:left}",
	".dshb-window-del{white-space:nowrap}",
	".dshb-price-scroll{overflow-x:auto}",
	".dshb-price-table{width:100%;min-width:520px}",
	".dshb-price-table th,.dshb-price-table td{padding:3px 4px;vertical-align:middle;text-align:center}",
	".dshb-price-table .dshb-input{padding:5px 8px;font-size:12px;border-radius:6px}",
	".dshb-price-corner{white-space:nowrap;text-align:center;font-weight:500}",
	".dshb-price-head-cell{width:20%;min-width:0}",
	".dshb-price-model-name{display:block;font-size:12px;line-height:1.35;word-break:break-word}",
	".dshb-price-metric{width:64px;min-width:64px;white-space:pre-line;word-break:break-word;font-weight:500;color:var(--dsw-alias-label-primary,#222);font-size:12px;line-height:1.35}",
	".dshb-price-period{white-space:nowrap;font-size:12px;color:var(--dsw-alias-label-secondary,#666);width:64px}",
	".dshb-period-peak{color:var(--dsw-alias-state-error-primary,#d33);font-weight:500}",
	".dshb-period-off{color:#16a34a;font-weight:500}",
	".dshb-btn-badge{margin-left:4px;white-space:nowrap;font-size:11px}",
	".dshb-price-cell .dshb-num{width:100%;box-sizing:border-box;text-align:center;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}"
].join("\n");
/** 注入 <style>（幂等：已存在则不重复注入）。 */
function injectStyles() {
	if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=\"" + CSS_ID + "\"]") === null) {
		const tag = document.createElement("style");
		tag.dataset.plugin = "dsh-balance-by-token";
		tag.dataset.pluginCss = CSS_ID;
		tag.textContent = css;
		document.head.appendChild(tag);
	}
}
//#endregion
//#region src/client/i18n.ts
/**
* dsh-balance-by-token —— 浏览器半边：语言与文案（中英双语，跟随主界面语言）。
*/
function resolveLang() {
	if (typeof document !== "undefined") {
		const host = document.documentElement.lang || navigator.language || "zh-CN";
		return /^zh/i.test(host) ? "zh" : "en";
	}
	return "zh";
}
const LANG = resolveLang();
const COPY = {
	zh: {
		balanceBtn: "余额",
		btnPeak: "高峰时段",
		btnOffPeak: "空闲时段 半价",
		headerBtnPrefix: "当前会话",
		timingBtn: "定时更新",
		timingTitle: "定时更新配置",
		timingHint: "每隔设定秒数自动刷新余额与费用（含顶部按钮与弹框）。",
		timingSeconds: "间隔（秒）",
		timingStart: "启动",
		timingStop: "停止",
		timingActive: "已开启：每 {n} 秒自动刷新",
		timingInvalid: "请输入 1–86400 之间的秒数",
		modalTitle: "DeepSeek 余额与费用",
		tabBalance: "余额",
		tabCost: "费用",
		tabPrices: "价格设置",
		refreshAll: "全部刷新",
		refresh: "刷新",
		loading: "加载中…",
		close: "关闭",
		save: "保存",
		saved: "已保存",
		saveFailed: "保存失败",
		cancel: "取消",
		add: "添加",
		delete: "删除",
		noProviders: "未发现 DeepSeek 服务商。请在 dsh 设置中配置 llm-pi-ai / llm-deepseek 段，或在下方附加 API Key。",
		sourcePiAi: "pi-ai 路由",
		sourceDeepseek: "官方路由",
		sourceExtra: "附加 Key",
		noCredential: "未配置凭据",
		balanceTotal: "总余额",
		balanceGranted: "赠送余额",
		toppedOut: "已用完",
		summaryTodayCost: "今日消耗",
		summaryBalance: "余额",
		extraKeysTitle: "附加 API Key",
		extraKeysHint: "手动添加不在 dsh providers 配置中的 key（仅用于余额查询，明文保存在 $DSH_HOME/settings.yaml）",
		addKeyBtn: "附加 API Key",
		keyLabel: "备注",
		keyLabelPlaceholder: "选填，如「测试账号」",
		keyInput: "API Key",
		keyInputPlaceholder: "sk-…",
		keyRequired: "请填写 API Key",
		costLastTurn: "最近一次提问",
		costSession: "本会话",
		costTodayProject: "今日·本项目",
		costTodayAll: "今日·全部",
		costTier: "当前生效价格档",
		noUsage: "暂无用量",
		tokensUncachedInput: "输入",
		tokensCacheRead: "缓存命中",
		tokensCacheWrite: "缓存写入",
		tokensOutput: "输出",
		costHint: "金额仅对官方 Key（api.deepseek.com）按价格档计费；各 API Key 的 token 用量分别统计数量（不区分官方与否）。宿主缓存 60 秒；今日两项扫描 ~/.dsh/sessions 日志。",
		costByKeyTitle: "按 API Key 明细",
		chipOfficial: "官方",
		chipNonOfficial: "非官方",
		notBilled: "不计费",
		pricesHint: "单价单位为每百万 tokens；每档分别设置高峰与空闲两套单价；匹配优先级：精确模型 id > 前缀 > * 通配兜底。修改后保存即生效。",
		priceName: "名称",
		priceMatch: "模型匹配",
		priceCurrency: "货币",
		priceInput: "输入",
		priceCacheRead: "缓存命中",
		priceCacheWrite: "缓存写入",
		priceOps: "操作",
		priceModel: "模型版本",
		pricePeriodPeak: "高峰时段",
		pricePeriodOffPeak: "空闲时段",
		priceInputHit: "百万tokens输入\n（缓存命中）",
		priceInputMiss: "百万tokens输入\n（缓存未命中）",
		priceOutput: "百万tokens输出",
		windowTitle: "时段配置",
		windowHint: "高峰时段窗口（其余时间为空闲时段），格式 HH:MM，按下方时区偏移解释。官方默认：北京时间 9:00–12:00、14:00–18:00。",
		windowStart: "开始",
		windowEnd: "结束",
		addWindow: "新增高峰时段",
		windowInvalid: "时段须为 HH:MM 且开始早于结束",
		tzOffset: "时区偏移",
		tzOffsetInvalid: "时区偏移须为数字",
		pricesSaved: "价格已保存",
		pricesEmpty: "至少保留一个价格档",
		fallbackHint: "通配档位：匹配所有未在上方列出的模型（match = *）",
		cmdNoResult: "命令未返回结果",
		errors: {
			"auth-failed": "认证失败：API Key 无效或已过期（HTTP 401/403）",
			"no-credential": "未配置凭据（apiKeyEnv 未解析到值）",
			"timeout": "请求超时",
			"network-failed": "网络请求失败",
			"http-error": "官方接口返回错误",
			"op-unknown": "未知操作",
			"params-invalid": "参数需为 JSON",
			"internal-error": "宿主内部错误",
			"forbidden": "请求被信任围栏拒绝"
		}
	},
	en: {
		balanceBtn: "Balance",
		btnPeak: "peak hours",
		btnOffPeak: "off-peak, half price",
		headerBtnPrefix: "Session ",
		timingBtn: "Auto",
		timingTitle: "Auto refresh",
		timingHint: "Refresh balance & cost every N seconds (header button and modal).",
		timingSeconds: "Interval (s)",
		timingStart: "Start",
		timingStop: "Stop",
		timingActive: "Active: every {n}s",
		timingInvalid: "Enter seconds between 1 and 86400",
		modalTitle: "DeepSeek Balance & Cost",
		tabBalance: "Balance",
		tabCost: "Cost",
		tabPrices: "Prices",
		refreshAll: "Refresh all",
		refresh: "Refresh",
		loading: "Loading…",
		close: "Close",
		save: "Save",
		saved: "Saved",
		saveFailed: "Save failed",
		cancel: "Cancel",
		add: "Add",
		delete: "Delete",
		noProviders: "No DeepSeek providers found. Configure llm-pi-ai / llm-deepseek in dsh settings, or attach an API key below.",
		sourcePiAi: "pi-ai route",
		sourceDeepseek: "official route",
		sourceExtra: "extra key",
		noCredential: "No credential",
		balanceTotal: "Total",
		balanceGranted: "Granted",
		toppedOut: "used up",
		summaryTodayCost: "Today spend",
		summaryBalance: "Balance",
		extraKeysTitle: "Extra API Keys",
		extraKeysHint: "Manually attach keys not in dsh providers config (balance query only; stored as plain text in $DSH_HOME/settings.yaml)",
		addKeyBtn: "Attach API Key",
		keyLabel: "Label",
		keyLabelPlaceholder: "Optional, e.g. \"test account\"",
		keyInput: "API Key",
		keyInputPlaceholder: "sk-…",
		keyRequired: "API key is required",
		costLastTurn: "Last question",
		costSession: "This session",
		costTodayProject: "Today · project",
		costTodayAll: "Today · all",
		costTier: "Active price tier",
		noUsage: "No usage yet",
		tokensUncachedInput: "Input",
		tokensCacheRead: "Cache hit",
		tokensCacheWrite: "Cache write",
		tokensOutput: "Output",
		costHint: "Only official keys (api.deepseek.com) are billed by price tier; token usage is counted per API key (official or not). Host caches 60s; today entries scan ~/.dsh/sessions logs.",
		costByKeyTitle: "Per API key",
		chipOfficial: "official",
		chipNonOfficial: "non-official",
		notBilled: "not billed",
		pricesHint: "Prices are per million tokens; each tier has peak and off-peak rates; match priority: exact model id > prefix > * fallback. Save to apply.",
		priceName: "Name",
		priceMatch: "Model match",
		priceCurrency: "Currency",
		priceInput: "Input",
		priceCacheRead: "Cache hit",
		priceCacheWrite: "Cache write",
		priceOps: "Actions",
		priceModel: "Model version",
		pricePeriodPeak: "Peak",
		pricePeriodOffPeak: "Off-peak",
		priceInputHit: "Input\n(cache hit)",
		priceInputMiss: "Input\n(cache miss)",
		priceOutput: "Output",
		windowTitle: "Time windows",
		windowHint: "Peak windows (the rest is off-peak), format HH:MM, interpreted in the timezone offset below. Official default: Beijing 9:00-12:00, 14:00-18:00.",
		windowStart: "Start",
		windowEnd: "End",
		addWindow: "Add peak window",
		windowInvalid: "Windows must be HH:MM and start before end",
		tzOffset: "Timezone offset",
		tzOffsetInvalid: "Timezone offset must be a number",
		pricesSaved: "Prices saved",
		pricesEmpty: "Keep at least one price tier",
		fallbackHint: "Wildcard tier: matches any model not listed above (match = *)",
		cmdNoResult: "Command returned no result",
		errors: {
			"auth-failed": "Authentication failed: invalid or expired API key (HTTP 401/403)",
			"no-credential": "No credential configured (apiKeyEnv resolved to nothing)",
			"timeout": "Request timed out",
			"network-failed": "Network request failed",
			"http-error": "Official API returned an error",
			"op-unknown": "Unknown operation",
			"params-invalid": "Parameters must be JSON",
			"internal-error": "Host internal error",
			"forbidden": "Rejected by the trust fence"
		}
	}
};
const dict = COPY[LANG] || COPY.zh;
/** 取文案并替换 {var} 占位符。 */
const t = (key, vars) => {
	let s = dict[key] !== void 0 ? dict[key] : String(key);
	if (vars) for (const k of Object.keys(vars)) s = s.split("{" + k + "}").join(String(vars[k]));
	return s;
};
/** 宿主错误通过 code 映射为本地化文本，未知错误回退原文。 */
const tErr = (res, fallback) => {
	if (res && res.code) {
		const local = dict.errors[res.code];
		if (local !== void 0) {
			const zh = LANG === "zh";
			if (res.code === "network-failed" || res.code === "timeout" || res.code === "http-error") {
				const detail = res.error ? String(res.error).trim() : "";
				return local + (detail ? (zh ? "：" : ": ") + detail : "");
			}
			return local;
		}
	}
	return res && res.error || fallback || "";
};
/** 金额格式化（保留合理小数位）。 */
const fmtAmount = (amount) => {
	if (amount === void 0 || !Number.isFinite(amount)) return "—";
	if (amount === 0) return "0";
	if (amount < .001) return amount.toExponential(2);
	if (amount < 1) return amount.toFixed(4);
	return amount.toFixed(2);
};
/** token 数量格式化（千分位）。 */
const fmtTokens = (n) => {
	if (n === void 0 || !Number.isFinite(n)) return "0";
	return Math.round(n).toLocaleString("en-US");
};
//#endregion
//#region src/client/rpc.ts
/**
* dsh-balance-by-token —— 浏览器半边：与宿主通信。
*
* 默认走宿主 webServer 注册的带信任围栏的 HTTP 路由 /dsh-balance/api
* （fetch POST JSON → { ok, value } 信封），请求不进入对话命令通道，因此不会在
* 页面产生 command 节点（空状态行 / {"ok":true,...} 调试卡片）。
*
* 老宿主（未注册该路由，如 headless 组合）自动回退到 commands.execute 命令通道，
* 仅作兼容，不影响新宿主上的行为。
*/
/**
* 尝试经 HTTP 路由执行一次 op。
* @returns 路由可用并返回有效载荷时返回 RunResult；否则返回 null（调用方回退命令通道）。
*/
async function runHttp(sessionId, op) {
	try {
		const response = await fetch("/dsh-balance/api", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(Object.assign({ sessionId: sessionId || "" }, op))
		});
		if (!response.ok) return null;
		const parsed = await response.json().catch(() => null);
		if (parsed === null || parsed.ok !== true || parsed.value === void 0) return null;
		const value = parsed.value;
		return value !== null && typeof value === "object" ? value : {
			ok: false,
			error: String(value)
		};
	} catch {
		return null;
	}
}
function makeRun(ctx) {
	return async function run(sessionId, op) {
		const viaHttp = await runHttp(sessionId, op);
		if (viaHttp !== null) return viaHttp;
		try {
			const execution = await ctx.remote.commands.execute(sessionId || "", "/dsh-balance " + JSON.stringify(op));
			const value = execution && execution.ok === true ? execution.value : void 0;
			const text = value && value.result && typeof value.result.text === "string" ? value.result.text : null;
			if (text === null || text.length === 0) return {
				ok: false,
				error: t("cmdNoResult")
			};
			try {
				return JSON.parse(text);
			} catch {
				return {
					ok: false,
					error: text.slice(0, 200)
				};
			}
		} catch (e) {
			return {
				ok: false,
				error: e instanceof Error ? e.message : String(e)
			};
		}
	};
}
//#endregion
//#region src/client/store.ts
/**
* dsh-balance-by-token —— 浏览器半边：统一「余额」弹框开关（footer 入口 ↔ overlay 弹框共享）。
*/
function createStore() {
	return {
		value: null,
		listeners: [],
		emit() {
			for (let i = 0; i < this.listeners.length; i++) this.listeners[i]();
		},
		subscribe(l) {
			this.listeners.push(l);
			return () => {
				const i = this.listeners.indexOf(l);
				if (i >= 0) this.listeners.splice(i, 1);
			};
		},
		open(value) {
			this.value = value;
			this.emit();
		},
		close() {
			this.value = null;
			this.emit();
		}
	};
}
function useStoreValue(target) {
	const [v, setV] = (0, react.useState)(target.value);
	(0, react.useEffect)(() => target.subscribe(() => setV(target.value)), []);
	return v;
}
/** 统一「余额」弹框的打开状态（footer 入口 open，overlay 弹框消费）。 */
function makeBalanceModalStore() {
	const store = createStore();
	const autoStore = createStore();
	const tickStore = createStore();
	autoStore.value = 0;
	tickStore.value = 0;
	const useOpen = () => {
		const [v, setV] = (0, react.useState)(!!store.value);
		(0, react.useEffect)(() => store.subscribe(() => setV(!!store.value)), []);
		return v;
	};
	const useAutoSeconds = () => {
		return useStoreValue(autoStore) ?? 0;
	};
	const useTick = () => {
		return useStoreValue(tickStore) ?? 0;
	};
	const bumpTick = () => {
		tickStore.value = (tickStore.value ?? 0) + 1;
		tickStore.emit();
	};
	return {
		store,
		useOpen,
		autoStore,
		useAutoSeconds,
		tickStore,
		useTick,
		bumpTick
	};
}
const BALANCE_LOGO = "data:image/svg+xml;utf8," + encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"6\" width=\"19\" height=\"13.5\" rx=\"2.5\"/><path d=\"M2.5 10h19\"/><circle cx=\"16.5\" cy=\"14.75\" r=\"1.4\" fill=\"#fff\" stroke=\"none\"/><path d=\"M6.5 6 8 3.5h8L17.5 6\"/></svg>");
//#endregion
//#region src/client/components/FooterButton.tsx
/**
* dsh-balance-by-token —— 侧边栏底部入口（sidebar.footer.action）：
* 常驻的「余额」按钮（footer.action 区），点击打开统一弹框
* （余额 / 费用 / 价格设置 三个 tab）。
*
* 右侧文案横排显示：「余额(xxCNY) 高峰时段/空闲时段 半价」——金额括号紧跟
* 「余额」，时段文案（高峰红色/空闲绿色）随当前时间动态变化。
* 时段判定与宿主一致（时区偏移 + 高峰窗口，按当前时间），每 60 秒刷新，
* 弹框关闭（保存价格后）也会立即刷新。
*/
/** 解析 'HH:MM' 为当日分钟数；非法返回 undefined（与宿主 cost.ts 同规则）。 */
function parseClock(value) {
	const m = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());
	if (m === null) return void 0;
	const h = Number(m[1]);
	const min = Number(m[2]);
	if (h < 0 || h > 23 || min < 0 || min > 59) return void 0;
	return h * 60 + min;
}
/** 判定一个时刻是否处于高峰时段（与宿主 isPeakTime 同逻辑）。 */
function isPeakNow(config, nowMs) {
	const offset = typeof config.timezoneOffsetMinutes === "number" ? config.timezoneOffsetMinutes : 480;
	const local = new Date(nowMs + offset * 6e4);
	const minutes = local.getUTCHours() * 60 + local.getUTCMinutes();
	for (const window of config.peakWindows ?? []) {
		const start = parseClock(window.start);
		const end = parseClock(window.end);
		if (start === void 0 || end === void 0) continue;
		if (start <= end) {
			if (minutes >= start && minutes < end) return true;
		} else if (minutes >= start || minutes < end) return true;
	}
	return false;
}
function FooterButton({ onOpen, reportSession, wide = false, useSessions, run, useOpen }) {
	const currentSessionId = useSessions ? useSessions((s) => s && s.current) : null;
	if (reportSession && currentSessionId) reportSession(currentSessionId);
	const open = useOpen();
	const [peak, setPeak] = (0, react.useState)(null);
	const [bal, setBal] = (0, react.useState)(null);
	const refresh = (0, react.useCallback)(async () => {
		try {
			const config = (await run("", { op: "pricesGet" })).config;
			if (config !== void 0) setPeak(isPeakNow(config, Date.now()));
		} catch {}
		try {
			const balances = (await run("", {
				op: "balance",
				refresh: false
			})).balances;
			const info = (Array.isArray(balances) ? balances.find((b) => b.ok === true && Array.isArray(b.balance_infos) && b.balance_infos.length > 0) : void 0)?.balance_infos?.[0];
			if (info !== void 0) setBal({
				total: info.total_balance,
				currency: info.currency
			});
		} catch {}
	}, [run]);
	(0, react.useEffect)(() => {
		refresh();
		const id = setInterval(() => {
			refresh();
		}, 6e4);
		return () => clearInterval(id);
	}, [refresh]);
	(0, react.useEffect)(() => {
		if (!open) refresh();
	}, [open, refresh]);
	const periodSuffix = peak === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
		className: "dshb-btn-badge " + (peak ? "dshb-period-peak" : "dshb-period-off"),
		children: peak ? t("btnPeak") : t("btnOffPeak")
	});
	const balText = bal === null ? "" : bal.total + " " + bal.currency;
	const periodText = peak === null ? "" : peak ? t("btnPeak") : t("btnOffPeak");
	const fullLabel = t("balanceBtn") + (balText !== "" ? "(" + balText + ")" : "") + (periodText !== "" ? " " + periodText : "");
	return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
		className: "dshb-footer-group" + (wide ? "" : " dshb-footer-rail-group"),
		children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "dshb-footer-btn" + (wide ? "" : " dshb-footer-btn-rail"),
			title: fullLabel,
			"aria-label": fullLabel,
			onClick: onOpen,
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
				src: BALANCE_LOGO,
				alt: "",
				className: "dshb-footer-logo"
			}), wide ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: "dshb-footer-label",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshb-footer-word",
						children: t("balanceBtn")
					}),
					balText !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dshb-footer-balance",
						children: [
							"(",
							balText,
							")"
						]
					}) : null,
					periodSuffix
				]
			}) : null]
		})
	});
}
//#endregion
//#region src/client/components/HeaderButton.tsx
/**
* dsh-balance-by-token —— 会话头部工具区按钮（conversation.session.header.utilities）：
* 【当前会话 ≈xx CNY】—— 只实时显示当前会话的预估费用。
* 点击按钮立即刷新一次；启用「定时更新」后按设定间隔自动刷新。
*/
function HeaderButton({ sessionId, run, useTick }) {
	const tick = useTick();
	const [costText, setCostText] = (0, react.useState)("--");
	const refresh = (0, react.useCallback)(async () => {
		try {
			const cost = (await run(sessionId, {
				op: "cost",
				sessionId
			})).cost;
			if (cost?.session?.amount !== void 0) setCostText(fmtAmount(cost.session.amount));
		} catch {}
	}, [run, sessionId]);
	(0, react.useEffect)(() => {
		refresh();
	}, [refresh, tick]);
	const title = t("headerBtnPrefix") + "≈" + costText + " CNY";
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
		type: "button",
		className: "dshb-header-btn",
		title,
		"aria-label": title,
		onClick: () => void refresh(),
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("headerBtnPrefix") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
			className: "dshb-header-amount",
			children: [
				"≈",
				costText,
				" CNY"
			]
		})]
	});
}
//#endregion
//#region src/client/components/BalanceModal.tsx
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
const sourceChipKey = {
	"llm-pi-ai": "sourcePiAi",
	"llm-deepseek": "sourceDeepseek",
	"extra": "sourceExtra"
};
/** 严格对齐官方价格表：仅三组指标（输入-缓存命中 / 输入-缓存未命中 / 输出）。 */
const METRIC_GROUPS = [
	{
		labelKey: "priceInputHit",
		field: "cacheRead"
	},
	{
		labelKey: "priceInputMiss",
		field: "input"
	},
	{
		labelKey: "priceOutput",
		field: "output"
	}
];
/** 叠加柱状图四段：输入 / 缓存命中 / 缓存写入 / 输出（纯 div，无交互）。 */
const TOKEN_SEGMENTS = [
	{
		key: "uncachedInput",
		labelKey: "tokensUncachedInput",
		color: "#1668e3"
	},
	{
		key: "cacheRead",
		labelKey: "tokensCacheRead",
		color: "#13c2c2"
	},
	{
		key: "cacheWrite",
		labelKey: "tokensCacheWrite",
		color: "#fa8c16"
	},
	{
		key: "output",
		labelKey: "tokensOutput",
		color: "#722ed1"
	}
];
/** 四桶 token 总数。 */
function totalTokensView(b) {
	return b.uncachedInput + b.cacheRead + b.cacheWrite + b.output;
}
/** 中文数字（用于「东八区」式时区名）。 */
const CN_NUM = [
	"零",
	"一",
	"二",
	"三",
	"四",
	"五",
	"六",
	"七",
	"八",
	"九",
	"十",
	"十一",
	"十二"
];
/** 把 UTC 偏移小时数格式化为时区名：东八区 / 西五区 / 零时区（中文），UTC+8（英文）。 */
function formatTimezone(offsetHours) {
	const h = Math.round(offsetHours);
	if (LANG === "zh") {
		if (h === 0) return "零时区";
		const n = CN_NUM[Math.abs(h)] ?? String(Math.abs(h));
		return h > 0 ? "东" + n + "区" : "西" + n + "区";
	}
	if (h === 0) return "UTC±0";
	return h > 0 ? "UTC+" + h : "UTC" + h;
}
function BalanceModal({ run, useOpen, close, getSession, useTick, useAutoSeconds, setAutoSeconds }) {
	const open = useOpen();
	const tick = useTick();
	const autoSeconds = useAutoSeconds();
	const [tab, setTab] = (0, react.useState)("balance");
	const [timingOpen, setTimingOpen] = (0, react.useState)(false);
	const [timingInput, setTimingInput] = (0, react.useState)("");
	const [timingErr, setTimingErr] = (0, react.useState)("");
	const [providers, setProviders] = (0, react.useState)(null);
	const [balances, setBalances] = (0, react.useState)({});
	const [balLoading, setBalLoading] = (0, react.useState)(false);
	const [balError, setBalError] = (0, react.useState)("");
	const [keys, setKeys] = (0, react.useState)([]);
	const [keyFormOpen, setKeyFormOpen] = (0, react.useState)(false);
	const [keyLabel, setKeyLabel] = (0, react.useState)("");
	const [keyValue, setKeyValue] = (0, react.useState)("");
	const [keyErr, setKeyErr] = (0, react.useState)("");
	const [cost, setCost] = (0, react.useState)(null);
	const [costLoading, setCostLoading] = (0, react.useState)(false);
	const [prices, setPrices] = (0, react.useState)(null);
	const [windowCfg, setWindowCfg] = (0, react.useState)({
		timezoneOffsetMinutes: 480,
		peakWindows: []
	});
	const [priceMsg, setPriceMsg] = (0, react.useState)("");
	/** 余额查询：providers 与 balances 一并回填。 */
	const loadBalances = (0, react.useCallback)(async (refresh) => {
		setBalLoading(true);
		setBalError("");
		try {
			const provRes = await run(getSession(), { op: "providers" });
			if (provRes.ok && Array.isArray(provRes.providers)) setProviders(provRes.providers);
			const res = await run(getSession(), {
				op: "balance",
				refresh
			});
			if (res.ok && Array.isArray(res.balances)) {
				const map = {};
				for (const b of res.balances) map[b.providerId] = b;
				setBalances(map);
			} else setBalError(tErr(res, t("saveFailed")));
		} finally {
			setBalLoading(false);
		}
	}, [run, getSession]);
	const loadKeys = (0, react.useCallback)(async () => {
		const res = await run(getSession(), { op: "keysGet" });
		if (res.ok && Array.isArray(res.keys)) setKeys(res.keys);
	}, [run, getSession]);
	const loadCost = (0, react.useCallback)(async () => {
		setCostLoading(true);
		try {
			const res = await run(getSession(), {
				op: "cost",
				sessionId: getSession()
			});
			if (res.ok && res.cost !== void 0) setCost(res.cost);
		} finally {
			setCostLoading(false);
		}
	}, [run, getSession]);
	const loadPrices = (0, react.useCallback)(async () => {
		const res = await run(getSession(), { op: "pricesGet" });
		if (res.ok) {
			const config = res.config;
			if (Array.isArray(config?.tiers)) setPrices(config.tiers);
			if (config !== void 0) setWindowCfg({
				timezoneOffsetMinutes: typeof config.timezoneOffsetMinutes === "number" ? config.timezoneOffsetMinutes : 480,
				peakWindows: Array.isArray(config.peakWindows) ? config.peakWindows : []
			});
		}
	}, [run, getSession]);
	(0, react.useEffect)(() => {
		if (!open) return;
		loadBalances(false);
		loadKeys();
		loadCost();
		loadPrices();
	}, [
		open,
		tab,
		loadBalances,
		loadKeys,
		loadCost,
		loadPrices
	]);
	(0, react.useEffect)(() => {
		if (!open || tick <= 0) return;
		loadBalances(false);
		loadCost();
	}, [
		tick,
		open,
		loadBalances,
		loadCost
	]);
	const saveAutoSeconds = async (seconds) => {
		try {
			const res = await run("", {
				op: "autoRefreshSave",
				seconds
			});
			if (res.ok && typeof res.seconds === "number") {
				setAutoSeconds(res.seconds);
				setTimingErr("");
				return true;
			}
			setTimingErr(tErr(res, t("saveFailed")));
			return false;
		} catch {
			setTimingErr(tErr(null, t("saveFailed")));
			return false;
		}
	};
	const openTimingDialog = () => {
		setTimingInput(autoSeconds > 0 ? String(autoSeconds) : "60");
		setTimingErr("");
		setTimingOpen(true);
	};
	if (!open) return null;
	const saveKeys = async (next) => {
		const res = await run(getSession(), {
			op: "keysSave",
			keys: next
		});
		if (res.ok) {
			await loadKeys();
			loadBalances(true);
		} else setKeyErr(tErr(res, t("saveFailed")));
	};
	const submitKey = () => {
		const value = keyValue.trim();
		if (value.length === 0) {
			setKeyErr(t("keyRequired"));
			return;
		}
		setKeyErr("");
		setKeyFormOpen(false);
		setKeyValue("");
		setKeyLabel("");
		saveKeys([...keys.map((k) => ({
			id: k.id,
			label: k.label,
			apiKey: ""
		})), {
			label: keyLabel.trim(),
			apiKey: value
		}]);
	};
	const removeKey = (id) => {
		saveKeys(keys.filter((k) => k.id !== id).map((k) => ({
			id: k.id,
			label: k.label,
			apiKey: ""
		})));
	};
	/** 更新某档某个时段的单项单价。 */
	const updateRate = (index, period, field, value) => {
		setPrices((prev) => {
			if (prev === null) return prev;
			const next = prev.slice();
			const tier = next[index];
			next[index] = {
				...tier,
				[period]: {
					...tier[period],
					[field]: value
				}
			};
			return next;
		});
	};
	const savePrices = async (list, windowCfgNext) => {
		if (list.length === 0) {
			setPriceMsg(t("pricesEmpty"));
			return;
		}
		const cfg = windowCfgNext ?? windowCfg;
		const res = await run(getSession(), {
			op: "pricesSave",
			config: {
				tiers: list,
				timezoneOffsetMinutes: cfg.timezoneOffsetMinutes,
				peakWindows: cfg.peakWindows
			}
		});
		if (res.ok) {
			const config = res.config;
			if (Array.isArray(config?.tiers)) setPrices(config.tiers);
			if (config !== void 0) setWindowCfg({
				timezoneOffsetMinutes: typeof config.timezoneOffsetMinutes === "number" ? config.timezoneOffsetMinutes : 480,
				peakWindows: Array.isArray(config.peakWindows) ? config.peakWindows : []
			});
			setPriceMsg(t("pricesSaved"));
			loadCost();
		} else setPriceMsg(tErr(res, t("saveFailed")));
	};
	const balanceOf = (id) => balances[id];
	/**
	* 单个服务商条目（API key）的今日消耗：从 cost.todayAll.byKey 按
	* 服务商路由匹配（pi-ai:<route> / llm-deepseek:<route> / label）。
	* 无用量时返回 undefined，展示为 ≈0.00 CNY。
	*/
	const todayCostOf = (p) => {
		return (cost?.todayAll?.byKey ?? []).find((k) => "pi-ai:" + k.provider === p.id || "llm-deepseek:" + k.provider === p.id || k.provider === p.id || k.provider === p.label);
	};
	const renderBalanceTab = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
		providers === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "dshb-spinner" }) : providers.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshb-empty",
			children: t("noProviders")
		}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshb-prov-list",
			children: providers.map((p) => {
				const b = balanceOf(p.id);
				const infos = b?.ok ? b.balance_infos ?? [] : [];
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshb-prov",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshb-prov-main",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshb-prov-name-row",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshb-prov-name",
									children: p.label
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dshb-chip" + (p.source === "extra" ? " dshb-chip-brand" : ""),
									children: t(sourceChipKey[p.source])
								}),
								!p.hasKey ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dshb-chip",
									title: p.keySource !== void 0 ? "source: " + p.keySource : void 0,
									children: [t("noCredential"), p.apiKeyEnv !== void 0 ? " · " + p.apiKeyEnv : ""]
								}) : null
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshb-prov-meta",
							children: [p.baseUrl, p.apiKeyMasked ? ` · ${p.apiKeyMasked}` : ""]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshb-prov-side",
						children: b === void 0 ? balLoading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshb-spinner",
							style: { margin: "4px 0 4px auto" }
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshb-prov-sub",
							children: "—"
						}) : b.ok ? infos.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshb-prov-sub",
							children: "—"
						}) : infos.map((info, i) => {
							const kc = todayCostOf(p);
							const kcCurrency = kc !== void 0 && kc.currency !== "" ? kc.currency : "CNY";
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshb-prov-costline",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("summaryTodayCost") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "dshb-balance-num",
										children: [
											"≈",
											fmtAmount(kc?.amount ?? 0),
											" ",
											kcCurrency
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dshb-balance-sep",
										children: "|"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("summaryBalance") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "dshb-balance-num",
										children: [
											info.total_balance,
											" ",
											info.currency
										]
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dshb-prov-sub" + (info.topped_out ? " dshb-topped" : ""),
								children: [
									t("balanceGranted"),
									" ",
									info.granted_balance,
									info.topped_out ? ` · ${t("toppedOut")}` : ""
								]
							})] }, i);
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dshb-prov-err",
							children: tErr(b)
						})
					})]
				}, p.id);
			})
		}),
		balError !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
			className: "dshb-err",
			children: balError
		}) : null,
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshb-keys",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshb-keys-title",
					children: t("extraKeysTitle")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "dshb-hint",
					children: t("extraKeysHint")
				}),
				keys.map((k) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshb-key-row",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshb-chip",
							children: k.label !== "" ? k.label : t("sourceExtra")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dshb-key-mask",
							children: k.apiKeyMasked
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshb-btn dshb-btn-small dshb-btn-danger",
							onClick: () => removeKey(k.id),
							children: t("delete")
						})
					]
				}, k.id)),
				keyFormOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshb-key-form",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "dshb-input",
							value: keyLabel,
							placeholder: t("keyLabelPlaceholder"),
							"aria-label": t("keyLabel"),
							onChange: (e) => setKeyLabel(e.target.value)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "dshb-input",
							value: keyValue,
							placeholder: t("keyInputPlaceholder"),
							"aria-label": t("keyInput"),
							onChange: (e) => setKeyValue(e.target.value)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshb-btn dshb-btn-small dshb-btn-primary",
							onClick: submitKey,
							children: t("add")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshb-btn dshb-btn-small",
							onClick: () => {
								setKeyFormOpen(false);
								setKeyErr("");
							},
							children: t("cancel")
						})
					]
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "dshb-btn dshb-btn-small",
					onClick: () => setKeyFormOpen(true),
					children: ["+ ", t("addKeyBtn")]
				}),
				keyErr !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "dshb-err",
					children: keyErr
				}) : null
			]
		})
	] });
	/** 服务商路由 key → 展示信息（label + 脱敏 key）；用余额 tab 已加载的 providers 列表匹配。 */
	const providerMeta = (provider) => {
		const hit = (providers ?? []).find((p) => p.id === "pi-ai:" + provider || p.id === "llm-deepseek:" + provider || p.id === provider || p.label === provider);
		if (hit !== void 0) return {
			label: hit.label !== "" ? hit.label : provider,
			...hit.apiKeyMasked !== void 0 && hit.apiKeyMasked !== "" ? { masked: hit.apiKeyMasked } : {}
		};
		return { label: provider };
	};
	/** 一条 token 四段柱状图（纯 div）。 */
	const usageBar = (buckets, small) => {
		const total = totalTokensView(buckets);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshb-bar" + (small ? " dshb-bar-sm" : ""),
			role: "img",
			"aria-label": TOKEN_SEGMENTS.map((s) => t(s.labelKey) + ": " + fmtTokens(buckets[s.key])).join(", "),
			children: total > 0 ? TOKEN_SEGMENTS.map((seg) => {
				const v = buckets[seg.key];
				return v > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshb-bar-seg",
					style: {
						width: v / total * 100 + "%",
						background: seg.color
					},
					title: t(seg.labelKey) + ": " + fmtTokens(v)
				}, seg.key) : null;
			}) : null
		});
	};
	const costCard = (label, entry) => {
		const byKey = entry?.byKey ?? [];
		const total = entry?.buckets ?? {
			uncachedInput: 0,
			cacheRead: 0,
			cacheWrite: 0,
			output: 0
		};
		const totalTokens = totalTokensView(total);
		return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshb-cost-card",
			children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dshb-cost-label",
				children: label
			}), entry === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "dshb-spinner" }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshb-cost-amount",
					children: [fmtAmount(entry.amount), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshb-cost-currency",
						children: entry.currency
					})]
				}),
				totalTokens > 0 ? usageBar(total, false) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshb-bar dshb-bar-empty",
					children: t("noUsage")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshb-bar-legend",
					children: TOKEN_SEGMENTS.map((seg) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "dshb-bar-legend-name",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("i", { style: { background: seg.color } }), t(seg.labelKey)]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: fmtTokens(total[seg.key]) })] }, seg.key))
				}),
				byKey.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshb-key-cost-list",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshb-nonofficial-title",
						children: t("costByKeyTitle")
					}), byKey.map((k) => {
						const meta = providerMeta(k.provider);
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dshb-key-cost",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dshb-key-cost-head",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dshb-key-cost-name",
											title: k.provider,
											children: meta.label
										}),
										meta.masked !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dshb-key-cost-mask",
											children: meta.masked
										}) : null,
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dshb-chip" + (k.official ? " dshb-chip-brand" : ""),
											children: k.official ? t("chipOfficial") : t("chipNonOfficial")
										}),
										k.official ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: "dshb-key-cost-amount",
											children: [
												"≈",
												fmtAmount(k.amount),
												" ",
												k.currency
											]
										}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dshb-chip",
											children: t("notBilled")
										})
									]
								}),
								usageBar(k.buckets, true),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dshb-key-cost-counts",
									children: TOKEN_SEGMENTS.map((seg) => t(seg.labelKey) + " " + fmtTokens(k.buckets[seg.key])).join(" · ")
								})
							]
						}, k.provider);
					})]
				}) : null
			] })]
		});
	};
	const renderCostTab = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
			className: "dshb-hint",
			children: t("costHint")
		}),
		/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshb-cost-grid",
			children: [
				costCard(t("costLastTurn"), cost?.lastTurn),
				costCard(t("costSession"), cost?.session),
				costCard(t("costTodayProject"), cost?.todayProject),
				costCard(t("costTodayAll"), cost?.todayAll)
			]
		}),
		cost?.sessionTier !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshb-cost-tier",
			children: [
				t("costTier"),
				"：",
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", { children: cost.sessionTier })
			]
		}) : null
	] });
	const renderPricesTab = () => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
			className: "dshb-hint",
			children: t("pricesHint")
		}),
		prices === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "dshb-spinner" }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshb-window-box",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshb-window-title",
					children: t("windowTitle")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "dshb-hint",
					children: t("windowHint")
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshb-window-list",
					children: windowCfg.peakWindows.map((w, wi) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshb-window-row",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: "dshb-input dshb-cur",
								value: w.start,
								"aria-label": t("windowStart"),
								placeholder: "09:00",
								onChange: (e) => {
									const next = windowCfg.peakWindows.map((x, j) => j === wi ? {
										...x,
										start: e.target.value
									} : x);
									setWindowCfg({
										...windowCfg,
										peakWindows: next
									});
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "–" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: "dshb-input dshb-cur",
								value: w.end,
								"aria-label": t("windowEnd"),
								placeholder: "12:00",
								onChange: (e) => {
									const next = windowCfg.peakWindows.map((x, j) => j === wi ? {
										...x,
										end: e.target.value
									} : x);
									setWindowCfg({
										...windowCfg,
										peakWindows: next
									});
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshb-btn dshb-btn-small dshb-btn-danger dshb-window-del",
								onClick: () => setWindowCfg({
									...windowCfg,
									peakWindows: windowCfg.peakWindows.filter((_, j) => j !== wi)
								}),
								children: t("delete")
							})
						]
					}, wi))
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshb-window-actions",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "dshb-btn dshb-btn-small",
						onClick: () => setWindowCfg({
							...windowCfg,
							peakWindows: [...windowCfg.peakWindows, {
								start: "09:00",
								end: "12:00"
							}]
						}),
						children: ["+ ", t("addWindow")]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "dshb-window-tz",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("tzOffset") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: "dshb-range",
								type: "range",
								min: -12,
								max: 12,
								step: 1,
								value: Math.round(windowCfg.timezoneOffsetMinutes / 60),
								"aria-label": t("tzOffset"),
								onChange: (e) => setWindowCfg({
									...windowCfg,
									timezoneOffsetMinutes: Number(e.target.value) * 60
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("b", {
								className: "dshb-window-tz-label",
								children: formatTimezone(windowCfg.timezoneOffsetMinutes / 60)
							})
						]
					})]
				})
			]
		}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshb-price-scroll",
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
				className: "dshb-table dshb-price-table",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
					className: "dshb-price-corner",
					colSpan: 2,
					children: t("priceModel")
				}), prices.map((tier, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
					className: "dshb-price-head-cell",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dshb-price-model-name",
						title: tier.match === "*" ? t("fallbackHint") : void 0,
						children: tier.name || tier.match
					})
				}, tier.id))] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: METRIC_GROUPS.map((group) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", {
						rowSpan: 2,
						className: "dshb-price-metric",
						children: t(group.labelKey)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
						className: "dshb-price-period dshb-period-off",
						children: t("pricePeriodOffPeak")
					}),
					prices.map((tier, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
						className: "dshb-price-cell",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "dshb-input dshb-num",
							type: "number",
							step: "any",
							min: 0,
							value: tier.offPeak[group.field],
							"aria-label": t(group.labelKey) + " · " + t("pricePeriodOffPeak"),
							onChange: (e) => updateRate(i, "offPeak", group.field, Number(e.target.value) || 0)
						})
					}, tier.id))
				] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
					className: "dshb-price-period dshb-period-peak",
					children: t("pricePeriodPeak")
				}), prices.map((tier, i) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
					className: "dshb-price-cell",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: "dshb-input dshb-num",
						type: "number",
						step: "any",
						min: 0,
						value: tier.peak[group.field],
						"aria-label": t(group.labelKey) + " · " + t("pricePeriodPeak"),
						onChange: (e) => updateRate(i, "peak", group.field, Number(e.target.value) || 0)
					})
				}, tier.id))] })] }, group.field)) })]
			})
		})] }),
		/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			style: {
				display: "flex",
				justifyContent: "flex-end",
				gap: 8,
				marginTop: 12
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "dshb-btn dshb-btn-small dshb-btn-primary",
				disabled: prices === null,
				onClick: () => {
					if (prices !== null) savePrices(prices);
				},
				children: t("save")
			})
		}),
		priceMsg !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
			className: "dshb-" + (priceMsg === t("pricesSaved") ? "ok" : "err"),
			children: priceMsg
		}) : null
	] });
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
		className: "dshb-backdrop",
		onClick: (e) => {
			if (e.target === e.currentTarget) close();
		},
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: "dshb-modal",
			role: "dialog",
			"aria-modal": "true",
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshb-modal-header",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshb-modal-title",
						children: t("modalTitle")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshb-head-ops",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "dshb-btn dshb-btn-small",
								onClick: openTimingDialog,
								children: [t("timingBtn"), autoSeconds > 0 ? "·" + autoSeconds + "s" : ""]
							}),
							tab === "balance" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshb-btn dshb-btn-small",
								disabled: balLoading,
								onClick: () => void loadBalances(true),
								children: balLoading ? t("loading") : t("refreshAll")
							}) : null,
							tab === "cost" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshb-btn dshb-btn-small",
								disabled: costLoading,
								onClick: () => void loadCost(),
								children: costLoading ? t("loading") : t("refresh")
							}) : null,
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshb-close",
								"aria-label": t("close"),
								onClick: close,
								children: "✕"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dshb-tabs",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshb-tab" + (tab === "balance" ? " dshb-tab-active" : ""),
							onClick: () => setTab("balance"),
							children: t("tabBalance")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshb-tab" + (tab === "cost" ? " dshb-tab-active" : ""),
							onClick: () => setTab("cost"),
							children: t("tabCost")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dshb-tab" + (tab === "prices" ? " dshb-tab-active" : ""),
							onClick: () => setTab("prices"),
							children: t("tabPrices")
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dshb-modal-body",
					children: tab === "balance" ? renderBalanceTab() : tab === "cost" ? renderCostTab() : renderPricesTab()
				})
			]
		}), timingOpen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
			className: "dshb-timing-backdrop",
			onClick: (e) => {
				if (e.target === e.currentTarget) setTimingOpen(false);
			},
			children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dshb-timing-dialog",
				role: "dialog",
				"aria-modal": "true",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshb-timing-title",
						children: t("timingTitle")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dshb-hint",
						children: t("timingHint")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "dshb-timing-field",
						children: [t("timingSeconds"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "dshb-input",
							type: "number",
							min: 1,
							max: 86400,
							value: timingInput,
							placeholder: "60",
							disabled: autoSeconds > 0,
							onChange: (e) => setTimingInput(e.target.value)
						})]
					}),
					autoSeconds > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dshb-timing-active",
						children: t("timingActive", { n: String(autoSeconds) })
					}) : null,
					timingErr !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dshb-err",
						children: timingErr
					}) : null,
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dshb-timing-actions",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshb-btn dshb-btn-small dshb-btn-primary",
								disabled: autoSeconds > 0,
								onClick: () => {
									const n = Number(String(timingInput).trim());
									if (!Number.isFinite(n) || n <= 0 || n > 86400) {
										setTimingErr(t("timingInvalid"));
										return;
									}
									saveAutoSeconds(Math.round(n)).then((ok) => {
										if (!ok) return;
										loadBalances(false);
										loadCost();
									});
								},
								children: t("timingStart")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshb-btn dshb-btn-small",
								disabled: autoSeconds <= 0,
								onClick: () => {
									saveAutoSeconds(0);
								},
								children: t("timingStop")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "dshb-btn dshb-btn-small",
								onClick: () => setTimingOpen(false),
								children: t("close")
							})
						]
					})
				]
			})
		}) : null]
	});
}
//#endregion
//#region src/client/plugin.tsx
/**
* dsh-balance-by-token —— 浏览器半边插件主体（slots 注册）。
*
* 本文件不包含 __ModuleLoader__ 包装：构建为单文件 CJS 后由 tsdown 的
* banner/footer 包装成宿主工厂格式。外部依赖（react 等）在打包时 external，
* 运行时经 factory 的 require 解析到宿主模块表（seed）。
*
* 入口结构（统一弹框）：
* - sidebar.footer.action：常驻「余额」按钮（固定 order: 30，排在插槽
*   靠前位置），点击打开统一弹框；
* - shell.overlay（dsh-balance-modal）：统一弹框，三个 tab —— 余额 / 费用 /
*   价格设置，所有余额相关的显示与设置都收敛在此。
*/
/** 侧边栏 footer 插槽 key 与本插件入口 id。 */
const FOOTER_SLOT = "sidebar.footer.action";
const FOOTER_ENTRY_ID = "dsh-balance-by-token";
function createPlugin() {
	return {
		name: "dsh-balance-by-token",
		inject: [
			"slots",
			"remote",
			"remote.commands",
			"timer"
		],
		apply(ctx) {
			const run = makeRun(ctx);
			const { store: modalStore, useOpen, autoStore, tickStore, bumpTick, useTick, useAutoSeconds } = makeBalanceModalStore();
			const slots = ctx.get("slots");
			if (slots === void 0) return;
			injectStyles();
			run("", { op: "autoRefreshGet" }).then((res) => {
				if (typeof res.seconds === "number") {
					autoStore.value = res.seconds;
					autoStore.emit();
				}
			}).catch(() => {});
			let lastAutoAt = Date.now();
			setInterval(() => {
				const seconds = autoStore.value ?? 0;
				if (seconds <= 0) return;
				if (Date.now() - lastAutoAt >= seconds * 1e3) {
					lastAutoAt = Date.now();
					bumpTick();
				}
			}, 1e3);
			const sessionRef = { current: "" };
			const getSession = () => sessionRef.current;
			try {
				slots.inject("conversation.chat.commandview", () => slots.register({
					name: "conversation.chat.commandview",
					key: "dsh-balance",
					priority: 0
				}, () => null));
			} catch {}
			slots.inject(FOOTER_SLOT, () => slots.register({
				name: FOOTER_SLOT,
				id: FOOTER_ENTRY_ID,
				order: 30
			}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FooterButton, {
				onOpen: () => modalStore.open(true),
				reportSession: (s) => {
					if (s) sessionRef.current = s;
				},
				wide: props.wide,
				useSessions: props.useSessions,
				run,
				useOpen
			})));
			slots.inject("conversation.session.header.utilities", () => slots.register({
				name: "conversation.session.header.utilities",
				id: "dsh-balance-header",
				order: 100
			}, (props) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HeaderButton, {
				sessionId: String(props.sessionId ?? ""),
				run,
				useTick
			})));
			slots.inject("shell.overlay", () => slots.register({
				name: "shell.overlay",
				id: "dsh-balance-modal"
			}, () => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BalanceModal, {
				run,
				useOpen,
				close: () => modalStore.close(),
				getSession,
				useTick,
				useAutoSeconds,
				setAutoSeconds: (seconds) => {
					autoStore.value = seconds;
					autoStore.emit();
					lastAutoAt = Date.now();
				}
			})));
		}
	};
}
//#endregion
//#region src/client/index.ts
/**
* dsh-balance-by-token —— 浏览器半边入口（tsdown 打包）。
*
* 本文件为纯 ESM 模块，直接导出插件形状 { name, inject, apply }；
* window.__ModuleLoader__.load 工厂包装由 tsdown 的 banner/intro/footer
* 在构建时生成（见 tsdown.config.ts）。外部依赖（react /
* react/jsx-runtime / @deepseek-ai/dsh-client-ui-primitives）构建时保持
* external，运行时经 factory 的 require 解析宿主模块表（seed）。
*/
const plugin = createPlugin();
const name = plugin.name;
const inject = plugin.inject;
const apply = plugin.apply;
//#endregion
exports.apply = apply;
exports.inject = inject;
exports.name = name;

return module.exports; } });
//# sourceMappingURL=client.js.map