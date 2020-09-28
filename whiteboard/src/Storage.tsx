import * as React from "react";
import "./Storage.less";
import * as zip_icon from "./assets/image/zip.svg";
import "@netless/zip";
import {netlessCaches} from "./NetlessCaches";
import {taskUuids, TaskUuidType} from "./taskUuids";
import {Button, Progress, Tag} from "antd";
import {Link} from "react-router-dom";
import {LeftOutlined} from "@ant-design/icons";
import empty_box from "./assets/image/empty-box.svg";

export type ServiceWorkTestStates = {
    space: number;
    availableSpace: number;
    pptDatas: TaskUuidType[];
    pptDatasStates: PptDatasType[];
    downloader: Downloader | null;
    downloadAllState: DownloadState;
};

enum DownloadState {
    preDownload = "preDownload",
    downloading = "downloading",
    stopDownload = "stopDownload",
    downloaded = "downloaded",
}

enum PptListState {
    listDownAll = "listDownAll",
    listDownPart = "listDownPart",
    listDownNone = "listDownNone",
}

export type PptDatasType = {
    taskUuid: string | null;
    progress: number;
    name: string;
    cover: string;
    DownloadState: DownloadState;
};

export default class Storage extends React.Component<{}, ServiceWorkTestStates> {

    public constructor(props: {}) {
        super(props);
        this.state = {
            space: 0,
            availableSpace: 0,
            pptDatas: taskUuids,
            pptDatasStates: [],
            downloader: null,
            downloadAllState: DownloadState.preDownload,
        }
    }

    public async componentDidMount(): Promise<void> {
        await this.refreshSpaceData();
        const pptDatasStates: PptDatasType[] = await Promise.all(taskUuids.map(async ppt => {
            if (await netlessCaches.hasTaskUUID(ppt.taskUuid)) {
                return {
                    taskUuid: ppt.taskUuid,
                    progress: 0,
                    name: ppt.name ? ppt.name : "",
                    cover: zip_icon,
                    DownloadState: DownloadState.downloaded,
                };
            } else {
                return {
                    taskUuid: ppt.taskUuid,
                    progress: 0,
                    name: ppt.name ? ppt.name : "",
                    cover: zip_icon,
                    DownloadState: DownloadState.preDownload,
                };
            }
        }));
        const downloader = new Downloader(pptDatasStates, this.onProgressUpdate, this.onPptSuccess)
        this.setState({downloader: downloader});
        this.setState({pptDatasStates: pptDatasStates});
    }

    private refreshSpaceData = async (): Promise<void> => {
        const space = await netlessCaches.calculateCache();
        const availableSpace = await netlessCaches.availableSpace();
        this.setState({space: Math.round(space), availableSpace: Math.round(availableSpace)});
    }

    private detectIsDownload = (ppt: PptDatasType): boolean => {
        return ppt.DownloadState === DownloadState.downloaded;
    }

    private renderZipCells = (): React.ReactNode => {
        const {pptDatasStates, downloadAllState} = this.state;
        return pptDatasStates.map((pptData, index: number) => {
            const isDownloadDisable = (pptData.DownloadState !== DownloadState.preDownload || downloadAllState === DownloadState.downloading);
            if (pptData.taskUuid !== null) {
                return (
                    <div key={`zip-${index}`}>
                        <div className="room-cell-box">
                            <div className="room-cell-left">
                                <div className="room-cell-image">
                                    <img src={pptData.cover} alt={"cover"} />
                                    {!this.detectIsDownload(pptData) &&
                                    <div className="room-cell-image-cover">
                                        <Progress
                                            width={42}
                                            style={{color: "white"}}
                                            strokeWidth={6}
                                            type="circle"
                                            trailColor={"white"}
                                            percent={pptData.progress} />
                                    </div>}
                                </div>
                                <div>
                                    <div className="room-cell-text">{pptData.name}</div>
                                </div>
                            </div>
                            <div className="room-download-cell-right">
                                <Button
                                    onClick={() => this.downloadCell(pptData.taskUuid!)}
                                    type={"primary"}
                                    disabled={isDownloadDisable}
                                    style={{ width: 96 }}
                                >
                                    下载
                                </Button>
                                <Button
                                    onClick={() => this.deleteCell(pptData.taskUuid!)}
                                    disabled={!this.detectIsDownload(pptData)}
                                    style={{ width: 96 }}
                                >
                                    删除
                                </Button>
                            </div>
                        </div>
                        <div className="room-cell-cut-line" />
                    </div>
                )
            }
            return null;
        });
    }

    private deleteCell = async (taskUuid: string): Promise<void> => {
        await netlessCaches.deleteTaskUUID(taskUuid);
        await this.refreshSpaceData();
        const pptDatasStates = this.state.pptDatasStates.map(pptData => {
            if (pptData.taskUuid === taskUuid) {
                pptData.progress = 0;
                pptData.DownloadState = DownloadState.preDownload;
                return pptData;
            } else {
                return pptData;
            }
        });
        this.setState({pptDatasStates: pptDatasStates});
    }

    private downloadCell = async (taskUuid: string): Promise<void> => {
        await netlessCaches.startDownload(taskUuid, (progress: number) => {
            const pptDatasStates = this.state.pptDatasStates.map(pptData => {
                if (pptData.taskUuid === taskUuid) {
                    pptData.progress = progress;
                    if (pptData.progress === 100) {
                        pptData.progress = 0;
                        pptData.DownloadState = DownloadState.downloaded;
                        return pptData;
                    } else {
                        pptData.DownloadState = DownloadState.downloading;
                        return pptData;
                    }
                } else {
                    return pptData;
                }
            });
            this.setState({pptDatasStates: pptDatasStates});
        });
        await this.refreshSpaceData();
    }

    private onProgressUpdate = (pptDatasStates: PptDatasType[]): void => {
        this.setState({pptDatasStates: pptDatasStates});
    }

    private onPptSuccess = async (): Promise<void> => {
        await this.refreshSpaceData();
    }

    private downloadAllCell = async (): Promise<void> => {
        const {downloader} = this.state;
        if (downloader) {
            this.setState({downloadAllState: DownloadState.downloading});
            await downloader.downloadAll();
            this.refreshPptListState();
        }
    }

    private restartDownloadAllCell = async (): Promise<void> => {
        const {downloader} = this.state;
        if (downloader) {
            downloader.start();
            this.setState({downloadAllState: DownloadState.downloading});
            await downloader.downloadAll();
            this.refreshPptListState();
        }
    }

    private refreshPptListState = (): void => {
        const {downloader} = this.state;
        if (downloader) {
            if (downloader.pptListState === PptListState.listDownAll) {
                this.setState({downloadAllState: DownloadState.downloaded});
            } else if (downloader.pptListState === PptListState.listDownPart) {
                this.setState({downloadAllState: DownloadState.stopDownload});
            } else {
                this.setState({downloadAllState: DownloadState.preDownload});
            }
        }
    }

    private stopAll = (): void => {
        const {downloader} = this.state;
        this.setState({downloadAllState: DownloadState.stopDownload});
        if (downloader) {
            downloader.stop();
        }
    }

    private clearSpace = async (): Promise<void> => {
        await netlessCaches.deleteCache();
        const pptDatasStates = this.state.pptDatasStates.map(pptData => {
            pptData.DownloadState = DownloadState.preDownload;
            pptData.progress = 0;
            return pptData;
        });
        this.setState({pptDatasStates: pptDatasStates, downloadAllState: DownloadState.preDownload});
        await this.refreshSpaceData();
    }

    public componentWillUnmount(): void {
        const {downloader} = this.state;
        if (downloader) {
            downloader.stop();
        }
    }

    private renderButton = (): React.ReactNode => {
        const {downloadAllState, downloader} = this.state;
        if (downloadAllState === DownloadState.downloading) {
            return (
                <Button
                    type="link"
                    size={"small"}
                    style={{ marginRight: 20, fontSize: 14 }}
                    onClick={this.stopAll}
                >
                    暂停下载
                </Button>
            );
        } else if (downloadAllState === DownloadState.preDownload) {
            return (
                <Button
                    type="link"
                    size={"small"}
                    style={{ marginRight: 20, fontSize: 14 }}
                    onClick={this.downloadAllCell}
                >
                    全部下载
                </Button>
            );
        } else {
            if (downloader) {
                if (downloader.pptListState === PptListState.listDownNone) {
                    return (
                        <Button
                            type="link"
                            size={"small"}
                            style={{ marginRight: 20, fontSize: 14 }}
                            onClick={this.downloadAllCell}
                        >
                            全部下载
                        </Button>
                    );
                } else if (downloader.pptListState === PptListState.listDownPart) {
                    return (
                        <Button
                            type="link"
                            size={"small"}
                            style={{ marginRight: 20, fontSize: 14 }}
                            onClick={this.restartDownloadAllCell}
                        >
                            继续下载
                        </Button>
                    );
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }
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
                            <div>
                                {this.renderButton()}
                                <Button
                                    type="link"
                                    size={"small"}
                                    style={{ marginRight: 20, fontSize: 14 }}
                                    onClick={this.clearSpace}
                                >
                                    清空缓存
                                </Button>
                            </div>
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

class Downloader {
    private didStop: boolean = false;
    private readonly pptDatasStates: PptDatasType[];
    private readonly onProgressUpdate: (pptDatasStates: PptDatasType[]) => void;
    private readonly onPptSuccess: () => Promise<void>;
    public pptListState: PptListState;
    public constructor(pptDatasStates: PptDatasType[],
                       onProgressUpdate: (pptDatasStates: PptDatasType[]) => void,
                       onPptSuccess: () => Promise<void>,
                       ) {
        this.pptDatasStates = pptDatasStates;
        this.onProgressUpdate = onProgressUpdate;
        this.onPptSuccess = onPptSuccess;
        this.pptListState = this.getPptListState();
    }
    public stop = (): void => {
        this.didStop = true;
    }

    public start = (): void => {
        this.didStop = false;
    }

    private getPptListState = (): PptListState => {
        const downloadData: PptDatasType[] = [];
        for (let pptData of this.pptDatasStates) {
            if (pptData.DownloadState === DownloadState.downloaded) {
                downloadData.push(pptData);
            }
        }
        const dataLength = this.pptDatasStates.length;
        const downloadDataLength = downloadData.length;
        if (downloadDataLength === 0) {
            return PptListState.listDownNone;
        } else if (downloadDataLength === dataLength) {
            return PptListState.listDownAll;
        } else {
            return PptListState.listDownPart;
        }
    }

    private detectIsDownload = (ppt: PptDatasType): boolean => {
        return ppt.DownloadState === DownloadState.downloaded;
    }
    public downloadAll = async (): Promise<void> => {
        for (let ppt of this.pptDatasStates) {
            if (this.didStop) {
                break;
            }
            if (ppt.taskUuid && !this.detectIsDownload(ppt)) {
                await netlessCaches.startDownload(ppt.taskUuid, (progress: number) => {
                    const pptDatasStates = this.pptDatasStates.map(pptData => {
                        if (pptData.taskUuid === ppt.taskUuid) {
                            pptData.progress = progress;
                            if (pptData.progress === 100) {
                                pptData.progress = 0;
                                pptData.DownloadState = DownloadState.downloaded;
                                return pptData;
                            } else {
                                pptData.DownloadState = DownloadState.downloading;
                                return pptData;
                            }
                        } else {
                            return pptData;
                        }
                    });
                    this.onProgressUpdate(pptDatasStates);
                });
                this.pptListState = this.getPptListState();
                await this.onPptSuccess();
            }
        }
    }
}
