import * as React from "react";
import {ApplianceNames, Room, RoomState} from "white-web-sdk";
import {Popover} from "antd";
import "./index.less";
import * as selector from "./image/selector.svg";
import * as selectorActive from "./image/selector-active.svg";
import * as pen from "./image/pencil.svg";
import * as penActive from "./image/pencil-active.svg";
import * as text from "./image/text.svg";
import * as textActive from "./image/text-active.svg";
import * as eraser from "./image/eraser.svg";
import * as eraserActive from "./image/eraser-active.svg";
import * as ellipse from "./image/ellipse.svg";
import * as ellipseActive from "./image/ellipse-active.svg";
import * as rectangle from "./image/rectangle.svg";
import * as rectangleActive from "./image/rectangle-active.svg";
import * as straight from "./image/straight.svg";
import * as straightActive from "./image/straight-active.svg";
import * as arrow from "./image/arrow.svg";
import * as arrowActive from "./image/arrow-active.svg";
import * as laserPointer from "./image/laserPointer.svg";
import * as laserPointerActive from "./image/laserPointer-active.svg";
import * as hand from "./image/hand.svg";
import * as handActive from "./image/hand-active.svg";
import ToolBoxPaletteBox from "./ToolBoxPaletteBox";

export type ToolBoxProps = {
    room: Room;
};
export type ToolBoxStates = {
    strokeEnable: boolean;
    extendsPanel: boolean;
    roomState: RoomState;
};
type ApplianceDescription = {
    readonly icon: string;
    readonly iconActive: string;
    readonly hasColor: boolean;
    readonly hasStroke: boolean;
};
export default class ToolBox extends React.Component<ToolBoxProps, ToolBoxStates> {
    private static readonly descriptions: { readonly [applianceName: string]: ApplianceDescription } = Object.freeze({
        selector: Object.freeze({
            icon: selector,
            iconActive: selectorActive,
            hasColor: false,
            hasStroke: false,
        }),
        pencil: Object.freeze({
            icon: pen,
            iconActive: penActive,
            hasColor: true,
            hasStroke: true,
        }),
        text: Object.freeze({
            icon: text,
            iconActive: textActive,
            hasColor: true,
            hasStroke: false,
        }),
        eraser: Object.freeze({
            icon: eraser,
            iconActive: eraserActive,
            hasColor: false,
            hasStroke: false,
        }),
        ellipse: Object.freeze({
            icon: ellipse,
            iconActive: ellipseActive,
            hasColor: true,
            hasStroke: true,
        }),
        rectangle: Object.freeze({
            icon: rectangle,
            iconActive: rectangleActive,
            hasColor: true,
            hasStroke: true,
        }),
        straight: Object.freeze({
            icon: straight,
            iconActive: straightActive,
            hasColor: true,
            hasStroke: true,
        }),
        arrow: Object.freeze({
            icon: arrow,
            iconActive: arrowActive,
            hasColor: true,
            hasStroke: false,
        }),
        laserPointer: Object.freeze({
            icon: laserPointer,
            iconActive: laserPointerActive,
            hasColor: false,
            hasStroke: false,
        }),
        hand: Object.freeze({
            icon: hand,
            iconActive: handActive,
            hasColor: false,
            hasStroke: false,
        }),
    });

    public constructor(props: ToolBoxProps) {
        super(props);
        this.state = {
            strokeEnable: false,
            extendsPanel: false,
            roomState: props.room.state,
        };
    }

    public componentDidMount(): void {
        const {room} = this.props;
        room.callbacks.on("onRoomStateChanged", (modifyState: Partial<RoomState>): void => {
            this.setState({roomState: {...room.state, ...modifyState}});
        });
    }
    public clickAppliance = (eventTarget: any, applianceName: ApplianceNames): void => {
        const {room} = this.props;
        eventTarget.preventDefault();
        room.setMemberState({currentApplianceName: applianceName});
        this.setState({extendsPanel: true});
    }
    private onVisibleChange = (visible: boolean): void => {
        if (!visible) {
            this.setState({extendsPanel: false});
        }
    }

    private renderApplianceButton(applianceName: ApplianceNames, description: ApplianceDescription): React.ReactNode {
        const {roomState} = this.state;
        const isSelected = roomState.memberState.currentApplianceName === applianceName;
        const isExtendable = description.hasStroke || description.hasColor;
        const iconUrl = isSelected ? description.iconActive : description.icon;
        const cell = (
            <div key={`${applianceName}`} className="tool-box-cell-box-left">
                <div className="tool-box-cell"
                     onClick={(event) => this.clickAppliance(event, applianceName)}>
                    <img src={iconUrl}/>
                </div>
            </div>
        );
        if (isExtendable && isSelected) {
            return (
                <Popover key={applianceName}
                         visible={this.state.extendsPanel}
                         placement={"right"}
                         trigger="click"
                         onVisibleChange={this.onVisibleChange}
                         content={this.renderToolBoxPaletteBox(description)}>
                    {cell}
                </Popover>
            );
        } else {
            return cell;
        }
    }

    private renderToolBoxPaletteBox(description: ApplianceDescription): React.ReactNode {
        const {room} = this.props;
        const {roomState} = this.state;
        return (
            <ToolBoxPaletteBox room={room}
                               roomState={roomState}
                               displayStroke={description.hasStroke}/>
        );
    }

    public render(): React.ReactNode {
        const nodes: React.ReactNode[] = [];
        for (const applianceName in ToolBox.descriptions) {
            const description = ToolBox.descriptions[applianceName];
            const node = this.renderApplianceButton(applianceName as ApplianceNames, description);
            nodes.push(node);
        }
        return (
            <div className="tool-mid-box-left">
                {nodes}
            </div>
        );
    }
}

