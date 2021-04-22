import * as React from "react";
import "./DrawTool.less";
import {ApplianceNames, RoomState, ShapeType} from "white-web-sdk";
import ToolBox from "./index";

export type DrawToolProps = {
    selectAppliance: (applianceName: ApplianceNames, shapeType?: ShapeType) => void;
    roomState: RoomState;
};


export default class DrawTool extends React.PureComponent<DrawToolProps> {

    private renderImage = (appliance: ApplianceNames, shapeType?: ShapeType): React.ReactNode => {

        const {roomState} = this.props;
        const currentApplianceName = roomState.memberState.currentApplianceName;
        const currentShapeType = roomState.memberState.shapeType;
        if (appliance === ApplianceNames.shape) {
            const description = ToolBox.descriptions[`${appliance}_${shapeType}`]
            const isSelected = currentShapeType === shapeType;
            const iconUrl = isSelected ? description.iconActive : description.icon;
            return (
                <img src={iconUrl} alt={"iconUrl"}/>
            )
        } else {
            const description = ToolBox.descriptions[appliance]
            const isSelected = currentApplianceName === appliance;
            const iconUrl = isSelected ? description.iconActive : description.icon;
            return (
                <img src={iconUrl} alt={"iconUrl"}/>
            )
        }
    }

    public render(): React.ReactNode {
        const {selectAppliance} = this.props;
        return (
            <div className="draw-tool-box">
                <div
                    className="draw-tool-box-cell"
                    onClick={() => {
                        selectAppliance(ApplianceNames.pencil);
                    }}
                >
                    {this.renderImage(ApplianceNames.pencil)}
                </div>
                <div
                    className="draw-tool-box-cell"
                    onClick={() => {
                        selectAppliance(ApplianceNames.ellipse);
                    }}
                >
                    {this.renderImage(ApplianceNames.ellipse)}
                </div>
                <div
                    className="draw-tool-box-cell"
                    onClick={() => {
                        selectAppliance(ApplianceNames.rectangle);
                    }}
                >
                    {this.renderImage(ApplianceNames.rectangle)}
                </div>
                <div
                    className="draw-tool-box-cell"
                    onClick={() => {
                        selectAppliance(ApplianceNames.straight);
                    }}
                >
                    {this.renderImage(ApplianceNames.straight)}
                </div>

                <div
                    className="draw-tool-box-cell"
                    onClick={() => {
                        selectAppliance(ApplianceNames.shape, "pentagram" as any);
                    }}
                >
                    {this.renderImage(ApplianceNames.shape, "pentagram" as any)}
                </div>
                <div
                    className="draw-tool-box-cell"
                    onClick={() => {
                        selectAppliance(ApplianceNames.shape, "rhombus" as any);
                    }}
                >
                    {this.renderImage(ApplianceNames.shape, "rhombus" as any)}
                </div>
                <div
                    className="draw-tool-box-cell"
                    onClick={() => {
                        selectAppliance(ApplianceNames.shape, "speechBalloon" as any);
                    }}
                >
                    {this.renderImage(ApplianceNames.shape, "speechBalloon" as any)}
                </div>
                <div
                    className="draw-tool-box-cell"
                    onClick={() => {
                        selectAppliance(ApplianceNames.shape, "triangle" as any);
                    }}
                >
                    {this.renderImage(ApplianceNames.shape, "triangle" as any)}
                </div>
            </div>
        );
    }
}
