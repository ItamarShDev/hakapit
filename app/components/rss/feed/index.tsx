import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavLink } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { Feed } from "~/api/rss/types";
import { Feed as MasonryFeed, Preview } from "~/components/rss/feed/feed";

export default function RSSFeed({
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
  const [newLimit, setNewLimit] = useState(limit);
  useEffect(() => {
    setNewLimit(limit);
  }, [limit]);
  return (
    <div className="flex flex-col items-center gap-3">
      {preview ? (
        <>
          <Preview data={data} podcastName={podcastName} />
          <NavLink
            to={`episodes`}
            className={({ isPending }) =>
              isPending ? "animate-pulse text-accent" : "text-accent"
            }
            unstable_viewTransition
          >
            <Button variant="link" className="text-xl lg:text-sm text-accent">
              לכל הפרקים
            </Button>
          </NavLink>
        </>
      ) : (
        <>
          <MasonryFeed data={data} podcastName={podcastName} limit={newLimit} />
          <NavLink
            to={`?limit=${limit + 5}`}
            className={({ isPending }) =>
              cn(
                "text-xl lg:text-md",
                isPending ? "animate-pulse text-accent" : "text-accent"
              )
            }
            onClick={() => setNewLimit(limit + 5)}
          >
            הצג עוד
          </NavLink>
        </>
      )}
    </div>
  );
}
