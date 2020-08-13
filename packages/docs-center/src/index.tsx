import * as React from "react";
import {Room, RoomState} from "white-web-sdk";
import * as close from "./image/close.svg";
import * as deleteIcon from "./image/delete.svg";
import MenuBox from "@netless/menu-box";
import "./index.less";

export type PPTDataType = {
    active: boolean,
    pptType: PPTType,
    id: string,
    data: any,
    name?: string,
    cover?: string,
};

export enum PPTType {
    dynamic = "dynamic",
    static = "static",
    init = "init",
}

export type WhiteboardFileProps = {
    room: Room;
    handleDocCenterState: (state: boolean) => void;
    isFileOpen: boolean;
};

export type WhiteboardFileStates = {
    roomState: RoomState;
};

export default class Index extends React.Component<WhiteboardFileProps, WhiteboardFileStates> {

    public constructor(props: WhiteboardFileProps) {
        super(props);
        this.state = {
            roomState: props.room.state,
        };
    }

    private selectDoc = (id: string) => {
        const {room} = this.props;
        const {roomState} = this.state;
        const {uuid} = room;
        const docs: PPTDataType[] = (roomState.globalState as any).docs;
        if (docs && docs.length > 0) {
            const newDocs = docs.map(doc => {
                if (id === doc.id) {
                    return {
                        ...doc,
                        active: true,
                    };
                } else {
                    return {
                        ...doc,
                        active: false,
                    }
                }
            });
            if (id === "init") {
                room.setScenePath(`/init`);
            } else {
                room.setScenePath(`/${uuid}/${id}/1`);
            }
            room.setGlobalState({docs: newDocs});
        }
    }
    public componentDidMount(): void {
        const {room} = this.props;
        room.callbacks.on("onRoomStateChanged", (modifyState: Partial<RoomState>): void => {
            this.setState({roomState: {...room.state, ...modifyState}});
        });
        this.initHomeDoc(room);
    }

    private initHomeDoc = (room: Room): void => {
        const {roomState} = this.state;
        if ((roomState.globalState as any).docs === undefined) {
            room.setGlobalState({docs: [{
                    active: true,
                    pptType: PPTType.init,
                    id: "init",
                }]})
        }
    }

    private removeScene = (pptData: PPTDataType): void => {
        const {room} = this.props;
        const {roomState} = this.state;
        const docs: PPTDataType[] = (roomState.globalState as any).docs;
        if (docs && docs.length > 0) {
            const newDocs = docs.filter(doc => doc.id !== pptData.id);
            room.setGlobalState({docs: newDocs});
            room.removeScenes(`/${room.uuid}/${pptData.id}`);
        }
    }

    private updateDocName = (id: string, name: string): void => {
        const {room} = this.props;
        const {roomState} = this.state;
        const docs: PPTDataType[] = (roomState.globalState as any).docs;
        if (docs && docs.length > 0) {
            const newDocs = docs.map(doc => {
                if (id === doc.id) {
                    return {
                        ...doc,
                        name: name,
                    };
                } else {
                    return doc;
                }
            });
            room.setGlobalState({docs: newDocs});
        }
    }

    private renderDocCells = (): React.ReactNode => {
        const {roomState} = this.state;
        const docs: PPTDataType[] = (roomState.globalState as any).docs;
        if (docs && docs.length > 0) {
            return docs.map(data => {
                if (data.pptType === PPTType.static) {
                    return (
                        <div
                            key={`${data.id}`}
                            className="menu-ppt-inner-cell">
                            <div onClick={() => this.selectDoc(data.id)}
                                 style={{borderColor: data.active ? "#71C3FC" : "#F4F4F4"}}
                                 className="menu-ppt-image-box">
                                <img src={data.cover}/>
                            </div>
                            <div className="menu-ppt-name">
                                <input onBlur={ evt => {
                                    this.updateDocName(data.id, evt.target.value);
                                }} defaultValue={data.name ? data.name : "首页"}/>
                            </div>
                            <div className="menu-ppt-type">
                                <div>
                                    静态
                                </div>
                                <div onClick={() => this.removeScene(data)}>
                                    <img src={deleteIcon}/>
                                </div>
                            </div>
                        </div>
                    );
                } else if (data.pptType === PPTType.dynamic) {
                    return (
                        <div
                            key={`${data.id}`}
                            className="menu-ppt-inner-cell">
                            <div onClick={() => this.selectDoc(data.id)}
                                 style={{borderColor: data.active ? "#71C3FC" : "#F4F4F4"}}
                                 className="menu-ppt-image-box">
                                <img src={data.cover}/>
                            </div>
                            <div className="menu-ppt-name">
                                <input onChange={ evt => {
                                    this.updateDocName(data.id, evt.target.value);
                                }} defaultValue={data.name ? data.name : "未命名"}/>
                            </div>
                            <div className="menu-ppt-type">
                                <div className="menu-ppt-type-text">
                                    动态
                                </div>
                                <div className="menu-ppt-type-icon" onClick={() => this.removeScene(data)}>
                                    <img src={deleteIcon}/>
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div
                            key={`${data.id}`}
                            className="menu-ppt-inner-cell">
                            <div onClick={() => this.selectDoc(data.id)}
                                 style={{borderColor: data.active ? "#71C3FC" : "#F4F4F4"}}
                                 className="menu-ppt-image-box">
                                <Preview
                                    room={this.props.room}
                                    path={"/init"}/>
                            </div>
                            <div className="menu-ppt-name">
                                <input onChange={ evt => {
                                    this.updateDocName(data.id, evt.target.value);
                                }} defaultValue={data.name ? data.name : "首页"}/>
                            </div>
                            <div className="menu-ppt-type">
                                <div className="menu-ppt-type-text">
                                    白板页
                                </div>
                            </div>
                        </div>
                    );
                }
            });
        } else {
            return null;
        }
    }

    public render(): React.ReactNode {
        const {handleDocCenterState, isFileOpen} = this.props;
        return (
            <MenuBox
                width={240}
                isVisible={isFileOpen}
            >
                <div
                    className="menu-annex-box">
                    <div className="menu-title-line-box">
                        <div className="menu-title-line">
                            <div className="menu-title-text-box">
                                Document
                            </div>
                            <div className="menu-title-left">
                                <div className="menu-head-btn" style={{marginLeft: 8}}
                                     onClick={() => handleDocCenterState(false)}>
                                    <img src={close}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{height: 64}}/>
                    <div className="menu-docs-body">
                        {this.renderDocCells()}
                    </div>
                </div>
            </MenuBox>
        );
    }
}

export type PreviewProps = { path: string, room: Room };

class Preview extends React.Component<PreviewProps, {}> {

    private ref?: HTMLDivElement | null;

    public constructor(props: any) {
        super(props);
    }

    private setupDivRef = (ref: HTMLDivElement | null) => {
        if (ref) {
            this.ref = ref;
            this.props.room.scenePreview(this.props.path, ref, 96, 72);
        }
    }

    public render(): React.ReactNode {
        return <div className="ppt-cover" ref={this.setupDivRef.bind(this)}/>;
    }
}