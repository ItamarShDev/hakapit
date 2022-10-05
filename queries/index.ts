import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { getPagePath as getKapitPagePath } from "queries/hakapit";
import { getPagePath as getNitkPagePath } from "queries/nitk";
import { getPagePath as getBalconyPagePath } from "queries/balcony-albums";
import { fetchFeed as fetchNitkFeed } from "pages/api/nitk/feed";
import { fetchFeed as fetchKapitFeed } from "pages/api/hakapit/feed";
import { fetchFeed as fetchBalconyFeed } from "pages/api/balcony-albums/feed";

function getFetcher(pathname: string) {
  if (pathname?.startsWith("/nitk")) return fetchNitkFeed;
  if (pathname?.startsWith("/balcony-albums")) return fetchBalconyFeed;
  if (pathname === "/") return fetchKapitFeed;
  return fetchKapitFeed;
}
function getPagePath(pathname: string) {
  if (pathname?.startsWith("/nitk")) return getNitkPagePath;
  if (pathname?.startsWith("/balcony-albums")) return getBalconyPagePath;
  if (pathname === "/") return getKapitPagePath;
  return getKapitPagePath;
}
export function useFeedByRoute(page: number) {
  const { pathname } = useRouter();
  const fetcher = getFetcher(pathname);
  const pagePath = getPagePath(pathname);
  return useQuery(pagePath(page), () => fetcher(page));
}
