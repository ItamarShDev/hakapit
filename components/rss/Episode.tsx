import { EpisodeData } from "components/rss/types";
import Image from "next/image";
import Link from "next/link";
import styles from "./episode.module.css";
export function Episode({
  episode,
  round,
}: {
  episode: EpisodeData;
  round?: boolean;
}) {
  const pageNumber = 1;
  const cardClass = styles.card + (round ? ` ${styles.round}` : "");
  return (
    <dl className={cardClass}>
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
          <Link href={`/episodes/${pageNumber}`}>
            <a className={styles.title}>{episode.title}</a>
          </Link>
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
