import * as React from "react";
import {Link} from "react-router-dom"
import logo from "./assets/image/logo.svg";
import join from "./assets/image/join.svg";
import create from "./assets/image/create.svg";
import "./IndexPage.less";
export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export type IndexPageStates = {
};

export default class IndexPage extends React.Component<{}, IndexPageStates> {
    public constructor(props: {}) {
        super(props);
    }
    public render(): React.ReactNode {
            return (
                <div className="page-index-box">
                    <div className="page-index-mid-box">
                        <div className="page-index-logo-box">
                            <img src={logo}/>
                            <span>
                                0.0.1
                            </span>
                        </div>
                        <div className="page-index-start-box">
                            <div className="page-index-start-cell">
                                <img src={join}/>
                                <span>加入房间</span>
                            </div>
                            <div className="page-index-cutline-box"/>
                            <div className="page-index-start-cell">
                                <Link to={"/whiteboard"}>
                                    <img src={create}/>
                                </Link>
                                <span>创建房间</span>
                            </div>
                        </div>
                        <div className="page-index-start-term">
                            使用产品即代表同意<span>《软件许可以及服务协议》</span>和<span>《隐私协议》</span>
                        </div>
                    </div>
                </div>
            );
    }
}

