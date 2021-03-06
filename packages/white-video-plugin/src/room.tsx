import * as React from "react";
import {PluginProps, Room} from "white-web-sdk";
import { reaction, IReactionDisposer } from "mobx";
import "./index.less";
import * as mute_icon from "./image/mute_icon.svg";
import * as video_plugin from "./image/video_plugin.svg";
import * as delete_icon from "./image/delete_icon.svg";
import { PluginContext } from "./Plugins";
import {WhiteVideoPluginAttributes} from "./index";
import {ProgressSyncNode} from "./ProgressSyncNode";
const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));
export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export type WhiteVideoPluginProps = {
    room: Room,
} & PluginProps<PluginContext, WhiteVideoPluginAttributes>;

export type WhiteVideoPluginStates = {
    play: boolean;
    mute: boolean;
    selfMute: boolean;
    volume: number;
    seek: number;
    currentTime: number;
    isEnd: boolean;
};

export type SelfUserInf = {
    identity?: IdentityType,
};

export default class WhiteVideoPluginRoom extends React.Component<WhiteVideoPluginProps, WhiteVideoPluginStates> {

    private readonly reactionPlayDisposer: IReactionDisposer;
    private readonly reactionSeekDisposer: IReactionDisposer;
    private readonly reactionSeekTimeDisposer: IReactionDisposer;
    private readonly reactionVolumeDisposer: IReactionDisposer;
    private readonly reactionMuteDisposer: IReactionDisposer;
    private readonly reactionSyncDisposer: IReactionDisposer;
    private readonly player: React.RefObject<HTMLVideoElement>;
    private syncNode: ProgressSyncNode;
    private selfUserInf: SelfUserInf | null = null;
    public constructor(props: WhiteVideoPluginProps) {
        super(props);
        this.player = React.createRef();
        this.reactionSeekDisposer = this.startSeekReaction();
        this.reactionSeekTimeDisposer = this.startSeekTimeReaction();
        this.reactionPlayDisposer = this.startPlayReaction();
        this.reactionVolumeDisposer = this.startVolumeReaction();
        this.reactionMuteDisposer = this.startMuteTimeReaction();
        this.reactionSyncDisposer = this.startSyncReaction();
        this.state = {
            play: false,
            seek: 0,
            selfMute: false,
            currentTime: 0,
            mute: false,
            volume: 1,
            isEnd: false,
        };
    }

    public async componentDidMount(): Promise<void> {
        this.syncNode = new ProgressSyncNode(this.player.current!);
        await this.handleStartCondition();
    }
    private playerState: boolean = false;
    private handleStartCondition = async (): Promise<void> => {
        const { plugin } = this.props;
        this.setMyIdentityRoom();
        await this.handleNativePlayerState(plugin.attributes.play);
        this.playerState = plugin.attributes.play;
        if (this.player.current) {
            this.handleFirstSeek();
            this.player.current.addEventListener("play", () => {
                this.handleRemotePlayState(true);
            });
            this.player.current.addEventListener("pause", () => {
                this.handleRemotePlayState(false);
            });
            this.player.current.addEventListener("seeked", () => {
                if (this.player.current) {
                    const currentTime = plugin.attributes.currentTime;
                    this.handleRemoteSeekData(currentTime);
                }
            });

            this.player.current.addEventListener("volumechange", (event: any) => {
                this.handleRemoteVolumeChange(event.target.volume);
                this.handleRemoteMuteState(event.target.muted);
            });
        }
    }

    private handleFirstSeek = (isEnd?: boolean): void => {
        if (!isEnd) {
            const {plugin} = this.props;
            const currentTime = Date.now() / 1000;
            let seekToTime;
            if (plugin.attributes.seekTime) {
                seekToTime = plugin.attributes.seek + currentTime - plugin.attributes.seekTime
            } else {
                seekToTime = plugin.attributes.seek;
            }
            this.syncNode.syncProgress(seekToTime);
        }
    }

    private isHost = (): boolean => {
        return !!(this.selfUserInf && this.selfUserInf.identity === IdentityType.host);
    }

    private setMyIdentityRoom = (): void => {
        const {plugin} = this.props;
        if (plugin.context && plugin.context.identity) {
            this.selfUserInf = {
                identity: plugin.context.identity,
            };
        }
    }

    private handleRemoteSeekData = (seek: number): void => {
        const { plugin } = this.props;
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                plugin.putAttributes({
                    seek: seek,
                    seekTime: Date.now() / 1000,
                });
            }
        }
    }

    private handleRemoteMuteState = (mute: boolean): void => {
        const { plugin } = this.props;
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                plugin.putAttributes({ mute: mute });
            }
        }
    }

    private handleRemoteVolumeChange = (volume: number): void => {
        const { plugin } = this.props;
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                plugin.putAttributes({ volume: volume });
            }
        }
    }

    private handleRemotePlayState = (play: boolean): void => {
        const { plugin } = this.props;
        this.playerState = play;
        const currentTime = plugin.attributes.currentTime;
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                plugin.putAttributes({
                    play: play,
                    seek: currentTime,
                    seekTime: Date.now() / 1000,
                });
            }
        }
    }

    private lastSyncProgressTimestamp: number = 0;

    private onTimeUpdate = (currentTime: number): void => {
        const { plugin } = this.props;
        const fireTimestamp = Date.now();
        const threshold = 1000;
        if (fireTimestamp - this.lastSyncProgressTimestamp > threshold) {
            this.lastSyncProgressTimestamp = fireTimestamp;
            if (this.selfUserInf) {
                if (this.selfUserInf.identity === IdentityType.host) {
                    plugin.putAttributes({ currentTime: currentTime, play: this.playerState });
                }
            }
        }
    }

    private startPlayReaction(): IReactionDisposer {
        const { plugin } = this.props;
        return reaction(() => {
            return plugin.attributes.play;
        }, async play => {
            if (!this.isHost()) {
                await this.handleNativePlayerState(play);
            }
        });
    }

    private handleNativePlayerState = async (play: boolean): Promise<void> => {
        if (play) {
            if (this.player.current) {
                try {
                    await this.player.current.play();
                } catch (err) {
                    if (`${err.name}` === "NotAllowedError" || `${err.name}` === "AbortError") {
                        this.setState({ selfMute: true });
                        await this.player.current.play();
                    }
                }
            }
        } else {
            if (this.player.current) {
                this.player.current.pause();
            }
        }
    }

    private startSeekReaction(): IReactionDisposer {
        const { plugin } = this.props;
        return reaction(() => {
            return plugin.attributes.seek;
        }, async seek => {
            await this.handleSeekReaction(seek, plugin.attributes.seekTime);
        });
    }

    private startSyncReaction(): IReactionDisposer {
        const { plugin } = this.props;
        return reaction(() => {
            return plugin.attributes.currentTime;
        }, async currentTime => {
            if (!this.isHost()) {
                const threshold = 2;
                if (this.player.current && Math.abs(currentTime - this.player.current.currentTime) > threshold) {
                    this.player.current.currentTime = currentTime;
                }
            }
        });
    }

    private startSeekTimeReaction(): IReactionDisposer {
        const { plugin } = this.props;
        return reaction(() => {
            return plugin.attributes.seekTime;
        }, async seekTime => {
            await this.handleSeekReaction(plugin.attributes.seek, seekTime);
        });
    }

    private handleSeekReaction = async (seek: number, seekTime?: number): Promise<void> => {
        if (!this.isHost()) {
            if (this.player.current && seekTime !== undefined) {
                this.player.current.currentTime = seek + (Date.now() / 1000) - seekTime;
            }
        }
    }

    private startVolumeReaction(): IReactionDisposer {
        const {plugin} = this.props;
        return reaction(() => {
            return plugin.attributes.volume;
        }, volume => {
            if (!this.isHost()) {
                if (this.player.current) {
                    this.player.current.volume = volume;
                }
            }
        });
    }
    private startMuteTimeReaction(): IReactionDisposer {
        const { plugin } = this.props;
        return reaction(() => {
            return plugin.attributes.mute;
        }, mute => {
            if (!this.isHost()) {
                this.setState({ mute: mute });
            }
        });
    }

    public componentWillUnmount(): void {
        this.reactionPlayDisposer();
        this.reactionSeekDisposer();
        this.reactionMuteDisposer();
        this.reactionVolumeDisposer();
        this.reactionSeekTimeDisposer();
        this.reactionSyncDisposer()
        if (this.player.current) {
            this.player.current.pause();
        }
    }

    private timeUpdate = (): void => {
        if (this.player.current) {
            const currentTime = this.player.current.currentTime;
            this.onTimeUpdate(currentTime);
        }
    }

    private detectVideoClickEnable = (): any => {
        const { plugin } = this.props;
        if (plugin.context && plugin.context.identity) {
            if (plugin.context.identity !== IdentityType.host) {
                return "none";
            } else {
                return "auto";
            }
        } else {
            return "none";
        }
    }
    private renderMuteBox = (): React.ReactNode => {
        const { plugin } = this.props;
        if (plugin.context && plugin.context.identity) {
            if (plugin.context.identity !== IdentityType.host) {
                if (this.state.selfMute) {
                    return (
                        <div className="media-mute-box">
                            <div onClick={() => {
                                this.setState({ selfMute: false });
                            }} onTouchStart={() => {
                                this.setState({ selfMute: false });
                            }} style={{ pointerEvents: "auto" }} className="media-mute-box-inner">
                                <img src={mute_icon} alt={"mute_icon"} />
                                <span>unmute</span>
                            </div>
                        </div>
                    );
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    private handleRemove = async (): Promise<void> => {
        const { plugin } = this.props;
        this.handleRemotePlayState(false);
        await timeout(300);
        plugin.remove();
    }

    private renderDeleteBtn = (): React.ReactNode => {
        const { plugin } = this.props;
        if (plugin.context && plugin.context.identity) {
            if (plugin.context.identity === IdentityType.host) {
                return (
                    <div
                        style={{ pointerEvents: "auto" }}
                        className="plugin-audio-box-delete"
                        onClick={this.handleRemove}
                    >
                        <img src={delete_icon}  alt={"delete"}/>
                    </div>
                );
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    private renderNavigation = (): React.ReactNode => {
        const { plugin } = this.props;
        if ((plugin.attributes as any).isNavigationDisable === true) {
            return null;
        } else {
            return (
                <div className="plugin-video-box-nav">
                    <div>
                        <img style={{ width: 20, marginLeft: 8 }} src={video_plugin}  alt={"video_plugin"}/>
                        <span>
                            Video Player
                        </span>
                    </div>
                    {this.renderDeleteBtn()}
                </div>
            );
        }
    }

    private handleOnEnd = async (): Promise<void> => {
        const { plugin } = this.props;
        if (this.player.current) {
            if (this.selfUserInf) {
                if (this.selfUserInf.identity === IdentityType.host) {
                    plugin.putAttributes({
                        seek: 0,
                        seekTime: undefined,
                        currentTime: 0,
                    });
                    await timeout(500);
                    this.player.current.load();
                } else {
                    await timeout(1000);
                    this.player.current.load();
                }
            } else {
                await timeout(1000);
                this.player.current.load();
            }
        }
        this.setState({isEnd: true});
    }

    private handleOnLoadedMetadataCapture = async (): Promise<void> => {
        const iOS = navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
        const {isEnd} = this.state;
        if (iOS) {
            await timeout(300);
            this.handleFirstSeek(isEnd);
        }
    }


    public render(): React.ReactNode {
        const { size, plugin, scale } = this.props;
        const {mute, selfMute} = this.state;
        const newScale = scale === 0 ? 1 : scale;
        return (
            <div className="plugin-video-box" style={{ width: (size.width / newScale), height: (size.height / newScale), transform: `scale(${newScale})`}}>
                {this.renderNavigation()}
                <div className="plugin-video-box-body">
                    {this.renderMuteBox()}
                    <div className="white-plugin-video-box">
                        <video webkit-playsinline="true"
                               playsInline
                               poster={(plugin.attributes as any).poster}
                               className="white-plugin-video"
                               src={(plugin.attributes as any).pluginVideoUrl}
                               ref={this.player}
                               muted={mute ? mute : selfMute}
                               style={{
                                   width: "100%",
                                   height: "100%",
                                   pointerEvents: this.detectVideoClickEnable(),
                                   outline: "none",
                               }}
                               disablePictureInPicture={true}
                               onLoadedMetadataCapture={this.handleOnLoadedMetadataCapture}
                               onEnded={this.handleOnEnd}
                               controls
                               controlsList={"nodownload nofullscreen"}
                               onTimeUpdate={this.timeUpdate}
                               preload="metadata"
                        />
                    </div>
                </div>
            </div>
        );
    }
}
