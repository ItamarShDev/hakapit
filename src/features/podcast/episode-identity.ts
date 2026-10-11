import type { Episode } from "~/features/podcast/types";

export function isSameEpisode(left: Episode | undefined, right: Episode | undefined) {
  return Boolean(left && right && left.audioUrl === right.audioUrl);
}
