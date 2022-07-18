import * as React from "react";
import {Button, Modal, Tooltip} from "antd";
import {RouteComponentProps} from "react-router";
import {withRouter} from "react-router-dom";
import {Player} from "white-web-sdk";
import "./ExitButton.less";
import exit from "../assets/image/exit.svg";
import replayScreen from "../assets/image/replay-screen.png";
import { Identity } from "../IndexPage";
import { withTranslation, WithTranslation } from 'react-i18next';
import { Region } from "../region";

export type ExitButtonPlayerStates = {
    exitViewDisable: boolean;
};

export type ExitButtonPlayerProps = {
    player: Player;
    identity: Identity;
    uuid: string;
    userId: string;
    region: Region;
} & RouteComponentProps;

class ExitButtonPlayer extends React.Component<ExitButtonPlayerProps & WithTranslation, ExitButtonPlayerStates> {
    public constructor(props: ExitButtonPlayerProps & WithTranslation) {
        super(props);
        this.state = {
            exitViewDisable: false,
        };
    }

    private handleReplay = async (): Promise<void> => {
        const { identity, uuid, userId, region} = this.props;
        this.props.history.push(`/whiteboard/${identity}/${uuid}/${userId}/${region}`);
    }

    private handleGoBack = async (): Promise<void> => {
        this.props.history.push("/");
    }

    public render(): React.ReactNode {
        const { t } = this.props
        return (
            <div>
                <Tooltip placement="bottom" title={"Exit"}>
                    <div className="page-controller-cell" onClick={() => this.setState({exitViewDisable: true})}>
                        <img src={exit} alt={"exit"}/>
                    </div>
                </Tooltip>
                <Modal
                    visible={this.state.exitViewDisable}
                    footer={null}
                    title={t('quiteReplay')}
                    onCancel={() => this.setState({exitViewDisable: false})}
                >
                    <div className="modal-box">
                        <div onClick={this.handleReplay}>
                            <img className="modal-box-img" src={replayScreen} alt={"replayScreen"}/>
                        </div>
                        <div className="modal-box-name">{t('backWhiteboard')}</div>
                        <Button
                            onClick={this.handleGoBack}
                            style={{width: 176}}
                            size="large">
                            {t('confirmExit')}
                        </Button>
                    </div>
                </Modal>
            </div>
        );
    }
}

export default withRouter(withTranslation()(ExitButtonPlayer))

