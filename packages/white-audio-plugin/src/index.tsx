import * as React from "react";
import {CNode, RoomConsumer, Room, PlayerConsumer, Player, PluginProps, Plugin, PluginInstance} from "white-web-sdk";
import "./index.less";
import {PluginContext} from "./Plugins";
import WhiteAudioPluginRoom from "./room";
import WhiteAudioPluginReplay from "./replay";

export type WhiteAudioPluginAttributes = {
    play: boolean;
    seek: number;
    volume: number,
    mute: boolean,
    currentTime: number;
    seekTime?: number;
};
export type WhiteAudioPluginProps = PluginProps<PluginContext, WhiteAudioPluginAttributes>;

class WhiteAudioPlugin extends React.Component<WhiteAudioPluginProps, {}> {

    public constructor(props: WhiteAudioPluginProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <CNode context={this.props.cnode}>
                <RoomConsumer>
                    {(room: Room | undefined) => {
                        if (room) {
                            return <WhiteAudioPluginRoom
                                {...this.props}
                            />
                        } else {
                            return null;
                        }
                    }}
                </RoomConsumer>
                <PlayerConsumer>
                    {(player: Player | undefined) => {
                        if (player) {
                            return <WhiteAudioPluginReplay
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

export const audioPlugin: Plugin<PluginContext, WhiteAudioPluginAttributes> = Object.freeze({
    kind: "audio",
    render: WhiteAudioPlugin,
    defaultAttributes: {
        play: false,
        seek: 0,
        mute: false,
        volume: 1,
        currentTime: 0,
    },
    hitTest: (plugin: PluginInstance<PluginContext, WhiteAudioPluginAttributes>): boolean => {
        const memberState = (plugin as any).component.context.getMemberState();
        return !(memberState && memberState.currentApplianceName === "eraser");
    },
});
