import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@remix-run/react";
import MenuIcon from "~/components/icons/menu";
import { Links } from "~/components/links";
import { Podcast } from "~/db/types";
type Props = {
	data: Podcast;
	podcast: string;
} & React.HTMLAttributes<HTMLElement>;
export default function Header({ data, podcast, className }: Props) {
	const { imageUrl } = data;
	return (
		<header className="overflow-hidden header">
			<div className="flex flex-wrap items-start gap-4 p-4 lg:items-center ">
				<div className="header-image">
					{imageUrl && <img src={imageUrl} alt="podcast logo" className="object-contain" />}
				</div>
				<div className="flex-1 header-title">
					<Link to={`/${podcast || ""}`}>
						<h1>{data.title}</h1>
					</Link>
				</div>
				<div className="flex flex-col flex-wrap items-end gap-2 pt-2 lg:gap-4 lg:hidden">
					<Button variant="link" className="menu-button">
						<MenuIcon />
					</Button>
				</div>
				<Links className="flex-row hidden lg:flex" />
			</div>
			<div className={cn("grid items-start grid-transition header-links hide-menu")}>
				<Links className="flex flex-col items-center text-2xl" />
			</div>
		</header>
	);
}
