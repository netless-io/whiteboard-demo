import * as React from "react";
import BraftEditor from "braft-editor";
import {CNode, RoomConsumer, Room, PlayerConsumer, Player, PluginProps, Plugin, PluginInstance} from "white-web-sdk";
import "./index.less";
import WhiteEditorPluginRoom from "./room";
import WhiteVideoPluginRoom from "@netless/white-video-plugin/dist/room";

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
                               <WhiteEditorPluginRoom
                                   {...this.props}
                                   room={room}
                               />
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
                                <div style={{backgroundColor: "white", width: 600, height: 600}}>
                                    <BraftEditor/>
                                </div>
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
    hitTest: (plugin: PluginInstance<{}, WhiteEditorPluginAttributes>): boolean => {
        const memberState = (plugin as any).component.context.getMemberState();
        return !(memberState && memberState.currentApplianceName === "eraser");
    },
});
