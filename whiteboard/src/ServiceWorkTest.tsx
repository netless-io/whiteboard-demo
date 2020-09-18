import * as React from "react";
import "./ServiceWorkTest.less";
import * as zip from "./assets/image/zip.svg";
import {message} from "antd";

export default class ServiceWorkTest extends React.Component<{}, {}> {
    public constructor(props: {}) {
        super(props);
    }

    private handleMessage = (): void => {
        const messageChannel = new MessageChannel();
        if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage("netless", [messageChannel.port2]);
        }
    }
    public render(): React.ReactNode {
        return (
            <div className="service-box">
                <div onClick={this.handleMessage} className="service-box-zip">
                    <img src={zip} alt={"zip"}/>
                </div>
            </div>
        );
    }
}
