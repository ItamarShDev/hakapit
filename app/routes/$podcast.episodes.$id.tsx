import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { fetchEpisode } from "~/api/fetch-page";
import type { Feed } from "~/api/types";

export const meta = ({ data }: { data: Feed }) => {
  return [
    { meta: "viewport", content: "width=device-width, initial-scale=1.0" },
    { meta: "description", content: data?.description },
    { meta: "author", content: data?.itunes?.author },
    { meta: "image", content: data?.itunes?.image },
    { title: data?.title },
    { tagName: "link", rel: "icon", href: data?.itunes.image },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  if (!params.podcast || !params.id) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  return await fetchEpisode(params.podcast, params.id);
};

export default function RouteComponent() {
  const params = useParams();
  const data = useLoaderData<typeof loader>();
  if (!params.podcast) return null;
  return (
    <section className="relative flex flex-col justify-start w-4/5 h-full m-auto lg:flex-row lg:gap-8 lg:py-32">
      <img
        src={data.itunes.image}
        className="top-0 right-0 z-0 faded-image-vertical lg:no-mask max-h-96 max-w-max rounded-2xl"
        alt="episode"
      />
      <div className="flex flex-col max-w-xl gap-3 p-2 text-lg -translate-y-32 rounded-xl lg:p-8 lg:translate-y-0 lg:gap-14">
        <div dangerouslySetInnerHTML={{ __html: data.content }}></div>
        <audio className="audio" controls src={data?.enclosure?.url}></audio>
      </div>
    </section>
  );
}
