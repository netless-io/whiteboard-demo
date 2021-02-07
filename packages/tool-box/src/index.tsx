import * as React from "react";
import {ApplianceNames, Room, RoomState} from "white-web-sdk";
import {Popover, Tooltip} from "antd";
import "./index.less";
import * as selector from "./image/selector.svg";
import * as selectorActive from "./image/selector-active.svg";
import * as pen from "./image/pencil.svg";
import * as penActive from "./image/pencil-active.svg";
import * as text from "./image/text.svg";
import * as textActive from "./image/text-active.svg";
import * as eraser from "./image/eraser.svg";
import * as eraserActive from "./image/eraser-active.svg";
import * as arrow from "./image/arrow.svg";
import * as arrowActive from "./image/arrow-active.svg";
import * as laserPointer from "./image/laserPointer.svg";
import * as laserPointerActive from "./image/laserPointer-active.svg";
import * as hand from "./image/hand.svg";
import * as handActive from "./image/hand-active.svg";
import * as ellipse from "./image/ellipse.svg";
import * as ellipseActive from "./image/ellipse-active.svg";
import * as rectangle from "./image/rectangle.svg";
import * as rectangleActive from "./image/rectangle-active.svg";
import * as straight from "./image/straight.svg";
import * as straightActive from "./image/straight-active.svg";

import ToolBoxPaletteBox from "./ToolBoxPaletteBox";

export type ToolBoxProps = {
    room: Room;
    customerComponent?: React.ReactNode[];
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
    readonly hasTool: boolean;
};
export default class ToolBox extends React.Component<ToolBoxProps, ToolBoxStates> {
    private static readonly descriptions: { readonly [applianceName: string]: ApplianceDescription } = Object.freeze({
        selector: Object.freeze({
            icon: selector,
            iconActive: selectorActive,
            hasColor: false,
            hasStroke: false,
            hasTool: false,
        }),
        pencil: Object.freeze({
            icon: pen,
            iconActive: penActive,
            hasColor: true,
            hasStroke: true,
            hasTool: true,
        }),
        text: Object.freeze({
            icon: text,
            iconActive: textActive,
            hasColor: true,
            hasStroke: false,
            hasTool: false,
        }),
        eraser: Object.freeze({
            icon: eraser,
            iconActive: eraserActive,
            hasColor: false,
            hasStroke: false,
            hasTool: false,
        }),
        ellipse: Object.freeze({
            icon: ellipse,
            iconActive: ellipseActive,
            hasColor: true,
            hasStroke: true,
            hasTool: true,
        }),
        rectangle: Object.freeze({
            icon: rectangle,
            iconActive: rectangleActive,
            hasColor: true,
            hasStroke: true,
            hasTool: true,
        }),
        straight: Object.freeze({
            icon: straight,
            iconActive: straightActive,
            hasColor: true,
            hasStroke: true,
            hasTool: true,
        }),
        arrow: Object.freeze({
            icon: arrow,
            iconActive: arrowActive,
            hasColor: true,
            hasStroke: true,
            hasTool: false,
        }),
        laserPointer: Object.freeze({
            icon: laserPointer,
            iconActive: laserPointerActive,
            hasColor: false,
            hasStroke: false,
            hasTool: false,
        }),
        hand: Object.freeze({
            icon: hand,
            iconActive: handActive,
            hasColor: false,
            hasStroke: false,
            hasTool: false,
        }),
    });

    private currentDraw: ApplianceNames = ApplianceNames.pencil;

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

    public clickAppliance = (applianceName: ApplianceNames): void => {
        const {room} = this.props;
        room.setMemberState({currentApplianceName: applianceName});
        this.setState({extendsPanel: true});
    }

    public clickDrawAppliance = (applianceName: ApplianceNames): void => {
        const {room} = this.props;
        room.setMemberState({currentApplianceName: applianceName});
    }
    private onVisibleChange = (visible: boolean): void => {
        if (!visible) {
            this.setState({extendsPanel: false});
        }
    }

    private renderApplianceButton(applianceName: ApplianceNames, description: ApplianceDescription): React.ReactElement {
        const {roomState} = this.state;
        const currentApplianceName = roomState.memberState.currentApplianceName;
        const isSelected = currentApplianceName === applianceName;
        const isExtendable = description.hasStroke || description.hasColor;
        const iconUrl = isSelected ? description.iconActive : description.icon;
        const cell = (
            <div key={`${applianceName}`} className="tool-box-cell-box-left">
                <div className="tool-box-cell"
                     onClick={(event) => this.clickAppliance(applianceName)}>
                    <img src={iconUrl} alt={"iconUrl"}/>
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
                    <Tooltip placement={"right"} title={applianceName}>
                        {cell}
                    </Tooltip>
                </Popover>
            );
        } else {
            return (
                <Tooltip placement={"right"} key={applianceName} title={applianceName}>
                    {cell}
                </Tooltip>
            );
        }
    }

    private renderDrawButton = (applianceName: ApplianceNames, description: ApplianceDescription): React.ReactElement => {
        const {roomState} = this.state;
        const currentApplianceName = roomState.memberState.currentApplianceName;
        const isSelected = currentApplianceName === applianceName;
        const isExtendable = description.hasStroke || description.hasColor;
        const iconUrl = isSelected ? description.iconActive : description.icon;
        const cell = (
            <div key={`${applianceName}`} className="tool-box-cell-box-left">
                <div className="tool-box-cell"
                     onClick={(event) => this.clickAppliance(applianceName)}>
                    <img src={iconUrl} alt={"iconUrl"}/>
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
                    <Tooltip placement={"right"} title={applianceName}>
                        {cell}
                    </Tooltip>
                </Popover>
            );
        } else {
            return (
                <Tooltip placement={"right"} key={applianceName} title={applianceName}>
                    {cell}
                </Tooltip>
            );
        }
    }

    private renderToolBoxPaletteBox(description: ApplianceDescription): React.ReactNode {
        const {room} = this.props;
        const {roomState} = this.state;
        return (
            <ToolBoxPaletteBox room={room}
                               roomState={roomState}
                               selectAppliance={this.clickDrawAppliance}
                               displaySelectAppliance={description.hasTool}
                               displayStroke={description.hasStroke}/>
        );
    }

    private addCustomerComponent = (nodes: React.ReactNode[]): React.ReactNode[] => {
        if (this.props.customerComponent) {
            const customerNodes = this.props.customerComponent.map((data: React.ReactNode, index: number) => {
                return <div key={`tool-customer-${index}`}>{data}</div>;
            });
            nodes.push(customerNodes);
            return nodes;
        } else {
            return nodes;
        }
    }

    private renderNodes = (): React.ReactNode[] => {
        const nodes: React.ReactNode[] = [];
        let drawNode = this.renderDrawButton(this.currentDraw as ApplianceNames, ToolBox.descriptions[this.currentDraw]);
        const {roomState} = this.state;
        const currentApplianceName = roomState.memberState.currentApplianceName;
        for (const applianceName in ToolBox.descriptions) {
            const description = ToolBox.descriptions[applianceName];
            if (applianceName === ApplianceNames.pencil || applianceName === ApplianceNames.ellipse ||
                applianceName === ApplianceNames.rectangle || applianceName === ApplianceNames.straight ) {
                if (currentApplianceName === applianceName) {
                    drawNode = this.renderDrawButton(applianceName as ApplianceNames, description);
                    this.currentDraw = applianceName;
                }
            } else {
                const node = this.renderDrawButton(applianceName as ApplianceNames, description);
                nodes.push(node);
            }
        }
        nodes.splice(1, 0, drawNode);
        return nodes
    }

    public render(): React.ReactNode {
        const nodes = this.renderNodes();
        return (
            <div className="tool-mid-box-left">
                {this.addCustomerComponent(nodes)}
            </div>
        );
    }
}

