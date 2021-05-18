import { build } from "esbuild";
import { main, module, peerDependencies } from "../package.json";

build({
    entryPoints: ["src/index.ts"],
    platform: "browser",
    bundle: true,
    target: "es2018",
    external: Object.keys(peerDependencies),
    format: "cjs",
    outfile: main,
    minify: true,
    sourcemap: true,
});

build({
    entryPoints: ["src/index.ts"],
    platform: "browser",
    bundle: true,
    target: "es2018",
    external: Object.keys(peerDependencies),
    format: "esm",
    outfile: module,
    minify: true,
    sourcemap: true,
});
