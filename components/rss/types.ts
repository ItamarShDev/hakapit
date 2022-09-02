export type EpisodeData = {
  guid: string | null;
  title: string | null;
  link: string | null;
  content: string | null;
  pubDate: string | null;
  duration: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  isoDate: string | null;
  itunes: { image: string; duration: string };
  enclosure: { url: string };
};
