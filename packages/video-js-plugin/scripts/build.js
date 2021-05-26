const { build } = require("esbuild");
const pkg = require("../package.json");

build({
    entryPoints: ["src/index.ts"],
    platform: "browser",
    bundle: true,
    target: "es2018",
    external: Object.keys(pkg.peerDependencies),
    format: "cjs",
    outfile: pkg.main,
    minify: true,
    sourcemap: true,
});

build({
    entryPoints: ["src/index.ts"],
    platform: "browser",
    bundle: true,
    target: "es2018",
    external: Object.keys(pkg.peerDependencies),
    format: "esm",
    outfile: pkg.module,
    minify: true,
    sourcemap: true,
});
