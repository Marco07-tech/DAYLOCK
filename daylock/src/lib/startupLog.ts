type StartupEntry = {
  t: number
  message: string
  detail?: unknown
}

declare global {
  interface Window {
    __STARTUP_LOGS?: StartupEntry[]
  }
}

export function startupLog(message: string, detail?: unknown): void {
  const entry: StartupEntry = { t: Date.now(), message, detail }
  if (typeof window !== 'undefined') {
    window.__STARTUP_LOGS = window.__STARTUP_LOGS ?? []
    window.__STARTUP_LOGS.push(entry)
  }
  console.log('[startup]', message, detail !== undefined ? detail : '')
}
