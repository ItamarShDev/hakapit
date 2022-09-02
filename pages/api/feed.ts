import { NextApiRequest, NextApiResponse } from "next";
import Parser from "rss-parser";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { page } = req.query;
  const start = (parseInt(page) - 1) * 10;
  const end = start + 10;
  const parser: Parser = new Parser();
  const rss = await parser.parseURL(process.env.RSS);
  const { items } = rss;
  const episodes = items.slice(start, end);
  res.status(200).json({ episodes });
}
