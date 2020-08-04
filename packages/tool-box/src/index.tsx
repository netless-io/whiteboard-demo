import * as React from "react";
import {ApplianceNames, Room} from "white-web-sdk";
import TweenOne from "rc-tween-one";
import "./index.less";
import {
    IconProps, ToolBoxArrow,
    ToolBoxEllipse,
    ToolBoxEraser, ToolBoxHand, ToolBoxLaserPointer,
    ToolBoxPencil, ToolBoxRectangle,
    ToolBoxSelector, ToolBoxStraight,
    ToolBoxText
} from "./ToolIconComponent";

export type ToolBoxProps = {
    room: Room;
};
export type ToolBoxStates = {
    isPaletteBoxAppear: boolean;
    strokeEnable: boolean;
    isToolBoxSwitched: boolean;
    extendsPanel: boolean;
};
type ApplianceDescription = {
    readonly iconView: React.ComponentClass<IconProps>;
    readonly hasColor: boolean;
    readonly hasStroke: boolean;
};
export default class ToolBox extends React.Component<ToolBoxProps, ToolBoxStates> {
    private static readonly descriptions: {readonly [applianceName: string]: ApplianceDescription} = Object.freeze({
        selector: Object.freeze({
            iconView: ToolBoxSelector,
            hasColor: false,
            hasStroke: false,
        }),
        pencil: Object.freeze({
            iconView: ToolBoxPencil,
            hasColor: true,
            hasStroke: true,
        }),
        text: Object.freeze({
            iconView: ToolBoxText,
            hasColor: true,
            hasStroke: false,
        }),
        eraser: Object.freeze({
            iconView: ToolBoxEraser,
            hasColor: false,
            hasStroke: false,
        }),
        ellipse: Object.freeze({
            iconView: ToolBoxEllipse,
            hasColor: true,
            hasStroke: true,
        }),
        rectangle: Object.freeze({
            iconView: ToolBoxRectangle,
            hasColor: true,
            hasStroke: true,
        }),
        straight: Object.freeze({
            iconView: ToolBoxStraight,
            hasColor: true,
            hasStroke: true,
        }),
        arrow: Object.freeze({
            iconView: ToolBoxArrow,
            hasColor: true,
            hasStroke: true,
        }),
        laserPointer: Object.freeze({
            iconView: ToolBoxLaserPointer,
            hasColor: false,
            hasStroke: false,
        }),
        hand: Object.freeze({
            iconView: ToolBoxHand,
            hasColor: false,
            hasStroke: false,
        }),
    });
    public constructor(props: ToolBoxProps) {
        super(props);
        this.state = {
            isPaletteBoxAppear: false,
            strokeEnable: false,
            isToolBoxSwitched: false,
            extendsPanel: false,
        };
    }
    public clickAppliance = (event: Event | undefined, applianceName: ApplianceNames): void => {
        const {room} = this.props;
        event!.preventDefault();
        const isSelected = room.state.memberState.currentApplianceName === applianceName;
        if (isSelected) {
            this.setState({isToolBoxSwitched: false, extendsPanel: !this.state.extendsPanel});
        } else {
            this.setState({isToolBoxSwitched: true, isPaletteBoxAppear: false});
            room.setMemberState({currentApplianceName: applianceName});
            this.setState({extendsPanel: false});
        }
    }
    private onVisibleChange = (visible: boolean): void => {
        if (!visible) {
            this.setState({extendsPanel: false});
        }
    }

    private buttonColor(isSelected: boolean): string {
        const {room} = this.props;
        if (isSelected) {
            const [r, g, b] = room.state.memberState.strokeColor;
            return `rgb(${r},${g},${b})`;
        } else {
            return "rgb(162,167,173)";
        }
    }

    private renderApplianceButton(applianceName: ApplianceNames, description: ApplianceDescription): React.ReactNode {
        const {room} = this.props;
        const ToolIcon = description.iconView;
        const isExtendable = description.hasStroke || description.hasColor;
        const isSelected = room.state.memberState.currentApplianceName === applianceName;
        const buttonColor = this.buttonColor(isSelected);

        const cellBox: React.ReactNode = (
            <div className={"tool-box-cell-box-left"} key={applianceName}>
                <div className="tool-box-cell"
                     onClick={() => this.clickAppliance(event, applianceName)}>
                    <ToolIcon color={buttonColor}/>
                </div>
                {isExtendable && isSelected && (
                    <TweenOne className="tool-box-cell-step-two"
                              animation={{
                                  duration: 150,
                                  delay: 100,
                                  width: 8,
                                  backgroundColor: buttonColor,
                                  display: isSelected ? "flex" : "none",
                              }}
                              style={{
                                  backgroundColor: buttonColor,
                                  width: 0,
                                  display: "none",
                              }}/>
                )}
            </div>
        );
        return cellBox;
    }
    public render(): React.ReactNode {
        const nodes: React.ReactNode[] = [];
        for (const applianceName in ToolBox.descriptions) {
            const description = ToolBox.descriptions[applianceName];
            const node = this.renderApplianceButton(applianceName as ApplianceNames, description);
            nodes.push(node);
        }
        return (
            <div className="whiteboard-tool-box-left">
                <div className="tool-mid-box-left">
                    {nodes}
                </div>
            </div>
        );
    }
}

