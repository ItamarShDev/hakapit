import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Script from "next/script";

const useScript = (paths: string[]) => {
  const [scriptTag, setScriptTag] = useState<ReactNode>(<></>);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    router.events.on("routeChangeStart", () => {
      setScriptTag(<></>);
    });

    setScriptTag(
      <>
        {paths.map((x, i) => {
          return (
            <Script
              key={i}
              className="script-tag-js"
              src={`${x}?v=${Math.random() * 999}`}
              type="module"
            />
          );
        })}
      </>
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath, router.isReady]);

  return { scriptTag };
};

export default useScript;
