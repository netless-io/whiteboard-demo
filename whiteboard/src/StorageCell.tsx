import * as React from "react";
import "./StorageCell.less";
import {netlessCaches} from "./NetlessCaches";
import {Button} from "antd";

export type StorageCellStates = {
    isDownload: boolean;
    progress: number;
};

export type StorageCellProps = {
    icon: string;
    taskUuid: string;
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
        console.log("taskUuid", this.props.taskUuid);
        const res = await netlessCaches.hasTaskUUID(this.props.taskUuid);
        console.log("res", res);
        this.setState({isDownload: res});
    }

    private onProgress = (progress: number): void => {
        this.setState({progress: progress});
    }

    private download = async (): Promise<void> => {
        const {taskUuid} = this.props;
        await netlessCaches.startDownload(taskUuid, this.onProgress);
        await this.props.refreshSpaceData();
    }

    private delete = async (): Promise<void> => {
        await netlessCaches.deleteTaskUUID(this.props.taskUuid);
        await this.props.refreshSpaceData();
    }

    public render(): React.ReactNode {
        const {icon} = this.props;
        return (
            <>
                <div className="room-cell-box">
                    <div className="room-cell-left">
                        <div className="room-cell-image">
                            <img src={icon} alt={"cover"} />
                        </div>
                        <div>{this.state.progress}</div>
                    </div>
                    <div className="room-download-cell-right">
                        <Button
                            onClick={this.download}
                            type={"primary"}
                            style={{ width: 96 }}
                        >
                            下载
                        </Button>
                        <Button
                            onClick={this.delete}
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
