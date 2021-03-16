import * as React from "react";
import {RouteComponentProps} from "react-router";
import "./JoinPage.less";
import logo from "./assets/image/logo.png";
import {Button, Input} from "antd";
import {Link} from "react-router-dom";
import { Identity } from "./IndexPage";
import {LocalStorageRoomDataType} from "./HistoryPage";
import moment from "moment";
import { withTranslation, WithTranslation } from 'react-i18next';
import { region } from "./region";

export type JoinPageStates = {
    roomId: string;
    name: string;
};
class JoinPage extends React.Component<RouteComponentProps & WithTranslation, JoinPageStates> {
    public constructor(props: RouteComponentProps & WithTranslation) {
        super(props);
        const name = localStorage.getItem("userName");
        this.state = {
            roomId: "",
            name: name ? name : "",
        };
    }

    private handleJoin = (): void => {
        const userId = `${Math.floor(Math.random() * 100000)}`;
        if (this.state.name !== localStorage.getItem("userName")) {
            localStorage.setItem("userName", this.state.name);
        }
        this.setRoomList(this.state.roomId, userId);
        this.props.history.push(`/whiteboard/${Identity.joiner}/${this.state.roomId}/${userId}/${region}`);
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
    };
    public render(): React.ReactNode {
        const { t } = this.props
        const {roomId, name} = this.state;
        return (
            <div className="page-index-box">
                <div className="page-index-mid-box">
                    <div className="page-index-logo-box">
                        <img src={logo} alt={"logo"}/>
                        <span>
                                0.0.1
                        </span>
                    </div>
                    <div className="page-index-form-box">
                        <Input placeholder={t('setNickname')}
                               value={name}
                               onChange={evt => this.setState({name: evt.target.value})}
                               className="page-index-input-box"
                               size={"large"}/>
                        <Input placeholder={t('roomName')}
                               value={roomId}
                               onChange={evt => this.setState({roomId: evt.target.value})}
                               className="page-index-input-box"
                               size={"large"}/>
                        <div className="page-index-btn-box">
                            <Link to={"/"}>
                                <Button className="page-index-btn"
                                        size={"large"}>
                                    {t('backHomePage')}
                                </Button>
                            </Link>
                            <Button className="page-index-btn"
                                    disabled={roomId === "" || name === ""}
                                    size={"large"}
                                    onClick={this.handleJoin}
                                    type={"primary"}>
                                {t('joinRoom')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation()(JoinPage)
