import { autorun } from "mobx";
import React, { Component, createRef, RefObject } from "react";
import { CNode, Player, PlayerConsumer, PluginProps, Room, RoomConsumer } from "white-web-sdk";
import videoPluginSVG from "./image/video_plugin.svg";
import deleteIconSVG from "./image/delete_icon.svg";
import "./index.less";
import { PluginContext, WhiteVideoPluginAttributes } from "./types";
import { ChangedMap, delay, doubleRAF, play } from "./utils";

/** 发送同步事件间隔秒 */
const SendInterval = 2;
/** 同步上游播放时间误差秒 */
const SyncDiff = 2;

export type WhiteVideoPluginProps = PluginProps<PluginContext, WhiteVideoPluginAttributes>;

export class WhiteVideoPlugin extends Component<WhiteVideoPluginProps> {
    render() {
        return (
            <CNode context={this.props.cnode}>
                <RoomConsumer
                    children={(room) =>
                        room && <WhiteVideoPluginImpl {...this.props} room={room} />
                    }
                />
                <PlayerConsumer
                    children={(player) =>
                        player && <WhiteVideoPluginImpl {...this.props} player={player} />
                    }
                />
            </CNode>
        );
    }
}

type WhiteVideoPluginImplProps = WhiteVideoPluginProps & {
    room?: Room;
    player?: Player;
};

class WhiteVideoPluginImpl extends Component<WhiteVideoPluginImplProps> {
    disposers: Function[] = [];
    changedMap = new ChangedMap();
    player: RefObject<HTMLVideoElement> = createRef();

    isHost() {
        return this.props.room && this.props.plugin.context.identity === "host";
    }

    componentDidMount() {
        if (this.props.room) {
            if (this.isHost()) {
                this.setupHost();
            } else {
                this.setupNonHost();
            }
        }
        if (this.props.player) {
            this.setupNonHost();
        }
    }

    timestamp = () => {
        const player = this.player.current!;
        return { currentTime: player.currentTime, hostTime: Date.now() };
    };

    setupHost() {
        const { plugin } = this.props;
        const player = this.player.current!;
        player.currentTime = plugin.attributes.currentTime;
        player.addEventListener("play", () => {
            plugin.putAttributes({ paused: false, ...this.timestamp() });
        });
        player.addEventListener("pause", () => {
            plugin.putAttributes({ paused: true, ...this.timestamp() });
        });
        player.addEventListener("seeked", () => {
            plugin.putAttributes(this.timestamp());
        });
        player.addEventListener("volumechange", () => {
            plugin.putAttributes({ volume: player.volume, muted: player.muted });
        });
        let timer = NaN;
        player.addEventListener("timeupdate", () => {
            timer ||= window.setTimeout(() => {
                timer = NaN;
                plugin.putAttributes(this.timestamp());
            }, SendInterval * 1000);
        });
        this.disposers.push(() => window.clearTimeout(timer));
        player.addEventListener("ended", async () => {
            plugin.putAttributes({ paused: true, ...this.timestamp() });
            await delay(500);
            player.load();
        });
        if (/iPad|iPhone|iPod/.test(navigator.platform)) {
            doubleRAF(() => {
                player.currentTime = plugin.attributes.currentTime;
            });
        }
    }

    setupNonHost() {
        const { plugin } = this.props;
        const player = this.player.current!;
        // n.b. reaction() 对 plugin.attributes 不起效，sdk 总是更新整个 attributes
        //      因此这里使用 autorun 和自己写的 changed() 检查变化
        const disposer = autorun(async () => {
            const { isPlaying, playerTimestamp, playbackSpeed } = plugin;
            const { paused, volume, muted, currentTime, hostTime } = plugin.attributes;
            if (this.changedMap.changed("paused", [paused, isPlaying])) {
                if (paused || !isPlaying) {
                    player.pause();
                } else {
                    await play(player);
                }
            }
            if (this.changedMap.changed("volume", [volume, muted])) {
                player.volume = plugin.attributes.volume;
                player.muted = plugin.attributes.muted;
            }
            if (this.changedMap.changed("time", [currentTime, hostTime]) && hostTime > 0) {
                let now = Date.now();
                if (this.props.player) {
                    now = this.props.player.beginTimestamp + playerTimestamp;
                }
                const hostCurrentTime = currentTime + (now - hostTime) / 1000;
                if (Math.abs(player.currentTime - hostCurrentTime) > SyncDiff) {
                    player.currentTime = hostCurrentTime;
                }
            }
            if (this.changedMap.changed("rate", playbackSpeed)) {
                player.playbackRate = playbackSpeed;
            }
        });
        this.disposers.push(disposer);
        this.disposers.push(() => this.changedMap.clear());
    }

    removeSelf = async () => {
        const { plugin } = this.props;
        plugin.putAttributes({ paused: true, ...this.timestamp() });
        await delay(300);
        plugin.remove();
    };

    componentWillUnmount() {
        this.player.current?.pause();
        this.disposers.forEach((dispose) => dispose());
    }

    get containerStyle() {
        const { size, scale: _scale } = this.props;
        const scale = _scale || 1;
        return {
            width: size.width / scale,
            height: size.height / scale,
            transform: `scale(${scale})`,
        };
    }

    get pointerEventsStyle(): { pointerEvents: "auto" | "none" } {
        return { pointerEvents: this.isHost() ? "auto" : "none" };
    }

    render() {
        const { room, player, plugin } = this.props;
        if (!room && !player) return null;
        return (
            <div className="white-video-plugin-container" style={this.containerStyle}>
                {!plugin.attributes.isNavigationDisable && (
                    <div className="white-video-plugin-nav">
                        <img src={videoPluginSVG} alt="video_plugin" />
                        <span className="white-video-plugin-nav-title">Video Player</span>
                        <span
                            className="white-video-plugin-nav-delete"
                            style={this.pointerEventsStyle}
                            onClick={this.removeSelf}
                        >
                            <img src={deleteIconSVG} alt="delete_icon" />
                        </span>
                    </div>
                )}
                <div className="white-video-plugin-body">
                    <video
                        src={plugin.attributes.src}
                        style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            ...this.pointerEventsStyle,
                        }}
                        controls
                        controlsList="nodownload nofullscreen"
                        preload="metadata"
                        ref={this.player}
                        playsInline
                        poster={plugin.attributes.poster}
                        disablePictureInPicture
                    />
                </div>
            </div>
        );
    }
}
