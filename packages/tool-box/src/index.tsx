import * as React from "react";
import {Room} from "white-web-sdk";
import "./index.less";

export type ToolBoxProps = {
    room: Room;
};

export default class ToolBox extends React.Component<ToolBoxProps, {}> {
    public constructor(props: ToolBoxProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <div className="tool-box">
            </div>
        );
    }
}

