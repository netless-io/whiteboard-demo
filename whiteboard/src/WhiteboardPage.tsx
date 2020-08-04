import * as React from "react";
import {RouteComponentProps} from "react-router";
import {
    Room,
    RoomPhase,
    WhiteWebSdk,
} from "white-web-sdk";
import ToolBox from "@netless/tool-box";
import RedoUndo from "@netless/redo-undo";
import "./WhiteboardPage.less";
import {message} from "antd";
import {netlessWhiteboardApi} from "./apiMiddleware";


export type WhiteboardPageStates = {
    phase: RoomPhase;
    room?: Room;
};
export type WhiteboardPageProps = RouteComponentProps<{
    uuid: string;
}>;
export default class WhiteboardPage extends React.Component<WhiteboardPageProps, WhiteboardPageStates> {
    public constructor(props: WhiteboardPageProps) {
        super(props);
        this.state = {
            phase: RoomPhase.Connecting,
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

    public render(): React.ReactNode {
        const {room} = this.state;
        if (room) {
            return (
                <div>
                    <ToolBox room={room}/>
                    <RedoUndo room={room}/>
                    <div ref={this.handleBindRoom} style={{width: "100%", height: "100vh"}}/>
                </div>
            );
        } else {
            return null;
        }
    }
}
