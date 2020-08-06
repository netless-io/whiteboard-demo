import * as React from "react";
import {Room, RoomState} from "white-web-sdk";
import * as default_cover_home from "./image/default_cover_home.svg";
import * as close from "./image/close.svg";
import MenuBox, {PagePreviewPositionEnum} from "@netless/menu-box";
import "./index.less";

export type PPTDataType = {
    active: boolean,
    pptType: PPTType,
    id: string,
    data: any,
    cover?: string,
};

export enum PPTType {
    dynamic = "dynamic",
    static = "static",
    init = "init",
}

export type WhiteboardFileProps = {
    room: Room;
    isFileOpen: boolean;
};

export type WhiteboardFileStates = {
    roomState: RoomState;
    isFileOpen: boolean;
};

export default class Index extends React.Component<WhiteboardFileProps, WhiteboardFileStates> {

    public constructor(props: WhiteboardFileProps) {
        super(props);
        this.state = {
            roomState: props.room.state,
            isFileOpen: props.isFileOpen,
        };
    }

    public UNSAFE_componentWillReceiveProps(nextProps: Readonly<WhiteboardFileProps>, nextContext: any) {
        if (nextProps.isFileOpen !== this.state.isFileOpen) {
            this.setState({isFileOpen: nextProps.isFileOpen});
        }
    }

    private selectDoc = (id: string) => {
        // if (documentArray) {
        //     this.handleUpdateDocsState(id, documentArray);
        // }
    }

    private handleUpdateDocsState = (id: string, documentArray: PPTDataType[]): void => {
        const {room} = this.props;
        const {roomState} = this.state;
        const {uuid} = room;

        const activeData = documentArray.find(data => data.id === id)!;
        if ((roomState.globalState as any).documentArrayState) {
            const documentArrayState: { id: string, isHaveScenes: boolean }[] = (roomState.globalState as any).documentArrayState;
            const activeDoc = documentArrayState.find(doc => doc.id === id);
            if (activeDoc) {
                if (activeDoc.isHaveScenes) {
                    if (activeDoc.id === "init") {
                        room.setScenePath(`/init`);
                    } else {
                        room.setScenePath(`/${uuid}/${activeData.id}/1`);
                    }
                } else {
                    room.putScenes(`/${uuid}/${activeData.id}`, activeData.data);
                    room.setScenePath(`/${uuid}/${activeData.id}/1`);
                }
            }
        }
    }

    private renderDocCells = (documentArray: PPTDataType[]): React.ReactNode => {
        if (documentArray && documentArray.length > 0) {
            return documentArray.map(data => {
                if (data.pptType === PPTType.static) {
                    return <div
                        key={`${data.id}`}
                        onClick={() => this.selectDoc(data.id)}
                        className="menu-ppt-inner-cell">
                        <div
                            style={{backgroundColor: data.active ? "#f2f2f2" : "#ffffff"}}
                            className="menu-ppt-image-box">
                            <svg key="" width={144} height={104}>
                                <image
                                    width="100%"
                                    height="100%"
                                    xlinkHref={data.cover}
                                />
                            </svg>
                        </div>
                    </div>;
                } else if (data.pptType === PPTType.dynamic) {
                    return <div
                        key={`${data.id}`}
                        onClick={() => this.selectDoc(data.id)}
                        className="menu-ppt-inner-cell">
                        <div
                            style={{backgroundColor: data.active ? "#f2f2f2" : "#ffffff"}}
                            className="menu-ppt-image-box">
                            <div className="menu-ppt-image-box-inner">
                                <img src={data.cover}/>
                                <div>
                                    Dynamic PPT
                                </div>
                            </div>
                        </div>
                    </div>;
                } else {
                    return <div
                        key={`${data.id}`}
                        onClick={() => this.selectDoc(data.id)}
                        className="menu-ppt-inner-cell">
                        <div
                            style={{backgroundColor: data.active ? "#f2f2f2" : "#ffffff"}}
                            className="menu-ppt-image-box">
                            <div className="menu-ppt-image-box-inner">
                                <img src={default_cover_home}/>
                                <div>
                                    Home Docs
                                </div>
                            </div>
                        </div>
                    </div>;
                }
            });
        } else {
            return null;
        }
    }

    private handleClose = (): void => {
        this.setState({isFileOpen: !this.state.isFileOpen})
    }

    public render(): React.ReactNode {
        const {isFileOpen} = this.state;

        return (
            <MenuBox
                pagePreviewPosition={PagePreviewPositionEnum.left}
                isVisible={isFileOpen}
            >
                <div className="file-box">
                    <div className="chat-inner-box">
                        <div className="chat-box-title">
                            <div className="chat-box-name">
                                <span>Document</span>
                            </div>
                            <div className="chat-box-close" onClick={this.handleClose}>
                                <img src={close}/>
                            </div>
                        </div>
                        <div className="file-inner-box">
                            {/*{this.renderDocCells()}*/}
                        </div>
                    </div>
                </div>
            </MenuBox>
        );
    }
}