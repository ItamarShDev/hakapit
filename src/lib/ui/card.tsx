import { type Handle, type Props } from "remix/component";

import { cn } from "~/lib/utils";
export function Card(handle: Handle<Props<"div">>) {
  return () => {
    const { className, ...props } = handle.props;
    return <div className={cn("rounded-lg border bg-card text-card-foreground shadow-xs", className)} {...props} />;
  };
}
export function CardHeader(handle: Handle<Props<"div">>) {
  return () => {
    const { className, ...props } = handle.props;
    return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
  };
}
export function CardTitle(handle: Handle<Props<"h3">>) {
  return () => {
    const { className, ...props } = handle.props;
    return <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />;
  };
}
export function CardDescription(handle: Handle<Props<"p">>) {
  return () => {
    const { className, ...props } = handle.props;
    return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
  };
}
export function CardContent(handle: Handle<Props<"div">>) {
  return () => {
    const { className, ...props } = handle.props;
    return <div className={cn("p-6 pt-0", className)} {...props} />;
  };
}
export function CardFooter(handle: Handle<Props<"div">>) {
  return () => {
    const { className, ...props } = handle.props;
    return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
  };
}
