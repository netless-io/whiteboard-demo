#!/bin/bash
set -exo pipefail
BASEDIR=$(cd $(dirname "$0"); cd ../; pwd -P)

cd $BASEDIR

yarn add pnpm -g

pnpm -r install

pnpm -r build:lib

pnpm --filter "whiteboard" build

#yarn
#lerna bootstrap
#
## 以下两个依赖，依赖于 package 中其他库，优先构建完其他库，再构建这两个库
#lerna run --ignore @netless/docs-center --ignore @netless/preview-controller build:lib
#lerna run --scope @netless/docs-center --scope @netless/preview-controller build:lib
#lerna run --scope whiteboard build

node $BASEDIR/scripts/docker.js