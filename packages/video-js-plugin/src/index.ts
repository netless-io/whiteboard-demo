import { Plugin } from "white-web-sdk";
import { PluginContext, VideoJsPluginAttributes } from "./types";
import { VideoJSPlugin } from "./VideoJsPlugin";
import { manager, VideoJsPluginManager } from "./global";

export const videoJsPlugin: Plugin<PluginContext, VideoJsPluginAttributes> & {
    manager: VideoJsPluginManager;
} = Object.freeze({
    kind: "video.js",
    render: VideoJSPlugin,
    defaultAttributes: {
        src: "",
        hostTime: 0,
        currentTime: 0,
        paused: true,
        muted: false,
        volume: 1,
    },
    manager,
});
