/**
 * 宿主 Context 的服务类型增强（声明合并）。
 *
 * 说明：本插件只经 `ctx.get(name)` 读取宿主服务（settings/commands/
 * credentials/sessions/webServer/webRuntime），不依赖任何服务的完整类型链；
 * 这里显式增强 Context.get 的泛型签名，保持类型安全。
 */
declare module '@deepseek-ai/cordis' {
  interface Context {
    /** 反射层提供的服务读取（context proxy 运行时委托给 reflect）。 */
    get<T = unknown>(name: string): T | undefined
  }
}

export {}
