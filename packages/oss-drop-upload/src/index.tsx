import * as React from "react";
import * as OSS from "ali-oss";
import {PPTProgressPhase, UploadManager} from "@netless/oss-upload-manager";
import TopLoadingBar from "@netless/loading-bar";
import {ApplianceNames, Room} from "white-web-sdk";
import Dropzone from "react-dropzone";
import "./index.less";
import {CSSProperties} from "react";
type OSSConfigObjType = {
    accessKeyId: string;
    accessKeySecret: string;
    region: string;
    bucket: string;
    folder: string;
    prefix: string;
};

export type OssDropUploadStates = {
    ossPercent: number,
    uploadState: PPTProgressPhase,
};

export type OssDropUploadProps = {
    room: Room,
    oss: OSSConfigObjType,
    style?: CSSProperties,
};

export default class OssDropUpload extends React.Component<OssDropUploadProps, OssDropUploadStates> {
    private readonly client: any;

    public constructor(props: OssDropUploadProps) {
        super(props);
        this.state = {
            ossPercent: 0,
            uploadState: PPTProgressPhase.Stop,
        };
        this.client = new OSS({
            accessKeyId: props.oss.accessKeyId,
            accessKeySecret: props.oss.accessKeySecret,
            region: props.oss.region,
            bucket: props.oss.bucket,
        });
    }

    private onProgress = (phase: PPTProgressPhase, percent: number): void => {
        this.setState({ossPercent: percent});
    }

    private onDropFiles = async (
        acceptedFiles: File[],
        rejectedFiles: File[],
        event: React.DragEvent<HTMLDivElement>): Promise<void> => {
        event.persist();
        const {room} = this.props;
        try {
            const uploadManager = new UploadManager(this.client, room);
            await Promise.all([
                uploadManager.uploadImageFiles(acceptedFiles, event.clientX, event.clientY, this.onProgress),
            ]);
        } catch (error) {
            room.setMemberState({
                currentApplianceName: ApplianceNames.pencil,
            });
        }
    }
    public render(): React.ReactNode {
        return (
            <Dropzone
                accept={"image/*"}
                disableClick={true}
                style={this.props.style}
                className="whiteboard-out-box"
                onDrop={this.onDropFiles}>
                <TopLoadingBar style={{backgroundColor: "#71C3FC", height: 4}}
                               loadingPercent={this.state.ossPercent}/>
                {this.props.children}
            </Dropzone>
        );
    }
}
