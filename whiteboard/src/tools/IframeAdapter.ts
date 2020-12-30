import { IframeBridge } from "@netless/iframe-bridge";
import { Room, RoomMember, RoomState } from "white-web-sdk";

export class IframeAdapter {
    private bridge: IframeBridge;
    private room: Room;
    private IframeEvent = "IframeEvent";
    private userId: string;
    private h5Url: URL;

    constructor(room: Room, bridge: IframeBridge, userId: string, url: string) {
        this.bridge = bridge;
        this.room = room;
        this.userId = userId;
        this.h5Url = new URL(url);
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
            if (event.origin === this.h5Url.origin) {
                const data = event.data;
                try {
                    const { method, toPage } = JSON.parse(data);
                    console.log(method);
                    if (method === "onJumpPage") {
                        this.room.setSceneIndex(toPage - 1);
                    } else {
                        this.room.dispatchMagixEvent(this.IframeEvent, data);
                    }
                    if (method === "onLoadComplete") {
                        this.jumpPage(this.room.state.sceneState.index);
                    }
                } catch (error) {
                    console.log(error)
                }
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