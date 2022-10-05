import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { getPagePath as getKapitPagePath } from "queries/hakapit";
import { getPagePath as getNitkPagePath } from "queries/nitk";
import { fetchFeed as fetchNitkFeed } from "pages/api/nitk/feed";
import { fetchFeed as fetchKapitFeed } from "pages/api/hakapit/feed";

export function useFeedByRoute(page: number) {
  const { pathname } = useRouter();
  const fetcher = pathname.includes("nitk") ? fetchNitkFeed : fetchKapitFeed;
  const getPagePath = pathname.includes("nitk")
    ? getNitkPagePath
    : getKapitPagePath;
  return useQuery(getPagePath(page), () => fetcher(page));
}
