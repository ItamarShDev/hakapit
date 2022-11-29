import { fetchFeed } from "api/hakapit/feed";
import Header from "components/header";
import "styles/themes/main.css";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const metadata = await fetchFeed();

  return (
    <>
      <Header data={metadata} />
      {children}
    </>
  );
}
