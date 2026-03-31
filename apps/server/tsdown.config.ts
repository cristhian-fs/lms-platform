import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts", "./src/migrate-and-seed.ts"],
  format: "esm",
  outDir: "./dist",
  clean: true,
  noExternal: [/@lms-platform\/.*/],
});
