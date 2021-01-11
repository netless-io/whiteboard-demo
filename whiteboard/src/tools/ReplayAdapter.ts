import { IframeBridge } from "@netless/iframe-bridge";
import { Player, PlayerState, Room, RoomMember, RoomState } from "white-web-sdk";

export class ReplayAdapter {
    private bridge: IframeBridge;
    private player: Player;
    private IframeEvent = "IframeEvent";
    private userId: string;
    private h5Url: URL;

    constructor(player: Player, bridge: IframeBridge, userId: string, url: string) {
        this.bridge = bridge;
        this.player = player;
        this.userId = userId;
        this.h5Url = new URL(url);
        let prevIndex = player.state.sceneState.index;
        player.callbacks.on("onPlayerStateChanged", (state: PlayerState) => {
            if (state.sceneState && state.sceneState.index !== prevIndex) {
                this.jumpPage(state.sceneState.index);
                prevIndex = state.sceneState.index;
            }
        })
        player.addMagixEventListener(this.IframeEvent, (event) => {
            this.postMessage(JSON.parse(event.payload));
        })
    }

    private postMessage(message: any) {
        if (this.bridge.iframe) {
            this.bridge.iframe.contentWindow?.postMessage(JSON.stringify(message), "*");
        }
    }

    private jumpPage(index: number) {
        this.postMessage({
            method: "onJumpPage",
            toPage: index + 1,
        })
    }

    private currentMember(player: Player): RoomMember | undefined {
        return player.state.roomMembers.find(member => member.payload.userId === this.userId);
    }
}