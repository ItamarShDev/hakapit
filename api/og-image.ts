import { withOGImage } from "next-api-og-image";

export default withOGImage<"query", "title">({
  strategy: "query",
  cacheControl: "public, max-age=604800, immutable",
  dev: {
    inspectHtml: false,
  },
  template: {
    html: async ({ title }) => {
      return `
        <html>
          <body>
            <h1>${title}</h1>
          </body>
          <style>
          h1 {
            direction: rtl;
            background-color: red;
            color: white;
          }
          </style>
        </html>
      `;
    },
  },
});
