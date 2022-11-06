"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./styles.module.css";
type Data = {
  author?: string;
  title?: string;
  description?: string;
  image?: { link?: string; url: string; title?: string };
};

function Links() {
  const pathname = usePathname();
  const isHakapit = pathname === "/hakapit";
  const isNitk = pathname?.startsWith("/nitk");
  const isBalconyAlbums = pathname?.startsWith("/balcony-albums");
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
    <div className={styles.links}>
      {links.map((link) => (
        <Link href={link.href} key={link.href}>
          {link.label}
        </Link>
      ))}
    </div>
  );
}
export default function Header({ data }: { data: Data }) {
  const { author, title, description, image } = data;
  const pathname = usePathname();
  const isNitk = pathname?.startsWith("/nitk") || false;
  const path = isNitk ? "/nitk" : "/";

  return (
    <header className={styles.header}>
      <header className={styles.head}>
        <div className={styles.image}>
          {image && (
            <Image
              src={image.url}
              alt="podcast logo"
              objectFit="contain"
              height={100}
              width={100}
              priority={true}
            />
          )}
          <span className={styles.author}>{author}</span>
        </div>
        <Link href={path} legacyBehavior>
          <span>
            <h1>{title}</h1>
            <Links />
          </span>
        </Link>
      </header>
      <footer className={styles.description}>
        <h2>{description}</h2>
      </footer>
    </header>
  );
}
