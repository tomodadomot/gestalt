import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    isolate: true,
    globals: true,
    include: ["src/**/*.test.ts"],
  },
});
