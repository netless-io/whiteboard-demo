import * as React from "react";
import {Input, Button, Tabs} from "antd";
import {Link} from "react-router-dom";
import "./IndexPage.less";
export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

const { TabPane } = Tabs;

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
                                <Input className="page-input" onChange={e => this.setState({name: e.target.value})}
                                       size={"large"} placeholder={"输入房间名称"}/>
                                <Button
                                    type="primary"
                                    size="large"
                                    className="name-button">
                                    创建白板房间
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="page-input-right-box"/>
                </div>
            );
    }
}

