const cp = require('child_process');
const { build } = require("esbuild");
const { style } = require("@hyrious/esbuild-plugin-style");
const pkg = require("../package.json");

build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    external: Object.keys(pkg.peerDependencies),
    format: "esm",
    target: "es2018",
    outfile: pkg.module,
    sourcemap: true,
    plugins: [style()],
    logLevel: "info"
}).then(() => {
    console.log("dist/index.es.js → dist/index.js ...")
    cp.spawnSync(`babel ${pkg.module} -o ${pkg.main} --source-maps`, { shell: true, stdio: 'inherit' })
    console.log("tsc -p . → dist/index.d.ts ...")
    cp.spawnSync(`tsc -p .`, { shell: true, stdio: 'inherit' })
    // cp.spawnSync(`rollup src/index.ts -p dts -o ${pkg.types}`, { shell: true, stdio: 'inherit' })
}).catch(() => {});
