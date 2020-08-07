import * as React from "react";
import close from "./image/close.svg";
import addPage from "./image/add-page.svg";
import {Room, WhiteScene, RoomState} from "white-web-sdk";
import "./index.less";
import MenuBox from "@netless/menu-box";
import deleteIcon from "./image/delete.svg";

export type PreviewControllerState = {
    isFocus: boolean;
    roomState: RoomState;
    hoverCellIndex: number | null;
};

export type PreviewControllerProps = {
    room: Room;
    handlePreviewState: (state: boolean) => void;
    isVisible: boolean;
};

class PreviewController extends React.Component<PreviewControllerProps, PreviewControllerState> {

    private ref: HTMLDivElement | null = null;

    public constructor(props: PreviewControllerProps) {
        super(props);
        this.state = {
            isFocus: false,
            roomState: props.room.state,
            hoverCellIndex: null,
        };
    }


    private removeScene(): void {
        const {room} = this.props;
        const {roomState} = this.state;
        const scenePath = roomState.sceneState.scenePath;
        room.removeScenes(`${scenePath}`);
    }

    private setScenePath = (newActiveIndex: number) => {
        const {room} = this.props;
        room.setSceneIndex(newActiveIndex);
    }
    private pathName = (path: string): string => {
        const reg = /\/([^\/]*)\//g;
        reg.exec(path);
        if (RegExp.$1 === "aria") {
            return "";
        } else {
            return RegExp.$1;
        }
    }

    public componentDidMount(): void {
        const {room} = this.props;
        room.callbacks.on("onRoomStateChanged", (modifyState: Partial<RoomState>): void => {
            this.setState({roomState: {...room.state, ...modifyState}});
        });
    }

    private setRef(ref: HTMLDivElement | null): void {
        this.ref = ref;
    }

    private renderPreviewCells = (scenes: ReadonlyArray<WhiteScene>, activeIndex: number, sceneDir: any): React.ReactNode => {
        const nodes: React.ReactNode = scenes.map((scene, index) => {
            const isActive = index === activeIndex;
            return (
                <div key={`key-${index}`} className="page-out-box">
                    <div
                        onClick={() => {
                            this.setScenePath(index);
                        }}
                        className="page-box" style={{borderColor: isActive ? "#71C3FC" : "#F4F4F4"}}>
                        <PageImage
                            scene={scene}
                            room={this.props.room}
                            path={sceneDir.concat(scene.name).join("/")}/>
                    </div>
                    <div className="page-box-under">
                        <div className="page-box-under-left">
                            {index + 1}
                        </div>
                        <div onClick={() => this.removeScene()} className="page-box-under-right">
                            <img src={deleteIcon}/>
                        </div>
                    </div>
                </div>
            );
        });
        return (
            <div style={{height: "calc(100vh - 62px)"}}>
                {nodes}
            </div>
        );
    }

    private addPage = (): void => {
        const {roomState} = this.state;
        const {room} = this.props;
        const activeIndex = roomState.sceneState.index;
        const newSceneIndex = activeIndex + 1;
        const scenePath = roomState.sceneState.scenePath;
        const pathName = this.pathName(scenePath);
        room.putScenes(`/${pathName}`, [{}], newSceneIndex);
        room.setSceneIndex(newSceneIndex);
    }

    public render(): React.ReactNode {
        const {roomState} = this.state;
        const {isVisible, handlePreviewState} = this.props;
        const scenes = roomState.sceneState.scenes;
        const sceneDir = roomState.sceneState.scenePath.split("/");
        sceneDir.pop();
        const activeIndex = roomState.sceneState.index;
        return (
            <MenuBox width={240} isVisible={isVisible}>
                <div
                    ref={this.setRef.bind(this)} className="menu-annex-box">
                    <div className="menu-title-line-box">
                        <div className="menu-title-line">
                            <div className="menu-title-text-box">
                                Preview
                            </div>
                            <div className="menu-title-left">
                                <div onClick={this.addPage} className="menu-head-btn">
                                    <img src={addPage}/>
                                </div>
                                <div className="menu-head-btn" style={{marginLeft: 8}}
                                     onClick={() => handlePreviewState(false)}>
                                    <img src={close}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{height: 62}}/>
                    {this.renderPreviewCells(scenes, activeIndex, sceneDir)}
                </div>
            </MenuBox>
        );
    }
}

export type PageImageProps = { scene: WhiteScene, path: string, room: Room };

class PageImage extends React.Component<PageImageProps, {}> {

    private ref?: HTMLDivElement | null;

    public constructor(props: any) {
        super(props);
    }

    private setupDivRef = (ref: HTMLDivElement | null) => {
        if (ref) {
            this.ref = ref;
            this.props.room.scenePreview(this.props.path, ref, 208, 156);
        }
    }

    public render(): React.ReactNode {
        return <div className="ppt-image" ref={this.setupDivRef.bind(this)}/>;
    }
}

export default PreviewController;