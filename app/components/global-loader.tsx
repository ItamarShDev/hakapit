import { useFetchers, useTransition } from "@remix-run/react";
import { useMemo } from "react";
const cx = (...args: string[]) =>
  args
    .flat()
    .filter((x) => x !== null && x !== undefined && typeof x !== "boolean")
    .join(" ");
function GlobalLoading() {
  const transition = useTransition();
  const fetchers = useFetchers();
  let state = useMemo<"idle" | "loading">(
    function getGlobalState() {
      let states = [
        transition.state,
        ...fetchers.map((fetcher) => fetcher.state),
      ];
      if (states.every((state) => state === "idle")) return "idle";
      return "loading";
    },
    [transition.state, fetchers]
  );
  const active = state !== "idle";
  return (
    <div
      role="progressbar"
      aria-valuetext={active ? "Loading" : undefined}
      aria-hidden={!active}
      className={cx(
        "pointer-events-none fixed left-0 bottom-0 z-50 p-4 transition-all duration-500 ease-out",
        active ? "translate-y-0" : "translate-y-full"
      )}
    >
      <svg
        className="h-7 w-7 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
      >
        <circle
          className="stroke-accent/25"
          cx={12}
          cy={12}
          r={10}
          strokeWidth={4}
        />
        <path
          className="fill-accent"
          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export { GlobalLoading };
