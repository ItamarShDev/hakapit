export const SITE_URL = "https://hakapit.online";
export const SITE_TITLE = "הכפית";

type PageMeta = {
  title: string;
  description: string;
  image: string;
  path: string;
  author?: string;
};

export function pageHead({ title, description, image, path, author = "hakapit" }: PageMeta) {
  const url = `${SITE_URL}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "author", content: author },
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

type SeoSource = {
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  authorName?: string | null;
};

export function podcastHead(source: SeoSource | null | undefined, podcast: string, path: string) {
  if (!source) {
    return { meta: [{ title: podcast }, { name: "description", content: `${podcast} podcast` }] };
  }
  return pageHead({
    title: source.title ?? podcast,
    description: source.description?.replace(/\n/g, " ") ?? "",
    image: source.imageUrl ?? "",
    path,
    author: source.authorName || "hakapit",
  });
}
