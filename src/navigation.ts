import type { AppRuntime, FrameHandle, ResolveFrame, ResolveFrameOptions } from "remix/component";

function formBody(options?: ResolveFrameOptions): BodyInit | undefined {
  if (!options?.formData || !options.method || /^(get|head)$/i.test(options.method)) return;
  if (options.encType === "text/plain") {
    const normalize = (text: string) => text.replace(/\r\n|\r|\n/g, "\r\n");
    return new Blob(
      [
        Array.from(
          options.formData,
          ([key, value]) => normalize(key) + "=" + normalize(typeof value === "string" ? value : value.name) + "\r\n",
        ).join(""),
      ],
      { type: "text/plain" },
    );
  }
  if (options.encType !== "application/x-www-form-urlencoded") return options.formData;
  return new URLSearchParams(
    Array.from(options.formData, ([key, value]) => [key, typeof value === "string" ? value : value.name]),
  );
}

const resolveFrameRequest: ResolveFrame = async (src, options) => {
  const headers = new Headers({ Accept: "text/html", "X-Remix-Frame": "true" });
  if (options?.target != null) headers.set("X-Remix-Target", options.target);
  const response = await fetch(src, {
    headers,
    method: options?.method,
    body: formBody(options),
    mode: "same-origin",
    signal: options?.signal,
  });
  const isHtml = response.headers.get("Content-Type")?.toLowerCase().includes("text/html");
  if (response.status >= 500 || (response.status >= 300 && !isHtml)) {
    throw new Error(`Failed to resolve frame: ${response.status} ${response.statusText}`.trimEnd());
  }
  return response;
};

export function createNavigationResolver(
  getFrame: () => FrameHandle,
  resolve: ResolveFrame = resolveFrameRequest,
): ResolveFrame {
  let active: ViewTransition | undefined;
  return async (src, options) => {
    const response = await resolve(src, options);
    if (
      !(response instanceof Response) ||
      options?.target != null ||
      typeof document.startViewTransition !== "function" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    )
      return response;
    const frame = getFrame();
    if (frame.src !== src) return response;
    // Fetch the destination before taking the old snapshot so network latency never freezes the page.
    await response.clone().text();
    if (options?.signal?.aborted) return response;
    active?.skipTransition();
    return new Promise<Response>((release) => {
      let complete: () => void;
      const committed = new Promise<void>((done) => {
        complete = done;
      });
      let transition: ViewTransition | undefined;
      const cleanup = () => {
        frame.removeEventListener("reloadComplete", finish);
        options?.signal?.removeEventListener("abort", abort);
      };
      const finish = () => {
        cleanup();
        complete();
      };
      const abort = () => {
        transition?.skipTransition();
        release(response);
        finish();
      };
      frame.addEventListener("reloadComplete", finish, { once: true });
      options?.signal?.addEventListener("abort", abort, { once: true });
      try {
        transition = document.startViewTransition(async () => {
          release(response);
          await committed;
        });
        active = transition;
        void transition.ready.catch(() => {});
        const settled = () => {
          if (active === transition) active = undefined;
          cleanup();
        };
        void transition.finished.then(settled, settled);
      } catch {
        release(response);
        finish();
      }
    });
  };
}

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
