export function anyValueToNumber(v?: any, label: string = ''): number | undefined {
  if (v == null) return undefined
  if (!v.toString) {
    throw new Error(`Value ${v} is not convertable`)
  }
  const str = v.toString()
  const numStr = str.trim().length > 0 ? str.trim() : undefined
  if (numStr === undefined) {
    return undefined
  }
  const num = Number(numStr)
  if (isNaN(num)) {
    throw new Error(`Invalid non numeric value for value ${label} (${numStr})`)
  }
  if (!Number.isFinite(num)) {
    throw new Error(`Invalid infinite number for value ${label} (${numStr})`)
  }
  return num
}
