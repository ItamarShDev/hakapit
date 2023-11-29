import { Link } from "@remix-run/react";
import type { Data } from "~/components/header/types";
import { NavLinks } from "~/components/links";
type Props = {
  data: Data;
  podcast: string;
} & React.HTMLAttributes<HTMLElement>;
export default function Header({ data, podcast, className }: Props) {
  const { image } = data;
  return (
    <header className="flex items-start lg:items-center gap-4 p-4 header">
      <div className="header-image">
        {image?.url && (
          <img
            src={image?.url}
            alt="podcast logo"
            placeholder="blur"
            className="object-contain"
          />
        )}
      </div>
      <div className="flex-1 header-title">
        <Link to={`/${podcast || ""}`}>
          <h1>{data.title}</h1>
        </Link>
      </div>
      <NavLinks />
    </header>
  );
}
