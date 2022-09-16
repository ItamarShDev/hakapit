import { Episode } from "components/rss/Episode";
import { EpisodeData } from "components/rss/types";
import { useRef, useState } from "react";
import styles from "./feed.module.css";
export default function Feed({ episodes }: { episodes: EpisodeData[] }) {
  const [currentEpisodes, setCurrentEpisodes] =
    useState<EpisodeData[]>(episodes);
  const ref = useRef({ page: 0 });
  const loadMore = () => {
    ref.current.page += 1;
    fetch(`/api/feed?page=${ref.current.page}`)
      .then((res) => res.json())
      .then(({ items }: { items: EpisodeData[] }) => {
        setCurrentEpisodes((currentEpisodes) => [...currentEpisodes, ...items]);
      });
  };

  return (
    <div>
      <section className={styles.wrapper}>
        {Array.from<EpisodeData>(currentEpisodes)?.map((episode, index) => (
          <Episode key={index} episode={episode} round />
        ))}
      </section>
      <button className={styles.more} onClick={() => loadMore()}>
        more
      </button>
    </div>
  );
}
