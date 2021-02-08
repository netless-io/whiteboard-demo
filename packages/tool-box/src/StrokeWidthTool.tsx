import * as React from "react";
import "./StrokeWidthTool.less";
import { Color, Room, RoomState} from "white-web-sdk";
import mask from "./image/mask.svg";

export type StrokeWidthToolProps = {
    room: Room;
    roomState: RoomState;
};

export type StrokeWidthToolStates = {
    percentage: number;
};



export default class StrokeWidthTool extends React.PureComponent<StrokeWidthToolProps, StrokeWidthToolStates> {
    public constructor(props: StrokeWidthToolProps) {
        super(props);
        this.state = {
            percentage: props.room.state.memberState.strokeWidth / 32,
        };
    }

    private rgbToHex = (rgb: Color): string => {
        return "#" +this.componentToHex(rgb[0]) + this.componentToHex(rgb[1]) + this.componentToHex(rgb[2]);
    }

    private setStrokeWidth = (event: any): void => {
        const {room} = this.props;
        const percentage = event.target.value / 32;
        const strokeWidth = parseInt(event.target.value);
        this.setState({percentage: percentage});
        room.setMemberState({strokeWidth: strokeWidth});
    }


    private componentToHex = (c: number): string =>  {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    public render(): React.ReactNode {
        const {room, roomState} = this.props;
        const strokeColor = room.state.memberState.strokeColor;
        return (
            <>
                <div className="tool-box-stroke-box">
                    <div className="tool-box-input-box">
                        <input className="palette-stroke-slider"
                               type="range"
                               min={1}
                               max={32}
                               onChange={this.setStrokeWidth}
                               defaultValue={roomState.memberState.strokeWidth}
                               onMouseUp={
                                   () => room.setMemberState({strokeWidth: roomState.memberState.strokeWidth})
                               }/>
                    </div>
                    <div className="tool-box-mask-box">
                        <img src={mask} alt={"mask"}/>
                    </div>
                    <div className="tool-box-under-box-2"
                         style={{
                             width: 156 * this.state.percentage,
                             backgroundColor: this.rgbToHex(strokeColor),
                         }}/>
                    <div className="tool-box-under-box"/>
                </div>
            </>
        );
    }
}
