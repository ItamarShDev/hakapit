export function toDateString(value?: Date | null) {
  if (!value) return undefined;
  return new Date(value).toLocaleDateString();
}
