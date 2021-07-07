import type { Room } from "white-web-sdk";
import type { PropsWithPlayer } from "./VideoJsPluginImpl";
import type { Keys, VideoJsPluginAttributes } from "./types";

import { BlockActionTimeout, Version } from "./constants";

export function checkWhiteWebSdkVersion(room: Room) {
    if (!room.calibrationTimestamp) {
        // prettier-ignore
        throw new Error(`@netless/video-js-plugin@${Version} requires white-web-sdk@^2.13.8 to work properly.`);
    }
}

export function isEmptyObject(obj: object) {
    for (const _ in obj) {
        return false;
    }
    return true;
}

export function getCurrentTime(attributes: VideoJsPluginAttributes, props: PropsWithPlayer) {
    if (attributes.paused) {
        return attributes.currentTime;
    }
    const now = getTimestamp(props);
    if (now) {
        return attributes.currentTime + (now - attributes.hostTime) / 1000;
    } else {
        return attributes.currentTime;
    }
}

export function getTimestamp(props: PropsWithPlayer) {
    if (props.player) {
        return props.player.beginTimestamp + props.plugin.playerTimestamp;
    }
    if (props.room) {
        return props.room.calibrationTimestamp;
    }
}

/**
 * 屏蔽一段时间从 autorun 里修改播放器的操作，并在屏蔽结束时执行一些代码。
 */
export class Blocker {
    /**
     * 收到 autorun 时，将这个集合填满，以后每次用户操作都从里面删掉对应的属性。
     * 再次收到 autorun 时，重来。
     * FIXME: 
     * 收到 autorun 时，attributes 一定是旧的状态，此时本地可能已经有一些最新的更改，
     * 那么理应保留这些新的更改，现在旧的状态可能会覆盖本地的新修改。
     */
    blockedAttributes: Partial<Record<Keys, true>> = {};

    constructor(readonly onBlockEnd: () => void, readonly isActive: boolean) {}

    timer = 0;

    initialize() {
        this.blockedAttributes = {
            src: true,
            poster: true,
            hostTime: true,
            currentTime: true,
            paused: true,
            muted: true,
            volume: true,
        };
        clearTimeout(this.timer);
        this.timer = setTimeout(this.onBlockEnd, this.isActive ? BlockActionTimeout : 0);
    }

    update(updated: Partial<VideoJsPluginAttributes>) {
        for (const key in updated) {
            delete this.blockedAttributes[key as Keys];
        }
    }

    applyAttributes(attributes: VideoJsPluginAttributes) {
        const filtered: Partial<VideoJsPluginAttributes> = Object.create(null);
        for (const key in this.blockedAttributes) {
            filtered[key as Keys] = attributes[key as Keys] as any;
        }
        this.blockedAttributes = {};
        return filtered;
    }
}
