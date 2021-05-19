import React, { Component } from "react";
import videojs, { VideoJsPlayer } from "video.js";
import {
    autorun,
    CNode,
    Player,
    PlayerConsumer,
    PluginProps,
    Room,
    RoomConsumer,
} from "white-web-sdk";
import { SendInterval, SyncDiff } from "./constants";
import { manager } from "./global";
import { PluginContext, VideoJsPluginAttributes } from "./types";
import { Transformer } from "./utils";

// https://stackoverflow.com/questions/13384276/videojs-keep-controls-visible
/* this is basically what "style-loader" does */ {
    const injectedStyle = document.createElement("style");
    injectedStyle.appendChild(
        document.createTextNode(`
            .video-js, [data-vjs-player] { width: 100%; height: 100% }
            [data-vjs-player] * { pointer-events: auto }
            .video-js.disabled * { pointer-events: none }
            .vjs-has-started .vjs-control-bar {
                opacity: 1 !important;
            }
            .videojs-plugin-close-icon.disabled {
                display: none;
            }
            .videojs-plugin-close-icon {
                pointer-events: auto;
                z-index: 42;
                color: white;
                background: rgba(0,0,0,.64);
                position: absolute;
                top: 0; right: 0;
                width: 32px; height: 32px;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.64;
            }
            .videojs-plugin-close-icon:hover {
                opacity: 1;
            }
            .videojs-plugin-muted-alert {
                pointer-events: auto;
                cursor: pointer;
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                z-index: 43;
            }
            .videojs-plugin-muted-alert::before {
                pointer-events: auto;
                cursor: pointer;
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                z-index: 43;
                content: "\\f104";
                background: rgba(0,0,0,.3);
                font-family: VideoJS;
                font-size: 2em;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
        `)
    );
    document.head.appendChild(injectedStyle);
}

export type VideoJSPluginProps = PluginProps<PluginContext, VideoJsPluginAttributes>;

export class VideoJSPlugin extends Component<VideoJSPluginProps> {
    render() {
        const { cnode, size, scale } = this.props;
        return (
            <CNode context={cnode}>
                <Transformer size={size} scale={scale}>
                    <RoomConsumer
                        children={(room) =>
                            room && <VideoJSPluginImpl {...this.props} room={room} />
                        }
                    />
                    <PlayerConsumer
                        children={(player) =>
                            player && <VideoJSPluginImpl {...this.props} player={player} />
                        }
                    />
                </Transformer>
            </CNode>
        );
    }
}

type VideoJSPluginImplProps = VideoJSPluginProps & {
    room?: Room;
    player?: Player;
};

interface VideoJSPluginImplState {
    /**
     * Chrome prevents video play sound on video.play().
     * Record the state here to tell the user to click once.
     */
    isFirstPlay: boolean;
}

export class VideoJSPluginImpl extends Component<VideoJSPluginImplProps, VideoJSPluginImplState> {
    identity: PluginContext["identity"];
    videoNode?: HTMLVideoElement;
    player?: VideoJsPlayer;
    disposers: (() => void)[] = [];
    changedMap: Partial<VideoJsPluginAttributes> = {};
    playbackSpeed?: number;

    constructor(props: VideoJSPluginImplProps) {
        super(props);
        this.state = {
            isFirstPlay: false,
        };
    }

    // called when context changed
    dispose() {
        for (const disposer of this.disposers) {
            disposer();
        }
        this.disposers = [];
        this.changedMap = {};
    }

    changed<T extends keyof VideoJsPluginAttributes>(key: T, value: VideoJsPluginAttributes[T]) {
        if (this.changedMap[key] !== value) {
            this.changedMap[key] = value;
            return true;
        }
        return false;
    }

    autorunDisposer?: () => void;
    componentDidMount() {
        const { plugin } = this.props;
        if (this.videoNode) {
            this.player = videojs(this.videoNode, {
                controlBar: {
                    fullscreenToggle: false,
                    pictureInPictureToggle: false,
                },
            });
            manager.add(plugin, this.player);
            this.player.ready(this.initPlayer.bind(this));
        }
        this.autorunDisposer = autorun(this.autorun.bind(this));
    }

    componentWillUnmount() {
        const { plugin } = this.props;
        manager.remove(plugin);
        this.dispose();
        this.autorunDisposer?.();
        this.player?.dispose();
    }

    /**
     * call this method in `player.on('error')` and `player.play().catch()`
     */
    fixMuted = () => {
        this.player!.autoplay("muted");
        this.setState({ isFirstPlay: true });
    }

    /**
     * call this method when user click the alert mask
     */
    afterFixMuted = () => {
        const { plugin } = this.props;
        if (this.isPublisher()) plugin.putAttributes({ muted: false });
        this.player!.muted(false);
        this.setState({ isFirstPlay: false });
    }

    initPlayer() {
        const player = this.player!;
        const { src, poster, currentTime, muted, paused, volume } = this.props.plugin.attributes;
        if (poster) player.poster(poster);
        player.currentTime(currentTime);
        player.volume(volume);
        player.src(src);
        player.controls(true);
        player.playsinline(true);
        player.preload(true);
        player.muted(muted);
        player.ready(() => {
            if (!paused) {
                player.play()?.catch(this.fixMuted);
            }
        });
        player.on("error", this.fixMuted);
    }

    setIdentity(identity: PluginContext["identity"]) {
        this.dispose();
        this.identity = identity;
        if (this.identity === "publisher") this.setupPublisher();
        if (this.identity === "observer") this.setupObserver();
        this.forceUpdate();
    }

    autorun() {
        const { plugin } = this.props;
        if (this.identity !== plugin.context.identity) {
            this.setIdentity(plugin.context.identity);
        }
        if (this.identity === "observer") {
            const player = this.player!;
            const { isPlaying, playerTimestamp, playbackSpeed } = plugin;
            const { src, paused, volume, muted, currentTime, hostTime } = plugin.attributes;
            if (this.changed("src", src)) {
                player.src(src);
            }
            if (this.changed("paused", paused || !isPlaying)) {
                if (paused || !isPlaying) {
                    player.pause();
                } else {
                    if (this.state.isFirstPlay) {
                        player.autoplay("any");
                    } else {
                        player.play()?.catch(this.fixMuted);
                    }
                }
            }
            if (this.changed("volume", muted ? 0 : volume)) {
                player.volume(volume);
                player.muted(muted);
            }
            if (this.changed("currentTime", currentTime)) {
                let now = Date.now();
                if (this.props.player) {
                    now = this.props.player.beginTimestamp + playerTimestamp;
                }
                const hostCurrentTime = currentTime + (now - hostTime) / 1000;
                if (Math.abs(player.currentTime() - hostCurrentTime) > SyncDiff) {
                    player.currentTime(hostCurrentTime);
                    if (paused || !isPlaying) {
                        player.pause();
                    } else {
                        // BUG: directly call play() here sometimes doesn't work
                        player.pause();
                        player.muted(muted);
                        setTimeout(() => {
                            if (this.state.isFirstPlay) {
                                player.autoplay("any");
                            } else {
                                player.play()?.catch(this.fixMuted);
                            }
                        });
                    }
                }
            }
            if (this.playbackSpeed !== playbackSpeed) {
                this.playbackSpeed = playbackSpeed;
                player.playbackRate(playbackSpeed);
            }
        }
    }

    timestamp = () => {
        const player = this.player!;
        return { currentTime: player.currentTime(), hostTime: Date.now() };
    };

    setupPublisher() {
        const { plugin } = this.props;
        const player = this.player!;
        player.removeClass("disabled");
        player.ready(() => {
            player.on("play", () => {
                plugin.putAttributes({ paused: false, ...this.timestamp() });
            });
            player.on("pause", () => {
                plugin.putAttributes({ paused: true, ...this.timestamp() });
            });
            player.on("seeked", () => {
                plugin.putAttributes({ ...this.timestamp() });
            });
            player.on("volumechange", () => {
                if (!this.state.isFirstPlay) {
                    plugin.putAttributes({ volume: player.volume(), muted: player.muted() });
                }
            });
            let timer = NaN;
            player.on("timeupdate", () => {
                timer ||= window.setTimeout(() => {
                    timer = NaN;
                    plugin.putAttributes(this.timestamp());
                }, SendInterval * 1000);
            });
            this.disposers.push(() => window.clearTimeout(timer));
        });
    }

    setupObserver() {
        const player = this.player!;
        player.addClass("disabled");
    }

    isPublisher() {
        return this.props.room && this.props.plugin.context.identity === "publisher";
    }

    removeSelf = () => {
        this.props.plugin.remove();
    }

    render() {
        const { room, player } = this.props;
        if (!room && !player) return null;
        return (
            <div style={{ display: "flex", flexGrow: 1, position: "relative" }}>
                <div data-vjs-player>
                    <video
                        className="video-js"
                        controls={!!room}
                        controlsList="nodownload nofullscreen"
                        disablePictureInPicture
                        ref={(node) => (this.videoNode = node!)}
                        webkit-playsinline="true"
                    />
                </div>
                <span
                    className={
                        this.isPublisher()
                            ? "videojs-plugin-close-icon"
                            : "videojs-plugin-close-icon disabled"
                    }
                    onClick={this.removeSelf}
                >
                    &times;
                </span>
                {this.state.isFirstPlay && (
                    <div
                        className="videojs-plugin-muted-alert"
                        onClick={this.afterFixMuted}
                    ></div>
                )}
            </div>
        );
    }
}
