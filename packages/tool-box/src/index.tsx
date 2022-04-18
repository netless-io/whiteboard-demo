import * as React from "react";
import {ApplianceNames, Color, Room, RoomState} from "white-web-sdk";
import {Popover, Tooltip} from "antd";
import DrawTool from "./DrawTool";
import ColorTool from "./ColorTool";
import StrokeWidthTool from "./StrokeWidthTool";
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
import * as subscript from "./image/subscript.svg";
import * as subscriptActive from "./image/subscript-active.svg";
import * as clear from "./image/clear.svg";
import * as clearActive from "./image/clear-active.svg";
import * as click from "./image/click.svg";
import * as clickActive from "./image/click-active.svg";
import * as triangle from "./image/triangle.svg";
import * as triangleActive from "./image/triangle-active.svg";
import * as rhombus from "./image/rhombus.svg";
import * as rhombusActive from "./image/rhombus-active.svg";
import * as pentagram from "./image/pentagram.svg";
import * as pentagramActive from "./image/pentagram-active.svg";
import * as speechBalloon from "./image/speechBalloon.svg";
import * as speechBalloonActive from "./image/speechBalloon-active.svg";

export type ApplianceNamesString = `${ApplianceNames}`;

const zhCN: Record<ApplianceNamesString | "clear", string> = {
    [ApplianceNames.clicker]: "点击",
    [ApplianceNames.arrow]: "箭头",
    [ApplianceNames.ellipse]: "椭圆",
    [ApplianceNames.eraser]: "橡皮擦",
    [ApplianceNames.hand]: "抓手",
    [ApplianceNames.laserPointer]: "激光笔",
    [ApplianceNames.pencil]: "笔",
    [ApplianceNames.rectangle]: "矩形",
    [ApplianceNames.selector]: "选择",
    [ApplianceNames.shape]: "形状",
    [ApplianceNames.straight]: "直线",
    [ApplianceNames.text]: "文本",
    clear: "清屏",
};

export type ToolBoxProps = {
    room: Room;
    customerComponent?: React.ReactNode[];
    i18nLanguage?: string;
    hotkeys?: Record<ApplianceNamesString | "clear", string>;
};
export type ToolBoxStates = {
    strokeEnable: boolean;
    roomState: RoomState;
    isClearActive: boolean;
};
type ApplianceDescription = {
    readonly icon: string;
    readonly iconActive: string;
    readonly shapeType?: string;
};
export default class ToolBox extends React.Component<ToolBoxProps, ToolBoxStates> {
    public static readonly descriptions: { readonly [applianceName: string]: ApplianceDescription } = Object.freeze({
        clicker: Object.freeze({
            icon: click,
            iconActive: clickActive,
        }),
        selector: Object.freeze({
            icon: selector,
            iconActive: selectorActive,
        }),
        pencil: Object.freeze({
            icon: pen,
            iconActive: penActive,
        }),
        text: Object.freeze({
            icon: text,
            iconActive: textActive,
        }),
        shape_triangle: Object.freeze({
            icon: triangle,
            iconActive: triangleActive,
            shapeType: "triangle",
        }),
        shape_speechBalloon: Object.freeze({
            icon: speechBalloon,
            iconActive: speechBalloonActive,
            shapeType: "speechBalloon",
        }),
        shape_rhombus: Object.freeze({
            icon: rhombus,
            iconActive: rhombusActive,
            shapeType: "rhombus",
        }),
        shape_pentagram: Object.freeze({
            icon: pentagram,
            iconActive: pentagramActive,
            shapeType: "pentagram",
        }),
        eraser: Object.freeze({
            icon: eraser,
            iconActive: eraserActive,
        }),
        ellipse: Object.freeze({
            icon: ellipse,
            iconActive: ellipseActive,
        }),
        rectangle: Object.freeze({
            icon: rectangle,
            iconActive: rectangleActive,
        }),
        straight: Object.freeze({
            icon: straight,
            iconActive: straightActive,
        }),
        arrow: Object.freeze({
            icon: arrow,
            iconActive: arrowActive,
        }),
        laserPointer: Object.freeze({
            icon: laserPointer,
            iconActive: laserPointerActive,
        }),
        hand: Object.freeze({
            icon: hand,
            iconActive: handActive,
        }),
    });

    private currentDraw: string = ApplianceNames.pencil;
    private currentDrawShape: string = "rhombus";

    public constructor(props: ToolBoxProps) {
        super(props);
        this.state = {
            strokeEnable: false,
            roomState: props.room.state,
            isClearActive: false,
        };
    }

    private getShape = (shape: string): {applianceName: string, applianceShape: string} => {
        const applianceObj = shape.split("_");
        const applianceName = applianceObj[0];
        const applianceShape = applianceObj[1];
        return {
            applianceName: applianceName,
            applianceShape: applianceShape,
        }
    }

    public componentDidMount(): void {
        const {room} = this.props;
        room.callbacks.on("onRoomStateChanged", this.onRoomStateChanged);
    }

    public componentWillUnmount(): void {
        const {room} = this.props;
        room.callbacks.off("onRoomStateChanged", this.onRoomStateChanged);
    }

    private onRoomStateChanged = (modifyState: Partial<RoomState>): void => {
        const {room} = this.props;
        this.setState({roomState: {...room.state, ...modifyState}});
    }

    public clickAppliance = (applianceName: string, shapeType?: string): void => {
        const {room} = this.props;
        if (applianceName.split("").includes("_")) {
            const applianceObj = this.getShape(applianceName);
            room.setMemberState({
                currentApplianceName: applianceObj.applianceName as any,
                shapeType: applianceObj.applianceShape as any});
        } else {
            room.setMemberState({currentApplianceName: applianceName as any, shapeType: shapeType as any});
        }
    }

    private renderButton = (applianceName: string, description: ApplianceDescription): React.ReactElement => {

        const {roomState} = this.state;
        const currentApplianceName = roomState.memberState.currentApplianceName;
        const isSelected = currentApplianceName === applianceName;
        const iconUrl = isSelected ? description.iconActive : description.icon;
        const cell = (
            <div key={`${applianceName}`} className="tool-box-cell-box-left">
                <div className="tool-box-cell"
                     onClick={() => this.clickAppliance(applianceName)}>
                    <img src={iconUrl} alt={"iconUrl"}/>
                </div>
            </div>
        );
        return (
            <Tooltip placement={"right"} key={applianceName} title={this.getApplianceName(applianceName)}>
                {cell}
            </Tooltip>
        );
    }

    private addCustomerComponent = (nodes: React.ReactNode[]): React.ReactNode[] => {
        if (this.props.customerComponent) {
            const customerNodes = this.props.customerComponent.map((data: React.ReactNode, index: number) => {
                return <div key={`tool-customer-${index}`}>{data}</div>;
            });
            nodes.push(...customerNodes);
            return nodes;
        } else {
            return nodes;
        }
    }

    private isDraw = (applianceName: string): boolean => {
        if (applianceName.split("").includes("_")) {
            return true;
        } else {
            return applianceName === ApplianceNames.pencil || applianceName === ApplianceNames.ellipse ||
                applianceName === ApplianceNames.rectangle || applianceName === ApplianceNames.straight
        }
    }

    private getApplianceName(name: string): string {
        const hotkeys = this.props.hotkeys || {};
        let tooltip = "";
        if (this.props.i18nLanguage === "zh-CN" && zhCN[name]) {
            tooltip = zhCN[name];
        } else {
            if (name === ApplianceNames.hand) {
                tooltip = "Drag";
            } else {
                tooltip = name
                    .replace(/[A-Z]/g, (e) => ` ${e.toLowerCase()}`)
                    .split(" ")
                    .map((e) => e[0].toUpperCase() + e.substring(1))
                    .join(" ");
            }
        }
        if (hotkeys[name]) {
            tooltip += ` / ${hotkeys[name]}`;
        }
        return tooltip;
    }

    private renderNodes = (): React.ReactNode[] => {
        const nodes: React.ReactNode[] = [];
        const {roomState} = this.state;
        const currentApplianceName = roomState.memberState.currentApplianceName;
        const currentShapeType = roomState.memberState.shapeType;
        for (const applianceName in ToolBox.descriptions) {
            const description = ToolBox.descriptions[applianceName];
            if (this.isDraw(applianceName)) {
                if (currentApplianceName === applianceName) {
                    this.currentDraw = applianceName;
                }
                if (applianceName.split("").includes("_")) {
                    const applianceObj = this.getShape(applianceName);
                    // this.currentDraw = ApplianceNames.shape;
                    if (currentShapeType === applianceObj.applianceShape) {
                        this.currentDrawShape = applianceObj.applianceShape;
                    }
                } else {
                    if (currentApplianceName === applianceName) {
                        this.currentDraw = applianceName;
                    }
                }
            } else {
                const node = this.renderButton(applianceName, description);
                nodes.push(node);
            }
        }
        return nodes
    }

    private componentToHex = (c: number): string =>  {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    private rgbToHex = (rgb: Color): string => {
        return "#" +this.componentToHex(rgb[0]) + this.componentToHex(rgb[1]) + this.componentToHex(rgb[2]);
    }

    private renderDrawContext = (): React.ReactNode => {
        const {roomState} = this.state;
        return (
            <DrawTool selectAppliance={this.clickAppliance} roomState={roomState} />
        );
    }

    private renderDraw = (): React.ReactNode => {
        const {roomState} = this.state;
        const currentApplianceName = roomState.memberState.currentApplianceName;
        if (currentApplianceName === ApplianceNames.shape) {
            const currentShapeType = roomState.memberState.shapeType;
            const description = ToolBox.descriptions[`${currentApplianceName}_${currentShapeType}`];
            const isSelected = currentShapeType === this.currentDrawShape;
            const iconUrl = isSelected ? description.iconActive : description.icon;
            const subscriptUrl = isSelected ? subscriptActive : subscript;
            return (
                <Popover key={"draw"}
                         placement={"right"}
                         trigger="hover"
                         content={this.renderDrawContext}>
                    <div key="draw-inner" className="tool-box-cell-box-left">
                        <div className="tool-box-cell"
                             onClick={() => this.clickAppliance(this.currentDraw)}>
                            <img src={iconUrl} alt={"iconUrl"}/>
                            <img className="tool-box-cell-subscript" src={subscriptUrl} alt={"subscriptUrl"}/>
                        </div>
                    </div>
                </Popover>
            );
        } else {
            const description = ToolBox.descriptions[this.currentDraw]
            const isSelected = currentApplianceName === this.currentDraw;
            const iconUrl = isSelected ? description.iconActive : description.icon;
            const subscriptUrl = isSelected ? subscriptActive : subscript;
            return (
                <Popover key={"draw"}
                         placement={"right"}
                         trigger="hover"
                         content={this.renderDrawContext}>
                    <div key="draw-inner" className="tool-box-cell-box-left">
                        <div className="tool-box-cell"
                             onClick={() => this.clickAppliance(this.currentDraw)}>
                            <img src={iconUrl} alt={"iconUrl"}/>
                            <img className="tool-box-cell-subscript" src={subscriptUrl} alt={"subscriptUrl"}/>
                        </div>
                    </div>
                </Popover>
            );
        }
    }

    private renderColorContext = (): React.ReactNode => {
        const {room} = this.props;
        const {roomState} = this.state
        return (
            <div className="palette-box">
                <StrokeWidthTool room={room} roomState={roomState} />
                <ColorTool room={room} roomState={roomState}/>
            </div>
        );
    }

    private renderColorCell = (): React.ReactNode => {
        const {room} = this.props;
        const strokeColor = room.state.memberState.strokeColor;
        return (
            <Popover key={"color"}
                     placement={"right"}
                     trigger="hover"
                     content={this.renderColorContext}>
                <div key="draw-inner" className="tool-box-cell-box-left">
                    <div className="tool-box-cell"
                         onClick={() => this.clickAppliance(this.currentDraw)}>
                        <div className="tool-box-cell-color" style={{backgroundColor: this.rgbToHex(strokeColor)}}/>
                        <img className="tool-box-cell-subscript" src={subscript} alt={"subscriptUrl"}/>
                    </div>
                </div>
            </Popover>
        );
    }

    private renderCleanCell = (): React.ReactNode => {
        const {room} = this.props;
        const { isClearActive } = this.state;
        return (
            <Tooltip placement={"right"} key="clean" title={this.getApplianceName("clear")}>
                <div
                    onMouseEnter={() => {
                        this.setState({ isClearActive: true });
                    }}
                    onMouseLeave={() => {
                        this.setState({ isClearActive: false });
                    }}
                    onClick={() => {
                        room.cleanCurrentScene();
                    }}
                    className="tool-box-cell-box-left"
                >
                    <div className="tool-box-cell">
                        <img src={isClearActive ? clearActive : clear} alt={"clear"} />
                    </div>
                </div>
            </Tooltip>
        );
    }

    public render(): React.ReactNode {
        const nodes = this.renderNodes();
        nodes.splice(2, 0, this.renderDraw());
        nodes.push(this.renderColorCell());
        nodes.push(this.renderCleanCell())
        return (
            <div className="tool-mid-box-left">
                {this.addCustomerComponent(nodes)}
            </div>
        );
    }
}

