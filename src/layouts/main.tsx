import { type Handle, type RemixNode } from "remix/component";

import { PODCASTS, isPodcastName } from "~/features/podcast/podcasts";
import Footer from "~/layouts/footer";
import Header from "~/layouts/header";

import type { PodcastName } from "~/features/podcast/podcasts";

export function MainLayout(
  handle: Handle<{
    children: RemixNode;
    params: { podcast: PodcastName };
  }>,
) {
  return () => {
    const {
      children,
      params: { podcast },
    } = handle.props;

    const safePodcast: PodcastName = isPodcastName(podcast) ? podcast : "hakapit";
    return (
      <div className={"body"}>
        <Header data={PODCASTS[safePodcast]} podcast={safePodcast} />
        <div className="main-content">{children}</div>
        <Footer />
      </div>
    );
  };
}
