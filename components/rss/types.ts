export type EpisodeData = {
  guid: string;
  title: string;
  link: string;
  content: string;
  pubDate: string;
  duration: string;
  imageUrl: string;
  audioUrl: string;
  isoDate: string;
  itunes: { image: string; duration: string };
  enclosure: { url: string };
};
