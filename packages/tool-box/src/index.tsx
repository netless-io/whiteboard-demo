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

    private currentDraw: ApplianceNames = ApplianceNames.pencil;

    public constructor(props: ToolBoxProps) {
        super(props);
        this.state = {
            strokeEnable: false,
            roomState: props.room.state,
            isClearActive: false,
        };
    }

    public componentDidMount(): void {
        const {room} = this.props;
        room.callbacks.on("onRoomStateChanged", (modifyState: Partial<RoomState>): void => {
            this.setState({roomState: {...room.state, ...modifyState}});
        });
    }

    public clickAppliance = (applianceName: ApplianceNames, shapeType?: ShapeType): void => {
        const {room} = this.props;
        room.setMemberState({currentApplianceName: applianceName, shapeType: shapeType});
    }

    private getApplianceName(name: ApplianceNames): string {
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

    private isDraw = (applianceName: ApplianceNames): boolean => {
        return applianceName === ApplianceNames.pencil || applianceName === ApplianceNames.ellipse ||
            applianceName === ApplianceNames.rectangle || applianceName === ApplianceNames.straight ||
            applianceName === ApplianceNames.shape;
    }

    private renderNodes = (): React.ReactNode[] => {
        const nodes: React.ReactNode[] = [];
        const {roomState} = this.state;
        const currentApplianceName = roomState.memberState.currentApplianceName;
        for (const applianceName in ToolBox.descriptions) {
            const description = ToolBox.descriptions[applianceName];
            if (this.isDraw(applianceName as ApplianceNames)) {
                if (currentApplianceName === applianceName) {
                    this.currentDraw = applianceName;
                }
            } else {
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

    private renderDraw = (): React.ReactNode => {
        const description = ToolBox.descriptions[this.currentDraw]
        const {roomState} = this.state;
        const currentApplianceName = roomState.memberState.currentApplianceName;
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

    private renderColorContext = (): React.ReactNode => {
        const {room} = this.props;
        const {roomState} = this.state
        return (
            <div className="palette-box">
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

