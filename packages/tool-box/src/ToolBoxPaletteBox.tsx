import * as React from "react";
import  "./ToolBoxPaletteBox.less";
import { Room, RoomState} from "white-web-sdk";
import toolPaletteConfig from "./ToolPaletteConfig";
import mask from "./image/mask.svg";
export type ToolBoxPaletteBoxProps = {
    displayStroke: boolean;
    room: Room;
    roomState: RoomState;
};

export type ToolBoxPaletteBoxStates = {
    borderColor: string;
    percentage: number;
};


export default class ToolBoxPaletteBox extends React.Component<ToolBoxPaletteBoxProps, ToolBoxPaletteBoxStates> {

    public constructor(props: ToolBoxPaletteBoxProps) {
        super(props);
        this.state = {
            borderColor: "#FFFFF",
            percentage: 0.125,
        };
    }

    private setStrokeWidth = (event: any): void => {
        const {room} = this.props;
        const percentage = event.target.value / 32;
        const strokeWidth = parseInt(event.target.value);
        this.setState({percentage: percentage});
        room.setMemberState({strokeWidth: strokeWidth});
    }

    private hexToRgb = (hex: string): any => {
        const rgb: number[] = [];
        hex = hex.substr(1);
        if (hex.length === 3) {
            hex = hex.replace(/(.)/g, "$1$1");
        }
        hex.replace(/../g, (color: any): any => {
            rgb.push(parseInt(color, 0x10));
        });
        return rgb;
    }

    private selectColor = (newColor: any): void => {
        const {room} = this.props;
        room.setMemberState({strokeColor: newColor});
    }

    private isMatchColor(color: any): boolean {
        const {strokeColor} = this.props.roomState.memberState;
        return (
            strokeColor[0] === color[0] &&
            strokeColor[1] === color[1] &&
            strokeColor[2] === color[2]
        );
    }

    private renderColor = (): React.ReactNode => {
        const colorCell = toolPaletteConfig.map((data, index) => {
            const newColor = this.hexToRgb(data);
            return (
               <div className="cell-mid-color" key={`color-${index}`} style={{borderColor: this.isMatchColor(newColor) ? "#106BC5" : "#FFFFFF"}}>
                   <div onClick={() => this.selectColor(newColor)}
                        className="cell-color" style={{backgroundColor: data}}>
                   </div>
               </div>
            );
        });
        return (
            <div className="cell-box">
                {colorCell}
            </div>
        );
    }

    private renderStrokeWidth = (): React.ReactNode => {
        const {room, roomState, displayStroke} = this.props;
        if (!displayStroke) {
            return null;
        }
        return [
            <div key={"key-color"} className="tool-box-stroke-box">
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
                    <img src={mask}/>
                </div>
                <div className="tool-box-under-box-2" style={{width: 156 * this.state.percentage}}/>
                <div className="tool-box-under-box"/>
            </div>,
            <div key="key-script" className="stroke-script">
                <div className="stroke-script-text">细</div>
                <div className="stroke-script-text">粗</div>
            </div>,
            <div key="key-cut-line" style={{width: 156, height: 1, backgroundColor: "#E7E7E7"}}/>
        ];
    }

    public render(): React.ReactNode {
        return (
            <div className="palette-box">
                {this.renderStrokeWidth()}
                {this.renderColor()}
            </div>
        );
    }
}