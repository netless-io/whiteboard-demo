import * as React from "react";
import {ApplianceNames, Room, RoomState} from "white-web-sdk";
import "./index.less";
import {
    IconProps,
    ToolBoxArrow,
    ToolBoxEllipse,
    ToolBoxEraser,
    ToolBoxHand,
    ToolBoxLaserPointer,
    ToolBoxPencil,
    ToolBoxRectangle,
    ToolBoxSelector,
    ToolBoxStraight,
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
    roomState: RoomState;
};
type ApplianceDescription = {
    readonly iconView: React.ComponentClass<IconProps>;
    readonly hasColor: boolean;
    readonly hasStroke: boolean;
};
export default class ToolBox extends React.Component<ToolBoxProps, ToolBoxStates> {
    private static readonly descriptions: { readonly [applianceName: string]: ApplianceDescription } = Object.freeze({
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
            roomState: props.room.state,
        };
    }

    public componentDidMount(): void {
        const {room} = this.props;
        room.callbacks.on("onRoomStateChanged", (modifyState: Partial<RoomState>): void => {
            this.setState({roomState: {...room.state, ...modifyState}});
        });
    }
    public clickAppliance = (event: Event | undefined, applianceName: ApplianceNames): void => {
        const {room} = this.props;
        const {roomState} = this.state;
        event!.preventDefault();
        const isSelected = roomState.memberState.currentApplianceName === applianceName;
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
        const {roomState} = this.state;
        if (isSelected) {
            const [r, g, b] = roomState.memberState.strokeColor;
            return `rgb(${r},${g},${b})`;
        } else {
            return `rgb(162,167,173)`;
        }
    }

    private renderApplianceButton(applianceName: ApplianceNames, description: ApplianceDescription): React.ReactNode {
        const {roomState} = this.state;
        const ToolIcon = description.iconView;
        const isSelected = roomState.memberState.currentApplianceName === applianceName;
        const buttonColor = this.buttonColor(isSelected);
        return (
            <div className="tool-box-cell-box-left" key={applianceName}>
                <div className="tool-box-cell"
                     onClick={() => this.clickAppliance(event, applianceName)}>
                    <ToolIcon color={buttonColor}/>
                </div>
            </div>
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

