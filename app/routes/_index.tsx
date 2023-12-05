import type { LinksFunction } from "@remix-run/node";
import { defer } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { Link, useLoaderData } from "@remix-run/react";
import { getTeamInfo, getTeamStats } from "~/api/football";
import { StatsTable } from "~/components/stats/stats";

export const meta: MetaFunction = () => [
  { title: "הכפית" },
  { charset: "utf-8" },
  { meta: "og:title", content: "הכפית" },
  { meta: "og:description", content: "אתר הבית של משפחת הכפית" },
  { meta: "og:image", content: "/logo.webp" },
  { meta: "og:type", content: "website" },
  { meta: "og:url", content: "hakapit.online" },
  { meta: "viewport", content: "width=device-width, initial-scale=1.0" },
  { meta: "description", content: "אתר הבית של משפחת הכפית" },
  { meta: "author", content: "משפחת הכפית" },
  { meta: "image", content: "/logo.webp" },
];

export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: "/logo.webp",
  },
];

export const loader = async () => {
  const standings = await getTeamInfo();
  const stats = getTeamStats(standings.response.map((res) => res.league.id));
  return defer({
    standings,
    stats,
  });
};

export default function Index() {
  const { standings, stats } = useLoaderData<typeof loader>();

  return (
    <section className="flex flex-col items-center justify-center h-full py-4 text-center lg:about lg:py-0">
      <StatsTable stats={stats} standings={standings} />
      <div className="text-center text-paragraph">
        <h1 className="text-4xl fade-in-bottom text-accent">מה זה כפית?</h1>
        <div className="what-is-kapit text-slate-300">
          <p className="py-2 fade-in-bottom a-delay-100">
            כפית זה משחק של אופי.
          </p>
          <p className="py-2 fade-in-bottom a-delay-400">
            כפית זה ניצחון ברגע האחרון.
          </p>
          <p className="py-2 fade-in-bottom a-delay-700">
            כפית זה כל כך פשוט וכל כך קשה.
          </p>
        </div>
      </div>
      <div className="flex justify-center gap-2 py-4">
        <Link to="https://twitter.com/KapitPod">Twitter</Link>
        <span className="text-accent">|</span>
        <Link to="https://www.threads.net/@kapitpod">Threads</Link>
        <span className="text-accent">|</span>
        <Link to="https://www.facebook.com/KapitPod">Facebook</Link>
        <span className="text-accent">|</span>
        <Link to="https://www.instagram.com/kapitpod/">Instagram</Link>
        <span className="text-accent">|</span>
        <Link to="https://pod.link/1546442506">Pod.link</Link>
      </div>
    </section>
  );
}
