import { on, ref, type Handle, type Props } from "remix/component";

import { cn } from "~/lib/utils";
type AvatarState = { loaded: boolean; refresh: () => void };
export function Avatar(handle: Handle<Props<"div">, AvatarState>) {
  const state = {
    loaded: false,
    refresh: () => {
      handle.update();
    },
  };
  handle.context.set(state);
  return () => {
    const { className, ...props } = handle.props;
    return (
      <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
    );
  };
}
export function AvatarImage(handle: Handle<Props<"img">>) {
  return () => {
    const { className, mix, ...props } = handle.props;
    const avatar = handle.context.get(Avatar);
    return (
      <img
        className={cn("aspect-square h-full w-full", className)}
        {...props}
        mix={[
          mix,
          ref((node) => {
            const image = node as HTMLImageElement;
            if (image.complete && image.naturalWidth) {
              avatar.loaded = true;
              avatar.refresh();
            }
          }),
          on("load", () => {
            avatar.loaded = true;
            avatar.refresh();
          }),
          on("error", (event) => {
            avatar.loaded = false;
            (event.currentTarget as HTMLImageElement).hidden = true;
            avatar.refresh();
          }),
        ]}
      />
    );
  };
}
export function AvatarFallback(handle: Handle<Props<"span">>) {
  return () => {
    const { className, ...props } = handle.props;
    const avatar = handle.context.get(Avatar);
    return avatar?.loaded ? null : (
      <span
        className={cn(
          "absolute inset-0 flex h-full w-full items-center justify-center rounded-full bg-muted",
          className,
        )}
        {...props}
      />
    );
  };
}
