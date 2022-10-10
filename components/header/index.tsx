import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "./styles.module.css";
type Data = {
  author?: string;
  title?: string;
  description?: string;
  image?: string;
};

function Links() {
  const { pathname } = useRouter();
  const isHakapit = pathname === "/";
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
    if (isHakapit) return link.href !== "/";
    return true;
  });
  return (
    <div className={styles.links}>
      {links.map((link) => (
        <Link href={link.href} key={link.href}>
          <a>{link.label}</a>
        </Link>
      ))}
    </div>
  );
}
export default function Header(props: { data: Data }) {
  const { author, title, description, image } = props.data;
  const { pathname } = useRouter();
  const isNitk = pathname?.startsWith("/nitk") || false;
  const path = isNitk ? "/nitk" : "/";
  return (
    <header className={styles.header}>
      <header className={styles.head}>
        <div className={styles.image}>
          {image && (
            <Image
              src={image}
              alt="podcast logo"
              objectFit="contain"
              height={100}
              width={100}
              priority={true}
            />
          )}
          <span className={styles.author}>{author}</span>
          {!isNitk && (
            <Link href="/what-is-kapit">
              <a>מה זה כפית?</a>
            </Link>
          )}
        </div>
        <Link href={path}>
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
