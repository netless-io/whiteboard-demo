import * as React from "react";
import {Input, Button, Tabs} from "antd";
import "./IndexPage.less";
import {Link} from "react-router";
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
                    <Link to="/">
                        {/*<img src={netless_black}/>*/}
                    </Link>
                    <div className="page-input-left-box">
                        <div className="page-input-left-mid-box">
                            <Tabs className="page-input-left-mid-box-tab" defaultActiveKey="1">
                                <TabPane tab="创建房间">
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
                                </TabPane>
                                <TabPane tab="加入房间" key="2">
                                    <div className="page-input-left-inner-box">
                                        <Input className="page-input"
                                               onChange={e => this.setState({url: e.target.value})}
                                               size={"large"} placeholder={"输入房间地址或者 UUID"}/>
                                        <Button
                                            size="large"
                                            type="primary"
                                            className="name-button">
                                            加入房间
                                        </Button>
                                    </div>
                                </TabPane>
                            </Tabs>
                        </div>
                    </div>
                    <div className="page-input-right-box"/>
                </div>
            );
    }
}

