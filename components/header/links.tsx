"use client";
import { Data } from "components/header/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./styles.module.css";

function Links() {
  const pathname = usePathname();
  const isHakapit = pathname === "/hakapit";
  const isNitk = pathname?.startsWith("/nitk");
  const isBalconyAlbums = pathname?.startsWith("/balcony-albums");
  const links = [
    {
      href: "/",
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
    <div className={styles.links}>
      {links.map((link) => (
        <Link href={link.href} key={link.href}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}
export function HomeLink({ data }: { data: Data }) {
  const pathname = usePathname();
  const isNitk = pathname?.startsWith("/nitk") || false;
  const path = isNitk ? "/nitk" : "/";
  return (
    <Link href={path} legacyBehavior>
      <span>
        <h1>{data.title}</h1>
        <Links />
      </span>
    </Link>
  );
}
