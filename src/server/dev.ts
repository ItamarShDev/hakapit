import { createServer } from "node:http";
import { createRequestListener } from "remix/node-fetch-server";
import { createServer as createViteServer } from "vite";
const vite = await createViteServer({ server: { middlewareMode: true }, appType: "custom" });
const server = createServer((request, response) => {
  vite.middlewares(request, response, async () => {
    try {
      const { createApp } = await vite.ssrLoadModule("/src/server/app.ts");
      await createRequestListener(createApp(true))(request, response);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      console.error(error);
      response.statusCode = 500;
      response.end("Server error");
    }
  });
});
const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => console.log(`Remix 3 dev server: http://localhost:${port}`));
