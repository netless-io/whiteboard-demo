import "./AppsButton.less";
import React, { ReactElement } from "react";
import {Button, Popover} from "antd";
import { WindowManager } from "@netless/window-manager";
import {AppstoreOutlined} from "@ant-design/icons";
import vscode from "./assets/image/vscode.svg";
import appstore from "./assets/image/appstore.svg";
import dice from "./assets/image/dice.svg";
import clock from "./assets/image/clock.svg";
import vote from "./assets/image/vote.svg";

export type AppIcon = {
    id: string,
    sourceCode: string,
    name: string,
    iconUrl: string,
};
const apps: AppIcon[] = [
    // {
    //     id: "AppStore",
    //     sourceCode: "https://cdn.jsdelivr.net/npm/@l1shen/vscode@0.0.36/dist/index.js",
    //     name: "appstore",
    //     iconUrl: appstore,
    // },
    {
        id: "MonacoPlugin",
        sourceCode: "https://cdn.jsdelivr.net/npm/@l1shen/vscode@0.0.36/dist/index.js",
        name: "vscode",
        iconUrl: vscode,
    },
    // {
    //     id: "Dice",
    //     sourceCode: "https://cdn.jsdelivr.net/npm/@l1shen/vscode@0.0.36/dist/index.js",
    //     name: "骰子",
    //     iconUrl: dice,
    // },
    // {
    //     id: "clock",
    //     sourceCode: "https://cdn.jsdelivr.net/npm/@l1shen/vscode@0.0.36/dist/index.js",
    //     name: "时钟",
    //     iconUrl: clock,
    // },
    // {
    //     id: "vote",
    //     sourceCode: "https://cdn.jsdelivr.net/npm/@l1shen/vscode@0.0.36/dist/index.js",
    //     name: "投票",
    //     iconUrl: vote,
    // },
];

interface Props {
    manager?: WindowManager;
}

interface State {
    appStoreIsVisible: boolean;
    loading: boolean;
}

export class AppsButton extends React.Component<Props, State> {
    public constructor(props: Props) {
        super(props);
        this.state = {
            appStoreIsVisible: false,
            loading: false,
        };
    }

    public renderAppStore = (): React.ReactNode => {
        return (
            <div className="app-box">
                {apps.map((e) => (
                    <div className="app-box-inner"
                        key={e.id}
                        // loading={this.state.loading}
                        // disabled={(this.props.manager as any)?.instancePlugins.has(e.id)}
                        onClick={() => this.loadApp(e.id)}
                    >
                        <div className="app-box-icon">
                            <img src={e.iconUrl} alt={"img"}/>
                        </div>
                        <div className="app-box-text">
                            {e.name}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    public render(): ReactElement {
        return (
            <>

                <Popover trigger="hover"
                         key={"oss-upload-popper"}
                         placement={"leftBottom"}
                         content={this.renderAppStore()}>
                    <div className="apps-button" onClick={this.showAppStore}>
                        <AppstoreOutlined />
                    </div>
                </Popover>
                {/*<Modal*/}
                {/*    visible={this.state.appStoreIsVisible}*/}
                {/*    footer={null}*/}
                {/*    onCancel={this.hideAppStore}*/}
                {/*    title="App Store"*/}
                {/*    destroyOnClose*/}
                {/*>*/}
                {/*    */}
                {/*</Modal>*/}
            </>
        );
    }

    private showAppStore = (): void => {
        this.setState({ appStoreIsVisible: true });
    };

    private hideAppStore = (): void => {
        this.setState({ appStoreIsVisible: false });
    };

    private async loadApp(id: string): Promise<void> {
        const app = apps.find((e) => e.id === id)!;
        this.setState({ loading: true });
        await this.props.manager?.addPlugin(app.id, app.sourceCode);
        this.setState({ loading: false, appStoreIsVisible: false });
    }
}
