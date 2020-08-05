import * as React from "react";
import close from "./image/close.svg";
import add_icon from "./image/add_icon.svg";
import TweenOne from "rc-tween-one";
import {Room, WhiteScene, RoomState} from "white-web-sdk";
import "./MenuAnnexBox.less";

export type MenuAnnexBoxState = {
    isFocus: boolean;
    roomState: RoomState;
    hoverCellIndex: number | null;
};

export type MenuAnnexBoxProps = {
    room: Room;
    handleAnnexBoxMenuState: () => void;
};

class MenuAnnexBox extends React.Component<MenuAnnexBoxProps, MenuAnnexBoxState> {

    private ref: HTMLDivElement | null = null;

    public constructor(props: MenuAnnexBoxProps) {
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

    private renderClose = (index: number, isActive: boolean): React.ReactNode => {
        if (index === this.state.hoverCellIndex || isActive) {
            return (
                <TweenOne
                    animation={[
                        {
                            scale: 1,
                            duration: 200,
                            ease: "easeInOutQuart",
                        },
                    ]}
                    style={{
                        transform: "scale(0)",
                    }}
                    className="page-box-inner-index-delete" onClick={() => this.removeScene()}>
                    <img className="menu-title-close-icon" src={close}/>
                </TweenOne>
            );
        } else {
            return null;
        }
    }

    private setRef(ref: HTMLDivElement | null): void {
        this.ref = ref;
    }

    private renderPreviewCellS = (scenes: ReadonlyArray<WhiteScene>, activeIndex: number, sceneDir: any): React.ReactNode => {
        const nodes: React.ReactNode = scenes.map((scene, index) => {
            const isActive = index === activeIndex;
            return <div
                key={index}
                className={isActive ? "page-out-box-active" : "page-out-box"}
                onMouseEnter={() => this.setState({hoverCellIndex: index})}
                onMouseLeave={() => this.setState({hoverCellIndex: null})}
            >
                <div className="page-box-inner-index-left">{index + 1}</div>
                <div
                    onFocus={() => this.setState({isFocus: true})}
                    onBlur={() => this.setState({isFocus: false})}
                    onClick={() => {
                        this.setScenePath(index);
                    }} className="page-mid-box">
                    <div className="page-box">
                        <PageImage
                            scene={scene}
                            room={this.props.room}
                            path={sceneDir.concat(scene.name).join("/")}/>
                    </div>
                </div>
                <div className="page-box-inner-index-delete-box">
                    {this.renderClose(index, isActive)}
                </div>
            </div>;
        });
        return (
            <div style={{height: "calc(100vh - 84px)"}}>
                {nodes}
            </div>
        );
    }


    public render(): React.ReactNode {
        const {roomState} = this.state;
        const scenes = roomState.sceneState.scenes;
        const sceneDir = roomState.sceneState.scenePath.split("/");
        sceneDir.pop();
        const activeIndex = roomState.sceneState.index;
        return (
            <div
                ref={this.setRef.bind(this)} className="menu-annex-box">
                <div className="menu-title-line">
                    <div className="menu-title-text-box">
                        Preview
                    </div>
                    <div className="menu-close-btn" onClick={this.props.handleAnnexBoxMenuState}>
                        <img className="menu-title-close-icon" src={close}/>
                    </div>
                </div>
                <div style={{height: 42}}/>
                {this.renderPreviewCellS(scenes, activeIndex, sceneDir)}
                <div style={{height: 42}}/>
                <div className="menu-under-btn">
                    <div
                        className="menu-under-btn-inner"
                        onClick={() => {
                            const {room} = this.props;
                            const activeIndex = roomState.sceneState.index;
                            const newSceneIndex = activeIndex + 1;
                            const scenePath = roomState.sceneState.scenePath;
                            const pathName = this.pathName(scenePath);
                            room.putScenes(`/${pathName}`, [{}], newSceneIndex);
                            room.setSceneIndex(newSceneIndex);
                        }}
                    >
                        <img src={add_icon}/>
                        <div>
                            Add a page
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export type PageImageProps = { scene: WhiteScene, path: string, room: Room};

class PageImage extends React.Component<PageImageProps, {}> {

    private ref?: HTMLDivElement | null;

    public constructor(props: any) {
        super(props);
    }
    private setupDivRef = (ref: HTMLDivElement | null) => {
        if (ref) {
            this.ref = ref;
            this.props.room.scenePreview(this.props.path, ref, 192, 112.5);
        }
    }

    public render(): React.ReactNode {
        return <div className="ppt-image" ref={this.setupDivRef.bind(this)}/>;
    }
}

export default MenuAnnexBox;