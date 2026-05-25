export function formatPercent(value) {
  return `${Math.round(value)}%`
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value)
}