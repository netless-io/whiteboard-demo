import { IframeBridge } from "@netless/iframe-bridge";
import { Room, RoomMember, RoomState } from "white-web-sdk";
import { h5DemoUrl2 } from "../appToken";

const h5Url = new URL(h5DemoUrl2);

export class IframeAdapter {
    private bridge: IframeBridge;
    private room: Room;
    private IframeEvent = "IframeEvent";
    private userId: string;

    constructor(room: Room, bridge: IframeBridge, userId: string) {
        this.bridge = bridge;
        this.room = room;
        this.userId = userId;
        room.callbacks.on("onRoomStateChanged", (state: RoomState) => {
            if (state.sceneState) {
                this.jumpPage(state.sceneState.index);
            }
        })
        room.addMagixEventListener(this.IframeEvent, (event) => {
            if (event.authorId === this.currentMember(room)?.memberId) {
                return;
            }
            this.postMessage(JSON.parse(event.payload));
        })
        this.addMessageListener();
    }

    private postMessage(message: any) {
        if (this.bridge.iframe) {
            this.bridge.iframe.contentWindow?.postMessage(JSON.stringify(message), "*");
        }
    }

    private addMessageListener() {
        const listener = (event: MessageEvent) => {
            if (event.origin === h5Url.origin) {
                const data = event.data;
                this.room.dispatchMagixEvent(this.IframeEvent, data);
            }
        }
        window.addEventListener("message", listener);
    }

    private jumpPage(index: number) {
        this.postMessage({
            method: "onJumpPage",
            toPage: index + 1,
        })
    }

    private currentMember(room: Room): RoomMember | undefined {
        return room.state.roomMembers.find(member => member.payload.userId === this.userId);
    }
}