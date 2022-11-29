import Image from "next/image";
import { HomeLink } from "components/header/links";
import { Data } from "components/header/types";
import styles from "./styles.module.css";

export default function Header({ data }: { data: Data }) {
  const { author, description, image } = data;

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
        <HomeLink data={data} />
      </header>
      <footer className={styles.description}>
        <h2>{description}</h2>
      </footer>
    </header>
  );
}
