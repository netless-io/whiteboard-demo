import * as React from "react";
import "./DrawTool.less";
import {ApplianceNames, RoomState} from "white-web-sdk";
import ToolBox from "./index";

export type DrawToolProps = {
    selectAppliance: (applianceName: ApplianceNames) => void;
    roomState: RoomState;
};


export default class DrawTool extends React.PureComponent<DrawToolProps> {

    private renderImage = (appliance: ApplianceNames): React.ReactNode => {
        const description = ToolBox.descriptions[appliance]
        const {roomState} = this.props;
        const currentApplianceName = roomState.memberState.currentApplianceName;
        const isSelected = currentApplianceName === appliance;
        const iconUrl = isSelected ? description.iconActive : description.icon;
        return (
            <img src={iconUrl} alt={"iconUrl"}/>
        )
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
            </div>
        );
    }
}
