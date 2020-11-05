import * as React from "react";
import {Player, PlayerPhase} from "white-web-sdk";
import {Dropdown, Menu} from "antd";
import {LoadingOutlined} from "@ant-design/icons";
import "./index.less";
import SeekSlider from "./SeekSlider";
import {displayWatch} from "./WatchDisplayer";
import * as video_pause from "./image/video_pause.svg";
import * as video_play from "./image/video_play.svg";
import { CombinePlayer } from '@netless/combine-player/dist/Types';

export type PlayerControllerStates = {
    phase: PlayerPhase;
    isPlayerSeeking: boolean;
    currentTime: number;
    multiple: number;
};

export type PlayerControllerProps = {
    player: Player;
    combinePlayer?: CombinePlayer;
};

export default class PlayerController extends React.Component<PlayerControllerProps, PlayerControllerStates> {
    private progressTime: number = 0;
    private playerOnPhaseChanged: (phase: PlayerPhase) => void
    private playerOnProgressTimeChanged: (currentTime: number) => void;

    public constructor(props: PlayerControllerProps) {
        super(props);
        this.state = {
            phase: props.player.phase,
            isPlayerSeeking: false,
            currentTime: 0,
            multiple: props.player.playbackSpeed,
        };

        this.playerOnPhaseChanged = (phase: PlayerPhase): void => {
            this.setState({phase: phase});
        };

        this.playerOnProgressTimeChanged = (currentTime: number): void => {
            this.setState({currentTime: currentTime});
        };
    }

    public componentDidMount(): void {
        const {player} = this.props;

        player.callbacks.on("onPhaseChanged", this.playerOnPhaseChanged);
        player.callbacks.on("onProgressTimeChanged", this.playerOnProgressTimeChanged);
    }

    public componentWillUnmount() {
        const {player} = this.props;

        player.callbacks.off("onPhaseChanged", this.playerOnPhaseChanged);
        player.callbacks.off("onProgressTimeChanged", this.playerOnProgressTimeChanged)
    }

    private onClickOperationButton = (player: Player): void => {
        const playerControl = this.props.combinePlayer || player;
        switch (player.phase) {
            case PlayerPhase.WaitingFirstFrame:
            case PlayerPhase.Pause:
            case PlayerPhase.Ended: {
                playerControl.play();
                break;
            }
            case PlayerPhase.Playing: {
                playerControl.pause();
                break;
            }
        }
    }

    private getCurrentTime = (progressTime: number): number => {
        if (this.state.isPlayerSeeking) {
            this.progressTime = progressTime;
            return this.state.currentTime;
        } else {
            const isChange = this.progressTime !== progressTime;
            if (isChange) {
                return progressTime;
            } else {
                return this.state.currentTime;
            }
        }
    }

    private operationButton = (phase: PlayerPhase): React.ReactNode => {
        switch (phase) {
            case PlayerPhase.Playing: {
                return <img src={video_pause}/>;
            }
            case PlayerPhase.Buffering: {
                return <LoadingOutlined style={{fontSize: 14, color: "#7A7B7C"}}/>;
            }
            default: {
                return <img style={{marginLeft: 2}} src={video_play}/>;
            }
        }
    }

    private handleMultiplePlay = (multiple: number) => {
        const {player} = this.props;
        player.playbackSpeed = multiple;
    }

    private handleActiveMultiple = (multiple: number): void => {
        this.handleMultiplePlay(multiple);
        this.setState({multiple: multiple});
    }

    private renderMultipleNode = (multipleInner: number): React.ReactNode => {
        const {multiple} = this.state;
        if (multipleInner === multiple) {
            return <div style={{color: "#3381FF"}}>{multipleInner}x</div>
        } else {
            return <div>{multipleInner}x</div>
        }
    }

    private renderMultipleSelector = (): React.ReactElement => {
        return (
            <Menu defaultValue={"1.0"} className="player-menu-box">
                <Menu.Item key="2.0"
                           onClick={() => this.handleActiveMultiple(2.0)}
                           className="player-menu-cell">
                    {this.renderMultipleNode(2.0)}
                </Menu.Item>
                <Menu.Item key="1.5"
                           onClick={() => this.handleActiveMultiple(1.5)}
                           className="player-menu-cell">
                    {this.renderMultipleNode(1.5)}
                </Menu.Item>
                <Menu.Item key="1.25"
                           onClick={() => this.handleActiveMultiple(1.25)}
                           className="player-menu-cell">
                    {this.renderMultipleNode(1.25)}
                </Menu.Item>
                <Menu.Item key="1.0"
                           onClick={() => this.handleActiveMultiple(1.0)}
                           className="player-menu-cell">
                    {this.renderMultipleNode(1.0)}
                </Menu.Item>
                <Menu.Item key="0.75"
                           onClick={() => this.handleActiveMultiple(0.75)}
                           className="player-menu-cell">
                    {this.renderMultipleNode(0.75)}
                </Menu.Item>
                <Menu.Item key="0.5"
                           onClick={() => this.handleActiveMultiple(0.5)}
                           className="player-menu-cell">
                    {this.renderMultipleNode(0.5)}
                </Menu.Item>
            </Menu>
        );
    }

    public render(): React.ReactNode {
        const {player, combinePlayer} = this.props;
        return (
            <div className="player-schedule">
                <div className="player-mid-box">
                    <SeekSlider
                        fullTime={player.timeDuration}
                        currentTime={this.getCurrentTime(this.state.currentTime)}
                        onChange={(time: number, offsetTime: number) => {
                            if (player) {
                                this.setState({currentTime: time});

                                if (combinePlayer) {
                                    combinePlayer.seek(time);
                                } else {
                                    player.seekToProgressTime(time);
                                }
                            }
                        }}
                        hideHoverTime={true}
                        limitTimeTooltipBySides={true}/>
                </div>
                <div className="player-controller-box">
                    <div className="player-controller-mid">
                        <div className="player-left-box">
                            <div
                                onClick={() => {
                                    if (player) {
                                        this.onClickOperationButton(player);
                                    }
                                }}
                                className="player-controller">
                                {this.operationButton(this.state.phase)}
                            </div>
                            <div className="player-mid-box-time">
                                {displayWatch(Math.floor(player.progressTime / 1000))} / {displayWatch(Math.floor(player.timeDuration / 1000))}
                            </div>
                        </div>
                        <Dropdown overlay={this.renderMultipleSelector} placement="topCenter">
                            <div className="player-right-box">
                                {this.state.multiple === 1.0 ? `倍数` : `${this.state.multiple}x`}
                            </div>
                        </Dropdown>
                    </div>
                </div>
            </div>
        );
    }
}
