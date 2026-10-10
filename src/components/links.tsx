import { type Handle, type Props } from "remix/component";

import { Link } from "~/components/link";
import { cn } from "~/lib/utils";
const links = [
  ["/", "בית"],
  ["/hakapit", "הכפית"],
  ["/nitk", "שכונה בממלכה"],
  ["/balcony-albums", "אלבומים במרפסת"],
];
export function Links(handle: Handle<Props<"nav"> & { onSelect?: () => void }>) {
  return () => (
    <nav className={cn("gap-2 lg:gap-4 links text-1xl overflow-hidden", handle.props.className)}>
      {links.map(([href, label], index) => (
        <>
          <Link
            key={href}
            to={href}
            className={
              new URL(handle.frames.top.src, "https://hakapit.online").pathname === href ? "underline" : undefined
            }
            resetScroll={false}
            onSelect={handle.props.onSelect}
          >
            {label}
          </Link>
          {index !== links.length - 1 && <span className="text-accent lg:inline-block hidden">|</span>}
        </>
      ))}
    </nav>
  );
}
