import * as React from "react";
import "./StorageCell.less";
import {netlessCaches} from "./NetlessCaches";
import {Button, Progress} from "antd";

export type StorageCellStates = {
    isDownload: boolean;
    progress: number;
};

export type StorageCellProps = {
    icon: string;
    taskUuid: string;
    space: number;
    refreshSpaceData: () => Promise<void>;
};

export default class StorageCell extends React.Component<StorageCellProps, StorageCellStates> {
    public constructor(props: StorageCellProps) {
        super(props);
        this.state = {
            isDownload: false,
            progress: 0,
        }
    }


    public async componentDidMount(): Promise<void> {
        await this.refreshDownloadState();
    }

    public refreshDownloadState = async (): Promise<void> => {
        const res = await netlessCaches.hasTaskUUID(this.props.taskUuid);
        this.setState({isDownload: res});
    }

    private onProgress = (progress: number): void => {
        this.setState({progress: progress});
    }

    private download = async (): Promise<void> => {
        const {taskUuid} = this.props;
        await netlessCaches.startDownload(taskUuid, this.onProgress);
        this.setState({isDownload: true});
        await this.props.refreshSpaceData();
        this.setState({progress: 0});
    }

    private delete = async (): Promise<void> => {
        await netlessCaches.deleteTaskUUID(this.props.taskUuid);
        await this.props.refreshSpaceData();
        this.setState({isDownload: false, progress: 0});
    }

    private downloadState = (): boolean => {
        const {space} = this.props;
        const {isDownload} = this.state;
        if (space === 0) {
            return false;
        } else {
            return isDownload;
        }
    }

    public render(): React.ReactNode {
        const {icon} = this.props;
        return (
            <>
                <div className="room-cell-box">
                    <div className="room-cell-left">
                        <div className="room-cell-image">
                            <img src={icon} alt={"cover"} />
                            {!this.downloadState() &&
                            <div className="room-cell-image-cover">
                                <Progress
                                    width={42}
                                    style={{color: "white"}}
                                    strokeWidth={6}
                                    type="circle"
                                    trailColor={"white"}
                                    percent={this.state.progress} />
                            </div>}
                        </div>
                    </div>
                    <div className="room-download-cell-right">
                        <Button
                            onClick={this.download}
                            type={"primary"}
                            disabled={this.downloadState()}
                            style={{ width: 96 }}
                        >
                            下载
                        </Button>
                        <Button
                            onClick={this.delete}
                            disabled={!this.downloadState()}
                            style={{ width: 96 }}
                        >
                            删除
                        </Button>
                    </div>
                </div>
                <div className="room-cell-cut-line" />
            </>
        );
    }
}
