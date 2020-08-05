import * as React from "react";
import {Room, RoomState} from "white-web-sdk";
import "./index.less";

export type PageControllerProps = {
    room: Room;
}
;
export type PageControllerStates = {
    roomState: RoomState;
    isVisible: boolean;
};

export default class PageController extends React.Component<PageControllerProps, PageControllerStates> {


    public constructor(props: PageControllerProps) {
        super(props);
        this.state = {
            roomState: props.room.state,
            isVisible: false,
        };
    }

    public componentDidMount(): void {
        const {room} = this.props;
        room.callbacks.on("onRoomStateChanged", (modifyState: Partial<RoomState>): void => {
            this.setState({roomState: {...room.state, ...modifyState}});
        });
    }

    private handlePptPreviousStep = async (): Promise<void> => {
        const {room} = this.props;
        room.pptPreviousStep();
    }
    private handlePptNextStep = async (): Promise<void> => {
        const {room} = this.props;
        room.pptNextStep();
    }
    private pageNumber = (): React.ReactNode => {
        const {roomState} = this.state;
        const activeIndex = roomState.sceneState.index;
        const scenes = roomState.sceneState.scenes;
        return (
            <div onClick={() => {
                this.setState({isVisible: !this.state.isVisible})
            }} className="whiteboard-annex-arrow-mid">
                <div className="whiteboard-annex-arrow-page">
                    {activeIndex + 1} / {scenes.length}
                </div>
            </div>
        );
    }

    public render(): React.ReactNode {
        return (
            <div className="whiteboard-annex-outbox">
                <div className="whiteboard-annex-box">
                    <div onClick={() => this.handlePptPreviousStep()}
                         className="whiteboard-annex-arrow-left">
                    </div>
                    {this.pageNumber()}
                    <div onClick={() => this.handlePptNextStep()}
                         className="whiteboard-annex-arrow-right">
                    </div>
                </div>
            </div>
        );
    }
}
