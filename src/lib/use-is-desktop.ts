import { useEffect, useState } from "react";

export function useIsDesktop(query = "(min-width: 768px)") {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;

    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = "matches" in e ? e.matches : (e as MediaQueryList).matches;
      setIsDesktop(matches);
    };

    onChange(mql);

    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange as (ev: Event) => void);
      return () => mql.removeEventListener("change", onChange as (ev: Event) => void);
    }
    mql.addEventListener("change", onChange as (ev: Event) => void);
    return () => {
      mql.removeEventListener("change", onChange as (ev: Event) => void);
    };
  }, [query]);

  return isDesktop;
}
