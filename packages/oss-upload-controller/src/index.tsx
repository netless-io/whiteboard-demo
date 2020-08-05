import * as React from "react";
import {Popover, Upload} from "antd";
import * as OSS from "ali-oss";
import {PPTDataType, UploadManager} from "./UploadManager";
import "./index.less";
import {PPTKind, Room, WhiteWebSdk} from "white-web-sdk";
import * as image_icon from "./image/image_icon.svg";
import * as image_transform from "./image/image_transform.svg";
import * as web_transform from "./image/web_transform.svg";
export type ToolBoxUploadBoxState = {
    toolBoxColor: string,
};

export const FileUploadStatic: string = "application/pdf, " +
    "application/vnd.openxmlformats-officedocument.presentationml.presentation, " +
    "application/vnd.ms-powerpoint, " +
    "application/msword, " +
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type UploadBtnProps = {
    oss: {
        accessKeyId: string,
        accessKeySecret: string,
        region: string,
        bucket: string,
        folder: string,
        prefix: string,
    },
    room: Room,
    uuid: string,
    roomToken: string | null,
    whiteboardRef?: HTMLDivElement,
};

export default class UploadBtn extends React.Component<UploadBtnProps, ToolBoxUploadBoxState> {
    private readonly client: any;
    public constructor(props: UploadBtnProps) {
        super(props);
        this.state = {
            toolBoxColor: "#A2A7AD",
        };
        this.client = new OSS({
            accessKeyId: this.props.oss.accessKeyId,
            accessKeySecret: this.props.oss.accessKeySecret,
            region: this.props.oss.region,
            bucket: this.props.oss.bucket,
        });
    }

    private uploadStatic = async (event: any): Promise<void> => {
        const {uuid} = this.props;
        const uploadManager = new UploadManager(this.client, this.props.room);
        const whiteWebSdk = new WhiteWebSdk({appIdentifier: "283/VGiScM9Wiw2HJg"});
        const pptConverter = whiteWebSdk.pptConverter(this.props.roomToken!);
        await uploadManager.convertFile(
            event.file,
            pptConverter,
            PPTKind.Static,
            this.props.oss.folder,
            uuid,
          );
    }

    private uploadDynamic = async (event: any): Promise<void> => {
        const {uuid} = this.props;
        const uploadManager = new UploadManager(this.client, this.props.room);
        const whiteWebSdk = new WhiteWebSdk({appIdentifier: "283/VGiScM9Wiw2HJg"});
        const pptConverter = whiteWebSdk.pptConverter(this.props.roomToken!);
        await uploadManager.convertFile(
            event.file,
            pptConverter,
            PPTKind.Dynamic,
            this.props.oss.folder,
            uuid,
        );
    }

    private uploadImage = async (event: any): Promise<void> => {
        const uploadFileArray: File[] = [];
        uploadFileArray.push(event.file);
        const uploadManager = new UploadManager(this.client, this.props.room);
        if (this.props.whiteboardRef) {
            const {clientWidth, clientHeight} = this.props.whiteboardRef;
            await uploadManager.uploadImageFiles(uploadFileArray, clientWidth / 2, clientHeight / 2);
        } else {
            const clientWidth = window.innerWidth;
            const clientHeight = window.innerHeight;
            await uploadManager.uploadImageFiles(uploadFileArray, clientWidth / 2, clientHeight / 2);
        }
    }

    private renderUploadButton = (): React.ReactNode => {
        return [
            <Upload
                key={`image`}
                accept={"image/*"}
                showUploadList={false}
                customRequest={this.uploadImage}>
                <div className="popover-section">
                    <div className="popover-section-inner">
                        <div className="popover-section-image">
                            <img width={68} src={image_icon}/>
                        </div>
                        <div className="popover-section-script">
                            <div className="popover-section-title">upload image</div>
                            <div className="popover-section-text">Support for common formats.</div>
                        </div>
                    </div>
                </div>
            </Upload>,
            <Upload
                key={`dynamic`}
                disabled={!this.props.roomToken}
                accept={"application/vnd.openxmlformats-officedocument.presentationml.presentation"}
                showUploadList={false}
                customRequest={this.uploadDynamic}>
                <div className="popover-section">
                    <div className="popover-section-inner">
                        <div className="popover-section-image">
                            <img width={72} src={web_transform}/>
                        </div>
                        <div className="popover-section-script">
                            <div className="popover-section-title">PPTX transfer web</div>
                            <div className="popover-section-text">Turn pptx into a web page for syncing.</div>
                        </div>
                    </div>
                </div>
            </Upload>,
            <Upload
                key={`static`}
                disabled={!this.props.roomToken}
                accept={FileUploadStatic}
                showUploadList={false}
                customRequest={this.uploadStatic}>
                <div className="popover-section">
                    <div className="popover-section-inner">
                        <div className="popover-section-image">
                            <img width={72} src={image_transform}/>
                        </div>
                        <div className="popover-section-script">
                            <div className="popover-section-title">Docs transfer image</div>
                            <div className="popover-section-text">Support ppt、pptx、word and pdf.</div>
                        </div>
                    </div>
                </div>
            </Upload>,
        ];
    }


    private handleVisibleChange = (e: any): void => {
        if (e) {
            this.setState({toolBoxColor: "#141414"});
        } else {
            this.setState({toolBoxColor: "#A2A7AD"});
        }
    }

    public render(): React.ReactNode {
        return (
            <Popover trigger="click"
                     onVisibleChange={this.handleVisibleChange}
                     content={
                         <div style={{height: 118 * 3}}
                              className="popover-box">
                            {this.renderUploadButton()}
                         </div>
                     }>
                <div
                    onMouseEnter={() => this.setState({toolBoxColor: "#141414"})}
                    onMouseLeave={() => this.setState({toolBoxColor: "#A2A7AD"})}
                    className="tool-box-cell-box-left">
                    <div className="tool-box-cell">
                       upload
                    </div>
                </div>
            </Popover>
        );
    }
}