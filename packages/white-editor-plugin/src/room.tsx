import * as React from "react";
import {PluginProps, Room} from "white-web-sdk";
import "./index.less";
import BraftEditor from "braft-editor";

export type WhiteEditorPluginProps = { room: Room } & PluginProps<{}, {}>;


export default class WhiteEditorPluginRoom extends React.Component<WhiteEditorPluginProps, {}> {

    public constructor(props: WhiteEditorPluginProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const { size, scale} = this.props;
        const newScale = scale === 0 ? 1 : scale;
        return (
            <div className="plugin-editor-box" style={{ width: (size.width / newScale), height: (size.height / newScale), transform: `scale(${newScale})`}}>
                <BraftEditor
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                />
            </div>
        );
    }
}
