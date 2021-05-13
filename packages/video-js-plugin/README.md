# @netless/video-js-plugin

> https://www.npmjs.com/package/@netless/video-js-plugin

## Install

**Note**: `video.js` is a `peerDependency` of this plugin.

```bash
npm i video.js @netless/video-js-plugin
# or
yarn add video.js @netless/video-js-plugin
```

## Usage

```ts
import "video.js/dist/video-js.css";
import { videoJsPlugin } from "@netless/video-js-plugin";

const plugins = createPlugins({ "video.js": videoJsPlugin });
plugins.setPluginContext("video.js", {
    identity: identity === Identity.creator ? "publisher" : "observer"
});

let sdk = new WhiteWebSdk({ plugins });

let room = await sdk.joinRoom(...);
const pluginId = room.insertPlugin("video.js", {
    originX: -240, originY: -43, width: 480, height: 86,
    attributes: { src: ..., poster: ... },
});

// change the identity (apply to all components created by this plugin)
videoJsPlugin.manager.setContext({ identity: 'publisher' })
```

## Params

```ts
interface Context {
    identity："publisher" | "observer";
}

interface Attributes {
    src: string;
    poster?: string;
    hostTime: number;
    currentTime: number;
    paused: boolean;
    muted: boolean;
    volume: number;
}
```

## License

MIT @ [Agora](https://agora.io)
