import { useDate } from "app/hooks";
import type { EpisodeData } from "app/api/types";
import { Link } from "@remix-run/react";
export function Episode({
  episode,
  round = false,
  podcastName,
}: {
  episode?: EpisodeData;
  round?: boolean;
  podcastName: "hakapit" | "nitk" | "balcony-albums";
}) {
  const isoDate = useDate(episode?.isoDate);
  return (
    <dl className={`episode-card ${round ? "rounded-3xl" : ""}`}>
      <dt className="grid grid-cols-auto-1fr gap-3 px-3 py-3 place-content-center">
        <img
          src={episode?.itunes?.image}
          alt="episode"
          height={80}
          width={80}
          className="object-contain"
        />
        <span>
          <Link
            to={`/${podcastName}/episodes/${episode?.episodeNumber}`}
            className="text-accent text-lg"
          >
            {episode?.title}
          </Link>
          <div>
            <span className="text-xs text-paragraph/30">{isoDate}</span>
          </div>
        </span>
      </dt>

      <dd>
        {episode?.content && (
          <div
            className="text-lg p-4"
            dangerouslySetInnerHTML={{
              __html: episode?.content,
            }}
          ></div>
        )}
        <div className="p-4 flex justify-end">
          <audio
            className="audio"
            controls
            src={episode?.enclosure?.url}
          ></audio>
        </div>
      </dd>
    </dl>
  );
}
