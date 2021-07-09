import type { Room, Player } from "white-web-sdk";
import type { VideoJsPlayer } from "video.js";
import type { Keys, Props, VideoJsPluginAttributes } from "./types";

import { autorun } from "white-web-sdk";
import React, { Component } from "react";
import videojs from "video.js";
import { PutDebounceTimeout, SyncPlayerMaxError } from "./constants";
import {
    Blocker,
    checkWhiteWebSdkVersion,
    getCurrentTime,
    getTimestamp,
    isEmptyObject,
} from "./utils";

export interface PropsWithPlayer extends Props {
    room?: Room;
    player?: Player;
}

interface State {
    /**
     * Chrome prevents video play sound on video.play().
     * Record the state here to tell the user to click once.
     */
    NoSound: boolean;
}

export class VideoJsPluginImpl extends Component<PropsWithPlayer, State> {
    video: HTMLVideoElement | null = null;
    closeIcon: HTMLSpanElement | null = null;
    alertMask: HTMLDivElement | null = null;
    player?: VideoJsPlayer;
    blocker: Blocker;
    disposer?: () => void;

    debug(msg: string, ...args: any[]) {
        if (this.props.plugin.context?.verbose) {
            console.log(`[VideoJS Plugin] ${msg}`, ...args);
        }
    }

    constructor(props: PropsWithPlayer) {
        super(props);
        props.room && checkWhiteWebSdkVersion(props.room);
        this.state = { NoSound: false };
        this.blocker = new Blocker(this.applyAttributes, !!props.room);
    }

    componentDidMount() {
        if (this.video) {
            this.player = videojs(this.video, {
                controlBar: {
                    fullscreenToggle: false,
                    pictureInPictureToggle: false,
                },
                // https://github.com/videojs/video.js/issues/7008
                html5: {
                    vhs: {
                        overrideNative: !videojs.browser.IS_SAFARI
                    }
                }
            });
            this.player.ready(this.initPlayer);

            this.initListener();
        }
    }

    componentWillUnmount() {
        if (this.disposer) {
            this.disposer();
            this.disposer = undefined;
        }
        if (this.player) {
            this.player.dispose();
            this.player = undefined;
        }
    }

    initPlayer = () => {
        const player = this.player!;
        player.controls(true);
        player.playsinline(true);
        player.preload(true);

        const { src, poster, currentTime, muted, paused, volume } = this.props.plugin.attributes;
        poster && player.poster(poster);
        player.currentTime(currentTime);
        player.volume(volume);
        player.src(src);
        player.muted(muted);

        player.on("error", this.catchPlayFail);
        !paused && player.play()?.catch(this.catchPlayFail);

        if (this.props.room) {
            player.on("play", this.notifyUpdate);
            player.on("pause", this.notifyUpdate);
            player.on("seeked", this.notifyUpdate);
            player.on("volumechange", this.notifyUpdate);
            player.on("ended", () => {
                player.autoplay(false);
                player.pause();
                player.src(this.props.plugin.attributes.src);
            });
        }
    };

    catchPlayFail = () => {
        this.debug("catch play() fail");
        this.player!.autoplay("any");
        this.setState({ NoSound: true });
    };

    fixPlayFail = () => {
        this.debug("try to fix play state");
        this.setState({ NoSound: false });
        const { muted, volume } = this.props.plugin.attributes;
        if (this.player) {
            this.player.muted(muted);
            this.player.volume(volume);
        }
    };

    debounceTimer = 0;
    notifyUpdate = () => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(this.update, PutDebounceTimeout);
    };

    /**
     * sync current state &rarr; plugin.attributes.
     * don't put empty state if nothing different.
     */
    update = () => {
        const player = this.player!;
        if (player.seeking()) {
            // if the player is loading, postpone its update.
            return this.notifyUpdate();
        }
        const plugin = this.props.plugin;
        const updated: Partial<VideoJsPluginAttributes> = Object.create(null);
        const current = {
            src: player.src(),
            poster: player.poster(),
            paused: player.paused(),
            muted: player.muted(),
            volume: player.volume(),
        };
        for (const key_ in current) {
            const key = key_ as keyof typeof current;
            if (current[key] !== plugin.attributes[key]) {
                updated[key] = current[key] as any;
            }
        }
        if (this.state.NoSound) {
            delete updated.volume;
            delete updated.muted;
        }
        const currentTime = player.currentTime();
        const hostCurrentTime = getCurrentTime(plugin.attributes, this.props);
        if (Math.abs(currentTime - hostCurrentTime) > SyncPlayerMaxError) {
            updated.currentTime = currentTime;
            updated.hostTime = getTimestamp(this.props);
        }
        if (!isEmptyObject(updated)) {
            this.debug(">>>", updated);
            this.blocker.update(updated);
            if (this.isEnabled()) {
                plugin.putAttributes(updated);
            }
        }
    };

    initListener() {
        this.disposer = autorun(this.autorun);
    }

    autorun = () => {
        this.blocker.initialize();
        void this.props.plugin.context;
        void this.props.plugin.attributes; // this line triggers autorun(), do not remove

        this.player?.toggleClass("disabled", !this.isEnabled());
        this.closeIcon?.classList.toggle("disabled", !this.isEnabled());
    };

    applyAttributes = () => {
        const player = this.player!;
        const attributes = this.blocker.applyAttributes(this.props.plugin.attributes);
        for (const key_ in attributes) {
            const key = key_ as Keys;
            if (key === "src" && player.src() !== attributes.src) {
                this.debug("<<< src %o -> %o", player.src(), attributes.src);
                player.src(attributes.src!);
            }
            if (key === "paused" && player.paused() !== attributes.paused) {
                this.debug("<<< paused %o -> %o", player.paused(), attributes.paused);
                attributes.paused ? player.pause() : player.play()?.catch(this.catchPlayFail);
            }
            if (!this.state.NoSound) {
                if (key === "volume" && player.volume() !== attributes.volume) {
                    this.debug("<<< volume %o -> %o", player.volume(), attributes.volume);
                    player.volume(attributes.volume!);
                }
                if (key === "muted" && player.muted() !== attributes.muted) {
                    this.debug("<<< muted %o -> %o", player.muted(), attributes.muted);
                    player.muted(attributes.muted!);
                }
            }
            if (key === "currentTime") {
                const currentTime = getCurrentTime(
                    attributes as VideoJsPluginAttributes,
                    this.props
                );
                if (player.currentTime() !== currentTime) {
                    this.debug("<<< currentTime %o -> %o", player.currentTime(), currentTime);
                    player.currentTime(currentTime);
                }
            }
        }
        if (this.props.player) {
            const { playbackSpeed } = this.props.plugin;
            if (player.playbackRate() !== playbackSpeed) {
                this.debug("<<< playbackRate %o -> %o", player.playbackRate(), playbackSpeed);
                player.playbackRate(playbackSpeed);
            }
        }
    };

    render() {
        const { room, player } = this.props;
        if (!room && !player) return null;
        return (
            <div style={{ display: "flex", flexGrow: 1, position: "relative" }}>
                <div data-vjs-player>
                    <video className="video-js" ref={(element) => (this.video = element)} />
                </div>
                <span ref={this.setupClose} className="videojs-plugin-close-icon">
                    &times;
                </span>
                {!this.props.plugin.context?.hideMuteAlert && this.state.NoSound && (
                    <div ref={this.setupAlert} className="videojs-plugin-muted-alert"></div>
                )}
            </div>
        );
    }

    setupClose = (element: HTMLSpanElement | null) => {
        if (element) {
            element.addEventListener("touchstart", this.removeSelf);
            element.addEventListener("click", this.removeSelf);
        }
        this.closeIcon = element;
    };

    setupAlert = (element: HTMLDivElement | null) => {
        if (element) {
            element.addEventListener("touchstart", this.fixPlayFail);
            element.addEventListener("click", this.fixPlayFail);
        }
        this.alertMask = element;
    };

    removeSelf = () => this.props.plugin.remove();

    isEnabled() {
        if (!this.props.room) return false;
        if (!this.props.room.isWritable) return false;

        let { identity, disabled } = this.props.plugin.context || {};
        if (identity === undefined && disabled === undefined) {
            // if not set, default to false
            return false;
        }
        if (identity) {
            // @deprecated respect identity
            return ["host", "publisher"].includes(identity);
        }
        if (disabled === undefined) {
            // if not set, default to false
            return false;
        }
        // not disabled
        return !disabled;
    }
}
