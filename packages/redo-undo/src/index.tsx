import * as React from "react";
import {Room} from "white-web-sdk";
import * as redo from "./image/redo.svg";
import * as undo from "./image/undo.svg";
import * as redo_black from "./image/redo_black.svg";
import * as undo_black from "./image/undo_black.svg";
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
        room.disableSerialization = false;
        room.callbacks.on("onCanUndoStepsUpdate", (steps: number): void => {
            this.setState({
                undoSteps: steps,
            });
        });
        room.callbacks.on("onCanRedoStepsUpdate", (steps: number): void => {
            this.setState({
                redoSteps: steps,
            });
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
                <div className="scale-controller-btn" onClick={this.handleUndo}>
                    <img style={{width: 16}} src={undoSteps === 0 ? undo : undo_black}/>
                </div>
                <div className="scale-controller-btn" onClick={this.handleRedo}>
                    <img style={{width: 16}} src={redoSteps === 0 ? redo : redo_black}/>
                </div>
            </div>
        );
    }
}

