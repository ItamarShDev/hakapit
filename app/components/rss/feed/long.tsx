import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday.js";
import type { EpisodeData } from "~/api/types";
import { Episode } from "~/components/rss/Episode";

dayjs.extend(isToday);

function isFromToday(dateString: string) {
  const date = dayjs(dateString);
  return date.isToday();
}

export default function LongFeed({
  episodes,
  podcastName,
}: {
  episodes: EpisodeData[] | undefined;
  podcastName: "hakapit" | "nitk" | "balcony-albums" | string;
}) {
  return (
    <div className="main-content">
      <Accordion type="single" collapsible>
        {episodes?.map((episode, index) => (
          <>
            <AccordionItem value={episode.guid}>
              <AccordionTrigger
                className={cn(
                  "gap-3",
                  isFromToday(episode.isoDate) ? "text-accent" : ""
                )}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={episode?.itunes?.image}
                    alt="episode"
                    placeholder="blur"
                    height={60}
                    width={60}
                    className="object-cover object-top"
                  />
                  {episode.title}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Episode
                  key={index}
                  episode={episode}
                  podcastName={podcastName}
                />
              </AccordionContent>
            </AccordionItem>
          </>
        ))}
      </Accordion>
    </div>
  );
}
