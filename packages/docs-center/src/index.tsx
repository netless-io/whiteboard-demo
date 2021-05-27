import React from "react";
import { Room, RoomState } from "white-web-sdk";
import MenuBox from "@netless/menu-box";
import * as close from "./image/close.svg";
import * as deleteIcon from "./image/delete.svg";
import * as default_cover from "./image/default_cover.svg";
import "./index.less";

export type PPTDataType = {
    active: boolean;
    pptType: PPTType;
    id: string;
    data?: any;
    name?: string;
    cover?: string;
};

export enum PPTType {
    dynamic = "dynamic",
    static = "static",
    init = "init",
}

export interface WhiteboardFileProps {
    room: Room;
    handleDocCenterState: (state: boolean) => void;
    isFileOpen: boolean;
    i18nLanguage?: string;
}

export default class Index extends React.Component<WhiteboardFileProps, { docs: PPTDataType[] }> {
    private isFirstRun = true;

    public constructor(props: WhiteboardFileProps) {
        super(props);
        this.state = { docs: [] };
    }

    /** sync `globalState.docs` with `entireScenes()` */
    private refreshDocs = (modifyState: Partial<RoomState>): void => {
        if (!this.isFirstRun && !modifyState.sceneState) return;
        this.isFirstRun = false;
        const { room } = this.props;
        const { uuid, state } = room;
        const scenes = room.entireScenes();
        const visited: { [id: string]: true } = {};
        const docs: PPTDataType[] = (state.globalState as any).docs || [];
        const newDocs: PPTDataType[] = [];
        // add existing docs from old docs
        for (const doc of docs) {
            const scenePath = doc.id === "init" ? "/" : `/${uuid}/${doc.id}`;
            if (scenePath in scenes && !visited[scenePath]) {
                visited[scenePath] = true;
                newDocs.push(doc);
            }
        }
        if (!visited["/"] && "/" in scenes) {
            newDocs.unshift({ active: false, id: "init", pptType: PPTType.init });
        }
        // sync active
        const full = state.sceneState.scenePath;
        const suffix = `/${state.sceneState.sceneName}`;
        const current = full.endsWith(suffix)
            ? full.substring(0, full.length - suffix.length)
            : full;
        for (const doc of newDocs) {
            const scenePath = doc.id === "init" ? "" : `/${uuid}/${doc.id}`;
            doc.active = current === scenePath;
        }
        room.setGlobalState({ docs: newDocs });
        this.setState({ docs: newDocs });
    };

    private selectDoc = (id: string): void => {
        const { room } = this.props;
        const { uuid, state } = room;
        const docs: PPTDataType[] = (state.globalState as any).docs;
        if (docs && docs.length > 0) {
            const newDocs = docs.map((doc) => ({ ...doc, active: id === doc.id }));
            room.setGlobalState({ docs: newDocs });
            if (id === "init") {
                room.setScenePath(`/init`);
            } else {
                const scenes = room.entireScenes();
                const dir = `/${uuid}/${id}`;
                if (scenes[dir]) {
                    for (const { name } of scenes[dir]) {
                        room.setScenePath(`${dir}/${name}`);
                        break;
                    }
                }
            }
        }
    };

    public componentDidMount(): void {
        const { room } = this.props;
        room.callbacks.on("onRoomStateChanged", this.refreshDocs);
    }

    public componentWillUnmount(): void {
        const { room } = this.props;
        room.callbacks.off("onRoomStateChanged", this.refreshDocs);
    }

    private removeScene = ({ id }: PPTDataType): void => {
        const { room } = this.props;
        const roomState = room.state;
        const docs: PPTDataType[] = (roomState.globalState as any).docs;
        if (docs && docs.length > 0) {
            const newDocs = docs.filter((doc) => doc.id !== id);
            room.setGlobalState({ docs: newDocs });
            room.removeScenes(`/${room.uuid}/${id}`);
        }
    };

    private updateDocName = (id: string, name: string): void => {
        const { room } = this.props;
        const roomState = room.state;
        const docs: PPTDataType[] = (roomState.globalState as any).docs;
        if (docs && docs.length > 0) {
            const newDocs = docs.map((doc) => (id === doc.id ? { ...doc, name } : doc));
            room.setGlobalState({ docs: newDocs });
        }
    };

    private handleCoverUrl = (imageUrl?: string): string | undefined => {
        return imageUrl ? imageUrl.replace("http", "https") : default_cover;
    };

    private isCN() {
        return this.props.i18nLanguage === "zh-CN";
    }

    private renderDocCells = (): React.ReactNode => {
        const { docs } = this.state;
        if (docs.length > 0) {
            return docs.map((data) => {
                if (data.pptType === PPTType.static) {
                    return (
                        <div key={data.id} className="menu-ppt-inner-cell">
                            <div
                                onClick={() => this.selectDoc(data.id)}
                                style={{ borderColor: data.active ? "#71C3FC" : "#F4F4F4" }}
                                className="menu-ppt-image-box"
                            >
                                <img src={this.handleCoverUrl(data.cover)} alt={"cover"} />
                            </div>
                            <div className="menu-ppt-name">
                                <input
                                    onBlur={(evt) => {
                                        this.updateDocName(data.id, evt.target.value);
                                    }}
                                    defaultValue={
                                        data.name ? data.name : this.isCN() ? "首页" : "Homepage"
                                    }
                                />
                            </div>
                            <div className="menu-ppt-type">
                                <div>静态</div>
                                <div onClick={() => this.removeScene(data)}>
                                    <img src={deleteIcon} alt={"deleteIcon"} />
                                </div>
                            </div>
                        </div>
                    );
                } else if (data.pptType === PPTType.dynamic) {
                    return (
                        <div key={data.id} className="menu-ppt-inner-cell">
                            <div
                                onClick={() => this.selectDoc(data.id)}
                                style={{ borderColor: data.active ? "#71C3FC" : "#F4F4F4" }}
                                className="menu-ppt-image-box"
                            >
                                <img src={this.handleCoverUrl(data.cover)} alt={"cover"} />
                            </div>
                            <div className="menu-ppt-name">
                                <input
                                    onChange={(evt) => {
                                        this.updateDocName(data.id, evt.target.value);
                                    }}
                                    defaultValue={
                                        data.name ? data.name : this.isCN() ? "未命名" : "Untitled"
                                    }
                                />
                            </div>
                            <div className="menu-ppt-type">
                                <div className="menu-ppt-type-text">
                                    {this.isCN() ? "动态" : "PPT"}
                                </div>
                                <div
                                    className="menu-ppt-type-icon"
                                    onClick={() => this.removeScene(data)}
                                >
                                    <img src={deleteIcon} alt={"deleteIcon"} />
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div key={data.id} className="menu-ppt-inner-cell">
                            <div
                                onClick={() => this.selectDoc(data.id)}
                                style={{ borderColor: data.active ? "#71C3FC" : "#F4F4F4" }}
                                className="menu-ppt-image-box"
                            >
                                <Preview room={this.props.room} path="/init" isOpen={this.props.isFileOpen} />
                            </div>
                            <div className="menu-ppt-name">
                                <input
                                    onChange={(evt) => {
                                        this.updateDocName(data.id, evt.target.value);
                                    }}
                                    defaultValue={
                                        data.name ? data.name : this.isCN() ? "首页" : "Homepage"
                                    }
                                />
                            </div>
                            <div className="menu-ppt-type">
                                <div className="menu-ppt-type-text">
                                    {this.isCN() ? "白板页" : "Whiteboard"}
                                </div>
                            </div>
                        </div>
                    );
                }
            });
        } else {
            return null;
        }
    };

    public render(): React.ReactNode {
        const { handleDocCenterState, isFileOpen } = this.props;
        return (
            <MenuBox width={240} isVisible={isFileOpen}>
                <div className="menu-annex-box">
                    <div className="menu-title-line-box">
                        <div className="menu-title-line">
                            <div className="menu-title-text-box">Document</div>
                            <div className="menu-title-left">
                                <div
                                    className="menu-head-btn"
                                    style={{ marginLeft: 8 }}
                                    onClick={() => handleDocCenterState(false)}
                                >
                                    <img src={close} alt={"close"} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ height: 64 }} />
                    <div className="menu-docs-body">{this.renderDocCells()}</div>
                </div>
            </MenuBox>
        );
    }
}

export type PreviewProps = { path: string; room: Room; isOpen: boolean; };

class Preview extends React.Component<PreviewProps> {
    private ref: HTMLDivElement | null;
    private isOpen = false;

    public componentDidMount() {
        this.props.room.callbacks.on("onRoomStateChanged", this.refreshPreview);
    }

    public componentWillUnmount() {
        this.props.room.callbacks.off("onRoomStateChanged", this.refreshPreview);
    }

    private refreshPreview = () => {
        if (this.ref) {
            this.props.room.scenePreview(this.props.path, this.ref, 96, 72);
        }
    };

    public componentDidUpdate() {
        if (this.isOpen !== this.props.isOpen) {
            this.isOpen = this.props.isOpen;
            this.refreshPreview();
        }
    }

    private setupDivRef = (ref: HTMLDivElement | null) => {
        this.ref = ref;
    };

    public render(): React.ReactNode {
        return <div className="ppt-cover" ref={this.setupDivRef} />;
    }
}
