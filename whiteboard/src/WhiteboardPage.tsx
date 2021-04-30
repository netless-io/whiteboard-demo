import * as React from "react";
import {RouteComponentProps} from "react-router";
import {
    createPlugins,
    DefaultHotKeys, DeviceType,
    PPTKind,
    Room,
    RoomPhase,
    RoomState,
    ViewMode,
    WhiteWebSdk,
    WhiteWebSdkConfiguration
} from "white-web-sdk";
import ToolBox from "@netless/tool-box";
import RedoUndo from "@netless/redo-undo";
import PageController from "@netless/page-controller";
import ZoomController from "@netless/zoom-controller";
import OssUploadButton from "@netless/oss-upload-button";
import {videoPlugin} from "@netless/white-video-plugin";
import {audioPlugin} from "@netless/white-audio-plugin";
import {videoPlugin2} from "@netless/white-video-plugin2";
import {audioPlugin2} from "@netless/white-audio-plugin2";
import PreviewController from "@netless/preview-controller";
import DocsCenter from "@netless/docs-center";
import {CursorTool} from "@netless/cursor-tool";
import {message, Tooltip} from "antd";
import {netlessWhiteboardApi} from "./apiMiddleware";
import PageError from "./PageError";
import LoadingPage from "./LoadingPage";
import pages from "./assets/image/pages.svg"
import folder from "./assets/image/folder.svg";
import follow from "./assets/image/follow.svg"
import followActive from "./assets/image/follow-active.svg";
import {h5DemoUrl, h5DemoUrl3, netlessToken, ossConfigObj, supplierUrl} from "./appToken";
import "./WhiteboardPage.less";
import InviteButton from "./components/InviteButton";
import ExitButtonRoom from "./components/ExitButtonRoom";
import {Identity} from "./IndexPage";
import OssDropUpload from "@netless/oss-drop-upload";
import {pptDatas} from "./taskUuids";
import {PPTDataType} from "@netless/oss-upload-manager";
import {v4 as uuidv4} from "uuid";
import moment from "moment";
import {LocalStorageRoomDataType} from "./HistoryPage";
import {IframeWrapper, IframeBridge} from "@netless/iframe-bridge";
import { IframeAdapter } from "./tools/IframeAdapter";
import { H5UploadButton } from "./components/H5UploadButton";
import i18n from "./i18n"
import { Region } from "./region";
import {isMobile, isWindows} from "react-device-detect";
import { SupplierAdapter } from "./tools/SupplierAdapter";
import { withTranslation, WithTranslation } from "react-i18next";
import FloatLink from "./FloatLink";

export type WhiteboardPageStates = {
    phase: RoomPhase;
    room?: Room;
    isMenuVisible: boolean;
    isFileOpen: boolean;
    mode?: ViewMode;
    whiteboardLayerDownRef?: HTMLDivElement;
    roomController?: ViewMode;
};
export type WhiteboardPageProps = RouteComponentProps<{
    identity: Identity;
    uuid: string;
    userId: string;
    region: Region;
}>;

class WhiteboardPage extends React.Component<WhiteboardPageProps & WithTranslation, WhiteboardPageStates> {
    public constructor(props: WhiteboardPageProps & WithTranslation) {
        super(props);
        this.state = {
            phase: RoomPhase.Connecting,
            isMenuVisible: false,
            isFileOpen: false,
        };
    }

    public async componentDidMount(): Promise<void> {
        await this.startJoinRoom();
    }

    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const roomToken = await netlessWhiteboardApi.room.joinRoomApi(uuid);
        if (roomToken) {
            return roomToken;
        } else {
            return null;
        }
    }
    private handleBindRoom = (ref: HTMLDivElement): void => {
        const {room} = this.state;
        this.setState({whiteboardLayerDownRef: ref});
        if (room) {
            room.bindHtmlElement(ref);
        }
    }

    private setDefaultPptData = (pptDatas: string[], room: Room): void => {
        const docs: PPTDataType[] = (room.state.globalState as any).docs;
        if (docs && docs.length > 1) {
            return;
        }
        if (pptDatas.length > 0) {
            for(let pptData of pptDatas){
                const sceneId = uuidv4();
                const scenes = JSON.parse(pptData);
                const documentFile: PPTDataType = {
                    active: false,
                    id: sceneId,
                    pptType: PPTKind.Dynamic,
                    data: scenes,
                };
                const docs = (room.state.globalState as any).docs;
                if (docs && docs.length > 0) {
                    const newDocs = [documentFile, ...docs];
                    room.setGlobalState({docs: newDocs});
                } else {
                    room.setGlobalState({docs: [documentFile]});
                }
                room.putScenes(`/${room.uuid}/${sceneId}`, scenes);
            }
        }
    }

    public setRoomList = (uuid: string, userId: string): void => {
        const rooms = localStorage.getItem("rooms");
        const timestamp = moment(new Date()).format("lll");
        if (rooms) {
            const roomArray: LocalStorageRoomDataType[] = JSON.parse(rooms);
            const room = roomArray.find(data => data.uuid === uuid);
            if (!room) {
                localStorage.setItem(
                    "rooms",
                    JSON.stringify([
                        {
                            uuid: uuid,
                            time: timestamp,
                            identity: Identity.creator,
                            userId: userId,
                        },
                        ...roomArray,
                    ]),
                );
            } else {
                const newRoomArray = roomArray.filter(data => data.uuid !== uuid);
                localStorage.setItem(
                    "rooms",
                    JSON.stringify([
                        {
                            uuid: uuid,
                            time: timestamp,
                            identity: Identity.creator,
                            userId: userId,
                        },
                        ...newRoomArray,
                    ]),
                );
            }
        } else {
            localStorage.setItem(
                "rooms",
                JSON.stringify([
                    {
                        uuid: uuid,
                        time: timestamp,
                        identity: Identity.creator,
                        userId: userId,
                    },
                ]),
            );
        }
    }

    private startJoinRoom = async (): Promise<void> => {
        const {uuid, userId, identity,region} = this.props.match.params;
        this.setRoomList(uuid, userId);
        const query = new URLSearchParams(window.location.search);
        const h5Url = decodeURIComponent(query.get("h5Url") || "");
        const h5Dir = query.get("h5Dir");
        try {
            const roomToken = await this.getRoomToken(uuid);
            if (uuid && roomToken) {
                const plugins = createPlugins({
                    "video": videoPlugin, "audio": audioPlugin,
                    "video2": videoPlugin2, "audio2": audioPlugin2,
                });
                plugins.setPluginContext("video", {identity: identity === Identity.creator ? "host" : ""});
                plugins.setPluginContext("audio", {identity: identity === Identity.creator ? "host" : ""});
                plugins.setPluginContext("video2", {identity: identity === Identity.creator ? "host" : ""});
                plugins.setPluginContext("audio2", {identity: identity === Identity.creator ? "host" : ""});
                let deviceType: DeviceType;
                if (isWindows) {
                    deviceType = DeviceType.Surface;
                } else {
                    if (isMobile) {
                        deviceType = DeviceType.Touch;
                    } else {
                        deviceType = DeviceType.Desktop;
                    }
                }
                let whiteWebSdkParams: WhiteWebSdkConfiguration = {
                    appIdentifier: netlessToken.appIdentifier,
                    plugins: plugins,
                    region,
                    preloadDynamicPPT: true,
                    deviceType: deviceType,
                    pptParams: {
                        useServerWrap: true,
                    },
                }
                if (h5Url) {
                    const pluginParam = {
                        wrappedComponents: [IframeWrapper],
                        invisiblePlugins: [IframeBridge]
                    }
                    whiteWebSdkParams = Object.assign(whiteWebSdkParams, pluginParam)
                }
                const whiteWebSdk = new WhiteWebSdk(whiteWebSdkParams);
                const cursorName = localStorage.getItem("userName");
                const cursorAdapter = new CursorTool();
                const room = await whiteWebSdk.joinRoom({
                        uuid: uuid,
                        roomToken: roomToken,
                        cursorAdapter: cursorAdapter,
                        userPayload: {
                            userId: userId,
                            cursorName: cursorName,
                        },
                        disableNewPencil: false,
                        floatBar: true,
                        hotKeys: {
                            ...DefaultHotKeys,
                            changeToSelector: "s",
                            changeToLaserPointer: "z",
                            changeToPencil: "p",
                            changeToRectangle: "r",
                            changeToEllipse: "c",
                            changeToEraser: "e",
                            changeToStraight: "l",
                            changeToArrow: "a",
                            changeToHand: "h",
                        },
                    },
                    {
                        onPhaseChanged: phase => {
                            this.setState({phase: phase});
                        },
                        onRoomStateChanged: (modifyState: Partial<RoomState>): void => {
                            if (modifyState.broadcastState) {
                                this.setState({mode: modifyState.broadcastState.mode});
                            }
                        },
                        onDisconnectWithError: error => {
                            console.error(error);
                        },
                        onKickedWithReason: reason => {
                            console.error("kicked with reason: " + reason);
                        },
                    });
                cursorAdapter.setRoom(room);
                room.setMemberState({
                    pencilOptions: {
                        disableBezier: false,
                        sparseHump: 1.0,
                        sparseWidth: 1.0,
                        enableDrawPoint: false
                    }
                });
                this.setDefaultPptData(pptDatas, room);
                if (room.state.broadcastState) {
                    this.setState({mode: room.state.broadcastState.mode})
                }
                this.setState({room: room});
                (window as any).room = room;
                if (h5Url && h5Dir) {
                    await this.handleEnableH5(room, h5Url, h5Dir);
                } else if (h5Url) {
                    await this.handleEnableH5(room, h5Url);
                }
            }
        } catch (error) {
            message.error(error);
            console.log(error);
        }
    }

    private handleEnableH5 = async (room: Room, h5Url: string, dir?: string): Promise<void> => {
        let bridge = await room.getInvisiblePlugin(IframeBridge.kind);
        if (!bridge) {
            const h5SceneDir = dir || "/h5";
            let totalPage = 6;
            bridge = await IframeBridge.insert({
                room,
                url: h5Url,
                width: 1280,
                height: 720,
                displaySceneDir: h5SceneDir,
                useClicker: true
            });
            if (h5Url === h5DemoUrl3) {
                totalPage = 14;
            }
            if ([h5DemoUrl, h5DemoUrl3].includes(h5Url) || dir) {
                const scenes = room.entireScenes();
                if (!scenes[h5SceneDir]) {
                    room.putScenes(h5SceneDir, this.createH5Scenes(totalPage));
                }
                if (room.state.sceneState.contextPath !== h5SceneDir) {
                    room.setScenePath(h5SceneDir);
                }
            }
        }
        if (dir) {
            new IframeAdapter(room, bridge as IframeBridge, this.props.match.params.userId, h5Url)
        }
        if (h5Url === supplierUrl) {
            new SupplierAdapter(room, bridge as IframeBridge, this.props.match.params.userId, h5Url);
        }
        (window as any).bridge = bridge;
    }


    private createH5Scenes = (pageNumber: number) => {
        return new Array(pageNumber).fill(1).map((_, index) => ({ name: `${index + 1}` }));
    }

    private handlePreviewState = (state: boolean): void => {
        this.setState({isMenuVisible: state});
    }

    private handleDocCenterState = (state: boolean): void => {
        this.setState({isFileOpen: state});
    }

    private handleRoomController = (room: Room): void => {
        const { t } = this.props;
        if (room.state.broadcastState.mode !== ViewMode.Broadcaster) {
            room.setViewMode(ViewMode.Broadcaster);
            message.success(t('other-users-will-follow-your-vision'));
        } else {
            room.setViewMode(ViewMode.Freedom);
            message.success(t('other-users-will-stop-follow-your-vision'));
        }
    }

    public render(): React.ReactNode {
        const {room, isMenuVisible, isFileOpen, phase, whiteboardLayerDownRef} = this.state;
        const { identity, uuid, userId, region } = this.props.match.params;
        if (room === undefined) {
            return <LoadingPage/>;
        }
        switch (phase) {
            case (RoomPhase.Connecting || RoomPhase.Disconnecting || RoomPhase.Reconnecting || RoomPhase.Reconnecting): {
                return <LoadingPage/>;
            }
            case RoomPhase.Disconnected: {
                return <PageError/>;
            }
            default: {
                return (
                    <div className="realtime-box">
                         <FloatLink />
                        {/*<div className="logo-box">*/}
                        {/*    <img src={logo} alt={"logo"}/>*/}
                        {/*</div>*/}
                        <div className="tool-box-out">
                            <ToolBox i18nLanguage={i18n.language} room={room} customerComponent={
                                [
                                    <OssUploadButton oss={ossConfigObj}
                                                     appIdentifier={netlessToken.appIdentifier}
                                                     sdkToken={netlessToken.sdkToken}
                                                     room={room}
                                                     region={region}
                                                     i18nLanguage={i18n.language}
                                                     whiteboardRef={whiteboardLayerDownRef}/>,
                                ]
                            }/>
                        </div>
                        <div className="redo-undo-box">
                            <RedoUndo room={room}/>
                        </div>
                        <div className="zoom-controller-box">
                            <ZoomController room={room}/>
                        </div>
                        <div className="room-controller-box">
                            <div className="page-controller-mid-box">
                                <Tooltip placement="bottom" title={"Vision control"}>
                                    <div className="page-preview-cell"
                                         onClick={()=> this.handleRoomController(room)}>
                                        <img style={{width: "28px"}} src={this.state.mode === ViewMode.Broadcaster ? followActive : follow} alt={"follow"}/>
                                    </div>
                                </Tooltip>
                                <Tooltip placement="bottom" title={"Docs center"}>
                                    <div className="page-preview-cell"
                                         onClick={() => this.setState({isFileOpen: !this.state.isFileOpen})}>
                                        <img style={{width: "28px"}} src={folder} alt={"folder"}/>
                                    </div>
                                </Tooltip>
                                <Tooltip placement="bottom" title={"H5 Course"}>
                                    <H5UploadButton region={region} room={room} {...this.props} />
                                </Tooltip>
                                <InviteButton uuid={uuid} region={region} />
                                <ExitButtonRoom identity={identity} room={room} userId={userId} />
                            </div>
                        </div>
                        <div className="page-controller-box">
                            <div className="page-controller-mid-box">
                                <PageController room={room}/>
                                <Tooltip placement="top" title={"Page preview"}>
                                    <div className="page-preview-cell" onClick={() => this.handlePreviewState(true)}>
                                        <img src={pages} alt={"pages"}/>
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                        <PreviewController handlePreviewState={this.handlePreviewState} isVisible={isMenuVisible}
                                           room={room}/>
                        <DocsCenter handleDocCenterState={this.handleDocCenterState}
                            isFileOpen={isFileOpen}
                            room={room}
                            i18nLanguage={i18n.language}/>
                        <OssDropUpload
                            room={room}
                            region={region}
                            oss={ossConfigObj}>
                            <div
                                ref={this.handleBindRoom}
                                className="whiteboard-box"/>
                        </OssDropUpload>
                    </div>
                );
            }
        }
    }
}

export default withTranslation()(WhiteboardPage);
