import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { Links } from "~/components/links";
import { MenuToggle, MOBILE_NAVIGATION_ID } from "~/layouts/header/menu";
import { karantina } from "~/lib/fonts";
import { cn } from "~/lib/utils";

type Props = {
  data: { imageUrl: string; title: string };
  podcast: string | undefined;
} & React.HTMLAttributes<HTMLElement>;

export default function Header({ data }: Props) {
  const { imageUrl } = data;
  const [open, setOpen] = useState(false);

  return (
    <header className="header overflow-hidden">
      <div className="lg:items-center flex flex-wrap items-start gap-4 p-4">
        <div className="header-image">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="podcast logo"
              className="object-contain"
              width={48}
              height={48}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          )}
        </div>
        <div className={cn("flex-1 header-title flex gap-3 items-baseline", karantina.className)}>
          <Link to="/">
            <h1>{data.title}</h1>
          </Link>
        </div>
        <div className="lg:gap-4 lg:hidden flex flex-col flex-wrap items-end gap-2 pt-2">
          <MenuToggle expanded={open} onClick={() => setOpen(!open)} />
        </div>
        <Links className="lg:flex flex-row hidden" />
      </div>
      <div
        id={MOBILE_NAVIGATION_ID}
        className={cn("grid-transition header-links grid items-start", open ? "show-menu mb-4" : "hide-menu")}
      >
        <Links className="flex flex-col items-center text-2xl" onSelect={() => setOpen(false)} />
      </div>
    </header>
  );
}
