import { cn } from "@/lib/utils";
import Footer from "~/components/footer";
import Header from "~/components/header";
import type { PodcastName } from "~/providers/rss/feed";

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
	return (
		<div className={cn("body", podcast || "hakapit")}>
			<Header data={podcasts[podcast || "hakapit"]} podcast={podcast} />
			<div className="main-content">{children}</div>
			<Footer />
		</div>
	);
}
