import * as React from "react";
import {Popover, Upload} from "antd";
import {UploadManager} from "@netless/oss-upload-manager";
import { v4 as uuidv4 } from "uuid";
import "./index.less";
import {Room} from "white-web-sdk";
import * as more from "./image/more.svg";
import * as moreActive from "./image/more-active.svg";
import * as OSS from "ali-oss";
import {ossConfigObj} from "./ossConfig";

export type PluginCenterProps = {
    room: Room,
};

export type PluginCenterStates = {
    isActive: boolean,
};

export default class PluginCenter extends React.Component<PluginCenterProps, PluginCenterStates> {
    private readonly client: any;
    public constructor(props: PluginCenterProps) {
        super(props);
        this.state = {
            isActive: false,
        };
        this.client = new OSS({
            accessKeyId: ossConfigObj.accessKeyId,
            accessKeySecret: ossConfigObj.accessKeySecret,
            region: ossConfigObj.region,
            bucket: ossConfigObj.bucket,
        });
    }
    private handleVisibleChange = (event: boolean): void => {
        this.setState({isActive: event})
    }

    private uploadVideo = async (event: any): Promise<void> => {
        try {
            const uploadManager = new UploadManager(this.client, this.props.room);
            const res = await uploadManager.addFile(`${uuidv4()}/${event.file.name}`, event.file);
            const isHttps = res.indexOf("https") !== -1;
            let url;
            if (isHttps) {
                url = res;
            } else {
                url = res.replace("http", "https");
            }
            if (url) {
                this.props.room.insertPlugin("video", {
                    originX: 0,
                    originY: 0,
                    width: 480,
                    height: 270,
                    attributes: {
                        pluginVideoUrl: url,
                    },
                });
            }
        } catch (err) {
            console.log(err);
        }
    }

    private uploadAudio = async (event: any): Promise<void> => {
        try {
            const uploadManager = new UploadManager(this.client, this.props.room);
            const res = await uploadManager.addFile(`${uuidv4()}/${event.file.name}`, event.file, );
            const isHttps = res.indexOf("https") !== -1;
            let url;
            if (isHttps) {
                url = res;
            } else {
                url = res.replace("http", "https");
            }
            if (url) {
                this.props.room.insertPlugin("audio", {
                    originX: 0,
                    originY: 0,
                    width: 480,
                    height: 86,
                    attributes: {
                        pluginAudioUrl: url,
                    },
                });
            }
        } catch (err) {
            console.log(err);
        }
    }

    private renderUploadButton = (): React.ReactNode => {
        return [
            <Upload
                key={`video`}
                accept={"video/mp4"}
                showUploadList={false}
                customRequest={this.uploadVideo}>
                <div className="popover-section">
                    <div className="popover-section-inner">
                        <div className="popover-section-image">
                        </div>
                        <div className="popover-section-script">
                            <div className="popover-section-title">upload image</div>
                            <div className="popover-section-text">Support for common formats.</div>
                        </div>
                    </div>
                </div>
            </Upload>,
            <Upload
                key={`audio`}
                accept={"audio/mp3"}
                showUploadList={false}
                customRequest={this.uploadAudio}>
                <div className="popover-section">
                    <div className="popover-section-inner">
                        <div className="popover-section-image">
                        </div>
                        <div className="popover-section-script">
                            <div className="popover-section-title">PPTX transfer web</div>
                            <div className="popover-section-text">Turn pptx into a web page for syncing.</div>
                        </div>
                    </div>
                </div>
            </Upload>
        ];
    }
    public render(): React.ReactNode {
        const {isActive} = this.state;
        return (
            <Popover trigger="click"
                     onVisibleChange={this.handleVisibleChange}
                     placement={"leftBottom"}
                     content={
                         <div style={{height: 118 * 3}}
                              className="popover-box">
                             {this.renderUploadButton()}
                         </div>
                     }>
                <div className="tool-box-cell-box-left">
                    <div className="tool-box-cell">
                        <img src={isActive ? moreActive: more}/>
                    </div>
                </div>
            </Popover>
        );
    }
}