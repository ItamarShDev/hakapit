import Image from "next/image";
import styles from "./styles.module.css";
type Data = {
  author: string;
  title: string;
  description: string;
  image: string;
};
export default function Header(props: { data: Data }) {
  const { author, title, description, image } = props.data;
  return (
    <header className={styles.header}>
      <div className={styles.image}>
        <Image
          src={image}
          alt="podcast logo"
          objectFit="contain"
          height={100}
          width={100}
          priority={true}
        />
        <span className={styles.author}>{author}</span>
      </div>
      <div>
        <h1>{title}</h1>
        <h2>{description}</h2>
      </div>
    </header>
  );
}
