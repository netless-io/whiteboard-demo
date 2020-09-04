import * as React from "react";
import {CNode, RoomConsumer, Room, PlayerConsumer, Player, PluginProps, Plugin, PluginInstance} from "white-web-sdk";
import "./index.less";
import {PluginContext} from "./Plugins";
import WhiteVideoPluginRoom from "./room";
import WhiteVideoPluginReplay from "./replay";

export type WhiteVideoPluginProps = PluginProps<PluginContext, WhiteVideoPluginAttributes>;

export type WhiteVideoPluginAttributes = {
    play: boolean;
    seek: number;
    seekTime?: number;
    volume: number,
    mute: boolean,
    currentTime: number;
};

class WhiteVideoPlugin extends React.Component<WhiteVideoPluginProps, {}> {

    public constructor(props: WhiteVideoPluginProps) {
        super(props);
    }
    public render(): React.ReactNode {
        return (
            <CNode context={this.props.cnode}>
                <RoomConsumer>
                    {(room: Room | undefined) => {
                        if (room) {
                            return <WhiteVideoPluginRoom
                                {...this.props}
                                room={room}
                            />
                        } else {
                            return null;
                        }
                    }}
                </RoomConsumer>
                <PlayerConsumer>
                    {(player: Player | undefined) => {
                        if (player) {
                            return <WhiteVideoPluginReplay
                                {...this.props}
                                player={player}
                            />;
                        } else {
                            return null;
                        }
                    }}
                </PlayerConsumer>
            </CNode>
        );
    }
}

export const videoPlugin: Plugin<PluginContext, WhiteVideoPluginAttributes> = Object.freeze({
    kind: "video",
    render: WhiteVideoPlugin,
    defaultAttributes: {
        play: false,
        seek: 0,
        mute: false,
        volume: 1,
        currentTime: 0,
    },
    hitTest: (plugin: PluginInstance<PluginContext, WhiteVideoPluginAttributes>): boolean => {
        const memberState = (plugin as any).component.context.getMemberState();
        return !(memberState && memberState.currentApplianceName === "eraser");

    },
});