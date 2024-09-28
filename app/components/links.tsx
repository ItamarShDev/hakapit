"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
function LinkItem({
	href,
	label,
	withBorder,
	onSelect,
}: {
	href: string;
	label: string;
	withBorder: boolean;
	onSelect?: () => void;
}) {
	const pathname = usePathname();
	return (
		<>
			<Link onClick={onSelect} href={href} className={cn(pathname === href && "underline")}>
				{label}
			</Link>
			{withBorder && <span className="text-accent lg:inline-block hidden">|</span>}
		</>
	);
}
export const Links: React.FC<
	React.HTMLAttributes<HTMLDivElement> & { visibilityClass?: string; onSelect?: () => void }
> = (props) => {
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
				<LinkItem
					onSelect={props.onSelect}
					href={link.href}
					label={link.label}
					withBorder={index !== links.length - 1}
					key={link.href}
				/>
			))}
		</nav>
	);
};
