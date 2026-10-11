import { useEffect, useMemo, useRef, useState } from "react";

import type { EpisodeWithPodcast } from "~/features/podcast/types";

export const FEED_IMAGE_SIZES =
  "(min-width: 1694px) min(576px, calc((100vw - 192px) / 5)), " +
  "(min-width: 1360px) min(576px, calc((100vw - 160px) / 4)), " +
  "(min-width: 1028px) min(576px, calc((100vw - 128px) / 3)), " +
  "(min-width: 1024px) min(576px, calc((100vw - 96px) / 2)), " +
  "(min-width: 996px) min(576px, calc((100vw - 96px) / 3)), " +
  "(min-width: 664px) min(576px, calc((100vw - 64px) / 2)), " +
  "min(576px, calc(100vw - 32px))";

export const LATEST_IMAGE_SIZES = "(min-width: 1024px) 80px, (min-width: 768px) 56px, 40px";
export const DETAIL_IMAGE_SIZES =
  "(min-width: 1088px) 395px, (min-width: 1024px) calc(41.6667vw - 58.6667px), calc(100vw - 64px)";

export function getEpisodeImageKey(episode: EpisodeWithPodcast, index = 0) {
  return String(episode._id ?? episode.guid ?? episode.episodeNumber ?? index);
}

export function useAdaptiveImageLayout(episodes: EpisodeWithPodcast[]) {
  const gridRef = useRef<HTMLDivElement>(null);
  const keys = useMemo(() => episodes.map((episode, index) => getEpisodeImageKey(episode, index)), [episodes]);
  const keySignature = keys.join("\u001f");
  const [priorityKeys, setPriorityKeys] = useState<Set<string>>(() => new Set(keys.slice(0, 1)));
  const [cardWidth, setCardWidth] = useState<number | null>(null);

  useEffect(() => {
    setPriorityKeys((current) => {
      const next = new Set(keys.slice(0, 1));
      return current.size === next.size && [...current].every((key) => next.has(key)) ? current : next;
    });
    setCardWidth((current) => (current === null ? current : null));

    const grid = gridRef.current;
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-image-key]"));
    const promote = (elements: HTMLElement[]) => {
      const visibleKeys = elements
        .map((element) => element.dataset.imageKey)
        .filter((key): key is string => Boolean(key));
      if (!visibleKeys.length) return;
      setPriorityKeys((current) => {
        const next = new Set(current);
        visibleKeys.forEach((key) => next.add(key));
        return next.size === current.size ? current : next;
      });
    };

    const measureCard = () => {
      const width = cards[0]?.getBoundingClientRect().width ?? 0;
      if (width > 0) {
        setCardWidth((current) => (current === Math.round(width) ? current : Math.round(width)));
      }
    };

    measureCard();

    const intersectionObserver =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              promote(entries.filter((entry) => entry.isIntersecting).map((entry) => entry.target as HTMLElement));
            },
            { rootMargin: "0px" },
          );
    if (cards[0]) {
      intersectionObserver?.observe(cards[0]);
    }
    cards.slice(1).forEach((card) => intersectionObserver?.observe(card));

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            measureCard();
          });
    resizeObserver?.observe(grid);
    if (cards[0]) resizeObserver?.observe(cards[0]);

    return () => {
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
    };
  }, [keySignature]);

  return {
    gridRef,
    imageSizes: cardWidth ? `${cardWidth}px` : FEED_IMAGE_SIZES,
    priorityKeys,
  };
}
