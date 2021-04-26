import * as React from "react";
import {Player, PluginProps} from "white-web-sdk";
import { reaction, IReactionDisposer } from "mobx";
import "./index.less";
import * as audio_plugin from "./image/audio_plugin.svg";
import { PluginContext } from "./Plugins";
import {WhiteAudioPluginAttributes} from "./index";
import {ProgressSyncNode} from "./ProgressSyncNode";
export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export type WhiteAudioPluginProps = { player: Player } & PluginProps<PluginContext, WhiteAudioPluginAttributes>;

export type WhiteAudioPluginStates = {
    mute: boolean;
};

export default class WhiteAudioPluginReplay extends React.Component<WhiteAudioPluginProps, WhiteAudioPluginStates> {

    private readonly reactionPlayDisposer: IReactionDisposer;
    private readonly reactionSeekDisposer: IReactionDisposer;
    private readonly reactionVolumeDisposer: IReactionDisposer;
    private readonly reactionMuteDisposer: IReactionDisposer;
    private readonly reactionReplayPlayingDisposer: IReactionDisposer;
    private readonly player: React.RefObject<HTMLVideoElement>;
    private syncNode: ProgressSyncNode;
    public constructor(props: WhiteAudioPluginProps) {
        super(props);
        this.player = React.createRef();
        this.reactionPlayDisposer = this.startPlayReaction();
        this.reactionSeekDisposer = this.startSeekReaction();
        this.reactionMuteDisposer = this.startMuteTimeReaction();
        this.reactionVolumeDisposer = this.startVolumeReaction();
        this.reactionReplayPlayingDisposer = this.startReplayPlayingReaction();
        this.state = {
            mute: false,
        };
    }
    public componentDidMount(): void {
        this.syncNode = new ProgressSyncNode(this.player.current!);
    }
    private startPlayReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.attributes.play;
        }, async play => {
            if (play) {
                if (this.player.current) {
                    try {
                        await this.player.current.play();
                    } catch (err) {
                        if (`${err.name}` === "NotAllowedError") {
                            await this.player.current.play();
                        }
                    }
                }
            } else {
                if (this.player.current) {
                    this.player.current.pause();
                }
            }
        });
    }

    private startSeekReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.playerTimestamp;
        }, playerTimestamp => {
            const {seek, seekTime} = this.props.plugin.attributes;
            if (seekTime !== undefined) {
                const currentTime = (this.props.player.beginTimestamp + playerTimestamp) / 1000;
                const seekToTime = seek + currentTime - seekTime;
                this.syncNode.syncProgress(seekToTime);
            }
        });
    }

    private startReplayPlayingReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.isPlaying;
        }, async isPlaying => {
            if (isPlaying) {
                if (this.player.current) {
                    try {
                        await this.player.current.play();
                    } catch (err) {
                        if (`${err.name}` === "NotAllowedError") {
                            await this.player.current.play();
                        }
                    }
                }
            } else {
                if (this.player.current) {
                    this.player.current.pause();
                }
            }
        });
    }

    private startVolumeReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.attributes.volume;
        }, volume => {
            if (this.player.current) {
                this.player.current.volume = volume;
            }
        });
    }

    public componentWillUnmount(): void {
        this.reactionPlayDisposer();
        this.reactionSeekDisposer();
        this.reactionMuteDisposer();
        this.reactionVolumeDisposer();
        this.reactionReplayPlayingDisposer();
    }

    private startMuteTimeReaction(): IReactionDisposer {
        const { plugin } = this.props;
        return reaction(() => {
            return plugin.attributes.mute;
        }, mute => {
            this.setState({ mute: mute });
        });
    }

    private renderNavigation = (): React.ReactNode => {
        const { plugin } = this.props;
        if ((plugin.attributes as any).isNavigationDisable === true) {
            return null;
        } else {
            return (
                <div className="plugin-audio-box-nav">
                    <div>
                        <img style={{ width: 20, marginLeft: 8 }} src={audio_plugin}  alt={"audio_plugin"}/>
                        <span>
                            Audio Player
                        </span>
                    </div>
                </div>
            );
        }
    }
    public render(): React.ReactNode {
        const { size, plugin, scale } = this.props;
        const newScale = scale === 0 ? 1 : scale;
        return (
            <div className="plugin-audio-box" style={{ width: (size.width / newScale), height: (size.height / newScale), transform: `scale(${newScale})`}}>
                {this.renderNavigation()}
                <div className="plugin-audio-box-body">
                    <div className="white-plugin-audio-box">
                        <audio
                            webkit-playsinline="true"
                            playsInline
                            className="white-plugin-audio"
                            src={(plugin.attributes as any).pluginAudioUrl}
                            ref={this.player}
                            muted={this.state.mute}
                            style={{
                                width: "100%",
                                height: "100%",
                                pointerEvents: "none",
                                outline: "none",
                            }}
                            controls
                            controlsList={"nodownload nofullscreen"}
                            preload="auto"
                        />
                    </div>
                </div>
            </div>
        );
    }
}
