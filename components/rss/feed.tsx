import { Episode } from "components/rss/Episode";
import { EpisodeData } from "pages/api/hakapit/feed";
import { useRef, useState } from "react";
import styles from "./feed.module.css";
export default function Feed({
  episodes,
  podcastName,
}: {
  episodes: EpisodeData[] | undefined;
  podcastName: "hakapit" | "nitk";
}) {
  const [currentEpisodes, setCurrentEpisodes] = useState<EpisodeData[]>(
    episodes || []
  );
  const ref = useRef({ page: 0 });
  const loadMore = () => {
    ref.current.page += 1;
    fetch(`/api/${podcastName}/feed?page=${ref.current.page}`)
      .then((res) => res.json())
      .then(({ items }: { items:  EpisodeData[] }) => {
        setCurrentEpisodes((currentEpisodes) => [...currentEpisodes, ...items]);
      });
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
