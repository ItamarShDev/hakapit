import type { Data } from "./types";
import { NavLink } from "@remix-run/react";

function Links({ selected }: { selected: string | undefined }) {
  const isHakapit = selected === "/hakapit";
  const isNitk = selected?.startsWith("/nitk");
  const isBalconyAlbums = selected?.startsWith("/balcony-albums");
  const activeStyle = {
    textDecoration: "underline",
  };
  const links = [
    {
      href: "/hakapit",
      label: "הכפית",
    },
    {
      href: "/nitk",
      label: "שכונה בממלכה",
    },
    {
      href: "/balcony-albums",
      label: "אלבומים במרפסת",
    },
  ].filter((link) => {
    if (isNitk) return link.href !== "/nitk";
    if (isBalconyAlbums) return link.href !== "/balcony-albums";
    if (isHakapit) return link.href !== "/hakapit";
    return true;
  });

  return (
    <div className="flex gap-4">
      {links.map((link) => (
        <NavLink
          to={link.href}
          key={link.href}
          style={({ isActive }) => (isActive ? activeStyle : {})}
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  );
}
export function HomeLink({ data }: { data: Data }) {
  return (
    <span>
      <h1 className="text-6xl">{data.title}</h1>
      <Links selected={data.title} />
    </span>
  );
}
