/** Session bootstrap tracing — uses console.log so messages are visible with default DevTools filters. */

let traceSeq = 0

export function syncTrace(step: string, phase: 'before' | 'after' | 'error', detail?: unknown): number {
  if (!import.meta.env.DEV) return 0

  const id = ++traceSeq
  const prefix = `[session-sync #${id}]`
  if (phase === 'before') {
    console.log(prefix, `→ ${step}`, detail ?? '')
  } else if (phase === 'after') {
    console.log(prefix, `✓ ${step}`, detail ?? '')
  } else {
    console.error(prefix, `✗ ${step}`, detail ?? '')
  }
  return id
}

export async function traceAwait<TAwaitable extends PromiseLike<unknown>>(
  step: string,
  fn: () => TAwaitable
): Promise<Awaited<TAwaitable>> {
  syncTrace(step, 'before')
  try {
    const result = await fn()
    syncTrace(step, 'after')
    return result
  } catch (err) {
    syncTrace(step, 'error', err)
    throw err
  }
}
