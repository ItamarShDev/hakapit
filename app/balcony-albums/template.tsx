import { fetchFeed } from "api/balcony-albums/feed";
import Header from "components/header";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await fetchFeed();
  return (
    <>
      <Header data={data} />
      {children}
    </>
  );
}
