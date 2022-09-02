import { NextApiRequest, NextApiResponse } from "next";
import Parser from "rss-parser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page } = req.query;
  const pageNumber = page ? parseInt(page as string) : 1;
  const start = (pageNumber - 1) * 10;
  const end = start + 10;
  const parser: Parser = new Parser();
  if (!process.env.RSS) {
    res.status(500).json({ error: "Missing RSS URL" });
    return;
  }
  const rss = await parser.parseURL(process.env.RSS);
  const { items } = rss;
  const episodes = items.slice(start, end);
  res.status(200).json({ episodes });
}
