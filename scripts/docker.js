#!/usr/bin/env node
const {exec, execInDir, remoteCommand} = require("./shell");
const path = require("path");

const whiteboardDir = path.resolve(__dirname, "../whiteboard");
const imageName = "demo-react";
const registry = `registry-dev.netless.link/demo`;

const patch = JSON.stringify({
    "spec": {
        "template": {
            "metadata": {
                "annotations": {
                    "version/config": `${Date.now()}`,
                },
            },
        },
    },
});


const deployment = "demo-react";
(async () => {
    const build = `docker build --rm -f dockerfile -t ${registry}/${imageName}:latest .`;
    await execInDir(whiteboardDir, build);
    const push = `docker push ${registry}/${imageName}:latest`;
    await exec(push);
    await exec("sleep 120");
    await remoteCommand("k8s-company-dev", [`kubectl patch deployment ${deployment} -n demo --patch '` + patch + `'`]);
})();
