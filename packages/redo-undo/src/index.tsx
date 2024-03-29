import * as React from "react";
import {Room} from "white-web-sdk";
import * as redo from "./image/redo.svg";
import * as undo from "./image/undo.svg";
import * as redoDisabled from "./image/redo-disabled.svg";
import * as undoDisabled from "./image/undo-disabled.svg";
import "./index.less";
export type RedoUndoProps = {
    room: Room;
};
export type RedoUndoStates = {
    undoSteps: number;
    redoSteps: number;
};
export default class RedoUndo extends React.Component<RedoUndoProps, RedoUndoStates> {
    public constructor(props: RedoUndoProps) {
        super(props);
        this.state = {
            undoSteps: 0,
            redoSteps: 0,
        };
    }
    public componentDidMount(): void {
        const {room} = this.props;
        if (room.isWritable) {
            room.disableSerialization = false;
        }
        room.callbacks.on("onCanUndoStepsUpdate", this.setUndoSteps);
        room.callbacks.on("onCanRedoStepsUpdate", this.setRedoSteps);
    }

    public componentWillUnmount(): void {
        const {room} = this.props;
        room.callbacks.off("onCanUndoStepsUpdate", this.setUndoSteps);
        room.callbacks.off("onCanRedoStepsUpdate", this.setRedoSteps);
    }

    private setUndoSteps = (steps: number): void => {
        this.setState({
            undoSteps: steps,
        });
    }

    private setRedoSteps = (steps: number): void => {
        this.setState({
            redoSteps: steps,
        });
    }

    private handleUndo = (): void => {
        const {room} = this.props;
        room.undo();
    }

    private handleRedo = (): void => {
        const {room} = this.props;
        room.redo();
    }

    public render(): React.ReactNode {
        const {redoSteps, undoSteps} = this.state;
        return (
            <div className="redo-undo">
                <div className="redo-undo-controller-btn " onClick={this.handleUndo}>
                    <img src={undoSteps === 0 ? undoDisabled : undo} alt={"undo"}/>
                </div>
                <div className="redo-undo-controller-btn" onClick={this.handleRedo}>
                    <img src={redoSteps === 0 ? redoDisabled : redo} alt={"redo"}/>
                </div>
            </div>
        );
    }
}

