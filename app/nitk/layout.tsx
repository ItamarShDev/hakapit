import { Inter } from "@next/font/google";
import { fetchFeed } from "api/nitk/feed";
import Header from "components/header";
import "styles/themes/nitk.css";
import "styles/globals.css";
const font = Inter();

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const metadata = await fetchFeed();
  return (
    <html>
      <body className={font.className}>
        <main className="page">
          <Header data={metadata} />
          {children}
        </main>
      </body>
    </html>
  );
}
