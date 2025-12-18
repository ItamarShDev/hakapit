import { Link, type LinkProps, linkOptions, useRouterState } from "@tanstack/react-router";
import { cn } from "~/@/lib/utils";

function LinkItem({
	label,
	withBorder,
	onSelect,
	...linkProps
}: {
	label: string;
	withBorder: boolean;
	onSelect?: () => void;
} & LinkProps) {
	const pathname = useRouterState({
		select: (s) => s.location.pathname,
	});
	return (
		<>
			<Link
				preload={"intent"}
				{...linkProps}
				onClick={onSelect}
				className={cn(pathname === linkProps.href && "underline")}
				resetScroll={false}
			>
				{label}
			</Link>
			{withBorder && <span className="text-accent lg:inline-block hidden">|</span>}
		</>
	);
}
export const Links: React.FC<
	React.HTMLAttributes<HTMLDivElement> & { visibilityClass?: string; onSelect?: () => void }
> = (props) => {
	const links = linkOptions([
		{
			to: "/",
			href: "/",
			label: "בית",
		},
		{
			to: "/$podcast",
			params: { podcast: "hakapit" },
			href: "/hakapit",
			label: "הכפית",
		},
		{
			to: "/$podcast",
			params: { podcast: "nitk" },
			href: "/nitk",
			label: "שכונה בממלכה",
		},
		{
			to: "/$podcast",
			params: { podcast: "balcony-albums" },
			href: "/balcony-albums",
			label: "אלבומים במרפסת",
		},
	]);
	return (
		<nav className={cn("gap-2 lg:gap-4 links text-1xl overflow-hidden", props.className)}>
			{links.map((link, index) => (
				<LinkItem onSelect={props.onSelect} withBorder={index !== links.length - 1} key={link.href} {...link} />
			))}
		</nav>
	);
};
