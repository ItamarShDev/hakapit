import { type Handle, type RemixNode } from "remix/component";
export function ConvexProvider(handle: Handle<{ url: string | null; children?: RemixNode }, { url: string | null }>) {
  handle.context.set({ url: handle.props.url });
  return () => handle.props.children;
}
