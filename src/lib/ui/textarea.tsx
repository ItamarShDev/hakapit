import { type Handle, type Props } from "remix/component";

import { cn } from "~/lib/utils";
export function Textarea(handle: Handle<Props<"textarea">>) {
  return () => {
    const { className, ...props } = handle.props;
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        {...props}
      />
    );
  };
}
