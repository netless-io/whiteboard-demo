
# whiteboard-demo

## 本项目目前已经处于停止维护状态，接入请使用 [fastboard](https://github.com/netless-io/fastboard)，体验请访问 [flat](https://flat-web.whiteboard.agora.io)

![](https://white-sdk.oss-cn-beijing.aliyuncs.com/images/react-whiteoard-home.png)

![whiteboard](https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/whiteboard.png)

Experience address：https://demo.netless.link/

[简体中文](./README_zh.md)

## 1. Applicable developers

- A web developer who is engaged in the development of online education software, online meetings, and remote collaboration software, and wants to quickly implant an interactive whiteboard in a short time.
- Have a certain TypeScript, React coding or reading foundation.
- If you want to develop components for the second time, you need to install lerna to start.

## 2. Advantage

The whole process is componentized. If you are not picky about the component's UI, you can just use the code in the `whiteboard` folder in the project. If you want to change the style of the component, you can customize the component under the premise of understanding the role of lerna and reading `DEV_README.md`.

## 3. Precautions

It is not safe for all Tokens in the demo to be hard-coded on the front end. It is recommended to have a server to call after the production environment.

## 4. Simply start the project

Simply starting a project means to directly apply the component code style in the project, and only write the "glue" code by yourself.

### 4.1 Get the SDK Token of Netless Whiteboard

1. Register a Netless account

   [Console](https://console.netless.link)

2. Get AppIdentifier

   Console -> Application management -> Click copy

3. Get SDK Token

   Console -> Application management -> Configuration -> Click copy

4. Complete the configuration, fill in the configuration file

   `.env.example` file name is changed to `.env`

   ```typescript
   APPIDENTIFIER=283/VGixxxxxx2HJg // Whiteboard APPIDENTIFIER
   SDKTOKEN=NETLESSSDK_YWs9eDRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxRkNTIyYjMwMmIyZGRj // Whiteboard SDKTOKEN
   ```

5. Safety Precautions

   After going online, this Token **It is recommended to maintain it in the backend**

### 4.2 Get Alibaba Cloud's `AK` `SK` (optional)

The process of synchronizing rich media such as videos and pictures on the whiteboard does not directly transmit these large-volume data through long connections, but uploads it to Alibaba Cloud's cloud storage and synchronizes the url address returned by the cloud storage. Under the premise that the developer understands that what is synchronized is the **address**, he should be able to figure out the basic elements required for the configuration of OSS during debugging:

1. For local debugging, we did not configure the proxy at the packaging layer, so cross-domain access should be enabled.

2. Shared reading is allowed, and can be changed to support various anti-theft links after going online.

3. You can upload by yourself (Needless to say, see the OSS documentation)

4. Debug configuration reference https://developer.netless.link/docs/faq/oss-config/

5. Complete the configuration, fill in the configuration file

   `.env.example` file name is changed to `.env`

   ```typescript
   AK=LTAI4xxxxxxxxxxuDmu
   SK=ycdfrOxxxxxxxxxxxxxxxxxxWqsy
   OSSREGION=oss-cn-hangzhou
   BUCKET=bxxxxxxxgs
   FOLDER=testxxxxx
   PREFIX=https://bxxxxxxxgs.oss-cn-hangzhou.aliyuncs.com/
   ```

6. If you don't want to configure cloud storage, please comment out the following code and run it directly. But you cannot use the core functions such as uploading pictures, audio and video, PPT, etc.

   ```tsx
    <ToolBox room={room} customerComponent={
           [
               <OssUploadButton oss={ossConfigObj}
                    room={room}
                    whiteboardRef={whiteboardLayerDownRef}/>,
               <PluginCenter oss={ossConfigObj}
                     room={room}/>
           ]
   }/>
   
   // changed to
   <ToolBox room={room}/>
   ```
7. Safety Precautions
    
    After going online, this Config **It is recommended to maintain it in the backend**

### 4.3 Startup project

```bash
# Access to the whiteboard folder
cd whiteboard
# Load dependencies
yarn
# Startup project
yarn dev
# Packaged project
yarn build
```

## 5. Component secondary development

We assume that the developers who need secondary development are deep players and need to be familiar with some front-end engineering and component-related tools.

- yarn or npm
- lerna (There is a simple way to run it below, please search and learn by yourself for detailed usage)

### 5.1 Component introduction

The advantage of using lerna management is: the common functions of the componentized whiteboard are convenient to use, maintain and manage. The following briefly lists the core components, and introduces their functions and styles.

#### 5.1.1 Whiteboard proprietary controls

![全部控件位置](https://white-sdk.oss-cn-beijing.aliyuncs.com/images/react-whiteboard.jpg)

- `@netless/tool-box`

  - Toolbar: control the switching of teaching aids of the whiteboard and the management of the color and thickness of the teaching aids

- `@netless/redo-undo` 

  - Undo redo

- `@netless/page-controller`

  - Pagination control: display the total number of pages, the current page, the previous page, the next page, the first page, and the last page.

- `@netless/zoom-controller`

  -  Zoom in and out control: zoom in, zoom out, current percentage, return to initial size and position

- `@netless/preview-controller`

  - Multi-page preview control: preview page content, insert blank page, delete page

  - Preview the details page

    ![预览图](https://white-sdk.oss-cn-beijing.aliyuncs.com/images/preview-controller.jpg)

- `@netless/cursor-tool`

  - Cursor tool: support cursor position display, cursor teaching aid status, cursor operator name display

- `@netless/docs-center`

  - Document Center: Manage the courseware materials uploaded in the whiteboard room, such as: PPT, PDF, WORD, PPTX

  - Document Center Preview

    ![docs-center](https://white-sdk.oss-cn-beijing.aliyuncs.com/images/docs-center.jpg)

- `@netless/oss-upload-button`

  - Upload management button: upload pictures, courseware

- `@netless/white-video-plugin`

  - Video plug-in: Support uploading video, which is used for injection during initialization.

- `@netless/white-audio-plugin`

  - Audio plug-in: Support audio plug-in, used to inject during initialization.

- `@netless/plugin-center`

  - Plug-in whiteboard plug-in management center: manage the display of plug-ins, used to upload videos using api.

#### 5.1.2 Common controls

- `@netless/fetch-middleware`
  - Network request middleware: has the function of setting request timeout error report
- `@netless/loading-bar`
  - Progress bar: upload to oss for display
- `@netless/menu-box`
  - Sidebar component with animation: used in document center and preview management

### 5.2 Start project build

```bash
# STEP 1
yarn
# STEP 2
lerna bootstrap
# STEP 3
# The following two dependencies depend on other libraries in the package, and build other libraries first, then build these two libraries
lerna run --ignore @netless/docs-center --ignore @netless/preview-controller build:lib
lerna run --scope @netless/docs-center --scope @netless/preview-controller build:lib
lerna run --scope whiteboard build
```



### 5.3 Introduction to common commands

```bash
# Install global lerna
yarn global add lerna
# or npm install
npm install lerna -g

# Separate yarn
yarn

# lerna Ready to work
lerna bootstrap

# Start hot update of all scripts
lerna run --parallel dev

# Yarn build command to build all libraries
lerna run build

# Run only the yarn dev script of toolbox
lerna run --scope `lib-name` dev
# lerna run --parallel  --scope @netless/toolbox --scope whiteboard dev

# Run run dev scripts except tool-box
lerna run --ignore @netless/tool-box dev

# build all libraries
lerna run --parallel build:lib
```
