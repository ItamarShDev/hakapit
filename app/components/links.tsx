import { NavLink } from '@remix-run/react';
function LinkItem({ href, label, withBorder }: { href: string, label: string; withBorder: boolean }) {
  return (
    <>
      <NavLink
        prefetch='render'
        to={href}
        className={({ isActive, isPending }) =>
          isActive
            ? "text-accent"
            : isPending
              ? "pending"
              : ""
        }
      >
        {label}
      </NavLink >
      {
        withBorder && (
          <span className="text-accent">|</span>
        )
      }</>
  )
}

export function HomeLink() {
  const links = [
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
    {
      href: "/",
      label: "מה זה כפית?",
    },
  ]
  return (
    <div className="flex flex-wrap links  text-1xl gap-4">
      {links.map((link, index) => (
        <LinkItem
          href={link.href}
          label={link.label}
          withBorder={index !== links.length - 1}
          key={link.href}
        />
      ))}
    </div >
  );
}