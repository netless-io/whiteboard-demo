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
            if (currentApplianceName !== ApplianceNames.shape) {
                return (
                    <img src={description.icon} alt={"iconUrl"}/>
                )
            }
            const isSelected = currentShapeType === shapeType;
            const iconUrl = isSelected ? description.iconActive : description.icon;
            return (
                <img src={iconUrl} alt={"iconUrl"}/>
            )
        } else {
            const description = ToolBox.descriptions[appliance]
            if (currentApplianceName === ApplianceNames.shape) {
                return (
                    <img src={description.icon} alt={"iconUrl"}/>
                )
            }
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
                        selectAppliance(ApplianceNames.shape,  ShapeType.Pentagram);
                    }}
                >
                    {this.renderImage(ApplianceNames.shape, ShapeType.Pentagram)}
                </div>
                <div
                    className="draw-tool-box-cell"
                    onClick={() => {
                        selectAppliance(ApplianceNames.shape, ShapeType.Rhombus);
                    }}
                >
                    {this.renderImage(ApplianceNames.shape, ShapeType.Rhombus)}
                </div>
                <div
                    className="draw-tool-box-cell"
                    onClick={() => {
                        selectAppliance(ApplianceNames.shape, ShapeType.SpeechBalloon);
                    }}
                >
                    {this.renderImage(ApplianceNames.shape, ShapeType.SpeechBalloon)}
                </div>
                <div
                    className="draw-tool-box-cell"
                    onClick={() => {
                        selectAppliance(ApplianceNames.shape, ShapeType.Triangle);
                    }}
                >
                    {this.renderImage(ApplianceNames.shape, ShapeType.Triangle)}
                </div>
            </div>
        );
    }
}
