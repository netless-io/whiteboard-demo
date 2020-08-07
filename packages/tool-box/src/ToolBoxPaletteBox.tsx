import * as React from "react";
import  "./ToolBoxPaletteBox.less";
import { Room, RoomState} from "white-web-sdk";
import {StrokeWidth} from "./ToolIconComponent";
export type ToolBoxPaletteBoxProps = {
    displayStroke: boolean;
    room: Room;
    roomState: RoomState;
};


export default class ToolBoxPaletteBox extends React.Component<ToolBoxPaletteBoxProps, {}> {

    public constructor(props: ToolBoxPaletteBoxProps) {
        super(props);
    }

    private setStrokeWidth(event: Event): void {
        const {room} = this.props;
        const strokeWidth = parseInt((event.target as any).value);
        room.setMemberState({strokeWidth: strokeWidth});
    }

    public render(): React.ReactNode {
        return (
            <div className="palette-mid-box">
                {this.props.displayStroke && this.renderStrokeSelector()}
                {this.renderColorSelector()}
            </div>
        );
    }

    private renderColorSelector = (): React.ReactNode => {
        return [
            <div key="title" className="palette-title-one">
                Color
            </div>,
            <div key="cells" className="palette-color-box">
            </div>,
        ];
    }

    private renderStrokeSelector(): React.ReactNode {
        const {roomState, room} = this.props;
        const [r, g, b] = roomState.memberState.strokeColor;
        return [
            <div key="title" className="palette-title-two">Width</div>,
            <div key="box" className="palette-stroke-width-box">
                <StrokeWidth
                    className="palette-stroke-under-layer"
                    color={`rgb(${r},${g},${b})`}/>
                <div className="palette-stroke-slider-mask">
                    <input className="palette-stroke-slider"
                           type="range"
                           min={2}
                           max={32}
                           onChange={this.setStrokeWidth.bind(this)}
                           defaultValue={`${roomState.memberState.strokeWidth}`}
                           onMouseUp={
                               () => room.setMemberState({strokeWidth: roomState.memberState.strokeWidth})
                           }/>
                </div>
            </div>,
        ];
    }
}