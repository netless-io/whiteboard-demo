import * as React from "react";
import "./Storage.less";
import * as zip_icon from "./assets/image/zip.svg";
import "@netless/zip";
import {netlessCaches} from "./NetlessCaches";
import {pptDatas} from "./pptDatas";
import {WhiteScene} from "white-web-sdk";
import {Button, Tag} from "antd";
import StorageCell from "./StorageCell";
import {Link} from "react-router-dom";
import {LeftOutlined} from "@ant-design/icons";
import empty_box from "./assets/image/empty-box.svg";

export type ServiceWorkTestStates = {
    space: number;
    progress: number;
    availableSpace: number;
    pptDatas: string[];
};

export default class Storage extends React.Component<{}, ServiceWorkTestStates> {

    public constructor(props: {}) {
        super(props);
        this.state = {
            space: 0,
            availableSpace: 0,
            progress: 0,
            pptDatas: pptDatas,
        }
    }

    public async componentDidMount(): Promise<void> {
        await this.refreshSpaceData();
    }

    private refreshSpaceData = async (): Promise<void> => {
        const space = await netlessCaches.calculateCache();
        const availableSpace = await netlessCaches.availableSpace();
        this.setState({space: Math.round(space), availableSpace: Math.round(availableSpace)});
    }

    private renderZipCells = (): React.ReactNode => {
        const {pptDatas, space} = this.state;
        return pptDatas.map((pptData: string, index: number) => {
            const scenes: WhiteScene[] = JSON.parse(pptData);
            let icon = zip_icon;
            if (scenes[0] && scenes[0].ppt) {
                if (scenes[0].ppt.previewURL) {
                    icon = scenes[0].ppt.previewURL;
                }
                const regex = /dynamicConvert\/([^\/]+)/gm;
                const inner = scenes[0].ppt.src.match(regex);
                if (inner) {
                    const taskUuid = inner[0].replace("dynamicConvert/", "");
                    return (
                        <div key={`zip-${index}`}>
                            <StorageCell
                                space={space}
                                icon={icon}
                                taskUuid={taskUuid}
                                refreshSpaceData={this.refreshSpaceData}/>
                        </div>
                    )
                }
            }

            return null;
        });
    }

    private clearSpace = async (): Promise<void> => {
        await netlessCaches.deleteCache();
        await this.refreshSpaceData();
    }

    public render(): React.ReactNode {
            return (
                <div className="page-index-box">
                    <div className="page-index-mid-box">
                        <div className="page-history-head">
                            <div className="page-history-head-left">
                                <Link to={"/"}>
                                    <div className="page-history-back">
                                        <LeftOutlined /> <div>返回</div>
                                    </div>
                                </Link>
                                <Tag
                                    color={"blue"}
                                    style={{marginLeft: 8}}>{this.state.space}(mb) / {this.state.availableSpace}(mb)
                                </Tag>
                            </div>
                            <Button
                                type="link"
                                size={"small"}
                                style={{ marginRight: 20, fontSize: 14 }}
                                onClick={this.clearSpace}
                            >
                                清空缓存
                            </Button>
                        </div>
                        {this.state.pptDatas.length === 0 ? (
                            <div className="page-history-body-empty">
                                <img src={empty_box} alt={"empty_box"} />
                            </div>
                        ) : (
                            <div className="page-history-body">
                                {this.renderZipCells()}
                            </div>
                        )}
                    </div>
                </div>
            );
        }
}
