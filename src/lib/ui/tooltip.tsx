import { ref, type Handle, type Props, type RemixNode } from "remix/component";

import { cn } from "~/lib/utils";
export function TooltipProvider(handle: Handle<{ children?: RemixNode }>) {
  return () => handle.props.children;
}
export function Tooltip(handle: Handle<{ children?: RemixNode }>) {
  return () => (
    <span className="relative inline-flex [&:hover>[role=tooltip]]:block [&:focus-within>[role=tooltip]]:block">
      {handle.props.children}
    </span>
  );
}
export function TooltipTrigger(handle: Handle<Props<"button">>) {
  return () => <button type="button" {...handle.props} />;
}
export function TooltipContent(handle: Handle<Props<"span"> & { side?: string }>) {
  return () => {
    const { side = "top", className, mix, ...props } = handle.props;
    return (
      <span
        role="tooltip"
        className={cn(
          "absolute left-1/2 -translate-x-1/2 z-50 hidden max-w-[calc(100vw-1rem)] overflow-hidden whitespace-nowrap rounded-md border bg-popover px-3 py-1.5 text-sm shadow-md",
          side === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
          className,
        )}
        {...props}
        mix={[
          mix,
          ref((node, signal) => {
            const element = node as HTMLElement;
            const parent = element.parentElement;
            function position() {
              const rect = element.getBoundingClientRect();
              if (!rect.width) return;
              const offset = Number.parseFloat(element.style.marginLeft) || 0;
              const left = rect.left - offset;
              const right = rect.right - offset;
              const shift = left < 8 ? 8 - left : Math.min(0, window.innerWidth - 8 - right);
              element.style.marginLeft = shift + "px";
            }
            const reposition = () => {
              if (parent?.matches(":hover, :focus-within")) position();
            };
            parent?.addEventListener("pointerenter", position, { signal });
            parent?.addEventListener("focusin", position, { signal });
            window.addEventListener("resize", reposition, { signal });
            window.addEventListener("scroll", reposition, { capture: true, signal });
            reposition();
          }),
        ]}
      />
    );
  };
}
