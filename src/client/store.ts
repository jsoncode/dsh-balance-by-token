/**
 * dsh-balance-by-token —— 浏览器半边：统一「余额」弹框开关（footer 入口 ↔ overlay 弹框共享）。
 */

import { useEffect, useState } from 'react'

interface StoreState<T> {
  value: T | null
  listeners: Array<() => void>
  emit(): void
  subscribe(l: () => void): () => void
  open(value: T): void
  close(): void
}

function createStore<T>() {
  const store: StoreState<T> = {
    value: null,
    listeners: [],
    emit() { for (let i = 0; i < this.listeners.length; i++) this.listeners[i]() },
    subscribe(l) { this.listeners.push(l); return () => { const i = this.listeners.indexOf(l); if (i >= 0) this.listeners.splice(i, 1) } },
    open(value) { this.value = value; this.emit() },
    close() { this.value = null; this.emit() },
  }
  return store
}

export interface BalanceModalStore {
  store: StoreState<boolean>
  useOpen(): boolean
  /** 定时自动刷新间隔（秒，0 = 关闭）。 */
  autoStore: StoreState<number>
  useAutoSeconds(): number
  /** 自动刷新 tick：宿主插件侧定时器到点递增，头部按钮 / 弹框订阅后各自刷新。 */
  tickStore: StoreState<number>
  useTick(): number
  bumpTick(): void
}

function useStoreValue<T>(target: StoreState<T>): T | null {
  const [v, setV] = useState<T | null>(target.value)
  useEffect(() => target.subscribe(() => setV(target.value)), [])
  return v
}

/** 统一「余额」弹框的打开状态（footer 入口 open，overlay 弹框消费）。 */
export function makeBalanceModalStore(): BalanceModalStore {
  const store = createStore<boolean>()
  const autoStore = createStore<number>()
  const tickStore = createStore<number>()
  autoStore.value = 0
  tickStore.value = 0
  const useOpen = (): boolean => {
    const [v, setV] = useState<boolean>(!!store.value)
    useEffect(() => store.subscribe(() => setV(!!store.value)), [])
    return v
  }
  const useAutoSeconds = (): number => {
    const v = useStoreValue<number>(autoStore)
    return v ?? 0
  }
  const useTick = (): number => {
    const v = useStoreValue<number>(tickStore)
    return v ?? 0
  }
  const bumpTick = (): void => {
    tickStore.value = (tickStore.value ?? 0) + 1
    tickStore.emit()
  }
  return { store, useOpen, autoStore, useAutoSeconds, tickStore, useTick, bumpTick }
}
