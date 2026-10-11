import { Button } from "~/lib/ui/button";

export const MOBILE_NAVIGATION_ID = "mobile-navigation";

export default function MenuIcon({ height = 30, width = 30 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width={width} height={height} viewBox="0 0 50 50">
      <title>Menu</title>
      <path
        className="fill-paragraph"
        d="M 0 9 L 0 11 L 50 11 L 50 9 Z M 0 24 L 0 26 L 50 26 L 50 24 Z M 0 39 L 0 41 L 50 41 L 50 39 Z"
      />
    </svg>
  );
}

export function MenuToggle({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return (
    <Button
      type="button"
      onClick={onClick}
      variant="link"
      className="menu-button"
      aria-label="Toggle navigation menu"
      aria-expanded={expanded}
      aria-controls={MOBILE_NAVIGATION_ID}
    >
      <MenuIcon />
    </Button>
  );
}
