import { HomeLink } from "./links";
import type { Data } from "./types";
import HeaderScroll from "./header-scroll";

export default function Header({ data }: { data: Data }) {
  const { author, description, image } = data;

  return (
    <header className="header clamp-text">
      <div id="page-header">
        <header className="grid grid-cols-auto-1fr-auto justify-between items-center gap-2">
          <div className="flex flex-col items-center p-4">
            <img
              src={image?.url}
              alt="podcast logo"
              className="object-contain"
              height={100}
              width={100}
            />
            <span className="text-sm">{author}</span>
          </div>
          <HomeLink data={data} />
        </header>
        <footer className="px-2 py-3 text-2xl">
          <h2 className="font-normal">{description}</h2>
        </footer>
        <HeaderScroll />
      </div>
    </header>
  );
}
