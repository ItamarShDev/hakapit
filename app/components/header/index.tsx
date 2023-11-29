"use client";
import { cn } from "@/lib/utils";
import { Link } from '@remix-run/react';
import type { Data } from '~/components/header/types';
type Props = {
  data: Data;
  podcast: string;
} & React.HTMLAttributes<HTMLElement>;
export default function Header({ data, podcast, className }: Props) {
  const { image } = data;
  return (
    <header className={cn("header", className)}>
      <div id="page-header">
        <header className="p-4 grid grid-cols-auto-1fr gap-4">
          <div className="header-image">
            {image?.url && (
              <img
                src={image?.url}
                alt="podcast logo"
                placeholder="blur"
                className='object-contain'
              />
            )}
          </div>
          <div className="header-title">
            <Link to={`/${podcast}`}>
              <h1 className="text-5xl">{data.title}</h1>
            </Link>
          </div>
        </header>
      </div>
    </header>
  );
}
