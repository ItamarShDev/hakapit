import { withOGImage } from "next-api-og-image";

type QueryParams = {
  title: string;
  logo: string;
};

export default withOGImage<"query", QueryParams>({
  strategy: "query",
  template: {
    react: ({ title }) => {
      return (
        <html>
          <body
            style={{ direction: "rtl", backgroundColor: "red", color: "white" }}
          >
            <span>{title}</span>
          </body>
        </html>
      );
    },
  },
});
