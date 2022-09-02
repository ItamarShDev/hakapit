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
      .then(({ episodes }: { episodes: EpisodeData[] }) => {
        setCurrentEpisodes((currentEpisodes) => [
          ...currentEpisodes,
          ...episodes,
        ]);
      });
  };

  return (
    <>
      <section className={styles.wrapper}>
        {Array.from<EpisodeData>(currentEpisodes)?.map((episode, index) => (
          <Episode key={index} episode={episode} />
        ))}
      </section>
      <button onClick={() => loadMore()}>more</button>
    </>
  );
}
