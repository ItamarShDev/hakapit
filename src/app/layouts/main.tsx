import Footer from "~/app/layouts/Footer";
import Header from "~/app/layouts/Header";
import type { PodcastName } from "~/app/providers/rss/feed";
import { validatePodcastParam } from "~/app/utils/validatie-podcast-param";

const podcasts: Record<PodcastName, { title: string; imageUrl: string }> = {
	hakapit: {
		title: "הכפית",
		imageUrl:
			"https://storage.pinecast.net/podcasts/covers/29ae23b9-9411-48e0-a947-efd71e9e82ea/Kapit_Logo_Red_Background.jpg",
	},
	"balcony-albums": {
		title: "אלבומים במרפסת",
		imageUrl:
			"https://storage.pinecast.net/podcasts/covers/04d1b0d7-965e-4a89-a990-2e87f531bcce/_____________________________2.jpg",
	},
	nitk: {
		title: "שכונה בממלכה",
		imageUrl:
			"https://storage.pinecast.net/podcasts/covers/a5676696-e6ab-460a-a5ec-47d5299eb547/IMG-20220206-WA0010.jpg",
	},
};

export function MainLayout({
	children,
	params: { podcast },
}: {
	children: React.ReactNode;
	params: { podcast: PodcastName };
}) {
	const safePodcast: PodcastName = validatePodcastParam(podcast) ? podcast : "hakapit";
	return (
		<div className={"body"}>
			<Header data={podcasts[safePodcast]} podcast={safePodcast} />
			<div className="main-content">{children}</div>
			<Footer />
		</div>
	);
}
