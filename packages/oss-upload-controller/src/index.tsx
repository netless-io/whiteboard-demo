import * as React from "react";
import {Popover, Upload} from "antd";
import * as OSS from "ali-oss";
import {UploadManager} from "./UploadManager";
import "./index.less";
import {PPTKind, Room, WhiteWebSdk} from "white-web-sdk";
import * as image_icon from "./image/image_icon.svg";
import * as image_transform from "./image/image_transform.svg";
import * as web_transform from "./image/web_transform.svg";
import * as upload from "./image/upload.svg";
import * as uploadActive from "./image/upload-active.svg";
import {ossConfigObj} from "./ossConfig";
export type OssUploadControllerState = {
    isActive: boolean,
};

export const FileUploadStatic: string = "application/pdf, " +
    "application/vnd.openxmlformats-officedocument.presentationml.presentation, " +
    "application/vnd.ms-powerpoint, " +
    "application/msword, " +
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type OssUploadControllerProps = {
    room: Room,
    whiteboardRef?: HTMLDivElement,
};

export default class OssUploadController extends React.Component<OssUploadControllerProps, OssUploadControllerState> {
    private readonly client: any;
    public constructor(props: OssUploadControllerProps) {
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

    private uploadStatic = async (event: any): Promise<void> => {
        const {uuid, roomToken} = this.props.room;
        const uploadManager = new UploadManager(this.client, this.props.room);
        const whiteWebSdk = new WhiteWebSdk({appIdentifier: "283/VGiScM9Wiw2HJg"});
        const pptConverter = whiteWebSdk.pptConverter(roomToken);
        await uploadManager.convertFile(
            event.file,
            pptConverter,
            PPTKind.Static,
            ossConfigObj.folder,
            uuid,
          );
    }

    private uploadDynamic = async (event: any): Promise<void> => {
        const {uuid, roomToken} = this.props.room;
        const uploadManager = new UploadManager(this.client, this.props.room);
        const whiteWebSdk = new WhiteWebSdk({appIdentifier: "283/VGiScM9Wiw2HJg"});
        const pptConverter = whiteWebSdk.pptConverter(roomToken);
        await uploadManager.convertFile(
            event.file,
            pptConverter,
            PPTKind.Dynamic,
            ossConfigObj.folder,
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


    private handleVisibleChange = (event: boolean): void => {
        this.setState({isActive: event})
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
                       <img src={isActive ? uploadActive: upload}/>
                    </div>
                </div>
            </Popover>
        );
    }
}