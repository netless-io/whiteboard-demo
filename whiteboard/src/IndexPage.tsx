import * as React from "react";
import {Link, withRouter} from "react-router-dom"
import {RouteComponentProps} from "react-router";
import logo from "./assets/image/logo.png";
import join from "./assets/image/join.svg";
import create from "./assets/image/create.svg";
import "./IndexPage.less";
import {Button, Input, Popover} from "antd";
import { withTranslation, WithTranslation } from 'react-i18next';
import { SwitchLanguage } from './SwitchLanguage';
import SwitchRegion from "./components/SwitchRegion";
import FloatLink from "./FloatLink";

export type IndexPageStates = {
    name: string;
    visible: boolean;
};
export enum Identity {
    creator = "creator",
    joiner = "joiner",
}
class IndexPage extends React.Component<RouteComponentProps & WithTranslation, IndexPageStates> {
    public constructor(props: RouteComponentProps & WithTranslation) {
        super(props);
        const name = localStorage.getItem("userName");
        this.state = {
            name: name ? name : "",
            visible: false,
        }
    }

    private handleCreate = (): void => {
        if (this.state.name) {
            this.props.history.push(`/create/`);
        } else {
            this.props.history.push("/name/");
        }
    }

    public componentDidMount() {
        this.register();
    }

    private updateName = (isEmpty?: boolean): void => {
        if (isEmpty) {
            localStorage.removeItem("userName");
            this.setState({ visible: false, name: ""});
        } else {
            localStorage.setItem("userName", this.state.name);
            this.setState({ visible: false });
        }
    };

    private register(): void {
        if (navigator.serviceWorker && navigator.serviceWorker.register) {
            navigator.serviceWorker.register('./worker.js').then(function(registration) {
              console.log("registration finish")
            }).catch(function(error) {
              console.log('An error happened during installing the service worker:');
              console.log(error.message);
            });
        }

    }

    public render(): React.ReactNode {
        const { t, i18n } = this.props
            return (
                <div className="page-index-box">
                    {/* <FloatLink /> */}
                    <SwitchRegion />
                    <div className="page-index-mid-box">
                        <div className="page-index-logo-box">
                            <img src={logo} alt={"logo"} />
                            {localStorage.getItem("rooms") && (
                                <Link to={"/history"}>
                                    <div className="page-index-history">{t('historyRecord')}</div>
                                </Link>
                            )}
                            <Link to={"/storage/"}>
                                <div className="page-index-storage">{t('preload')}</div>
                            </Link>
                            <SwitchLanguage />
                            <Popover visible={this.state.visible} placement={"bottom"} trigger="click" content={
                                <div className="page-index-name-box" >
                                    <Input maxLength={8}
                                           onChange={e => this.setState({name: e.target.value})}
                                           value={this.state.name} style={{width: 120}} size={"small"}/>
                                    <Button
                                        onClick={() => this.updateName()}
                                        style={{width: 120, marginTop: 12}}
                                        type={"primary"}
                                        size={"small"}>
                                        {t('update')}
                                    </Button>
                                    <Button
                                        onClick={() => this.updateName(true)}
                                        style={{ width: 120, marginTop: 12 }}
                                        size={"small"}
                                    >
                                        {t('clear')}
                                    </Button>

                                </div>
                            } title={t('editName')}>
                                <span style={{ paddingTop: 8 }} onClick={() => this.setState({visible: true})}>
                                    <span style={{color: "#3381FF"}}>{this.state.name}</span>&nbsp;
                                    <span>{t('welcome')} 👋 </span>
                                </span>
                            </Popover>
                        </div>
                        <div className="page-index-start-box">
                            <div className="page-index-start-cell">
                                <Link to={"/join/"}>
                                    <img src={join} alt={"join"}/>
                                </Link>
                                <span>{t('joinRoom')}</span>
                            </div>
                            <div className="page-cutline-box"/>
                            <div className="page-index-start-cell">
                                <div onClick={this.handleCreate}>
                                    <img src={create} alt={"create"}/>
                                </div>
                                <span>{t('createRoom')}</span>
                            </div>
                        </div>
                        <div className="page-index-link-box">
                            <div className="page-index-cell-left">
                                <a href={i18n.language === 'zh-CN' ? "https://www.agora.io/cn/interactive-whiteboard" : "https://www.agora.io/en"} target={"_blank"}>{t('officialWebsite')}</a>
                            </div>
                            <div className="page-cutline-link-box"/>
                            <div className="page-index-cell-right">
                                <a href={"https://github.com/netless-io/whiteboard-demo"} target={"_blank"}>GitHub</a>
                            </div>
                        </div>
                        <div className="page-index-start-term">
                            {t('license')}
                            <a href={"https://github.com/netless-io/whiteboard-demo/blob/master/LICENSE.txt"} target={"_blank"}>{t('MITLicense')}</a>
                        </div>
                    </div>
                </div>
            );
    }
}

export default withRouter(withTranslation()(IndexPage));
