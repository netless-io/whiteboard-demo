import * as React from "react";
import {Room, RoomState} from "white-web-sdk";
import {ProjectorPlugin} from "@netless/projector-plugin";
import * as next from "./image/next.svg";
import * as nextDisabled from "./image/next-disabled.svg";
import * as back from "./image/back.svg";
import * as backDisabled from "./image/back-disable.svg";
import * as first from "./image/first-active.svg";
import * as firstDisabled from "./image/first-disable.svg";
import * as last from "./image/last-active.svg";
import * as lastDisabled from "./image/last-disable.svg";
import "./index.less";

export type PageControllerProps = {
    room: Room;
    pptPlugin?: ProjectorPlugin;
}
;
export type PageControllerStates = {
    roomState: RoomState;
};

export default class PageController extends React.Component<PageControllerProps, PageControllerStates> {

    private page: number = 0;

    public constructor(props: PageControllerProps) {
        super(props);
        this.state = {
            roomState: props.room.state,
        };
    }

    public componentDidMount(): void {
        const {room} = this.props;
        this.page = room.state.sceneState.index;
        room.callbacks.on("onRoomStateChanged", this.onRoomStateChanged);
    }

    private onRoomStateChanged = (modifyState: Partial<RoomState>): void => {
        this.setState({roomState: {...this.props.room.state, ...modifyState}});
    }

    public componentWillUnmount(): void {
        const {room} = this.props;
        room.callbacks.off("onRoomStateChanged", this.onRoomStateChanged);
    }

    private handlePptPreviousStep = async (): Promise<void> => {
        const {room, pptPlugin} = this.props;
        const scenePath = this.props.room.state.sceneState.scenePath;
        if (scenePath.includes('projector-plugin') && pptPlugin) {
            pptPlugin.prevStep();
        } else {
            room.pptPreviousStep();
        }
    }

    private handlePptNextStep = async (): Promise<void> => {
        const {room, pptPlugin} = this.props;
        const scenePath = this.props.room.state.sceneState.scenePath;
        if (scenePath.includes('projector-plugin') && pptPlugin) {
            pptPlugin.nextStep();
        } else {
            room.pptNextStep();
        }
    }

    private pageNumber = (): React.ReactNode => {
        const {roomState} = this.state;
        const {room} = this.props;
        const activeIndex = roomState.sceneState.index;
        if (this.page !== activeIndex) {
            this.page = activeIndex;
            room.scalePptToFit();
        }
        const scenes = roomState.sceneState.scenes;
        return (
            <div className="whiteboard-annex-arrow-page">
                {activeIndex + 1} / {scenes.length}
            </div>
        );
    }

    private isFirst = (): boolean => {
        const {roomState} = this.state;
        const activeIndex = roomState.sceneState.index;
        return activeIndex === 0;
    }

    private isLast = (): boolean => {
        const {roomState} = this.state;
        const activeIndex = roomState.sceneState.index;
        const lastIndex = roomState.sceneState.scenes.length - 1;
        return activeIndex === lastIndex;
    }

    private renderSlideIndex = async (slideIndex: number, fallback: (index: number) => void) => {
        const { pptPlugin } = this.props;
        if (!pptPlugin) {
            return;
        }
        const { roomState } = this.state;
        const scenePath = roomState.sceneState.scenePath;
        if (scenePath.includes('projector-plugin')) {
            const taskId = scenePath.split('/')[2];
            const pageList = await pptPlugin.listSlidePreviews(taskId);
            if (slideIndex <= pageList.length) {
                await pptPlugin.renderSlidePage(slideIndex);
                return;
            }
        }
        fallback(slideIndex - 1)
    }

    private setLastStep = async (): Promise<void> => {
        const { room } = this.props;
        const { roomState } = this.state;
        const lastIndex = roomState.sceneState.scenes.length - 1;
        await this.renderSlideIndex(lastIndex + 1, (index) => {
            room.setSceneIndex(index);
        });
    }

    private setFirstStep = async (): Promise<void> => {
        const {room} = this.props;
        await this.renderSlideIndex(1, (index) => {
            room.setSceneIndex(index);
        });
    }

    public render(): React.ReactNode {
        return (
            <div className="whiteboard-annex-box">
                <div onClick={() => this.setFirstStep()}
                     className="whiteboard-annex-arrow">
                    <img src={this.isFirst() ? firstDisabled : first} alt={"first"}/>
                </div>
                <div onClick={() => this.handlePptPreviousStep()}
                     className="whiteboard-annex-arrow">
                    <img src={this.isFirst() ? backDisabled : back} alt={"back"}/>
                </div>
                {this.pageNumber()}
                <div onClick={() => this.handlePptNextStep()}
                     className="whiteboard-annex-arrow">
                    <img src={this.isLast() ? nextDisabled : next} alt={"next"}/>
                </div>
                <div onClick={() => this.setLastStep()}
                     className="whiteboard-annex-arrow">
                    <img src={this.isLast() ? lastDisabled : last} alt={"last"}/>
                </div>
            </div>
        );
    }
}
