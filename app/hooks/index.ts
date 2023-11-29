
export function isDate(value?: string) {
  return value && new Date(Date.parse(value)).toLocaleDateString()
}