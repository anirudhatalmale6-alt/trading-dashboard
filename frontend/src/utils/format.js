export function formatCurrency(value, currency = 'USD') {
  if (value == null) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value) {
  if (value == null) return '-'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function formatPnl(value) {
  if (value == null) return '-'
  const formatted = formatCurrency(Math.abs(value))
  return value >= 0 ? `+${formatted}` : `-${formatted}`
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function pnlColor(value) {
  if (value == null || value === 0) return 'text-gray-500'
  return value > 0 ? 'text-emerald-500' : 'text-red-500'
}
