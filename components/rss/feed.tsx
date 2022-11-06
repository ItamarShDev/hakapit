"use client";
import { Episode } from "components/rss/Episode";
import { EpisodeData } from "api/types";
import { useRef, useState } from "react";
import styles from "./feed.module.css";
import { fetchPage } from "api/fetch-page";
export default function Feed({
  episodes,
  podcastName,
}: {
  episodes: EpisodeData[] | undefined;
  podcastName: "hakapit" | "nitk" | "balcony-albums";
}) {
  const [currentEpisodes, setCurrentEpisodes] = useState<EpisodeData[]>(
    episodes || []
  );
  const ref = useRef({ page: 0 });
  const loadMore = () => {
    ref.current.page += 1;
    fetchPage(podcastName, ref.current.page).then(
      ({ items }: { items: EpisodeData[] }) => {
        setCurrentEpisodes((currentEpisodes) => [...currentEpisodes, ...items]);
      }
    );
  };

  return (
    <section className={styles.feed}>
      {Array.from<EpisodeData>(currentEpisodes)?.map((episode, index) => (
        <Episode
          key={index}
          episode={episode}
          round
          podcastName={podcastName}
        />
      ))}
      <button className={styles.more} onClick={() => loadMore()}>
        more
      </button>
    </section>
  );
}
