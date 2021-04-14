import {IframeBridge, DomEvents, IframeEvents} from "@netless/iframe-bridge";
import {Room, RoomMember, RoomState} from "white-web-sdk";
import {message} from "antd";
import {createH5Scenes} from "./QueryGetter";

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
        let prevIndex = room.state.sceneState.index;
        const eventName = this.isReplay(room) ? "onPlayerStateChanged" : "onRoomStateChanged";
        room.callbacks.on(eventName, (state: RoomState) => {
            if (state.sceneState && state.sceneState.index !== prevIndex) {
                this.jumpPage(state.sceneState.index);
                prevIndex = state.sceneState.index;
            }
        })

        room.addMagixEventListener(this.IframeEvent, (event) => {
            if (event.authorId === this.currentMember(room)?.memberId) {
                return;
            }
            this.postMessage(JSON.parse(event.payload));
        })
        this.addMessageListener();
        IframeBridge.emitter.on(DomEvents.IframeLoad, () => {
            message.info("loaded")
        });
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
                    const { method, toPage, totalPages } = JSON.parse(data);
                    switch (method) {
                        case "onJumpPage": {
                            this.room.setSceneIndex(toPage - 1);
                            break;
                        }
                        case "onPagenum": {
                            this.room.putScenes(this.bridge.attributes.displaySceneDir, createH5Scenes(totalPages));
                            break;
                        }
                        case "onLoadComplete": {
                            this.jumpPage(this.room.state.sceneState.index);
                            setTimeout(() => {
                                IframeBridge.emitter.emit(IframeEvents.Ready);
                            }, 500)
                            break;
                        }
                        default: {
                            this.bridge.dispatchMagixEvent(this.IframeEvent, data);
                            break;
                        }
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

    private isReplay(room: Room) {
        return "isPlayable" in room;
    }

    private currentMember(room: Room): RoomMember | undefined {
        return room.state.roomMembers.find(member => member.payload.userId === this.userId);
    }
}
