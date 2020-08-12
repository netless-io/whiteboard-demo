import * as React from "react";
import {Popover, Upload, Tooltip} from "antd";
import {UploadManager} from "@netless/oss-upload-manager";
import { v4 as uuidv4 } from "uuid";
import "./index.less";
import {Room} from "white-web-sdk";
import * as more from "./image/more.svg";
import * as Video from "./image/video.svg";
import * as Audio from "./image/audio.svg";
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
        return (
            <div className="oss-upload-box">
                <Upload
                    accept={"video/mp4"}
                    showUploadList={false}
                    customRequest={this.uploadVideo}>
                    <div className="oss-upload-section">
                        <div className="oss-upload-section-inner">
                            <div className="oss-upload-title-section">
                                <div className="oss-upload-title">上传视频</div>
                                <div className="oss-upload-icon">
                                    <img src={Video}/>
                                </div>
                            </div>
                            <div className="oss-upload-section-script">
                                <div className="oss-upload-section-text">支持 MP4 格式</div>
                            </div>
                        </div>
                    </div>
                </Upload>
                <div style={{width: 208, height: 0.5, backgroundColor: "#E7E7E7"}}/>
                <Upload
                    accept={"audio/mp3"}
                    showUploadList={false}
                    customRequest={this.uploadAudio}>
                    <div className="oss-upload-section">
                        <div className="oss-upload-section-inner">
                            <div className="oss-upload-title-section">
                                <div className="oss-upload-title">上传音频</div>
                                <div className="oss-upload-icon">
                                    <img src={Audio}/>
                                </div>
                            </div>
                            <div className="oss-upload-section-script">
                                <div className="oss-upload-section-text">支持 MP3 格式</div>
                            </div>
                        </div>
                    </div>
                </Upload>
            </div>
        );
    }
    public render(): React.ReactNode {
        const {isActive} = this.state;
        return (
            <Popover trigger="click"
                     onVisibleChange={this.handleVisibleChange}
                     placement={"leftBottom"}
                     content={this.renderUploadButton()}>
                <Tooltip title={"plugin"} placement={"right"}>
                    <div className="tool-box-cell-box-left">
                        <div className="tool-box-cell">
                            <img src={isActive ? moreActive: more}/>
                        </div>
                    </div>
                </Tooltip>
            </Popover>
        );
    }
}