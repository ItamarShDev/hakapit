export interface RSSItem {
  title?: string;
  guid?: string;
  link?: string;
  content?: string;
  contentSnippet?: string;
  isoDate?: string;
  itunes?: {
    image?: string;
    duration?: string;
  };
  enclosure?: {
    url?: string;
  };
}

export interface RSSFeed {
  title?: string;
  link?: string;
  description?: string;
  feedUrl?: string;
  itunes?: {
    image?: string;
    owner?: {
      name?: string;
      email?: string;
    };
    summary?: string;
  };
  items: RSSItem[];
}

export const PODCAST_RSS_URLS: Record<string, string | undefined> = {
  hakapit: process.env.HAKAPIT_RSS,
  nitk: process.env.NITK_RSS,
  "balcony-albums": process.env.BALCONY_RSS,
};

export async function fetchAndParseRSS(url: string): Promise<RSSFeed | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`RSS fetch failed: ${response.status}`);
      return null;
    }
    const xmlText = await response.text();

    const parseRSSXML = (xml: string): RSSFeed => {
      const removeIframes = (content: string) => content?.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "") || "";
      const getTextContent = (xml: string, tag: string): string | undefined => {
        const match = xml.match(new RegExp(`<${tag}[^>]*>([^]*?)</${tag}>`, "i"));
        return match?.[1]?.trim();
      };
      const getAttribute = (xml: string, tag: string, attribute: string): string | undefined =>
        xml.match(new RegExp(`<${tag}[^>]*\\s${attribute}="([^"]+)"`, "i"))?.[1];

      const channel = xml.match(/<channel[^>]*>([\s\S]*?)<\/channel>/i)?.[1] || "";

      const feed: RSSFeed = {
        title: getTextContent(channel, "title"),
        link: getTextContent(channel, "link"),
        description: getTextContent(channel, "description"),
        feedUrl: url,
        itunes: {
          image: getAttribute(channel, "itunes:image", "href"),
          owner: {
            name: getTextContent(channel, "itunes:name"),
            email: getTextContent(channel, "itunes:email"),
          },
          summary: getTextContent(channel, "itunes:summary"),
        },
        items: [],
      };

      const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi);
      for (const itemMatch of itemMatches) {
        const itemXml = itemMatch[1];
        const title = getTextContent(itemXml, "title");

        if (!title?.includes("פרק") || title?.includes("מתוך פרק")) {
          continue;
        }

        const guid = getTextContent(itemXml, "guid");
        const content = removeIframes(
          getTextContent(itemXml, "content:encoded") || getTextContent(itemXml, "description") || "",
        );
        const enclosureUrl = itemXml.match(/<enclosure[^>]*url="([^"]+)"/)?.[1];

        feed.items.push({
          title,
          guid,
          link: getTextContent(itemXml, "link"),
          content,
          contentSnippet: removeIframes(getTextContent(itemXml, "description") || ""),
          isoDate: getTextContent(itemXml, "pubDate"),
          itunes: {
            image: getAttribute(itemXml, "itunes:image", "href"),
            duration: getTextContent(itemXml, "itunes:duration"),
          },
          enclosure: enclosureUrl ? { url: enclosureUrl } : undefined,
        });
      }

      return feed;
    };

    return parseRSSXML(xmlText);
  } catch (error) {
    console.error("Failed to fetch RSS:", error);
    return null;
  }
}

export function extractEpisodeNumber(title: string): number {
  const match = title.match(/פרק (\d+)/) || title.match(/פרק - (\d+)/);
  return match ? Number(match[1]) : 0;
}
