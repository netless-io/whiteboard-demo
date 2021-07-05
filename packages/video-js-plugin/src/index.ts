import type { Plugin } from "white-web-sdk";
import { PluginId } from "./constants";
import { PluginContext, VideoJsPluginAttributes } from "./types";
import { VideoJsPlugin } from "./VideoJsPlugin";

export * from "./types";
export * from "./constants";

export const videoJsPlugin: Plugin<PluginContext, VideoJsPluginAttributes> = {
    kind: PluginId,
    render: VideoJsPlugin,
    defaultAttributes: {
        src: "",
        poster: "",
        hostTime: 0,
        currentTime: 0,
        paused: true,
        muted: false,
        volume: 1,
    },
};
