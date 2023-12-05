/** @type {import('@remix-run/dev').AppConfig} */
export default {
  tailwind: true,
  ignoredRouteFiles: ["**/.*"],
  serverDependenciesToBundle: [/@nivo\/.+/, /d3-.+/, /lodash/],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
};
