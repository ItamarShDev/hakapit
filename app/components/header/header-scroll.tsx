import { useEffect, useState } from "react";
function scrollFunction(ref: React.RefObject<HTMLElement>) {
  if (document.documentElement.scrollTop >= 60) {
    ref.current?.classList.add("scrolled");
  } else if (document.documentElement.scrollTop == 0) {
    ref.current?.classList.remove("scrolled");
  }
}

export default function useHeaderScroll() {
  const [element, setElement] = useState<React.RefObject<HTMLElement> | null>(
    null
  );
  useEffect(() => {
    if (element?.current) window.onscroll = () => scrollFunction(element);
  }, [element]);
  return [setElement];
}
