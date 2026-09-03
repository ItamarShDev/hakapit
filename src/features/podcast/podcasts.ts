export const PODCASTS = {
  hakapit: {
    title: "הכפית",
    imageUrl:
      "https://storage.pinecast.net/podcasts/covers/29ae23b9-9411-48e0-a947-efd71e9e82ea/Kapit_Logo_Red_Background.jpg",
  },
  "balcony-albums": {
    title: "אלבומים במרפסת",
    imageUrl:
      "https://storage.pinecast.net/podcasts/covers/04d1b0d7-965e-4a89-a990-2e87f531bcce/_____________________________2.jpg",
  },
  nitk: {
    title: "שכונה בממלכה",
    imageUrl:
      "https://storage.pinecast.net/podcasts/covers/a5676696-e6ab-460a-a5ec-47d5299eb547/IMG-20220206-WA0010.jpg",
  },
} as const;

export type PodcastName = keyof typeof PODCASTS;

export const PODCAST_NAMES = Object.keys(PODCASTS) as PodcastName[];

export function isPodcastName(value: string): value is PodcastName {
  return (PODCAST_NAMES as string[]).includes(value);
}
