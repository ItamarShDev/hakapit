import { EpisodeData } from "components/rss/types";
import Image from "next/image";
import styles from "./episode.module.css";
export function Episode({ episode }: { episode: EpisodeData }) {
  return (
    <dl className={styles.card}>
      <dt className={styles.header}>
        {episode.itunes.image && (
          <Image
            src={episode.itunes.image}
            alt="episode image"
            height={80}
            width={80}
            objectFit="contain"
            loading="lazy"
          />
        )}
        <span>
          <span className={styles.title}>{episode.title}</span>
          <div>
            <span className={styles.date}>
              {new Date(Date.parse(episode.isoDate)).toLocaleString()}
            </span>
          </div>
        </span>
      </dt>

      <dd>
        <p
          className={styles.description}
          dangerouslySetInnerHTML={{
            __html: episode.content,
          }}
        ></p>
        <div className={styles.audio}>
          <audio controls src={episode.enclosure.url}></audio>
        </div>
      </dd>
    </dl>
  );
}
