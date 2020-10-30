import * as React from "react";
import {RouteComponentProps} from "react-router";
import {CursorTool} from "@netless/cursor-tool";
import polly from "polly-js";
import {message} from "antd";
import {WhiteWebSdk, PlayerPhase, Player, createPlugins} from "white-web-sdk";
import video_play from "./assets/image/video-play.svg";
import "video.js/dist/video-js.css";
import "./ReplayPage.less";
import "./ReplaySyncPage.less";
import PageError from "./PageError";
import PlayerController from "@netless/player-controller";
import {netlessWhiteboardApi} from "./apiMiddleware";
import {netlessToken} from "./appToken";
import LoadingPage from "./LoadingPage";
import logo from "./assets/image/logo.svg";
import ExitButtonPlayer from "./components/ExitButtonPlayer";
import { Identity } from "./IndexPage";
import {videoPlugin} from "@netless/white-video-plugin";
import {audioPlugin} from "@netless/white-audio-plugin";
import CombinePlayerFactory from "@netless/combine-player";
import { CombinePlayer } from '@netless/combine-player/dist/Types';

export type PlayerSyncPageProps = RouteComponentProps<{
    identity: Identity;
    uuid: string;
    userId: string;
}>;


export type PlayerSyncPageStates = {
    player?: Player;
    phase: PlayerPhase;
    currentTime: number;
    isPlayerSeeking: boolean;
    isVisible: boolean;
    replayFail: boolean;
    replayState: boolean;
    combinePlayer?: CombinePlayer;
};

export default class NetlessSyncPlayer extends React.Component<PlayerSyncPageProps, PlayerSyncPageStates> {
    private readonly videoRef: React.RefObject<HTMLVideoElement>;

    public constructor(props: PlayerSyncPageProps) {
        super(props);
        this.state = {
            currentTime: 0,
            phase: PlayerPhase.Pause,
            isPlayerSeeking: false,
            isVisible: false,
            replayFail: false,
            replayState: false,
        };

        this.videoRef = React.createRef();
    }

    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const roomToken = await netlessWhiteboardApi.room.joinRoomApi(uuid);

        return roomToken || null;
    };

    public async componentDidMount(): Promise<void> {
        window.addEventListener("keydown", this.handleSpaceKey);
        const {uuid, identity} = this.props.match.params;
        const plugins = createPlugins({"video": videoPlugin, "audio": audioPlugin});
        plugins.setPluginContext("video", {identity: identity === Identity.creator ? "host" : ""});
        plugins.setPluginContext("audio", {identity: identity === Identity.creator ? "host" : ""});
        const roomToken = await this.getRoomToken(uuid);
        if (uuid && roomToken) {
            const whiteWebSdk = new WhiteWebSdk({
                appIdentifier: netlessToken.appIdentifier,
                plugins,
            });
            await this.loadPlayer(whiteWebSdk, uuid, roomToken);
        }
    }

    private loadPlayer = async (whiteWebSdk: WhiteWebSdk, uuid: string, roomToken: string): Promise<void> => {
        const replayState = await polly().waitAndRetry(10).executeForPromise(async () => {
             return await whiteWebSdk.isPlayable({
                region: "cn-hz",
                room: uuid,
            });
        });

        if (replayState) {
            this.setState({replayState: true});
            await this.startPlayer(whiteWebSdk, uuid, roomToken);
        }
    }

    private startPlayer = async (whiteWebSdk: WhiteWebSdk, uuid: string, roomToken: string): Promise<void> => {
        const cursorAdapter = new CursorTool();
        const player = await whiteWebSdk.replayRoom(
            {
                room: uuid,
                roomToken: roomToken,
                cursorAdapter: cursorAdapter,
            }, {
                onPhaseChanged: phase => {
                    this.setState({phase: phase});
                },
                onStoppedWithError: (error: Error) => {
                    message.error(`Playback error: ${error}`);
                    this.setState({replayFail: true});
                },
                onProgressTimeChanged: (scheduleTime: number) => {
                    this.setState({currentTime: scheduleTime});
                },
            });
        (window as any).player = player;
        cursorAdapter.setPlayer(player);
        this.setState({
            player: player,
        });

        this.initCombinePlayer(player);
    }

    private handleBindRoom = (ref: HTMLDivElement): void => {
        const {player} = this.state;
        if (player) {
            player.bindHtmlElement(ref);
        }
    }

    private handleSpaceKey = (evt: any): void => {
        if (evt.code === "Space") {
            if (this.state.player && this.state.combinePlayer) {
                this.onClickOperationButton(this.state.player, this.state.combinePlayer);
            }
        }
    }

    private onClickOperationButton = (player: Player, combinePlayer: CombinePlayer | undefined): void => {
        if (!player || !combinePlayer) {
            return;
        }

        switch (player.phase) {
            case PlayerPhase.WaitingFirstFrame:
            case PlayerPhase.Pause:
            case PlayerPhase.Ended:{
                console.log(1);
                combinePlayer.play();
                break;
            }
            case PlayerPhase.Playing: {
                combinePlayer.pause();
                break;
            }
        }
    }
    private renderScheduleView(): React.ReactNode {
        const {player, isVisible, combinePlayer} = this.state;
        if (player && isVisible && combinePlayer) {
            return (
                <div onMouseEnter={() => this.setState({isVisible: true})}>
                    <PlayerController player={player} combinePlayer={combinePlayer}/>
                </div>
            );
        } else {
            return null;
        }
    }

    private initCombinePlayer(player: Player): void {
        if (this.videoRef.current === null) {
            return;
        }

        const combinePlayerFactory = new CombinePlayerFactory(player, {
            url: "https://docs-assets.oss-cn-hangzhou.aliyuncs.com/m3u8-video/test.m3u8",
            videoDOM: this.videoRef.current,
        }, true);

        const combinePlayer = combinePlayerFactory.create();

        combinePlayer.setOnStatusChange((status, message) => {
            console.log("状态发生改变", status, message);
        });

        this.setState({
            combinePlayer,
        });

        (window as any).combinePlayer = combinePlayer;

    }


    private getReplayPage() {
        const {player, phase, replayState, combinePlayer} = this.state;
        const { identity, uuid, userId } = this.props.match.params;
        if (this.state.replayFail) {
            return <PageError/>;
        }
        if (!replayState) {
            return <LoadingPage text={"正在生成回放请耐心等待"}/>;
        }
        if (player === undefined) {
            return <LoadingPage/>;
        }
        switch (phase) {
            case (PlayerPhase.WaitingFirstFrame): {
                return <LoadingPage/>;
            }
            default: {
                return (
                    <div className="player-out-box">
                        <div className="logo-box">
                            <img src={logo} alt={"logo"}/>
                        </div>
                        <div className="room-controller-box">
                            <div className="page-controller-mid-box">
                                <ExitButtonPlayer
                                    identity={identity}
                                    uuid={uuid}
                                    userId={userId}
                                    player={player}
                                />

                            </div>
                        </div>
                        <div className="player-board">
                            {this.renderScheduleView()}
                            <div
                                className="player-board-inner"
                                onMouseOver={() => this.setState({isVisible: true})}
                                onMouseLeave={() => this.setState({isVisible: false})}
                            >
                                <div
                                    onClick={() => this.onClickOperationButton(player, combinePlayer)}
                                    className="player-mask">
                                    {phase === PlayerPhase.Pause &&
                                    <div className="player-big-icon">
                                      <img
                                        style={{width: 50, marginLeft: 6}}
                                        src={video_play}
                                        alt={"video_play"}/>
                                    </div>}
                                </div>
                                <div style={{backgroundColor: "#F2F2F2"}}
                                     className="player-box"
                                     ref={this.handleBindRoom}/>
                            </div>
                        </div>
                    </div>
                );
            }
        }
    }

    public render(): React.ReactNode {
        return (
            <div className="overall-box">
                {this.getReplayPage()}
                <video
                    className="video-box video-js"
                    ref={this.videoRef}
                    width="500"
                />
            </div>
        )
    }
}
