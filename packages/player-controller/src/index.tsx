import * as React from "react";
import {Player, PlayerPhase} from "white-web-sdk";
import {LoadingOutlined} from "@ant-design/icons";
import "./index.less";
import SeekSlider from "./SeekSlider";
import {displayWatch} from "./WatchDisplayer";
import * as player_stop from "./image/player_stop.svg";
import * as player_begin from "./image/player_begin.svg";

export type PlayerControllerStates = {
    phase: PlayerPhase;
    isPlayerSeeking: boolean;
    currentTime: number;
};

export type PlayerControllerProps = {
    player: Player;
};

export default class PlayerController extends React.Component<PlayerControllerProps, PlayerControllerStates> {
    private scheduleTime: number = 0;

    public constructor(props: PlayerControllerProps) {
        super(props);
        this.state = {
            phase: PlayerPhase.Pause,
            isPlayerSeeking: false,
            currentTime: 0,
        };
    }

    public componentDidMount(): void {
        const {player} = this.props;
        player.callbacks.on("onPhaseChanged", (phase: PlayerPhase): void => {
            this.setState({phase: phase});
        });
    }

    private onClickOperationButton = (player: Player): void => {
        switch (player.phase) {
            case PlayerPhase.WaitingFirstFrame:
            case PlayerPhase.Pause: {
                player.play();
                break;
            }
            case PlayerPhase.Playing: {
                player.pause();
                break;
            }
            case PlayerPhase.Ended: {
                player.seekToScheduleTime(0);
                break;
            }
        }
    }

    private getCurrentTime = (scheduleTime: number): number => {
        if (this.state.isPlayerSeeking) {
            this.scheduleTime = scheduleTime;
            return this.state.currentTime;
        } else {
            const isChange = this.scheduleTime !== scheduleTime;
            if (isChange) {
                return scheduleTime;
            } else {
                return this.state.currentTime;
            }
        }
    }

    private operationButton = (phase: PlayerPhase): React.ReactNode => {
        // return null;
        switch (phase) {
            case PlayerPhase.Playing: {
                return <img src={player_begin}/>;
            }
            case PlayerPhase.Buffering: {
                return <LoadingOutlined style={{fontSize: 18, color: "white"}} />;
            }
            default: {
                return <img style={{marginLeft: 2}} src={player_stop}/>;
            }
        }
    }

    public render(): React.ReactNode {
        const {player} = this.props;
        return (
            <div className="player-schedule">
                <div className="player-mid-box">
                    <SeekSlider
                        fullTime={player.timeDuration}
                        currentTime={this.getCurrentTime(this.state.currentTime)}
                        onChange={(time: number, offsetTime: number) => {
                            if (player) {
                                this.setState({currentTime: time});
                                player.seekToScheduleTime(time);
                            }
                        }}
                        hideHoverTime={true}
                        limitTimeTooltipBySides={true}/>
                </div>
                <div className="player-controller-box">
                    <div className="player-controller-left">
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
                        </div>
                        <div className="player-mid-box-time">
                            {displayWatch(Math.floor(player.scheduleTime / 1000))} / {displayWatch(Math.floor(player.timeDuration / 1000))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
