import React, { Component } from "react";
import { Room, RoomState } from "white-web-sdk";
import MenuBox from "@netless/menu-box";
import close from "./image/close.svg";
import deleteIcon from "./image/delete.svg";
import default_cover from "./image/default_cover.svg";
import "./index.less";

export type PPTDataType = {
    active: boolean;
    pptType: PPTType;
    id: string;
    data?: any;
    name?: string;
    cover?: string;
};

export type PPTType = "dynamic" | "static" | "init";

export type Docs = PPTDataType[];

export interface DocsCenterProps {
    room: Room;
    handleDocCenterState: (state: boolean) => void;
    isFileOpen: boolean;
    i18nLanguage?: string;
}

export interface DocsCenterState {
    docs: Docs;
}

export default class Index extends Component<DocsCenterProps, DocsCenterState> {
    public constructor(props: DocsCenterProps) {
        super(props);
        this.state = { docs: [...this.getDocsFromGlobalState()] };
    }

    public componentDidMount() {
        this.props.room.callbacks.on("onRoomStateChanged", this.onRoomStateChanged);
        this.ensureInitDocState();
    }

    public componentWillUnmount() {
        this.props.room.callbacks.off("onRoomStateChanged", this.onRoomStateChanged);
    }

    private onRoomStateChanged = ({ globalState, sceneState }: Partial<RoomState>) => {
        if (sceneState) {
            // can be triggered by the user or upload button,
            // note that upload button does not change globalState when this happens,
            // we update "active" here, and remove deleted docs not in scenes
            this.syncStateWithSceneState();
        }
        if (globalState) {
            // can be triggered by this(rename, delete) or upload button(add),
            // we add missing docs to this.state here
            this.syncStateWithGlobalState();
        }
    };

    private getDocsFromGlobalState({ docs } = this.props.room.state.globalState as any): Docs {
        return docs || [];
    }

    /**
     * may return `/room-uuid/folder-uuid` or `(empty string)` (init)
     */
    private getCurrentScenePath() {
        const { scenePath: full, sceneName } = this.props.room.state.sceneState;
        const suffix = `/${sceneName}`;
        return full.endsWith(suffix) ? full.substring(0, full.length - suffix.length) : full;
    }

    private getScenePath(id: string, overrideInit = "") {
        if (id === "init") return overrideInit;
        const uuid = this.props.room.uuid;
        return `/${uuid}/${id}`;
    }

    private ensureInitDocState() {
        let { docs } = this.state;
        if (docs.find((e) => e.id === "init")) return;
        const { room } = this.props;
        const scenes = room.entireScenes();
        if ("/" in scenes) {
            const nonActive = !docs.find((e) => e.active);
            docs = [{ active: nonActive, id: "init", pptType: "init" }, ...docs];
            this.setState({ docs });
            room.setGlobalState({ docs });
        }
    }

    /**
     * - update `active` according to current scenes (may be non-active)
     * - remove docs not in the scenes
     */
    private syncStateWithSceneState() {
        const { room } = this.props;
        const scenes = room.entireScenes();
        const current = this.getCurrentScenePath();
        let { docs } = this.state;
        for (const doc of docs) {
            doc.active = this.getScenePath(doc.id) === current;
        }
        docs = docs.filter((doc) => this.getScenePath(doc.id, "/") in scenes);
        this.setState({ docs });
        room.setGlobalState({ docs });
    }

    /**
     * be careful: don't `room.setGlobalState` here
     * - add missing docs from globalState
     */
    private syncStateWithGlobalState() {
        const docs = this.getDocsFromGlobalState();
        this.setState({ docs });
    }

    private selectDoc = (id: string) => {
        const { room } = this.props;
        let { docs } = this.state;
        docs = docs.map((doc) => ({ ...doc, active: id === doc.id }));
        room.setGlobalState({ docs });
        if (id === "init") {
            room.setScenePath("/init");
        } else {
            const scenes = room.entireScenes();
            const dir = this.getScenePath(id);
            if (dir in scenes) {
                for (const { name } of scenes[dir]) {
                    room.setScenePath(`${dir}/${name}`);
                    break;
                }
            }
        }
    };

    private removeScene = ({ id }: PPTDataType) => {
        const { room } = this.props;
        const docs = this.getDocsFromGlobalState().filter((doc) => doc.id !== id);
        this.setState({ docs });
        room.setGlobalState({ docs });
        room.removeScenes(`/${room.uuid}/${id}`);
    };

    private updateDocName = (id: string, name: string): void => {
        const { room } = this.props;
        const docs = this.getDocsFromGlobalState().map((doc) =>
            id === doc.id ? { ...doc, name } : doc
        );
        this.setState({ docs });
        room.setGlobalState({ docs });
    };

    private handleCoverUrl = (imageUrl?: string): string | undefined => {
        return imageUrl ? imageUrl.replace("http:", "https:") : default_cover;
    };

    private isCN() {
        return this.props.i18nLanguage === "zh-CN";
    }

    private renderDocCells = (): React.ReactNode => {
        const { docs } = this.state;
        if (docs.length > 0) {
            return docs.map((data) => {
                if (data.pptType === "static") {
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
                } else if (data.pptType === "dynamic") {
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
                                <Preview
                                    room={this.props.room}
                                    path="/init"
                                    isFileOpen={this.props.isFileOpen}
                                />
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

interface PreviewProps {
    path: string;
    room: Room;
    isFileOpen: boolean;
}

class Preview extends Component<PreviewProps> {
    private ref: HTMLDivElement | null = null;
    private isFileOpen = false;

    public componentDidMount() {
        this.props.room.callbacks.on("onRoomStateChanged", this.refreshPreview);
    }

    public componentWillUnmount() {
        this.props.room.callbacks.off("onRoomStateChanged", this.refreshPreview);
    }

    private refreshPreview = () => {
        this.ref && this.props.room.scenePreview(this.props.path, this.ref, 96, 72);
    };

    public componentDidUpdate() {
        if (this.isFileOpen !== this.props.isFileOpen) {
            this.isFileOpen = this.props.isFileOpen;
            if (this.isFileOpen) {
                this.refreshPreview();
            }
        }
    }

    private setupRef = (ref: HTMLDivElement | null) => {
        this.ref = ref;
    };

    public render() {
        return <div className="ppt-cover" ref={this.setupRef} />;
    }
}
