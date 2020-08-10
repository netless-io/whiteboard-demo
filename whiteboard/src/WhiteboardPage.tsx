import * as React from "react";
import {RouteComponentProps} from "react-router";
import {
    Room,
    RoomPhase,
    WhiteWebSdk,
} from "white-web-sdk";
import ToolBox from "@netless/tool-box";
import RedoUndo from "@netless/redo-undo";
import PageController from "@netless/page-controller";
import ZoomController from "@netless/zoom-controller";
import OssUploadButton from "@netless/oss-upload-button";
import "./WhiteboardPage.less";
import {message} from "antd";
import {netlessWhiteboardApi} from "./apiMiddleware";
import PreviewController from "@netless/preview-controller";
import DocsCenter from "@netless/docs-center";
import PageError from "./PageError";
import LoadingPage from "./LoadingPage";
import pages from "./assets/image/pages.svg";
import folder from "./assets/image/folder.svg";
import invite from "./assets/image/invite.svg";
import exit from "./assets/image/exit.svg";
import PluginCenter from "@netless/plugin-center";


export type WhiteboardPageStates = {
    phase: RoomPhase;
    room?: Room;
    isMenuVisible: boolean;
    isFileOpen: boolean;
    whiteboardLayerDownRef?: HTMLDivElement;
};
export type WhiteboardPageProps = RouteComponentProps<{
    uuid: string;
}>;
export default class WhiteboardPage extends React.Component<WhiteboardPageProps, WhiteboardPageStates> {
    public constructor(props: WhiteboardPageProps) {
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
        const res = await netlessWhiteboardApi.room.joinRoomApi(uuid);
        if (res.code === 200) {
            return res.msg.roomToken;
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
    private startJoinRoom = async (): Promise<void> => {
        // const {uuid} = this.props.match.params;
        try {
            // const roomToken = await this.getRoomToken(uuid);
            // if (uuid && roomToken) {
            const whiteWebSdk = new WhiteWebSdk({
                appIdentifier: "283/VGiScM9Wiw2HJg",
            });
            const room = await whiteWebSdk.joinRoom({
                    uuid: "250024f0d2ed11ea9322f7b90d6b361a",
                    roomToken: "WHITEcGFydG5lcl9pZD14NGFfY1JDV09hbzItNEYtJnNpZz1kMGNiMTk5ZGRkYTMzN2I1MDRkNWUxMmNiM2U2MjZmODlhZjNjNTM3OmFrPXg0YV9jUkNXT2FvMi00Ri0mY3JlYXRlX3RpbWU9MTU5NjE3MjcxNzE3MyZleHBpcmVfdGltZT0xNjI3NzA4NzE3MTczJm5vbmNlPTE1OTYxNzI3MTcxNzMwMCZyb2xlPXJvb20mcm9vbUlkPTI1MDAyNGYwZDJlZDExZWE5MzIyZjdiOTBkNmIzNjFhJnRlYW1JZD0yODM",
                    userPayload: {
                        userId: 1024,
                    },
                    floatBar: true,
                },
                {
                    onPhaseChanged: phase => {
                        this.setState({phase: phase});
                        console.log(`room ${"uuid"} changed: ${phase}`);
                    },
                    onDisconnectWithError: error => {
                        console.error(error);
                    },
                    onKickedWithReason: reason => {
                        console.error("kicked with reason: " + reason);
                    },
                });
            room.setMemberState({
                pencilOptions: {
                    disableBezier: false,
                    sparseHump: 1.0,
                    sparseWidth: 1.0,
                    enableDrawPoint: false
                }
            });
            this.setState({room: room});
            // }
        } catch (error) {
            message.error(error);
            console.log(error);
        }
    }

    private handlePreviewState = (state: boolean): void => {
        this.setState({isMenuVisible: state});
    }

    private handleDocCenterState = (state: boolean): void => {
        this.setState({isFileOpen: state});
    }

    public render(): React.ReactNode {
        const {room, isMenuVisible, isFileOpen, phase, whiteboardLayerDownRef} = this.state;
        if (room === undefined) {
            return null;
        }
        switch (phase) {
            case RoomPhase.Disconnected: {
                return <PageError/>;
            }
            case RoomPhase.Connecting: {
                return <LoadingPage
                    phase={phase}/>;
            }
            case RoomPhase.Disconnecting: {
                return <LoadingPage
                    phase={phase}/>;
            }
            case RoomPhase.Reconnecting: {
                return <LoadingPage
                    phase={phase}/>;
            }
            default: {
                return (
                    <div className="realtime-box">
                        <div className="tool-box-out">
                            <ToolBox room={room} customerComponent={
                                [
                                    <OssUploadButton room={room} whiteboardRef={whiteboardLayerDownRef}/>,
                                    <PluginCenter room={room}/>
                                    ]
                            }/>
                        </div>
                        <div className="redo-undo-box">
                            <RedoUndo room={room}/>
                        </div>
                        <div className="zoom-controller-box">
                            <ZoomController room={room}/>
                        </div>
                        <div className="title-controller-box">
                            <div className="title-controller-mid-box">
                                <div className="title-text">伍双创建会议</div>
                                <div className="title-cut-line"/>
                                <div className="title-time">8月8日 21:23</div>
                            </div>
                        </div>
                        <div className="room-controller-box">
                            <div className="page-controller-mid-box">
                                <div className="page-controller-cell" onClick={() => this.setState({isFileOpen: !this.state.isFileOpen})}>
                                    <img src={folder}/>
                                </div>
                                <div className="page-controller-cell" onClick={() => this.handlePreviewState(true)}>
                                    <img src={invite}/>
                                </div>
                                <div className="page-controller-cell" onClick={() => this.handlePreviewState(true)}>
                                    <img src={exit}/>
                                </div>
                            </div>
                        </div>
                        <div className="page-controller-box">
                            <div className="page-controller-mid-box">
                                <div className="page-controller-cell" onClick={() => this.handlePreviewState(true)}>
                                    <img src={pages}/>
                                </div>
                                <PageController room={room}/>
                            </div>
                        </div>
                        <PreviewController handlePreviewState={this.handlePreviewState} isVisible={isMenuVisible} room={room}/>
                        <DocsCenter handleDocCenterState={this.handleDocCenterState} isFileOpen={isFileOpen} room={room}/>
                        <div ref={this.handleBindRoom}
                             style={{width: "100%", height: "100vh", backgroundColor: "#F4F4F4"}}/>
                    </div>
                );
            }
        }
    }
}
