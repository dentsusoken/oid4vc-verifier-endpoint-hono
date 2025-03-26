import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./src/lambda.ts"],
  bundle: true,
  minify: true,
  format: "cjs",
  platform: "node",
  target: "node20",
  outfile: "./dist/index.js",
  external: ["aws-sdk", "@aws-sdk/*", "buffer", "crypto", "util"],
});
