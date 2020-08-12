#!/usr/bin/env node
const {exec, execInDir, remoteCommand} = require("./shell");
const path = require("path");

const whiteboardDir = path.resolve(__dirname, "../whiteboard");
const imageName = "react-whiteboard";
const registry = `netless-dev-registry.ap-southeast-1.cr.aliyuncs.com/prod`;

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

(async () => {
    const build = `docker build --rm -f Dockerfile -t ${registry}/${imageName}:latest .`;
    await execInDir(whiteboardDir, build);
    const push = `docker push ${registry}/${imageName}:latest`;
    await exec(push);
    await exec("sleep 120");
    await remoteCommand("k8s-site", [`kubectl patch deployment ${imageName} -n site --patch '` + patch + `'`]);
})();