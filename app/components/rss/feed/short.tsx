import { useNavigation } from "@remix-run/react";
import type { Feed } from "~/api/types";
import { Episode, SkeletonCard } from "~/components/rss/Episode";

export default function ShortFeed({
  data,
  podcastName,
}: {
  data: Feed | undefined;
  podcastName: "hakapit" | "nitk" | "balcony-albums" | string;
}) {
  const navigation = useNavigation();
  const pathname = navigation.location?.pathname.includes("episodes");
  return (
    <>
      <span className="max-w-xl p-4 py-12 font-light info crazy-font">
        {data?.description}
      </span>
      {data?.items?.map((episode, index) => (
        <Episode key={index} episode={episode} podcastName={podcastName} />
      ))}
      {pathname &&
        navigation.state !== "idle" &&
        new Array(5)
          .fill(0)
          ?.map((episode, index) => <SkeletonCard key={index} />)}
    </>
  );
}
