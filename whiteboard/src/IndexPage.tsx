import * as React from "react";
import {Button} from "antd";
import {Link} from "react-router-dom";
import "./IndexPage.less";
export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export type IndexPageStates = {
    name: string;
    url: string;
};

export default class IndexPage extends React.Component<{}, IndexPageStates> {
    public constructor(props: {}) {
        super(props);
        this.state = {
            name: "",
            url: "",
        };
    }

    public render(): React.ReactNode {
            return (
                <div className="page-input-box">
                    <div className="page-input-left-box">
                        <div className="page-input-left-mid-box">
                            <div className="page-input-left-inner-box">
                                <Link to={"/test/"}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        className="name-button">
                                        creatRoom
                                    </Button>
                                </Link>
                            </div>
                            <div className="page-input-left-inner-box">
                                <Link to={"/test2/"}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        className="name-button">
                                        creatReplay
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="page-input-right-box"/>
                </div>
            );
    }
}

