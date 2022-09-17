import Image from "next/image";
import Link from "next/link";
import { EpisodeData } from "pages/api/feed";
import styles from "./episode.module.css";
export function Episode({
  episode,
  round = false,
}: {
  episode?: EpisodeData;
  round?: boolean;
}) {
  if (!episode) return null;
  const cardClass = styles.card + (round ? ` ${styles.round}` : "");
  const guid = episode?.guid.split("/").pop();
  return (
    <dl className={cardClass}>
      <dt className={styles.header}>
        {episode?.itunes?.image && (
          <Image
            src={episode?.itunes?.image}
            alt="episode image"
            height={80}
            width={80}
            objectFit="contain"
            loading="lazy"
          />
        )}
        <span>
          <Link href={`/episodes/${guid}`}>
            <a className={styles.title}>{episode?.title}</a>
          </Link>
          <div>
            <span className={styles.date}>
              {new Date(Date.parse(episode?.isoDate)).toLocaleString()}
            </span>
          </div>
        </span>
      </dt>

      <dd className={styles.content}>
        <div
          className={styles.description}
          dangerouslySetInnerHTML={{
            __html: episode?.content,
          }}
        ></div>
        <div className={styles.audio}>
          <audio controls src={episode?.enclosure?.url}></audio>
        </div>
      </dd>
    </dl>
  );
}
