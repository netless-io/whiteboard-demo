import * as React from "react";
import "./ColorTool.less";
import toolPaletteConfig from "./ToolPaletteConfig";
import {Color, Room, RoomState} from "white-web-sdk";

export type ColorToolProps = {
    room: Room,
    roomState: RoomState,
}

export default class ColorTool extends React.PureComponent<ColorToolProps> {

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

    private componentToHex = (c: number): string =>  {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    private rgbToHex = (rgb: Color): string => {
        return "#" +this.componentToHex(rgb[0]) + this.componentToHex(rgb[1]) + this.componentToHex(rgb[2]);
    }

    public render(): React.ReactNode {
        const {room} = this.props;
        const strokeColor = room.state.memberState.strokeColor;
        const colorCell = toolPaletteConfig.map((data, index) => {
            const newColor = this.hexToRgb(data);
            return (
                <div className="cell-mid-color" key={`color-${index}`}
                     style={{borderColor: this.isMatchColor(newColor) ? this.rgbToHex(strokeColor) : "#FFFFFF"}}>
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
}
