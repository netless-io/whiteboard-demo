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
import {message, Popover} from "antd";
import {netlessWhiteboardApi} from "./apiMiddleware";
import PreviewController from "@netless/preview-controller";
import DocsCenter from "@netless/docs-center";
import PageError from "./PageError";
import LoadingPage from "./LoadingPage";
import pages from "./assets/image/pages.svg";
import folder from "./assets/image/folder.svg";
import invite from "./assets/image/invite.svg";
import inviteActive from "./assets/image/invite-active.svg";
import logo from "./assets/image/logo.svg";
import exit from "./assets/image/exit.svg";
import PluginCenter from "@netless/plugin-center";


export type WhiteboardPageStates = {
    phase: RoomPhase;
    room?: Room;
    isMenuVisible: boolean;
    isFileOpen: boolean;
    whiteboardLayerDownRef?: HTMLDivElement;
    inviteDisable: boolean;
};
export type WhiteboardPageProps = RouteComponentProps<{
    uuid: string;
    userId: string;
}>;
export default class WhiteboardPage extends React.Component<WhiteboardPageProps, WhiteboardPageStates> {
    public constructor(props: WhiteboardPageProps) {
        super(props);
        this.state = {
            phase: RoomPhase.Connecting,
            isMenuVisible: false,
            isFileOpen: false,
            inviteDisable: false,
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

    private onVisibleChange = (event: boolean): void => {
        if (event) {
            this.setState({inviteDisable: true});
        } else {
            this.setState({inviteDisable: false});
        }
    }

    private handleInvite = (): void => {
        this.setState({inviteDisable: !this.state.inviteDisable})
    }

    private renderInvite = (): React.ReactNode => {
        return (
            <Popover visible={this.state.inviteDisable}
                     trigger="click"
                     onVisibleChange={this.onVisibleChange}
                     content={
                         <div className="invite-box">
                             <div className="invite-text-box">
                                 <div style={{marginBottom: 12}}>房间号：<span
                                     className="invite-room-box">a0e4f100db7011eab93ae1da9406727f</span></div>
                                 <div>加入链接：<span
                                     className="invite-url-box">https://demo.herewhite.com/whiteboard/host/a0e4f100db7011eab93ae1da9406727f</span>
                                 </div>
                             </div>
                             <div className="invite-button-box">
                                 <div onClick={this.handleInvite} className="invite-button-left">
                                     关闭
                                 </div>
                                 <div className="invite-button-right">
                                     复制
                                 </div>
                             </div>
                         </div>
                     }
                     placement={"bottomRight"}>
                <div className="page-controller-cell" onClick={this.handleInvite}>
                    <img src={this.state.inviteDisable ? inviteActive : invite}/>
                </div>
            </Popover>
        );
    }

    private

    private startJoinRoom = async (): Promise<void> => {
        const {uuid, userId} = this.props.match.params;
        try {
            const roomToken = await this.getRoomToken(uuid);
            if (uuid && roomToken) {
                const whiteWebSdk = new WhiteWebSdk({
                    appIdentifier: "283/VGiScM9Wiw2HJg",
                });
                const room = await whiteWebSdk.joinRoom({
                        uuid: uuid,
                        roomToken: roomToken,
                        userPayload: {
                            userId: userId,
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
            }
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
            return <LoadingPage
                phase={phase}/>;
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
                        <div className="logo-box">
                            <img src={logo}/>
                        </div>
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
                        <div className="room-controller-box">
                            <div className="page-controller-mid-box">
                                <div className="page-controller-cell"
                                     onClick={() => this.setState({isFileOpen: !this.state.isFileOpen})}>
                                    <img src={folder}/>
                                </div>
                                {this.renderInvite()}
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
                        <PreviewController handlePreviewState={this.handlePreviewState} isVisible={isMenuVisible}
                                           room={room}/>
                        <DocsCenter handleDocCenterState={this.handleDocCenterState} isFileOpen={isFileOpen}
                                    room={room}/>
                        <div ref={this.handleBindRoom}
                             style={{width: "100%", height: "100vh", backgroundColor: "#F4F4F4"}}/>
                    </div>
                );
            }
        }
    }
}
