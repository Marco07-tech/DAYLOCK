/**
 * Captures [startup] console logs across a page reload.
 * Usage: node scripts/capture-startup-logs.mjs [url]
 */
import { chromium } from 'playwright'

const url = process.argv[2] ?? 'http://localhost:5173/dashboard'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

const consoleLines = []
page.on('console', (msg) => {
  const text = msg.text()
  if (text.includes('[startup]')) {
    consoleLines.push(text)
    console.log('CAPTURED:', text)
  }
})

console.log('--- First load:', url)
await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
await page.waitForTimeout(3000)

const logsBeforeReload = await page.evaluate(() => window.__STARTUP_LOGS ?? [])
console.log('--- Reload (F5 simulation)')
await page.reload({ waitUntil: 'networkidle', timeout: 60_000 })
await page.waitForTimeout(8000)

const logsAfterReload = await page.evaluate(() => window.__STARTUP_LOGS ?? [])
const isLoading = await page.evaluate(() => {
  const el = document.body?.innerText ?? ''
  return el.includes('Loading session')
})

console.log('\n=== SUMMARY ===')
console.log('Stuck on Loading session:', isLoading)
console.log('Console [startup] lines after reload:', consoleLines.length)
console.log('Last console line:', consoleLines[consoleLines.length - 1] ?? '(none)')
console.log('\n__STARTUP_LOGS after reload:')
for (const entry of logsAfterReload) {
  console.log(`  ${entry.message}`, entry.detail ? JSON.stringify(entry.detail) : '')
}
const last = logsAfterReload[logsAfterReload.length - 1]
console.log('\nLAST __STARTUP_LOGS entry:', last?.message ?? '(none)')

await browser.close()
