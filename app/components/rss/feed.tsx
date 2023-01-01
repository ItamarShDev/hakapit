import { Episode } from "./Episode";
import type { EpisodeData } from "app/api/types";
import { useRef, useState } from "react";
import { fetchPage } from "app/api/fetch-page";
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
    fetchPage(podcastName, ref.current.page)?.then(
      ({ items }: { items: EpisodeData[] }) => {
        setCurrentEpisodes((currentEpisodes) => [...currentEpisodes, ...items]);
      }
    );
  };

  return (
    <section className="flex flex-col items-center">
      {Array.from<EpisodeData>(currentEpisodes)?.map((episode, index) => (
        <Episode
          key={index}
          episode={episode}
          round
          podcastName={podcastName}
        />
      ))}
      <button className="action-button" onClick={() => loadMore()}>
        more
      </button>
    </section>
  );
}
