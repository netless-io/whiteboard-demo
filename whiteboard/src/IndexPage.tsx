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
                                <Link to={"/join/"}>
                                    <img src={join}/>
                                </Link>
                                <span>加入房间</span>
                            </div>
                            <div className="page-cutline-box"/>
                            <div className="page-index-start-cell">
                                <Link to={"/whiteboard/"}>
                                    <img src={create}/>
                                </Link>
                                <span>创建房间</span>
                            </div>
                        </div>
                        <div className="page-index-link-box">
                            <div className="page-index-cell-left">
                                <a href={"https://netless.link/"} target={"_blank"}>官网</a>
                            </div>
                            <div className="page-cutline-link-box"/>
                            <div className="page-index-cell-right">
                                <a href={"https://github.com/netless-io/react-whiteboard"} target={"_blank"}>Github</a>
                            </div>
                        </div>
                        <div className="page-index-start-term">
                            本开源项目遵循<a href={"https://opensource.org/licenses/MIT"} target={"_blank"}>《 MIT 开源协议》</a>
                        </div>
                    </div>
                </div>
            );
    }
}

