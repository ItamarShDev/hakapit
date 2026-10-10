import { on, ref, type Handle, type Props, type RemixNode } from "remix/component";

import { cn } from "~/lib/utils";
type PopoverState = { open: boolean; toggle: () => void; trigger?: HTMLButtonElement };
export function Popover(
  handle: Handle<{ children?: RemixNode; open: boolean; onOpenChange: (open: boolean) => void }, PopoverState>,
) {
  const state: PopoverState = {
    get open() {
      return handle.props.open;
    },
    toggle() {
      handle.props.onOpenChange(!handle.props.open);
    },
  };
  handle.context.set(state);
  let element: Element | undefined;
  handle.queueTask(() => {
    document.addEventListener(
      "pointerdown",
      (event) => {
        if (handle.props.open && !element?.contains(event.target as Node)) handle.props.onOpenChange(false);
      },
      { signal: handle.signal },
    );
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") {
          handle.props.onOpenChange(false);
          state.trigger?.focus();
        }
      },
      { signal: handle.signal },
    );
  });
  return () => (
    <div
      className="relative"
      mix={ref((node) => {
        element = node;
      })}
    >
      {handle.props.children}
    </div>
  );
}
export function PopoverTrigger(handle: Handle<{ children?: RemixNode; asChild?: boolean }>) {
  return () => {
    const state = handle.context.get(Popover);
    return (
      <button
        type="button"
        className="block w-full"
        aria-expanded={state.open}
        mix={[
          ref((node) => {
            state.trigger = node as HTMLButtonElement;
          }),
          on("click", () => state.toggle()),
        ]}
      >
        {handle.props.children}
      </button>
    );
  };
}
export function PopoverContent(handle: Handle<Props<"div"> & { side?: string; align?: string }>) {
  let element: HTMLElement | undefined;
  function position() {
    const trigger = handle.context.get(Popover).trigger;
    if (!element || !trigger) return;
    const rect = trigger.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    const left = Math.max(16, Math.min(rect.left + rect.width / 2 - box.width / 2, window.innerWidth - box.width - 16));
    const below = rect.bottom + 8;
    const top = below + box.height < window.innerHeight - 16 ? below : Math.max(16, rect.top - box.height - 8);
    element.style.left = left + "px";
    element.style.top = top + "px";
  }
  return () => {
    const { className, side: _, align: __, ...props } = handle.props;
    if (!handle.context.get(Popover).open) return null;
    handle.queueTask(() => {
      element?.showPopover?.();
      position();
    });
    return (
      <div
        role="dialog"
        popover="manual"
        className={cn(
          "fixed z-50 inset-auto m-0 w-72 max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-2rem)] overflow-auto rounded-md border bg-popover p-4 text-popover-foreground shadow-md",
          className,
        )}
        {...props}
        mix={ref((node, signal) => {
          element = node as HTMLElement;
          element.showPopover?.();
          position();
          window.addEventListener("resize", position, { signal });
          window.addEventListener("scroll", position, { capture: true, signal });
        })}
      />
    );
  };
}
