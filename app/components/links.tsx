import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavLink } from "@remix-run/react";
import { useState } from "react";
import MenuIcon from "~/components/icons/menu";
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
      <NavLink
        prefetch="render"
        to={href}
        className={({ isActive, isPending }) =>
          cn(
            "hover:text-accent hover:opacity-80",
            isActive ? "text-accent" : "",
            isPending ? "pending" : ""
          )
        }
      >
        {label}
      </NavLink>
      {withBorder && (
        <span className="hidden text-accent lg:inline-block">|</span>
      )}
    </>
  );
}
const Links: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { visibilityClass?: string }
> = (props) => {
  const links = [
    {
      href: "/",
      label: "מה זה כפית?",
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
    <nav
      className={cn(
        "gap-2 lg:gap-4 links text-1xl overflow-hidden",
        props.className
      )}
    >
      {links.map((link, index) => (
        <LinkItem
          href={link.href}
          label={link.label}
          withBorder={index !== links.length - 1}
          key={link.href}
        />
      ))}
    </nav>
  );
};

export function NavLinks() {
  const [linksShown, setLinksShown] = useState(false);

  return (
    <div>
      <div className="flex flex-col pt-2 items-end gap-2 lg:gap-4 lg:hidden overflow-hidden">
        <Button variant="link" onClick={() => setLinksShown((prev) => !prev)}>
          <MenuIcon />
        </Button>
        <div
          className={cn(
            "grid items-start grid-transition",
            linksShown ? "show-menu" : "hide-menu"
          )}
        >
          <Links className="flex flex-col"></Links>
        </div>
      </div>
      <Links className="flex-row hidden lg:flex"></Links>
    </div>
  );
}
