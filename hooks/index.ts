import { useMemo } from "react";

export function useDate(value?: string) {
  const date = useMemo(
    () => value && new Date(Date.parse(value)).toLocaleString(),
    [value]
  );
  return date;
}
export function scrollHandler(onScroll: () => void, onScrollEnd: () => void) {
  function scrollFunction() {
    if (
      document.body.scrollTop > 50 ||
      document.documentElement.scrollTop > 50
    ) {
      onScroll();
    } else {
      onScrollEnd();
    }
  }
  if (typeof window !== "undefined") {
    window.onscroll = scrollFunction;
  }
}
