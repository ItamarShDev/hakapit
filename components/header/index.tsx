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
export default function Header(props: { data: Data }) {
  const { author, title, description, image } = props.data;
  const { pathname } = useRouter();
  const isNitk = pathname?.startsWith("/nitk") || false;
  const path = isNitk ? "/nitk" : "/";
  return (
    <header className={styles.header}>
      <Link href="/">
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
      </Link>
      <Link href={path}>
        <div>
          <h1>{title}</h1>
          <h2>{description}</h2>
        </div>
      </Link>
      <div className={styles.links}>
        {!isNitk ? (
          <Link href="/nitk">
            <a>שכונה בממלכה</a>
          </Link>
        ) : (
          <Link href="/">
            <a>הכפית</a>
          </Link>
        )}
      </div>
    </header>
  );
}
