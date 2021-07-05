# @netless/video-js-plugin

https://www.npmjs.com/package/@netless/video-js-plugin

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
    hideMuteAlert: false,   // hide the big mute icon when play fail (*)
    disabled: false,        // pointer-events: none
    verbose: false,         // print debug info in console
});

// (*): https://developers.google.com/web/updates/2017/09/autoplay-policy-changes

let sdk = new WhiteWebSdk({ plugins });

let room = await sdk.joinRoom(...);

const pluginId = room.insertPlugin("video.js", {
    originX: -240, originY: -43, width: 480, height: 86,
    attributes: { src: ..., poster: ... },
});
```

## Params

```ts
interface Context {
    hideMuteAlert?: boolean;
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

## Changelog

### 0.2.0

- Deprecated context `identity`.
- Require `white-web-sdk` &ge; 2.13.8.
- Support multi host.

## License

MIT @ [Agora](https://agora.io)
