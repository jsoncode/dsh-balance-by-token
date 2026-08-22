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

import { injectStyles } from './styles.ts'
import { makeRun, type RunFn } from './rpc.ts'
import { makeBalanceModalStore } from './store.ts'
import { FooterButton } from './components/FooterButton.tsx'
import { HeaderButton } from './components/HeaderButton.tsx'
import { BalanceModal } from './components/BalanceModal.tsx'

/** 宿主 slots 服务最小视图。 */
interface SlotsService {
  inject(name: string, fn: () => unknown): unknown
  register(def: Record<string, unknown>, component: unknown): () => void
}

/** 侧边栏 footer 插槽 key 与本插件入口 id。 */
const FOOTER_SLOT = 'sidebar.footer.action'
const FOOTER_ENTRY_ID = 'dsh-balance-by-token'

/** 浏览器侧插件上下文（宿主注入）。 */
export interface ClientCtx {
  get<T = unknown>(name: string): T | undefined
  remote: {
    commands: {
      execute(sessionId: string, command: string): Promise<unknown>
    }
  }
}

export interface ClientPluginModule {
  name: string
  inject: string[]
  apply(ctx: ClientCtx): void
}

/** footer slot 宿主注入的 hooks 形状。 */
interface FooterWorkspaceHooks {
  useSessions(selector: (s: { current?: string }) => unknown): unknown
}

export function createPlugin(): ClientPluginModule {
  return {
    name: 'dsh-balance-by-token',
    inject: ['slots', 'remote', 'remote.commands', 'timer'],

    apply(ctx: ClientCtx) {
      const run: RunFn = makeRun(ctx)
      const { store: modalStore, useOpen, autoStore, tickStore, bumpTick, useTick, useAutoSeconds } = makeBalanceModalStore()
      const slots = ctx.get<SlotsService>('slots')
      if (slots === undefined) return
      injectStyles()

      // 载入持久化的定时自动刷新间隔（秒），并驱动全局自动刷新 tick。
      void run('', { op: 'autoRefreshGet' }).then((res) => {
        if (typeof res.seconds === 'number') {
          autoStore.value = res.seconds
          autoStore.emit()
        }
      }).catch(() => { /* 宿主不可达时保持关闭 */ })
      let lastAutoAt = Date.now()
      setInterval(() => {
        const seconds = autoStore.value ?? 0
        if (seconds <= 0) return
        if (Date.now() - lastAutoAt >= seconds * 1000) {
          lastAutoAt = Date.now()
          bumpTick()
        }
      }, 1000)

      // 当前会话 id 追踪：footer 入口挂载时上报，费用查询随请求上传，
      // 供宿主读取内存 Session（最近一次提问 / 本会话费用）。
      const sessionRef: { current: string } = { current: '' }
      const getSession = (): string => sessionRef.current

      // ─── 对话中的 dsh-balance 命令行：兜底不渲染内部 JSON 结果 ──────────
      // 浏览器半边的请求走 /dsh-balance/api HTTP 路由（rpc.ts），不进入对话
      // 命令通道。此 commandview 注册仅兜底「用户/模型在对话中显式执行
      // /dsh-balance 命令」的场景，隐藏 {"ok":true,...} 内部 JSON 卡片。
      try {
        slots.inject('conversation.chat.commandview', () => slots.register(
          { name: 'conversation.chat.commandview', key: 'dsh-balance', priority: 0 },
          () => null,
        ))
      } catch { /* 插槽未声明时静默降级（通用命令卡片渲染） */ }

      // ─── 侧边栏底部入口：常驻「余额」按钮（footer.action 区）─────────
      //     一次注册，声明固定 order: 30、不订阅插槽变化：
      //     避免与其它动态排序插件形成互相触发的重注册死循环。styles.ts
      //     已把该列表容器改为纵向堆叠，多个按钮各占一行。
      slots.inject(FOOTER_SLOT, () => slots.register(
        { name: FOOTER_SLOT, id: FOOTER_ENTRY_ID, order: 30 },
        (props: Record<string, unknown>) => (
          <FooterButton
            onOpen={() => modalStore.open(true)}
            reportSession={(s) => { if (s) sessionRef.current = s }}
            wide={props.wide as boolean | undefined}
            useSessions={props.useSessions as FooterWorkspaceHooks['useSessions']}
            run={run}
            useOpen={useOpen}
          />
        ),
      ))

      // ─── 会话头部工具区：当前会话费用 / 余额按钮（header.utilities）────
      slots.inject('conversation.session.header.utilities', () => slots.register(
        { name: 'conversation.session.header.utilities', id: 'dsh-balance-header', order: 100 },
        (props: Record<string, unknown>) => (
          <HeaderButton
            sessionId={String(props.sessionId ?? '')}
            run={run}
            useTick={useTick}
          />
        ),
      ))

      // ─── 统一「余额」弹框（余额 / 费用 / 价格设置 三 tab）──────────────
      slots.inject('shell.overlay', () => slots.register(
        { name: 'shell.overlay', id: 'dsh-balance-modal' },
        () => (
          <BalanceModal
            run={run}
            useOpen={useOpen}
            close={() => modalStore.close()}
            getSession={getSession}
            useTick={useTick}
            useAutoSeconds={useAutoSeconds}
            setAutoSeconds={(seconds) => {
              autoStore.value = seconds
              autoStore.emit()
              lastAutoAt = Date.now()
            }}
          />
        ),
      ))
    },
  }
}
