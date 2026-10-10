import { type Handle, type Props } from "remix/component";
export function Image(handle: Handle<Props<"img"> & { layout?: string; priority?: boolean }>) {
  return () => {
    const { layout: _, priority, ...props } = handle.props;
    return <img loading={priority ? "eager" : "lazy"} decoding="async" {...props} />;
  };
}
