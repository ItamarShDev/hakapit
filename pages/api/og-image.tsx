import { withOGImage } from "next-api-og-image";

type QueryParams = {
  title: string;
  // logo: string;
};

export default withOGImage<"query", QueryParams>({
  strategy: "query",
  cacheControl: "public, max-age=604800, immutable",
  dev: {
    inspectHtml: false,
  },
  template: {
    html: ({ title }) => `<span>${title}
                          </span>`,

    // {
    //   return (
    //     <html>
    //       <body
    //         style={{ direction: "rtl", backgroundColor: "red", color: "white" }}
    //       >
    //         <span>{title}</span>
    //       </body>
    //     </html>
    //   );
    // },
  },
});
