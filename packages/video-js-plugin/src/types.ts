import type { PluginInstance, PluginProps } from "white-web-sdk";

export type Props = PluginProps<PluginContext, VideoJsPluginAttributes>;

export type Instance = PluginInstance<PluginContext, VideoJsPluginAttributes>;

export interface PluginContext {
    /**
     * Chrome prevents video play sound on video.play().
     * Set `hideMuteAlert: true` to hide the muted mask covering the player.
     */
    hideMuteAlert?: boolean;

    /**
     * @deprecated use `disabled` or `room.setWritable()` instead.
     */
    identity?: "host" | "publisher" | "guest" | "observer";

    /**
     * If set, videojs plugins will not be controlled by the user input.
     */
    disabled?: boolean;

    /**
     * For debug.
     */
    verbose?: boolean;
}

export interface VideoJsPluginAttributes {
    /** 视频文件地址，空字符串时不播放 */
    src: string;
    /** 封面 */
    poster: string;
    /**
     * host 的当前 `room.calibrationTimestamp`，用于同步
     * @example
     * hostCurrentTime = (room.calibrationTimestamp - hostTime) / 1000 + currentTime
     */
    hostTime: number;
    /** 当前播放位置秒数，默认 0 */
    currentTime: number;
    /** 是否暂停中，默认 false */
    paused: boolean;
    /** 是否静音中，默认 false */
    muted: boolean;
    /** 音量 0..1，默认 1 */
    volume: number;
}

export type Keys = keyof VideoJsPluginAttributes;

export type Callback = () => void;
