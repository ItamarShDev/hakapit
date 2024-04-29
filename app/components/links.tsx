import { cn } from "@/lib/utils";
import Link from "next/link";
function LinkItem({
	href,
	label,
	withBorder,
}: {
	href: string;
	label: string;
	withBorder: boolean;
}) {
	return (
		<>
			<Link
				prefetch={false}
				// reloadDocument
				href={href}
				// className={({ isActive, isPending }) =>
				// 	cn("hover:text-accent hover:opacity-80", isActive ? "text-accent" : "", isPending ? "pending" : "")
				// }
			>
				{label}
			</Link>
			{withBorder && <span className="hidden text-accent lg:inline-block">|</span>}
		</>
	);
}
export const Links: React.FC<React.HTMLAttributes<HTMLDivElement> & { visibilityClass?: string }> = (props) => {
	const links = [
		{
			href: "/",
			label: "בית",
		},
		{
			href: "/hakapit",
			label: "הכפית",
		},
		{
			href: "/nitk",
			label: "שכונה בממלכה",
		},
		{
			href: "/balcony-albums",
			label: "אלבומים במרפסת",
		},
	];
	return (
		<nav className={cn("gap-2 lg:gap-4 links text-1xl overflow-hidden", props.className)}>
			{links.map((link, index) => (
				<LinkItem href={link.href} label={link.label} withBorder={index !== links.length - 1} key={link.href} />
			))}
		</nav>
	);
};
