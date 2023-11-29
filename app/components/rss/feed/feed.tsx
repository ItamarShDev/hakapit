import { useNavigation } from "@remix-run/react";
import type { Feed } from "~/api/types";
import { Episode, SkeletonCard } from "~/components/rss/Episode";

export function Feed({
  data,
  podcastName,
  limit,
}: {
  data: Feed | undefined;
  podcastName: "hakapit" | "nitk" | "balcony-albums" | string;
  limit: number;
}) {
  const navigation = useNavigation();
  const skeletonCount = Math.max(limit - (data?.items?.length || 0), 0);

  return (
    <>
      <span className="max-w-xl p-4 py-12 font-light info crazy-font">
        פרקים
      </span>
      <div className="masonry">
        {data?.items?.map((episode, index) => (
          <Episode key={index} episode={episode} podcastName={podcastName} />
        ))}
        {navigation.state !== "idle" &&
          new Array(skeletonCount)
            .fill(0)
            ?.map((_, index) => <SkeletonCard key={index} />)}
      </div>
    </>
  );
}
export function Preview({
  data,
  podcastName,
}: {
  data: Feed | undefined;
  podcastName: "hakapit" | "nitk" | "balcony-albums" | string;
}) {
  return (
    <>
      <span className="max-w-xl p-4 py-12 font-light info crazy-font">
        {data?.description}
      </span>
      <Episode episode={data?.items[0]} podcastName={podcastName} />
    </>
  );
}
