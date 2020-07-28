import * as React from "react";
import {RouteComponentProps} from "react-router";
import "./WhiteboardPage.less";
import {IdentityType} from "./IndexPage";
import {netlessWhiteboardApi} from "./apiMiddleware";
export type WhiteboardPageProps = RouteComponentProps<{
    uuid: string;
    userId: string;
    identityType: IdentityType;
}>;


export type WhiteboardPageState = {
    recordData: RecordDataType | null;
    room: any;
    mediaSource?: string;
};
export type RecordDataType = {startTime?: number, endTime?: number, mediaUrl?: string};
export default class WhiteboardPage extends React.Component<WhiteboardPageProps, WhiteboardPageState> {
    public constructor(props: WhiteboardPageProps) {
        super(props);
        this.state = {
            recordData: null,
            room: null,
        };
    }

    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const res = await netlessWhiteboardApi.room.joinRoomApi(uuid);
        if (res.code === 200) {
            return res.msg.roomToken;
        } else {
            return null;
        }
    }


    private handleReplayUrl = (): void => {
        const {userId, uuid} = this.props.match.params;
        const {recordData} = this.state;
        if (recordData) {
            if (recordData.startTime) {
                if (recordData.endTime) {
                    if (recordData.mediaUrl) {
                        this.props.history.push(`/replay/${uuid}/${userId}/${recordData.startTime}/${recordData.endTime}/${recordData.mediaUrl}/`);
                    } else {
                        this.props.history.push(`/replay/${uuid}/${userId}/${recordData.startTime}/${recordData.endTime}/`);
                    }
                } else {
                    this.props.history.push(`/replay/${uuid}/${userId}/${recordData.startTime}/`);
                }
            } else {
                this.props.history.push(`/replay/${uuid}/${userId}/`);
            }
        } else {
            this.props.history.push(`/replay/${uuid}/${userId}/`);
        }
    }

    public render(): React.ReactNode {
        return (
            <div id="whiteboard" className="whiteboard-box">
                123
            </div>
        );
    }
}
