import "./style.css";

import { CNode, PlayerConsumer, RoomConsumer } from "white-web-sdk";
import React, { Component } from "react";

import type { Props } from "./types";
import { Transformer } from "./Transformer";
import { VideoJsPluginImpl } from "./VideoJsPluginImpl";

export class VideoJsPlugin extends Component<Props> {
    render() {
        const { cnode, size, scale } = this.props;
        return (
            <CNode context={cnode}>
                <Transformer size={size} scale={scale}>
                    <RoomConsumer
                        children={(room) =>
                            room && <VideoJsPluginImpl {...this.props} room={room} />
                        }
                    />
                    <PlayerConsumer
                        children={(player) =>
                            player && <VideoJsPluginImpl {...this.props} player={player} />
                        }
                    />
                </Transformer>
            </CNode>
        );
    }
}
