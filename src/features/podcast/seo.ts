const SITE_URL = "https://hakapit.online";

type SeoSource = {
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  authorName?: string | null;
};

export function podcastFallbackHead(podcast: string) {
  return {
    title: podcast,
    meta: [
      { name: "description", content: `${podcast} podcast` },
      { name: "author", content: podcast },
    ],
  };
}

export function podcastHead(source: SeoSource, path: string) {
  const url = `${SITE_URL}${path}`;
  const title = source.title ?? "";
  const description = source.description?.replace(/\n/g, " ") ?? "";
  const image = source.imageUrl ?? "";
  return {
    title,
    meta: [
      { name: "description", content: description },
      { name: "author", content: source.authorName || "hakapit" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "twitter:url", content: url },
    ],
  };
}
