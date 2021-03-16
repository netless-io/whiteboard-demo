import * as React from "react";
import {Button, Input, message, Popover} from "antd";
import "./InviteButton.less";
import copy from "copy-to-clipboard";
import inviteActive from "../assets/image/invite-active.svg";
import invite from "../assets/image/invite.svg";
import {CopyOutlined} from "@ant-design/icons/lib";
import { Identity } from "../IndexPage";
import { withTranslation, WithTranslation } from 'react-i18next';
import { Region } from "../region";

export type InviteButtonStates = {
    inviteDisable: boolean;
};

export type InviteButtonProps = {
    uuid: string;
    region: Region
};

class InviteButton extends React.Component<InviteButtonProps & WithTranslation, InviteButtonStates> {
    public constructor(props: InviteButtonProps & WithTranslation) {
        super(props);
        this.state = {
            inviteDisable: false,
        };
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

    private handleCopy = (): void => {
        const { t, uuid, region } = this.props;
        let url = `https://demo.netless.link/whiteboard/${Identity.joiner}/${uuid}/${region}`;
        const h5Url = this.getH5Url();
        if (h5Url) {
            url = url + `?h5Url=${h5Url}`;
        }
        this.handleInvite();
        copy(`${t('roomNumber')}：${uuid}\n${t('joinLink')}：${url}`);
        message.success(t('copyClipboard'));
    }

    private getH5Url = () => {
        const query = new URLSearchParams(window.location.search);
        return query.get("h5Url");
    }

    private renderInviteContent = (): React.ReactNode => {
        const { t, uuid, region } = this.props;
        const isLocal = location.hostname === "localhost";
        const protocol = isLocal ? "http" : "https";
        let shareLink = `${protocol}://${location.host}/whiteboard/${Identity.joiner}/${uuid}/${region}`
        const h5Url = this.getH5Url();
        if (h5Url) {
            shareLink = shareLink + `?h5Url=${encodeURIComponent(h5Url)}`;
        }
        return (
            <div className="invite-box">
                <div className="invite-box-title">
                    {t('inviteJoin')}
                </div>
                <div style={{width: 400, height: 0.5, backgroundColor: "#E7E7E7"}}/>
                <div className="invite-text-box">
                    <div className="invite-url-box" style={{marginBottom: 12}}>
                        <span style={{width: 96}}>{t('roomNumber')}：</span>
                        <Input
                            size={"middle"}
                            value={uuid}
                            addonAfter={
                                <CopyOutlined
                                    onClick={() => {
                                        copy(uuid);
                                        message.success(t('copyUuidMessage'));
                                    }}
                                />
                            }
                        />

                    </div>
                    <div className="invite-url-box">
                        <span style={{width: 96}}>{t('joinLink')}：</span>
                        <Input size={"middle"}
                               value={shareLink}
                               addonAfter={
                                   <CopyOutlined
                                       onClick={() => {
                                           copy(shareLink);
                                           message.success(t('copyClipboard'));
                                       }}
                                   />
                               }/>
                    </div>
                </div>
                <div className="invite-button-box">
                    <Button onClick={this.handleCopy} style={{width: 164, height: 40}} type={"primary"} size={"middle"}>
                        {t('copy')}
                    </Button>
                </div>
            </div>
        );
    }

    public render(): React.ReactNode {
        return (
            <Popover visible={this.state.inviteDisable}
                     trigger="click"
                     onVisibleChange={this.onVisibleChange}
                     content={() => this.renderInviteContent()}
                     placement={"bottomRight"}>
                <div className="page-preview-cell" onClick={this.handleInvite}>
                    <img
                        style={{width: "28px"}}
                        src={this.state.inviteDisable ? inviteActive : invite}
                        alt={"invite"}/>
                </div>
            </Popover>
        );
    }
}

export default withTranslation()(InviteButton)
