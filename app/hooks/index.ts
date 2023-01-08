import { useMemo } from "react";

export function useDate(value?: string) {
  const date = useMemo(
    () => value && new Date(Date.parse(value)).toLocaleString(),
    [value]
  );
  return date;
}
