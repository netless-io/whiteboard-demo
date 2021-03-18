import * as React from "react";
import {Room, WhiteScene, RoomState} from "white-web-sdk";
import MenuBox from "@netless/menu-box";
import close from "./image/close.svg";
import addPage from "./image/add-page.svg";
import "./index.less";
import deleteIcon from "./image/delete.svg";

export type PreviewControllerState = {
    isFocus: boolean;
    hoverCellIndex: number | null;
    scenesCount: number;
};

export type PreviewControllerProps = {
    room: Room;
    handlePreviewState: (state: boolean) => void;
    isVisible: boolean;
};

class PreviewController extends React.Component<PreviewControllerProps, PreviewControllerState> {

    public constructor(props: PreviewControllerProps) {
        super(props);
        this.state = {
            isFocus: false,
            hoverCellIndex: null,
            scenesCount: 0,
        };
    }

    private setScenePath = (newActiveIndex: number) => {
        const {room} = this.props;
        room.setSceneIndex(newActiveIndex);
    }
    private pathName = (path: string): string => {
        const cells = path.split("/");
        const popCell = cells.pop();
        if (popCell === "") {
            cells.pop();
        }
        return cells.join("/");
    }

    public componentDidMount(): void {
        const { room } = this.props;
        this.setState({ scenesCount: room.state.sceneState.scenes.length });
        room.callbacks.on("onRoomStateChanged", (): void => {
            this.setState({ scenesCount: room.state.sceneState.scenes.length });
        });
    }

    private renderPreviewCells = (scenes: ReadonlyArray<WhiteScene>, activeIndex: number, sceneDir: any): React.ReactNode => {
        const nodes: React.ReactNode = scenes.map((scene, index) => {
            const isActive = index === activeIndex;
            const scenePath = sceneDir.concat(scene.name).join("/");
            return (
                <div key={`key-${scenePath}`} className="page-out-box">
                    <div
                        onClick={() => {
                            this.setScenePath(index);
                        }}
                        className="page-box" style={{borderColor: isActive ? "#71C3FC" : "#F4F4F4"}}>
                        <PageImage
                            room={this.props.room}
                            path={scenePath}
                        />
                    </div>
                    <div className="page-box-under">
                        <div className="page-box-under-left">
                            {index + 1}
                        </div>
                        <div onClick={() => this.props.room.removeScenes(`${scenePath}`)} className="page-box-under-right">
                            <img src={deleteIcon} alt={"deleteIcon"}/>
                        </div>
                    </div>
                </div>
            );
        });
        return (
            <div className="preview-cells-box">
                {nodes}
            </div>
        );
    }

    private addPage = (): void => {
        const {room} = this.props;
        const activeIndex = room.state.sceneState.index;
        const newSceneIndex = activeIndex + 1;
        const scenePath = room.state.sceneState.scenePath;
        const pathName = this.pathName(scenePath);
        room.putScenes(pathName, [{}], newSceneIndex);
        room.setSceneIndex(newSceneIndex);
    }

    public render(): React.ReactNode {
        const {isVisible, handlePreviewState, room} = this.props;
        const scenes = room.state.sceneState.scenes;
        const sceneDir = room.state.sceneState.scenePath.split("/");
        sceneDir.pop();
        const activeIndex = room.state.sceneState.index;
        return (
            <MenuBox width={240} isVisible={isVisible}>
                <div className="menu-annex-box" style={{ outline: 0 }}>
                    <div className="menu-title-line-box">
                        <div className="menu-title-line">
                            <div className="menu-title-text-box">
                                Preview
                            </div>
                            <div className="menu-title-left">
                                <div onClick={this.addPage} className="menu-head-btn">
                                    <img src={addPage} alt={"addPage"}/>
                                </div>
                                <div className="menu-head-btn" style={{marginLeft: 8}}
                                     onClick={() => handlePreviewState(false)}>
                                    <img src={close} alt={"close"}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{height: 64}}/>
                    <div className="menu-annex-body">
                        {this.renderPreviewCells(scenes, activeIndex, sceneDir)}
                    </div>
                </div>
            </MenuBox>
        );
    }
}

export type PageImageProps = { path: string, room: Room };

class PageImage extends React.Component<PageImageProps, {}> {

    private ref = React.createRef<HTMLDivElement>()

    public componentDidMount(): void {
        const { room } = this.props;
        window.setTimeout(() => {
            this.syncPreview();
        });
        room.callbacks.on("onRoomStateChanged", (): void => {
            if (room.state.sceneState.scenePath === this.props.path && this.ref.current) {
                this.syncPreview();
            }
        });
    }

    public componentDidUpdate(prevProps: PageImageProps): void {
        if (prevProps.path !== this.props.path) {
            this.syncPreview();
        }
    }

    public render(): React.ReactNode {
        return <div className="ppt-image" ref={this.ref}/>;
    }

    private syncPreview(): void {
        if (this.ref.current) {
            this.props.room.scenePreview(this.props.path, this.ref.current, 208, 156);
            this.ref.current.dataset.path = this.props.path;
        }
    }
}

export default PreviewController;
