## 准备工作

```shell

# 安装全局 lerna
yarn global add lerna
# or npm install
npm install lerna -g

# 单独 yarn
yarn

# lerna 准备工作
lerna bootstrap

# 启动所有脚本的热更新
lerna run --parallel start

# 构建所有库的 yarn build 命令
lerna run build

# 只运行 toolbox 的 yarn dev 脚本
lerna run --scope `lib-name` dev

# 运行除 tool-box 外的 run dev 脚本
lerna run --ignore @netless/tool-box dev

# build 所有库
lerna run --parallel build:lib

```