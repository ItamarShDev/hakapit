import { Button } from "@/components/ui/button";
import { Link, NavLink } from "@remix-run/react";
import type { Feed } from "~/api/types";
import MasonryFeed from "~/components/rss/feed/feed";

export default function Feed({
  data,
  podcastName,
  limit = 1,
  preview = false,
}: {
  data: Feed | undefined;
  podcastName: "hakapit" | "nitk" | "balcony-albums" | string;
  limit?: number;
  preview?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <MasonryFeed data={data} podcastName={podcastName} />
      {preview ? (
        <Link to={`episodes`}>
          <Button variant="link" className="text-accent">
            לכל הפרקים
          </Button>
        </Link>
      ) : (
        <NavLink
          to={`?limit=${limit + 5}`}
          className={({ isPending }) =>
            isPending ? "animate-pulse text-accent" : "text-accent"
          }
        >
          הצג עוד
        </NavLink>
      )}
    </div>
  );
}
