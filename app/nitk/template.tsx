import { fetchFeed } from "api/nitk/feed";
import Header from "components/header";
import "styles/globals.css";
import "styles/themes/nitk.css";
export default async function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await fetchFeed();
  return (
    <div>
      <Header data={data} />
      {children}
    </div>
  );
}
