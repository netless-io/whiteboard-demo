import * as React from "react";
import {ApplianceNames, Color, Room, RoomState, ShapeType} from "white-web-sdk";
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

export type ToolBoxProps = {
    room: Room;
    customerComponent?: React.ReactNode[];
    i18nLanguage?: string;
};
export type ToolBoxStates = {
    strokeEnable: boolean;
    roomState: RoomState;
    isClearActive: boolean;
};
type ApplianceDescription = {
    readonly icon: string;
    readonly iconActive: string;
    readonly shapeType?: ShapeType;
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
            shapeType: ShapeType.Triangle,
        }),
        shape_speechBalloon: Object.freeze({
            icon: speechBalloon,
            iconActive: speechBalloonActive,
            shapeType: ShapeType.SpeechBalloon,
        }),
        shape_rhombus: Object.freeze({
            icon: rhombus,
            iconActive: rhombusActive,
            shapeType: ShapeType.Rhombus,
        }),
        shape_pentagram: Object.freeze({
            icon: pentagram,
            iconActive: pentagramActive,
            shapeType: ShapeType.Pentagram,
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

    public constructor(props: ToolBoxProps) {
        super(props);
        this.state = {
            strokeEnable: false,
            roomState: props.room.state,
            isClearActive: false,
        };
    }

    private getShape = (shape: string): {applianceName: ApplianceNames, applianceShape: ShapeType} => {
        const applianceObj = shape.split("_");
        const applianceName = applianceObj[0];
        const applianceShape = applianceObj[1];
        return {
            applianceName: applianceName as ApplianceNames,
            applianceShape: applianceShape as ShapeType,
        }
    }

    public componentDidMount(): void {
        const {room} = this.props;
        room.callbacks.on("onRoomStateChanged", (modifyState: Partial<RoomState>): void => {
            this.setState({roomState: {...room.state, ...modifyState}});
        });
    }

    public clickAppliance = (applianceName: ApplianceNames, shapeType?: ShapeType): void => {
        const {room} = this.props;
        this.updateDrawData(applianceName, shapeType);
        if (this.isShape(applianceName)) {
            const applianceObj = this.getShape(applianceName);
            room.setMemberState({
                currentApplianceName: applianceObj.applianceName,
                shapeType: applianceObj.applianceShape});
        } else {
            room.setMemberState({currentApplianceName: applianceName, shapeType: shapeType});
        }
    }

    private updateDrawData = (applianceName: ApplianceNames, shapeType?: ShapeType): void => {
        if (this.isDraw(applianceName)) {
            this.activeApplianceName = applianceName;
        }

        if (applianceName === ApplianceNames.shape && shapeType) {
            this.activeShapeType = shapeType;
            this.activeApplianceName = ApplianceNames.shape;
        }
    }

    private renderButton = (applianceName: ApplianceNames, description: ApplianceDescription): React.ReactElement => {
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

    private isShape = (applianceName: string): boolean => {
        return !!applianceName.split("").includes("_");
    }

    private isDraw = (applianceName: string): boolean => {
        return applianceName === ApplianceNames.pencil || applianceName === ApplianceNames.ellipse ||
            applianceName === ApplianceNames.rectangle || applianceName === ApplianceNames.straight
    }

    private getApplianceName(name: string): string {
        if (this.props.i18nLanguage === "zh-CN") {
            switch (name) {
                case ApplianceNames.arrow: return "箭头";
                case ApplianceNames.ellipse: return "椭圆";
                case ApplianceNames.eraser: return "橡皮擦";
                case ApplianceNames.hand: return "抓手";
                case ApplianceNames.laserPointer: return "激光笔";
                case ApplianceNames.pencil: return "笔";
                case ApplianceNames.rectangle: return "矩形";
                case ApplianceNames.selector: return "选择";
                case ApplianceNames.shape: return "形状";
                case ApplianceNames.straight: return "直线";
                case ApplianceNames.text: return "文本";
            }
        } else {
            switch (name) {
                case ApplianceNames.arrow:
                case ApplianceNames.ellipse:
                case ApplianceNames.eraser:
                case ApplianceNames.hand:
                case ApplianceNames.laserPointer:
                case ApplianceNames.pencil:
                case ApplianceNames.rectangle:
                case ApplianceNames.selector:
                case ApplianceNames.shape:
                case ApplianceNames.straight:
                case ApplianceNames.text: {
                    return name
                        .replace(/[A-Z]/g, (e) => ` ${e.toLowerCase()}`)
                        .split(" ")
                        .map((e) => e[0].toUpperCase() + e.substring(1))
                        .join(" ");
                }
            }
        }
        return "";
    }

    private renderNodes = (): React.ReactNode[] => {
        const nodes: React.ReactNode[] = [];
        for (const applianceName in ToolBox.descriptions) {
            const description = ToolBox.descriptions[applianceName];
            if (!this.isDraw(applianceName) && !this.isShape(applianceName)) {
                const node = this.renderButton(applianceName as ApplianceNames, description);
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
            <div className="palette-box">
                <DrawTool selectAppliance={this.clickAppliance} roomState={roomState} />
            </div>
        );
    }

    private activeApplianceName: ApplianceNames = ApplianceNames.pencil;

    private activeShapeType: ShapeType = ShapeType.Triangle;

    private isDrawSelected = (applianceName: ApplianceNames, shapeType?: ShapeType): boolean => {
        if (applianceName === ApplianceNames.shape && shapeType) {
            return shapeType === this.activeShapeType;
        } else {
            return applianceName === this.activeApplianceName;
        }
    }

    private renderDrawToolIcon = (): React.ReactNode => {
        const {roomState} = this.state;
        const currentApplianceName = roomState.memberState.currentApplianceName;
        if (this.isDraw(currentApplianceName)) {
            const description = ToolBox.descriptions[currentApplianceName]
            if (description) {
                const iconUrl = this.isDrawSelected(currentApplianceName) ? description.iconActive : description.icon;
                const subscriptUrl = this.isDrawSelected(currentApplianceName) ? subscriptActive : subscript;
                return (
                    <div className="tool-box-cell"
                         onClick={() => this.clickAppliance(currentApplianceName)}>
                        <img src={iconUrl} alt={"iconUrl"}/>
                        <img className="tool-box-cell-subscript" src={subscriptUrl} alt={"subscriptUrl"}/>
                    </div>
                );
            }
        }

        if (currentApplianceName === ApplianceNames.shape) {
            const currentShapeType = roomState.memberState.shapeType;
            const description = ToolBox.descriptions[`shape_${currentShapeType}`];
            if (description && currentShapeType) {
                const iconUrl = this.isDrawSelected(ApplianceNames.shape, currentShapeType) ? description.iconActive : description.icon;
                const subscriptUrl = this.isDrawSelected(ApplianceNames.shape, currentShapeType) ? subscriptActive : subscript;
                return (
                    <div className="tool-box-cell"
                         onClick={() => this.clickAppliance(currentApplianceName, currentShapeType)}>
                        <img src={iconUrl} alt={"iconUrl"}/>
                        <img className="tool-box-cell-subscript" src={subscriptUrl} alt={"subscriptUrl"}/>
                    </div>
                );
            }
        }

        if (this.activeApplianceName === ApplianceNames.shape) {
            const description = ToolBox.descriptions[`shape_${this.activeShapeType}`];
            if (description) {
                return (
                    <div className="tool-box-cell"
                         onClick={() => this.clickAppliance(ApplianceNames.shape, this.activeShapeType)}>
                        <img src={description.icon} alt={"iconUrl"}/>
                        <img className="tool-box-cell-subscript" src={subscript} alt={"subscriptUrl"}/>
                    </div>
                );
            }
        }

        const description = ToolBox.descriptions[this.activeApplianceName];
        if (description) {
            return (
                <div className="tool-box-cell"
                     onClick={() => this.clickAppliance(this.activeApplianceName, this.activeShapeType)}
                >
                    <img src={description.icon} alt={"iconUrl"}/>
                    <img className="tool-box-cell-subscript" src={subscript} alt={"subscriptUrl"}/>
                </div>
            );
        }
        return null;

    }

    private renderDraw = (): React.ReactNode => {
        return (
            <Popover key={"draw"}
                     placement={"right"}
                     trigger="hover"
                     content={this.renderDrawContext}>
                <div key="draw-inner" className="tool-box-cell-box-left">
                    {this.renderDrawToolIcon()}
                </div>
            </Popover>
        )
    }

    private renderColorContext = (): React.ReactNode => {
        const {room} = this.props;
        const {roomState} = this.state
        return (
            <div className="palette-box-color">
                <StrokeWidthTool
                    room={room}
                    roomState={roomState} />
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
                    <div className="tool-box-cell">
                        <div className="tool-box-cell-color" style={{backgroundColor: this.rgbToHex(strokeColor)}}/>
                        <img className="tool-box-cell-subscript" src={subscript} alt={"subscriptUrl"}/>
                    </div>
                </div>
            </Popover>
        );
    }

    private renderCleanCell = (): React.ReactNode => {
        const {room} = this.props;
        const {isClearActive} = this.state;
        return (
            <div
                onMouseEnter={() => {
                    this.setState({isClearActive: true})
                }}
                onMouseLeave={() => {
                    this.setState({isClearActive: false})
                }}
                onClick={() => {
                    room.cleanCurrentScene();
                }}
                key={"key"}
                className="tool-box-cell-box-left">
                <div className="tool-box-cell">
                    <img src={isClearActive ? clearActive : clear} alt={"clear"}/>
                </div>
            </div>
        )
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

