import { cn } from "@/lib/utils";
import Header from "~/components/header";

export function MainLayout({
	children,
	params: { podcast },
}: {
	children: React.ReactNode;
	params: { podcast: string };
}) {
	return (
		<body className={cn("body", podcast)}>
			<Header
				data={{
					imageUrl:
						"https://storage.pinecast.net/podcasts/covers/29ae23b9-9411-48e0-a947-efd71e9e82ea/Kapit_Logo_Red_Background.jpg",
					title: "הכפית",
				}}
				podcast={podcast}
			/>
			<main className="main-content">{children}</main>
		</body>
	);
}
