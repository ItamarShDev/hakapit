import { type Handle, type Props, type RemixNode } from "remix/component";

import { cn } from "~/lib/utils";
export function TooltipProvider(handle: Handle<{ children?: RemixNode }>) {
  return () => handle.props.children;
}
export function Tooltip(handle: Handle<{ children?: RemixNode }>) {
  return () => <span className="group/tooltip relative inline-flex">{handle.props.children}</span>;
}
export function TooltipTrigger(handle: Handle<Props<"button">>) {
  return () => <button type="button" {...handle.props} />;
}
export function TooltipContent(handle: Handle<Props<"span"> & { side?: string }>) {
  return () => {
    const { side = "top", className, ...props } = handle.props;
    return (
      <span
        role="tooltip"
        className={cn(
          "absolute left-1/2 -translate-x-1/2 z-50 hidden group-hover/tooltip:block group-focus-within/tooltip:block whitespace-nowrap rounded-md border bg-popover px-3 py-1.5 text-sm shadow-md",
          side === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
          className,
        )}
        {...props}
      />
    );
  };
}
