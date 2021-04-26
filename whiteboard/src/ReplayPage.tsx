import * as React from "react";
import {RouteComponentProps} from "react-router";
import {CursorTool} from "@netless/cursor-tool";
import polly from "polly-js";
import {message} from "antd";
import {WhiteWebSdk, PlayerPhase, Player, createPlugins, WhiteWebSdkConfiguration} from "white-web-sdk";
import video_play from "./assets/image/video-play.svg";
import "video.js/dist/video-js.css";
import "./ReplayPage.less";
import PageError from "./PageError";
import PlayerController from "@netless/player-controller";
import {netlessWhiteboardApi} from "./apiMiddleware";
import {h5DemoUrl3, netlessToken} from "./appToken";
import LoadingPage from "./LoadingPage";
import logo from "./assets/image/logo.png";
import ExitButtonPlayer from "./components/ExitButtonPlayer";
import { Identity } from "./IndexPage";
import { videoPlugin} from "@netless/white-video-plugin";
import { audioPlugin } from "@netless/white-audio-plugin";
import { videoPlugin2 } from "@netless/white-video-plugin2";
import { audioPlugin2 } from "@netless/white-audio-plugin2";
import { withTranslation, WithTranslation } from 'react-i18next';
import { getQueryH5Url } from "./tools/QueryGetter";
import { IframeBridge, IframeWrapper } from "@netless/iframe-bridge";
import { ReplayAdapter } from "./tools/ReplayAdapter";
import { Region } from "./region";

export type PlayerPageProps = RouteComponentProps<{
    identity: Identity;
    uuid: string;
    userId: string;
    region: Region;
}>;


export type PlayerPageStates = {
    player?: Player;
    phase: PlayerPhase;
    currentTime: number;
    isPlayerSeeking: boolean;
    isVisible: boolean;
    replayFail: boolean;
    replayState: boolean;
};

class NetlessPlayer extends React.Component<PlayerPageProps & WithTranslation, PlayerPageStates> {
    public constructor(props: PlayerPageProps & WithTranslation) {
        super(props);
        this.state = {
            currentTime: 0,
            phase: PlayerPhase.Pause,
            isPlayerSeeking: false,
            isVisible: false,
            replayFail: false,
            replayState: false,
        };
    }

    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const roomToken = await netlessWhiteboardApi.room.joinRoomApi(uuid);

        return roomToken || null;
    };

    public async componentDidMount(): Promise<void> {
        window.addEventListener("keydown", this.handleSpaceKey);
        const {uuid, identity, region} = this.props.match.params;
        const plugins = createPlugins({
            "video": videoPlugin, "audio": audioPlugin,
            "video2": videoPlugin2, "audio2": audioPlugin2,
        });
        plugins.setPluginContext("video", {identity: identity === Identity.creator ? "host" : ""});
        plugins.setPluginContext("audio", {identity: identity === Identity.creator ? "host" : ""});
        plugins.setPluginContext("video2", {identity: identity === Identity.creator ? "host" : ""});
        plugins.setPluginContext("audio2", {identity: identity === Identity.creator ? "host" : ""});
        const roomToken = await this.getRoomToken(uuid);
        if (uuid && roomToken) {
            const h5Url = getQueryH5Url();
            let whiteWebSdkParams: WhiteWebSdkConfiguration = {
                appIdentifier: netlessToken.appIdentifier,
                preloadDynamicPPT: true,
                plugins: plugins,
                region,
            }
            if (h5Url) {
                whiteWebSdkParams = Object.assign(whiteWebSdkParams, {
                    invisiblePlugins: [IframeBridge],
                    wrappedComponents: [IframeWrapper]
                })
            }
            const whiteWebSdk = new WhiteWebSdk(whiteWebSdkParams);
            await this.loadPlayer(whiteWebSdk, uuid, roomToken);
        }
    }

    private loadPlayer = async (whiteWebSdk: WhiteWebSdk, uuid: string, roomToken: string): Promise<void> => {
        await polly().waitAndRetry(10).executeForPromise(async () => {
            const isPlayable =  whiteWebSdk.isPlayable({ room: uuid, roomToken });

            if (!isPlayable) {
                throw Error("the current room cannot be replay");
            }

            return;
        });

        this.setState({replayState: true});
        await this.startPlayer(whiteWebSdk, uuid, roomToken);
    }

    private startPlayer = async (whiteWebSdk: WhiteWebSdk, uuid: string, roomToken: string): Promise<void> => {
        const cursorAdapter = new CursorTool();
        let firstPlay = false;
        const player = await whiteWebSdk.replayRoom(
            {
                room: uuid,
                roomToken: roomToken,
                cursorAdapter: cursorAdapter,
            }, {
                onPhaseChanged: phase => {
                    this.setState({phase: phase});
                    if (phase === PlayerPhase.Playing) {
                        if (!firstPlay) {
                           setTimeout(() => {
                            const h5Url = getQueryH5Url();
                            if (h5Url && (h5Url === h5DemoUrl3)) {
                                const bridge = player.getInvisiblePlugin(IframeBridge.kind);
                                new ReplayAdapter(player, bridge as IframeBridge, this.props.match.params.userId, h5Url);
                            }
                           }, 500);
                        }
                        firstPlay = true;
                    }
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
    }

    private handleBindRoom = (ref: HTMLDivElement): void => {
        const {player} = this.state;
        if (player) {
            player.bindHtmlElement(ref);
        }
    }

    private handleSpaceKey = (evt: any): void => {
        if (evt.code === "Space") {
            if (this.state.player) {
                this.onClickOperationButton(this.state.player);
            }
        }
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
    private renderScheduleView(): React.ReactNode {
        const {player, isVisible} = this.state;
        if (player && isVisible) {
            return (
                <div onMouseEnter={() => this.setState({isVisible: true})}>
                    <PlayerController player={player} i18nLanguage={this.props.i18n.language} />
                </div>
            );
        } else {
            return null;
        }
    }


    public render(): React.ReactNode {
        const { t } = this.props
        const {player, phase, replayState} = this.state;
        const { identity, uuid, userId, region } = this.props.match.params;
        if (this.state.replayFail) {
            return <PageError/>;
        }
        if (!replayState) {
            return <LoadingPage text={t('waitingReplayGenerate')}/>;
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
                        <div className="player-board">
                            {this.renderScheduleView()}
                            <div
                                className="player-board-inner"
                                onMouseOver={() => this.setState({isVisible: true})}
                                onMouseLeave={() => this.setState({isVisible: false})}
                            >
                                <div
                                    onClick={() => this.onClickOperationButton(player)}
                                    className="player-mask">
                                    {phase === PlayerPhase.Pause &&
                                    <div className="player-big-icon">
                                        <img
                                            style={{width: 50, marginLeft: 6}}
                                            src={video_play}
                                            alt={"video_play"}/>
                                    </div>}
                                </div>
                                <div className="player-box"
                                     ref={this.handleBindRoom}/>
                            </div>
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
                    </div>
                );
            }
        }
    }
}

export default withTranslation()(NetlessPlayer)
