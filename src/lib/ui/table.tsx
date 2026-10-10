import { type Handle, type Props } from "remix/component";

import { cn } from "~/lib/utils";
export function Table(handle: Handle<Props<"table">>) {
  return () => {
    const { className, ...props } = handle.props;
    return (
      <div className="relative w-full overflow-auto">
        <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
      </div>
    );
  };
}
export function TableHeader(handle: Handle<Props<"thead">>) {
  return () => {
    const { className, ...props } = handle.props;
    return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
  };
}
export function TableBody(handle: Handle<Props<"tbody">>) {
  return () => {
    const { className, ...props } = handle.props;
    return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
  };
}
export function TableFooter(handle: Handle<Props<"tfoot">>) {
  return () => {
    const { className, ...props } = handle.props;
    return <tfoot className={cn("border-t bg-muted/50 font-medium last:[&>tr]:border-b-0", className)} {...props} />;
  };
}
export function TableRow(handle: Handle<Props<"tr">>) {
  return () => {
    const { className, ...props } = handle.props;
    return (
      <tr
        className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)}
        {...props}
      />
    );
  };
}
export function TableHead(handle: Handle<Props<"th">>) {
  return () => {
    const { className, ...props } = handle.props;
    return (
      <th
        className={cn(
          "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
          className,
        )}
        {...props}
      />
    );
  };
}
export function TableCell(handle: Handle<Props<"td">>) {
  return () => {
    const { className, ...props } = handle.props;
    return <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />;
  };
}
export function TableCaption(handle: Handle<Props<"caption">>) {
  return () => {
    const { className, ...props } = handle.props;
    return <caption className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />;
  };
}
