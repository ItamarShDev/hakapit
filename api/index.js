var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf, __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
}, __copyProps = (to, from, except, desc) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: !0 }) : target,
  mod
)), __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: !0 }), mod);

// <stdin>
var stdin_exports = {};
__export(stdin_exports, {
  assets: () => assets_manifest_default,
  assetsBuildDirectory: () => assetsBuildDirectory,
  entry: () => entry,
  future: () => future,
  publicPath: () => publicPath,
  routes: () => routes
});
module.exports = __toCommonJS(stdin_exports);

// app/entry.server.tsx
var entry_server_exports = {};
__export(entry_server_exports, {
  default: () => handleRequest
});
var import_stream = require("stream"), import_node = require("@remix-run/node"), import_react = require("@remix-run/react"), import_isbot = __toESM(require("isbot")), import_server = require("react-dom/server"), import_jsx_dev_runtime = require("react/jsx-dev-runtime"), ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return (0, import_isbot.default)(request.headers.get("user-agent")) ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let didError = !1, { pipe, abort } = (0, import_server.renderToPipeableStream)(
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_react.RemixServer, {
        context: remixContext,
        url: request.url
      }, void 0, !1, {
        fileName: "app/entry.server.tsx",
        lineNumber: 41,
        columnNumber: 7
      }, this),
      {
        onAllReady() {
          let body = new import_stream.PassThrough();
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new import_node.Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          didError = !0, console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let didError = !1, { pipe, abort } = (0, import_server.renderToPipeableStream)(
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_react.RemixServer, {
        context: remixContext,
        url: request.url
      }, void 0, !1, {
        fileName: "app/entry.server.tsx",
        lineNumber: 82,
        columnNumber: 7
      }, this),
      {
        onShellReady() {
          let body = new import_stream.PassThrough();
          responseHeaders.set("Content-Type", "text/html"), resolve(
            new import_node.Response(body, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode
            })
          ), pipe(body);
        },
        onShellError(err) {
          reject(err);
        },
        onError(error) {
          didError = !0, console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}

// app/root.tsx
var root_exports = {};
__export(root_exports, {
  default: () => App,
  links: () => links,
  loader: () => loader,
  meta: () => meta
});
var import_react5 = require("@remix-run/react");

// app/api/fetch-rss.ts
var import_rss_parser = __toESM(require("rss-parser"));
async function fetch_rss(url) {
  if (!url)
    throw new Error("No RSS URL provided");
  let rss = await new import_rss_parser.default().parseURL(url), { items } = rss, episodes = items.map((item, index) => {
    var _a;
    return {
      ...item,
      episodeGUID: (_a = item.guid) == null ? void 0 : _a.split("/").pop()
    };
  });
  return rss.items = episodes, { ...rss };
}

// app/api/balcony-albums/feed.ts
function _fetch() {
  let url = process.env.BALCONY_RSS;
  return fetch_rss(url);
}
async function fetchEpisode(episodeGUID) {
  let { items, ...rss } = await _fetch(), episode = items.find((episode2) => (episode2 == null ? void 0 : episode2.episodeGUID) == episodeGUID);
  return rss.items = [episode], rss;
}
async function fetchFeed(pageNumber = 1) {
  let rss = await _fetch(), start = (pageNumber - 1) * 10, end = start + 10, episodes = rss.items.slice(start, end);
  return rss.items = episodes, rss;
}

// app/api/hakapit/feed.ts
function _fetch2() {
  let url = process.env.HAKAPIT_RSS;
  return fetch_rss(url);
}
async function fetchEpisode2(episodeGUID) {
  let { items, ...rss } = await _fetch2(), episode = items.find((episode2) => (episode2 == null ? void 0 : episode2.episodeGUID) == episodeGUID);
  return rss.items = [episode], rss;
}
async function fetchFeed2(pageNumber = 1) {
  let rss = await _fetch2(), start = (pageNumber - 1) * 10, end = start + 10, episodes = rss.items.slice(start, end);
  return rss.items = episodes, rss;
}

// app/api/nitk/feed.ts
function _fetch3() {
  var _a;
  let url = (_a = process == null ? void 0 : process.env) == null ? void 0 : _a.NITK_RSS;
  return fetch_rss(url);
}
async function fetchEpisode3(episodeGUID) {
  let { items, ...rss } = await _fetch3(), episode = items.find((episode2) => (episode2 == null ? void 0 : episode2.episodeGUID) == episodeGUID);
  return rss.items = [episode], rss;
}
async function fetchFeed3(pageNumber = 1) {
  let rss = await _fetch3(), start = (pageNumber - 1) * 10, end = start + 10, episodes = rss.items.slice(start, end);
  return rss.items = episodes, rss;
}

// app/api/fetch-page.ts
function fetchPage(podcastName, page = 1) {
  switch (podcastName) {
    case "hakapit":
      return fetchFeed2(page);
    case "nitk":
      return fetchFeed3(page);
    case "balcony-albums":
      return fetchFeed(page);
  }
}
function fetchEpisode4(podcastName, episodeGUID) {
  switch (podcastName) {
    case "hakapit":
      return fetchEpisode2(episodeGUID);
    case "nitk":
      return fetchEpisode3(episodeGUID);
    case "balcony-albums":
      return fetchEpisode(episodeGUID);
  }
}

// app/components/header/links.tsx
var import_react2 = require("@remix-run/react"), import_jsx_dev_runtime2 = require("react/jsx-dev-runtime");
function Links({ selected }) {
  let isHakapit = selected === "/hakapit", isNitk = selected == null ? void 0 : selected.startsWith("/nitk"), isBalconyAlbums = selected == null ? void 0 : selected.startsWith("/balcony-albums"), links8 = [
    {
      href: "/hakapit",
      label: "\u05D4\u05DB\u05E4\u05D9\u05EA"
    },
    {
      href: "/nitk",
      label: "\u05E9\u05DB\u05D5\u05E0\u05D4 \u05D1\u05DE\u05DE\u05DC\u05DB\u05D4"
    },
    {
      href: "/balcony-albums",
      label: "\u05D0\u05DC\u05D1\u05D5\u05DE\u05D9\u05DD \u05D1\u05DE\u05E8\u05E4\u05E1\u05EA"
    }
  ].filter((link) => isNitk ? link.href !== "/nitk" : isBalconyAlbums ? link.href !== "/balcony-albums" : isHakapit ? link.href !== "/hakapit" : !0);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("div", {
    className: "flex gap-4",
    children: links8.map((link) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_react2.Link, {
      to: link.href,
      prefetch: "render",
      children: link.label
    }, link.href, !1, {
      fileName: "app/components/header/links.tsx",
      lineNumber: 31,
      columnNumber: 9
    }, this))
  }, void 0, !1, {
    fileName: "app/components/header/links.tsx",
    lineNumber: 29,
    columnNumber: 5
  }, this);
}
function HomeLink({ data }) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("span", {
    children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)("h1", {
        className: "text-6xl",
        children: data.title
      }, void 0, !1, {
        fileName: "app/components/header/links.tsx",
        lineNumber: 41,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Links, {
        selected: data.title
      }, void 0, !1, {
        fileName: "app/components/header/links.tsx",
        lineNumber: 42,
        columnNumber: 7
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/components/header/links.tsx",
    lineNumber: 40,
    columnNumber: 5
  }, this);
}

// app/components/header/header-scroll.tsx
var import_react3 = require("react"), import_jsx_dev_runtime3 = require("react/jsx-dev-runtime");
function scrollFunction() {
  var _a, _b;
  window.pageYOffset || document.documentElement.scrollTop > 30 ? (_a = document.getElementById("page-header")) == null || _a.classList.add("scrolled") : (_b = document.getElementById("page-header")) == null || _b.classList.remove("scrolled");
}
function HeaderScroll() {
  return (0, import_react3.useEffect)(() => {
    window.onscroll = () => scrollFunction();
  }, []), /* @__PURE__ */ (0, import_jsx_dev_runtime3.jsxDEV)(import_jsx_dev_runtime3.Fragment, {}, void 0, !1, {
    fileName: "app/components/header/header-scroll.tsx",
    lineNumber: 14,
    columnNumber: 10
  }, this);
}

// app/components/header/index.tsx
var import_jsx_dev_runtime4 = require("react/jsx-dev-runtime");
function Header({ data }) {
  let { author, description, image } = data;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("header", {
    className: "header clamp-text",
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", {
      id: "page-header",
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("header", {
          className: "grid grid-cols-auto-1fr-auto justify-between items-center gap-2",
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("div", {
              className: "flex flex-col items-center p-4",
              children: [
                /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("img", {
                  src: image == null ? void 0 : image.url,
                  alt: "podcast logo",
                  className: "object-contain",
                  height: 100,
                  width: 100
                }, void 0, !1, {
                  fileName: "app/components/header/index.tsx",
                  lineNumber: 13,
                  columnNumber: 13
                }, this),
                /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("span", {
                  className: "text-sm",
                  children: author
                }, void 0, !1, {
                  fileName: "app/components/header/index.tsx",
                  lineNumber: 20,
                  columnNumber: 13
                }, this)
              ]
            }, void 0, !0, {
              fileName: "app/components/header/index.tsx",
              lineNumber: 12,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(HomeLink, {
              data
            }, void 0, !1, {
              fileName: "app/components/header/index.tsx",
              lineNumber: 22,
              columnNumber: 11
            }, this)
          ]
        }, void 0, !0, {
          fileName: "app/components/header/index.tsx",
          lineNumber: 11,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("footer", {
          className: "px-2 py-3 text-2xl",
          children: /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)("h2", {
            className: "font-normal",
            children: description
          }, void 0, !1, {
            fileName: "app/components/header/index.tsx",
            lineNumber: 25,
            columnNumber: 11
          }, this)
        }, void 0, !1, {
          fileName: "app/components/header/index.tsx",
          lineNumber: 24,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime4.jsxDEV)(HeaderScroll, {}, void 0, !1, {
          fileName: "app/components/header/index.tsx",
          lineNumber: 27,
          columnNumber: 9
        }, this)
      ]
    }, void 0, !0, {
      fileName: "app/components/header/index.tsx",
      lineNumber: 10,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/components/header/index.tsx",
    lineNumber: 9,
    columnNumber: 5
  }, this);
}

// app/hooks/index.ts
var import_react4 = require("react");
function useDate(value) {
  return (0, import_react4.useMemo)(
    () => value && new Date(Date.parse(value)).toLocaleString(),
    [value]
  );
}
function scrollHandler(onScroll, onScrollEnd) {
  function scrollFunction2() {
    document.body.scrollTop > 50 || document.documentElement.scrollTop > 50 ? onScroll() : onScrollEnd();
  }
  typeof window < "u" && (window.onscroll = scrollFunction2);
}

// app/tailwind.css
var tailwind_default = "/build/_assets/tailwind-KV7GSBMT.css";

// app/root.tsx
var import_jsx_dev_runtime5 = require("react/jsx-dev-runtime"), links = () => [
  { rel: "stylesheet", href: tailwind_default }
], meta = ({ data, params }) => {
  var _a;
  if (params != null && params.episode) {
    let episode = data.items.find(
      (item) => item.episodeGUID === params.episode
    );
    return {
      charset: "utf-8",
      title: episode == null ? void 0 : episode.title,
      description: episode == null ? void 0 : episode.description,
      "meta:image": (_a = episode == null ? void 0 : episode.itunes) == null ? void 0 : _a.image,
      viewport: "width=device-width,initial-scale=1"
    };
  }
  return {
    charset: "utf-8",
    title: data.title,
    description: data.description,
    "meta:image": data.image,
    viewport: "width=device-width,initial-scale=1"
  };
}, loader = async ({ request, params }) => {
  let podcastName = request.url.split("/").at(3) || "hakapit";
  return podcastName ? params != null && params.episode ? await fetchEpisode4(podcastName, params.episode) : await fetchPage(podcastName) : {};
};
function App() {
  let data = (0, import_react5.useLoaderData)();
  return scrollHandler(
    () => {
      document.getElementById("page-header").classList.add("small");
    },
    () => {
      document.getElementById("page-header").classList.remove("small");
    }
  ), /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("html", {
    lang: "en",
    children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("head", {
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react5.Meta, {}, void 0, !1, {
            fileName: "app/root.tsx",
            lineNumber: 69,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react5.Links, {}, void 0, !1, {
            fileName: "app/root.tsx",
            lineNumber: 70,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("script", {
            src: "https://platform.twitter.com/widgets.js"
          }, void 0, !1, {
            fileName: "app/root.tsx",
            lineNumber: 71,
            columnNumber: 9
          }, this)
        ]
      }, void 0, !0, {
        fileName: "app/root.tsx",
        lineNumber: 68,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("body", {
        style: { direction: "rtl" },
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(Header, {
            data
          }, void 0, !1, {
            fileName: "app/root.tsx",
            lineNumber: 74,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)("main", {
            className: "bg-accent2",
            children: /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react5.Outlet, {}, void 0, !1, {
              fileName: "app/root.tsx",
              lineNumber: 76,
              columnNumber: 11
            }, this)
          }, void 0, !1, {
            fileName: "app/root.tsx",
            lineNumber: 75,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react5.ScrollRestoration, {}, void 0, !1, {
            fileName: "app/root.tsx",
            lineNumber: 78,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react5.Scripts, {}, void 0, !1, {
            fileName: "app/root.tsx",
            lineNumber: 79,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime5.jsxDEV)(import_react5.LiveReload, {}, void 0, !1, {
            fileName: "app/root.tsx",
            lineNumber: 80,
            columnNumber: 9
          }, this)
        ]
      }, void 0, !0, {
        fileName: "app/root.tsx",
        lineNumber: 73,
        columnNumber: 7
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/root.tsx",
    lineNumber: 67,
    columnNumber: 5
  }, this);
}

// app/routes/balcony-albums/episodes/$episode.tsx
var episode_exports = {};
__export(episode_exports, {
  default: () => Index,
  links: () => links2,
  loader: () => loader2
});
var import_react7 = require("@remix-run/react");

// app/components/rss/Episode.tsx
var import_react6 = require("@remix-run/react"), import_jsx_dev_runtime6 = require("react/jsx-dev-runtime");
function Episode({
  episode,
  round = !1,
  podcastName
}) {
  var _a, _b;
  let isoDate = useDate(episode == null ? void 0 : episode.isoDate);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("dl", {
    className: `episode-card ${round ? "rounded-3xl" : ""}`,
    children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("dt", {
        className: "grid grid-cols-auto-1fr gap-3 px-3 py-3 place-content-center",
        children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("img", {
            src: (_a = episode == null ? void 0 : episode.itunes) == null ? void 0 : _a.image,
            alt: "episode",
            height: 80,
            width: 80,
            className: "object-contain"
          }, void 0, !1, {
            fileName: "app/components/rss/Episode.tsx",
            lineNumber: 17,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("span", {
            children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)(import_react6.Link, {
                to: `/${podcastName}/episodes/${episode == null ? void 0 : episode.episodeGUID}`,
                className: "text-accent text-lg",
                children: episode == null ? void 0 : episode.title
              }, void 0, !1, {
                fileName: "app/components/rss/Episode.tsx",
                lineNumber: 25,
                columnNumber: 11
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", {
                children: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("span", {
                  className: "text-xs text-paragraph/30",
                  children: isoDate
                }, void 0, !1, {
                  fileName: "app/components/rss/Episode.tsx",
                  lineNumber: 32,
                  columnNumber: 13
                }, this)
              }, void 0, !1, {
                fileName: "app/components/rss/Episode.tsx",
                lineNumber: 31,
                columnNumber: 11
              }, this)
            ]
          }, void 0, !0, {
            fileName: "app/components/rss/Episode.tsx",
            lineNumber: 24,
            columnNumber: 9
          }, this)
        ]
      }, void 0, !0, {
        fileName: "app/components/rss/Episode.tsx",
        lineNumber: 16,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("dd", {
        children: [
          (episode == null ? void 0 : episode.content) && /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", {
            className: "text-lg p-4",
            dangerouslySetInnerHTML: {
              __html: episode == null ? void 0 : episode.content
            }
          }, void 0, !1, {
            fileName: "app/components/rss/Episode.tsx",
            lineNumber: 39,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("div", {
            className: "p-4 flex justify-end",
            children: /* @__PURE__ */ (0, import_jsx_dev_runtime6.jsxDEV)("audio", {
              className: "audio",
              controls: !0,
              src: (_b = episode == null ? void 0 : episode.enclosure) == null ? void 0 : _b.url
            }, void 0, !1, {
              fileName: "app/components/rss/Episode.tsx",
              lineNumber: 47,
              columnNumber: 11
            }, this)
          }, void 0, !1, {
            fileName: "app/components/rss/Episode.tsx",
            lineNumber: 46,
            columnNumber: 9
          }, this)
        ]
      }, void 0, !0, {
        fileName: "app/components/rss/Episode.tsx",
        lineNumber: 37,
        columnNumber: 7
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/components/rss/Episode.tsx",
    lineNumber: 15,
    columnNumber: 5
  }, this);
}

// styles/themes/balcony-albums.css
var balcony_albums_default = "/build/_assets/balcony-albums-IGNH3DUZ.css";

// app/routes/balcony-albums/episodes/$episode.tsx
var import_jsx_dev_runtime7 = require("react/jsx-dev-runtime"), links2 = () => [{ rel: "stylesheet", href: balcony_albums_default }], loader2 = loader;
function Index() {
  let data = (0, import_react7.useLoaderData)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)("section", {
    className: "full-page-episode",
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime7.jsxDEV)(Episode, {
      episode: data.items[0],
      podcastName: "balcony-albums"
    }, void 0, !1, {
      fileName: "app/routes/balcony-albums/episodes/$episode.tsx",
      lineNumber: 14,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/balcony-albums/episodes/$episode.tsx",
    lineNumber: 13,
    columnNumber: 5
  }, this);
}

// app/routes/hakapit/episodes/$episode.tsx
var episode_exports2 = {};
__export(episode_exports2, {
  default: () => Index2,
  links: () => links3,
  loader: () => loader3
});
var import_react8 = require("@remix-run/react");

// styles/themes/hakapit.css
var hakapit_default = "/build/_assets/hakapit-46YXLH6Z.css";

// app/routes/hakapit/episodes/$episode.tsx
var import_jsx_dev_runtime8 = require("react/jsx-dev-runtime"), links3 = () => [{ rel: "stylesheet", href: hakapit_default }], loader3 = loader;
function Index2() {
  let data = (0, import_react8.useLoaderData)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)("section", {
    className: "full-page-episode",
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime8.jsxDEV)(Episode, {
      episode: data.items[0],
      podcastName: "hakapit"
    }, void 0, !1, {
      fileName: "app/routes/hakapit/episodes/$episode.tsx",
      lineNumber: 14,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/hakapit/episodes/$episode.tsx",
    lineNumber: 13,
    columnNumber: 5
  }, this);
}

// app/routes/nitk/episodes/$episode.tsx
var episode_exports3 = {};
__export(episode_exports3, {
  default: () => Index3,
  links: () => links4,
  loader: () => loader4
});
var import_react9 = require("@remix-run/react");

// styles/themes/nitk.css
var nitk_default = "/build/_assets/nitk-POGBXVKZ.css";

// app/routes/nitk/episodes/$episode.tsx
var import_jsx_dev_runtime9 = require("react/jsx-dev-runtime"), links4 = () => [{ rel: "stylesheet", href: nitk_default }], loader4 = loader;
function Index3() {
  let data = (0, import_react9.useLoaderData)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)("section", {
    className: "full-page-episode",
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime9.jsxDEV)(Episode, {
      episode: data.items[0],
      podcastName: "nitk"
    }, void 0, !1, {
      fileName: "app/routes/nitk/episodes/$episode.tsx",
      lineNumber: 16,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/nitk/episodes/$episode.tsx",
    lineNumber: 15,
    columnNumber: 5
  }, this);
}

// app/routes/balcony-albums/index.tsx
var balcony_albums_exports = {};
__export(balcony_albums_exports, {
  default: () => Index4,
  links: () => links5,
  loader: () => loader5
});
var import_react11 = require("@remix-run/react");

// app/components/rss/feed.tsx
var import_react10 = require("react");
var import_jsx_dev_runtime10 = require("react/jsx-dev-runtime");
function Feed({
  episodes,
  podcastName
}) {
  var _a;
  let [currentEpisodes, setCurrentEpisodes] = (0, import_react10.useState)(
    episodes || []
  ), ref = (0, import_react10.useRef)({ page: 0 }), loadMore = () => {
    var _a2;
    ref.current.page += 1, (_a2 = fetchPage(podcastName, ref.current.page)) == null || _a2.then(
      ({ items }) => {
        setCurrentEpisodes((currentEpisodes2) => [...currentEpisodes2, ...items]);
      }
    );
  };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("section", {
    className: "flex flex-col items-center",
    children: [
      (_a = Array.from(currentEpisodes)) == null ? void 0 : _a.map((episode, index) => /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)(Episode, {
        episode,
        round: !0,
        podcastName
      }, index, !1, {
        fileName: "app/components/rss/feed.tsx",
        lineNumber: 28,
        columnNumber: 9
      }, this)),
      /* @__PURE__ */ (0, import_jsx_dev_runtime10.jsxDEV)("button", {
        className: "action-button",
        onClick: () => loadMore(),
        children: "more"
      }, void 0, !1, {
        fileName: "app/components/rss/feed.tsx",
        lineNumber: 35,
        columnNumber: 7
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/components/rss/feed.tsx",
    lineNumber: 26,
    columnNumber: 5
  }, this);
}

// app/components/twitter-timeline-embed/index.tsx
var import_jsx_dev_runtime11 = require("react/jsx-dev-runtime");
function TwitterTimelineEmbed({
  podcastName
}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("div", {
    className: "timeline",
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime11.jsxDEV)("a", {
      "data-lang": "he",
      "data-dnt": "true",
      "data-theme": "dark",
      "data-tweet-limit": "10",
      "data-height": "720",
      "data-chrome": "noborders",
      href: `https://twitter.com/${podcastName}?ref_src=twsrc%5Etfw`,
      children: "feed"
    }, void 0, !1, {
      fileName: "app/components/twitter-timeline-embed/index.tsx",
      lineNumber: 8,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/components/twitter-timeline-embed/index.tsx",
    lineNumber: 7,
    columnNumber: 5
  }, this);
}

// app/routes/balcony-albums/index.tsx
var import_jsx_dev_runtime12 = require("react/jsx-dev-runtime"), links5 = () => [{ rel: "stylesheet", href: balcony_albums_default }], loader5 = loader;
function Index4() {
  let data = (0, import_react11.useLoaderData)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)("section", {
    className: "feed-page",
    children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(Feed, {
        podcastName: "balcony-albums",
        episodes: data == null ? void 0 : data.items
      }, void 0, !1, {
        fileName: "app/routes/balcony-albums/index.tsx",
        lineNumber: 14,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime12.jsxDEV)(TwitterTimelineEmbed, {
        podcastName: "KapitPod"
      }, void 0, !1, {
        fileName: "app/routes/balcony-albums/index.tsx",
        lineNumber: 15,
        columnNumber: 7
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/routes/balcony-albums/index.tsx",
    lineNumber: 13,
    columnNumber: 5
  }, this);
}

// app/routes/hakapit/index.tsx
var hakapit_exports = {};
__export(hakapit_exports, {
  default: () => Page,
  links: () => links6,
  loader: () => loader6
});
var import_react12 = require("@remix-run/react");
var import_jsx_dev_runtime13 = require("react/jsx-dev-runtime"), links6 = () => [{ rel: "stylesheet", href: hakapit_default }], loader6 = loader;
function Page() {
  let data = (0, import_react12.useLoaderData)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)("section", {
    className: "feed-page",
    children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)(Feed, {
        podcastName: "hakapit",
        episodes: data == null ? void 0 : data.items
      }, void 0, !1, {
        fileName: "app/routes/hakapit/index.tsx",
        lineNumber: 14,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime13.jsxDEV)(TwitterTimelineEmbed, {
        podcastName: "KapitPod"
      }, void 0, !1, {
        fileName: "app/routes/hakapit/index.tsx",
        lineNumber: 15,
        columnNumber: 7
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/routes/hakapit/index.tsx",
    lineNumber: 13,
    columnNumber: 5
  }, this);
}

// app/routes/nitk/index.tsx
var nitk_exports = {};
__export(nitk_exports, {
  default: () => Index5,
  links: () => links7,
  loader: () => loader7
});
var import_react13 = require("@remix-run/react");
var import_jsx_dev_runtime14 = require("react/jsx-dev-runtime"), links7 = () => [{ rel: "stylesheet", href: nitk_default }], loader7 = loader;
function Index5() {
  let data = (0, import_react13.useLoaderData)();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)("section", {
    className: "feed-page",
    children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(Feed, {
        podcastName: "nitk",
        episodes: data == null ? void 0 : data.items
      }, void 0, !1, {
        fileName: "app/routes/nitk/index.tsx",
        lineNumber: 15,
        columnNumber: 7
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime14.jsxDEV)(TwitterTimelineEmbed, {
        podcastName: "ShchunaPod"
      }, void 0, !1, {
        fileName: "app/routes/nitk/index.tsx",
        lineNumber: 16,
        columnNumber: 7
      }, this)
    ]
  }, void 0, !0, {
    fileName: "app/routes/nitk/index.tsx",
    lineNumber: 14,
    columnNumber: 5
  }, this);
}

// app/routes/index.tsx
var routes_exports = {};
__export(routes_exports, {
  default: () => Index6
});
var import_jsx_dev_runtime15 = require("react/jsx-dev-runtime");
function Index6() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("section", {
    className: "about flex flex-col justify-center text-center align-middle",
    children: /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("div", {
      className: "text-center text-paragraph",
      children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("h1", {
          className: "text-5xl fade-in-bottom",
          children: "\u05D0\u05D6 \u05DE\u05D4 \u05D6\u05D4 \u05DB\u05E4\u05D9\u05EA?"
        }, void 0, !1, {
          fileName: "app/routes/index.tsx",
          lineNumber: 5,
          columnNumber: 9
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("div", {
          className: "what-is-kapit py-5",
          children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("p", {
              className: "fade-in-bottom a-delay-100 py-5",
              children: "\u05DB\u05E4\u05D9\u05EA \u05D6\u05D4 \u05DE\u05E9\u05D7\u05E7 \u05E9\u05DC \u05D0\u05D5\u05E4\u05D9."
            }, void 0, !1, {
              fileName: "app/routes/index.tsx",
              lineNumber: 7,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("p", {
              className: "fade-in-bottom a-delay-400 py-5",
              children: "\u05DB\u05E4\u05D9\u05EA \u05D6\u05D4 \u05E0\u05D9\u05E6\u05D7\u05D5\u05DF \u05D1\u05E8\u05D2\u05E2 \u05D4\u05D0\u05D7\u05E8\u05D5\u05DF."
            }, void 0, !1, {
              fileName: "app/routes/index.tsx",
              lineNumber: 10,
              columnNumber: 11
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime15.jsxDEV)("p", {
              className: "fade-in-bottom a-delay-700 py-5",
              children: "\u05DB\u05E4\u05D9\u05EA \u05D6\u05D4 \u05DB\u05DC \u05DB\u05DA \u05E4\u05E9\u05D5\u05D8 \u05D5\u05DB\u05DC \u05DB\u05DA \u05E7\u05E9\u05D4."
            }, void 0, !1, {
              fileName: "app/routes/index.tsx",
              lineNumber: 13,
              columnNumber: 11
            }, this)
          ]
        }, void 0, !0, {
          fileName: "app/routes/index.tsx",
          lineNumber: 6,
          columnNumber: 9
        }, this)
      ]
    }, void 0, !0, {
      fileName: "app/routes/index.tsx",
      lineNumber: 4,
      columnNumber: 7
    }, this)
  }, void 0, !1, {
    fileName: "app/routes/index.tsx",
    lineNumber: 3,
    columnNumber: 5
  }, this);
}

// server-assets-manifest:@remix-run/dev/assets-manifest
var assets_manifest_default = { version: "b2e7d585", entry: { module: "/build/entry.client-PA5BX2IV.js", imports: ["/build/_shared/chunk-HEA3LAGM.js", "/build/_shared/chunk-XBGKFPLQ.js"] }, routes: { root: { id: "root", parentId: void 0, path: "", index: void 0, caseSensitive: void 0, module: "/build/root-DH5LHYQJ.js", imports: ["/build/_shared/chunk-STMGNTZI.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/balcony-albums/episodes/$episode": { id: "routes/balcony-albums/episodes/$episode", parentId: "root", path: "balcony-albums/episodes/:episode", index: void 0, caseSensitive: void 0, module: "/build/routes/balcony-albums/episodes/$episode-55K32YZW.js", imports: ["/build/_shared/chunk-YQLSDZWT.js", "/build/_shared/chunk-UFVUKZRV.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/balcony-albums/index": { id: "routes/balcony-albums/index", parentId: "root", path: "balcony-albums", index: !0, caseSensitive: void 0, module: "/build/routes/balcony-albums/index-GPZ6WV2H.js", imports: ["/build/_shared/chunk-YQLSDZWT.js", "/build/_shared/chunk-EX4D3AXE.js", "/build/_shared/chunk-UFVUKZRV.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/hakapit/episodes/$episode": { id: "routes/hakapit/episodes/$episode", parentId: "root", path: "hakapit/episodes/:episode", index: void 0, caseSensitive: void 0, module: "/build/routes/hakapit/episodes/$episode-KOSPAQWS.js", imports: ["/build/_shared/chunk-U233M3G5.js", "/build/_shared/chunk-UFVUKZRV.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/hakapit/index": { id: "routes/hakapit/index", parentId: "root", path: "hakapit", index: !0, caseSensitive: void 0, module: "/build/routes/hakapit/index-VKUQ275D.js", imports: ["/build/_shared/chunk-U233M3G5.js", "/build/_shared/chunk-EX4D3AXE.js", "/build/_shared/chunk-UFVUKZRV.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/index": { id: "routes/index", parentId: "root", path: void 0, index: !0, caseSensitive: void 0, module: "/build/routes/index-YWEVMCIZ.js", imports: void 0, hasAction: !1, hasLoader: !1, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/nitk/episodes/$episode": { id: "routes/nitk/episodes/$episode", parentId: "root", path: "nitk/episodes/:episode", index: void 0, caseSensitive: void 0, module: "/build/routes/nitk/episodes/$episode-XYL3CQFH.js", imports: ["/build/_shared/chunk-JEGSFHKY.js", "/build/_shared/chunk-UFVUKZRV.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 }, "routes/nitk/index": { id: "routes/nitk/index", parentId: "root", path: "nitk", index: !0, caseSensitive: void 0, module: "/build/routes/nitk/index-4GOKTZ5I.js", imports: ["/build/_shared/chunk-JEGSFHKY.js", "/build/_shared/chunk-EX4D3AXE.js", "/build/_shared/chunk-UFVUKZRV.js"], hasAction: !1, hasLoader: !0, hasCatchBoundary: !1, hasErrorBoundary: !1 } }, url: "/build/manifest-B2E7D585.js" };

// server-entry-module:@remix-run/dev/server-build
var assetsBuildDirectory = "public/build", future = { v2_meta: !1 }, publicPath = "/build/", entry = { module: entry_server_exports }, routes = {
  root: {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: root_exports
  },
  "routes/balcony-albums/episodes/$episode": {
    id: "routes/balcony-albums/episodes/$episode",
    parentId: "root",
    path: "balcony-albums/episodes/:episode",
    index: void 0,
    caseSensitive: void 0,
    module: episode_exports
  },
  "routes/hakapit/episodes/$episode": {
    id: "routes/hakapit/episodes/$episode",
    parentId: "root",
    path: "hakapit/episodes/:episode",
    index: void 0,
    caseSensitive: void 0,
    module: episode_exports2
  },
  "routes/nitk/episodes/$episode": {
    id: "routes/nitk/episodes/$episode",
    parentId: "root",
    path: "nitk/episodes/:episode",
    index: void 0,
    caseSensitive: void 0,
    module: episode_exports3
  },
  "routes/balcony-albums/index": {
    id: "routes/balcony-albums/index",
    parentId: "root",
    path: "balcony-albums",
    index: !0,
    caseSensitive: void 0,
    module: balcony_albums_exports
  },
  "routes/hakapit/index": {
    id: "routes/hakapit/index",
    parentId: "root",
    path: "hakapit",
    index: !0,
    caseSensitive: void 0,
    module: hakapit_exports
  },
  "routes/nitk/index": {
    id: "routes/nitk/index",
    parentId: "root",
    path: "nitk",
    index: !0,
    caseSensitive: void 0,
    module: nitk_exports
  },
  "routes/index": {
    id: "routes/index",
    parentId: "root",
    path: void 0,
    index: !0,
    caseSensitive: void 0,
    module: routes_exports
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  assets,
  assetsBuildDirectory,
  entry,
  future,
  publicPath,
  routes
});
//# sourceMappingURL=index.js.map
