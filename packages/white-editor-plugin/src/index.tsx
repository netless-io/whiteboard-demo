import * as React from "react";
import BraftEditor from "braft-editor";
import {CNode, RoomConsumer, Room, PlayerConsumer, Player, PluginProps, Plugin, PluginInstance} from "white-web-sdk";
import "braft-editor/dist/index.css";
import "./index.less";

export type WhiteEditorPluginProps = PluginProps<{}, WhiteEditorPluginAttributes>;

export type WhiteEditorPluginAttributes = {
    play: boolean;
    seek: number;
    seekTime?: number;
    volume: number,
    mute: boolean,
    currentTime: number;
};

class WhiteEditorPlugin extends React.Component<WhiteEditorPluginProps, {}> {

    public constructor(props: WhiteEditorPluginProps) {
        super(props);
    }
    public render(): React.ReactNode {
        return (
            <CNode context={this.props.cnode}>
                <RoomConsumer>
                    {(room: Room | undefined) => {
                        if (room) {
                            return (
                                <BraftEditor/>
                            );
                        } else {
                            return null;
                        }
                    }}
                </RoomConsumer>
                <PlayerConsumer>
                    {(player: Player | undefined) => {
                        if (player) {
                            return (
                                <BraftEditor/>
                            );
                        } else {
                            return null;
                        }
                    }}
                </PlayerConsumer>
            </CNode>
        );
    }
}

export const editorPlugin: Plugin<{}, WhiteEditorPluginAttributes> = Object.freeze({
    kind: "editor",
    render: WhiteEditorPlugin,
    defaultAttributes: {
        play: false,
        seek: 0,
        mute: false,
        volume: 1,
        currentTime: 0,
    },
    hitTest: (plugin: PluginInstance<{}, WhiteEditorPluginAttributes>): boolean => {
        const memberState = (plugin as any).component.context.getMemberState();
        return !(memberState && memberState.currentApplianceName === "eraser");

    },
});
