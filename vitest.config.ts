import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@wifilabel/printer-spec": fileURLToPath(
        new URL("./packages/spec/src/index.ts", import.meta.url),
      ),
      "@wifilabel/transport": fileURLToPath(
        new URL("./packages/transport/src/index.ts", import.meta.url),
      ),
      "@wifilabel/zpl": fileURLToPath(new URL("./packages/zpl/src/index.ts", import.meta.url)),
      "@wifilabel/epl2": fileURLToPath(new URL("./packages/epl2/src/index.ts", import.meta.url)),
      "@wifilabel/webusb": fileURLToPath(
        new URL("./packages/transport-webusb/src/index.ts", import.meta.url),
      ),
      "@wifilabel/box-client": fileURLToPath(
        new URL("./packages/transport-box/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts"],
    root,
  },
});
