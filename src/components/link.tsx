import { link, on, type Handle, type Props } from "remix/component";
type LinkProps = Omit<Props<"a">, "href" | "role"> & {
  to: string;
  params?: Record<string, string>;
  preload?: string;
  resetScroll?: boolean;
  onSelect?: () => void;
};
export function Link(handle: Handle<LinkProps>) {
  return () => {
    const { to, params = {}, preload: _, resetScroll = true, onSelect, mix, ...props } = handle.props;
    const href = to.replace(/\$(\w+)/g, (_, name) => encodeURIComponent(params[name] ?? ""));
    return <a {...props} href={href} mix={[mix, link(href, { resetScroll }), on("click", () => onSelect?.())]} />;
  };
}
