import * as React from "react";
import {RouteComponentProps} from "react-router";
import {Link} from "react-router-dom";
import "./AddNamePage.less";
import logo from "./assets/image/logo.png";
import {Button, Input} from "antd";
import { Identity } from "./IndexPage";
import { withTranslation, WithTranslation } from 'react-i18next';

export type JoinPageStates = {
    name: string;
    uuid: string;
};

export type AddNamePageProps = RouteComponentProps<{uuid?: string}>;

class AddNamePage extends React.Component<AddNamePageProps & WithTranslation, JoinPageStates> {
    public constructor(props: AddNamePageProps & WithTranslation) {
        super(props);
        const {uuid} = this.props.match.params;
        this.state = {
            name: "",
            uuid: uuid ? uuid : "",
        };
    }

    private handleJoin = (): void => {
        const {name} = this.state;
        const {uuid} = this.props.match.params;
        localStorage.setItem("userName", name);
        if (uuid) {
            this.props.history.push(`/whiteboard/${Identity.creator}/${uuid}/`);

        } else {
            this.props.history.push(`/whiteboard/${Identity.creator}/`);
        }
    }

    public render(): React.ReactNode {
        const { t } = this.props
        const {name, uuid} = this.state;
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
                               maxLength={8}
                               value={name}
                               onChange={evt => this.setState({name: evt.target.value})}
                               className="page-index-input-box"
                               size={"large"}/>
                        {uuid && <Input
                            value={uuid}
                            disabled={true}
                            className="page-index-input-box"
                            size={"large"}/>}
                        <div className="page-index-btn-box">
                            <Link to={"/"}>
                                <Button className="page-index-btn"
                                        size={"large"}>
                                    {t('backHomePage')}
                                </Button>
                            </Link>
                            <Button className="page-index-btn"
                                    disabled={name === ""}
                                    size={"large"}
                                    onClick={this.handleJoin}
                                    type={"primary"}>
                                {uuid ? t('joinRoom') : t('createRoom')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation()(AddNamePage)
