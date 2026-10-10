import type { AppRuntime } from "remix/component";
export function enableNavigationFallback(app: AppRuntime) {
  if (window.navigation && typeof NavigateEvent !== "undefined" && "sourceElement" in NavigateEvent.prototype) return;
  let revision = 0;
  async function visit(url: URL, push: boolean, resetScroll = true) {
    const current = ++revision;
    if (push) history.pushState(null, "", url.href);
    app.frames.top.src = url.href;
    try {
      await app.frames.top.reload();
      if (current !== revision) return;
      history.replaceState(null, "", app.frames.top.src);
      if (resetScroll) window.scrollTo(0, 0);
    } catch {
      if (current === revision) location.assign(url.href);
    }
  }
  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.shiftKey
    )
      return;
    const anchor = event.target instanceof Element ? event.target.closest("a") : null;
    if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin || (url.protocol !== "https:" && url.protocol !== "http:")) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;
    event.preventDefault();
    visit(url, true, anchor.dataset.rmxResetScroll !== "false");
  });
  window.addEventListener("popstate", () => visit(new URL(location.href), false));
}
