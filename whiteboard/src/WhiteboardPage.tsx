import * as React from "react";
import {RouteComponentProps} from "react-router";
import {Link} from "react-router-dom";
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
import {Button, Input, message, Modal, Popover} from "antd";
import {netlessWhiteboardApi} from "./apiMiddleware";
import PreviewController from "@netless/preview-controller";
import DocsCenter from "@netless/docs-center";
import PageError from "./PageError";
import LoadingPage from "./LoadingPage";
import pages from "./assets/image/pages.svg";
import folder from "./assets/image/folder.svg";
import invite from "./assets/image/invite.svg";
import replayScreen from "./assets/image/replay-screen.png";
import inviteActive from "./assets/image/invite-active.svg";
import logo from "./assets/image/logo.svg";
import exit from "./assets/image/exit.svg";
import PluginCenter from "@netless/plugin-center";
import Clipboard from "react-clipboard.js";


export type WhiteboardPageStates = {
    phase: RoomPhase;
    room?: Room;
    isMenuVisible: boolean;
    isFileOpen: boolean;
    whiteboardLayerDownRef?: HTMLDivElement;
    inviteDisable: boolean;
    exitViewDisable: boolean;
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
            exitViewDisable: false,
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
        const {uuid} = this.props.match.params;
        return (
            <Popover visible={this.state.inviteDisable}
                     trigger="click"
                     onVisibleChange={this.onVisibleChange}
                     content={
                         <div className="invite-box">
                             <div className="invite-box-title">
                                 邀请加入
                             </div>
                             <div style={{width: 400, height: 0.5, backgroundColor: "#E7E7E7"}}/>
                             <div className="invite-text-box">
                                 <div style={{marginBottom: 12}}>
                                     <span style={{width: 96}}>房间号：</span><span
                                     className="invite-room-box">{uuid}</span></div>
                                 <div className="invite-url-box">
                                     <span style={{width: 96}}>加入链接：</span><Input size={"middle"} value={`${location.host}/whiteboard/${uuid}/`}/>
                                 </div>
                             </div>
                             <div className="invite-button-box">
                                 <Clipboard
                                     data-clipboard-text={`房间号：${uuid}\n加入链接：${location.host}/whiteboard/${uuid}/`}
                                     component="div"
                                     onSuccess={() => {
                                         this.handleInvite();
                                         message.success("已经将链接复制到剪贴板");
                                     }}
                                 >
                                     <Button style={{width: 164, height: 40}} type={"primary"} size={"middle"}>
                                         复制
                                     </Button>
                                 </Clipboard>
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

    private renderExitView = (): React.ReactNode => {
        const {uuid, userId} = this.props.match.params;
        const {room} = this.state;
        return (
            <div>
                <div className="page-controller-cell" onClick={() => this.setState({exitViewDisable: true})}>
                    <img src={exit}/>
                </div>
                <Modal
                    visible={this.state.exitViewDisable}
                    footer={null}
                    title={"退出教室"}
                    onCancel={() => this.setState({exitViewDisable: false})}
                >
                    <div className="modal-box">
                        <div onClick={async () => {
                            if (room) {
                                await room.disconnect();
                                this.props.history.push(`/replay/${uuid}/${userId}/`);
                            }
                        }}>
                            <img className="modal-box-img" src={replayScreen}/>
                        </div>
                        <div className="modal-box-name">观看回放</div>
                        <Button
                            onClick={async () => {
                                if (room) {
                                    await room.disconnect();
                                    this.props.history.push("/");
                                }
                            }}
                            style={{width: 176}}
                            size="large">
                            确认退出
                        </Button>
                    </div>
                </Modal>
            </div>
        )
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
                                {this.renderExitView()}
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
