import {IframeBridge, DomEvents, IframeEvents} from "@netless/iframe-bridge";
import { Room, RoomMember, RoomState } from "white-web-sdk";
import {message} from "antd";
import { createH5Scenes } from "./QueryGetter";

export class SupplierAdapter {
    private bridge: IframeBridge;
    private room: Room;
    private IframeEvent = "SupplierAdapterEvent";
    private userId: string;
    private h5Url: URL;
    private eventMap = {
        "ready": this.handleReady,
        "3001": this.handleSaveData,
        "getAllMembersInfomationBywzomo": this.handleInfo,
        "getClientDataBywzomo": this.handleClientData
    }

    constructor(room: Room, bridge: IframeBridge, userId: string, url: string) {
        this.bridge = bridge;
        this.room = room;
        this.userId = userId;
        this.h5Url = new URL(url);
        this.addMessageListener();

        let prevIndex = room.state.sceneState.index;
        const eventName = this.isReplay(room) ? "onPlayerStateChanged" : "onRoomStateChanged";
        room.callbacks.on(eventName, (state: RoomState) => {
            if (state.sceneState && state.sceneState.index !== prevIndex) {
                this.pageTo(state.sceneState.index);
                prevIndex = state.sceneState.index;
            }
            if (state.roomMembers) {
                this.postInfo(this)
            }
        })

        room.addMagixEventListener(this.IframeEvent, (ev) =>{
            if (ev.authorId !== room.observerId) {
                this.postMessage(ev.payload);
            }
        })
    }

    private addMessageListener() {
        const listener = (event: MessageEvent) => {
            if (event.origin === this.h5Url.origin) {
                const data = event.data;
                try {
                    const event = JSON.parse(data);
                    const handler = this.eventMap[event.msgTag];
                    if (handler) {
                        handler(this, event);
                    } else {
                        this.bridge.dispatchMagixEvent(this.IframeEvent, event);
                    }
                } catch (error) {
                    console.error(error)
                }
            }
        }
        window.addEventListener("message", listener);
    }

    private handleReady(instance: SupplierAdapter, event) {
        const totalPage = Number(event.totalPage);
        const scenes = instance.room.entireScenes();
        const displaySceneDir = instance.bridge.attributes.displaySceneDir;
        if (!scenes[displaySceneDir]) {
            instance.room.putScenes(displaySceneDir, createH5Scenes(totalPage))
        }
        if (!instance.room.state.sceneState.scenePath.startsWith(displaySceneDir)) {
            instance.room.setScenePath(displaySceneDir);
        }
        instance.pageTo(instance.room.state.sceneState.index);
        if ((instance.bridge.attributes as any).h5Data) {
            instance.postMessage((instance.bridge.attributes as any).h5Data)
        }
        setTimeout(() => {
           instance.postInfo(instance);
        }, 500)
    }

    private handleSaveData(instance: SupplierAdapter, event) {
        instance.bridge.setAttributes({
            h5Data: event
        })
    }

    private handleInfo(instance: SupplierAdapter, event) {
        instance.postInfo(instance)
    }

    private handleClientData(instance: SupplierAdapter, event) {
        instance.postMessage({
            msgTag: "getClientDataBywzomo",
            ossUrl: "https://static.pre.wzomo.com/kjdata/netless/lesson1/",
            waitingTime: 500
        })
    }
    
    private postMessage(payload: any) {
        this.bridge.iframe?.contentWindow?.postMessage(JSON.stringify(payload), "*")
    }

    private pageTo(index: number) {
        this.postMessage({ msgTag: "pageTo", pageIndex: index + 1 });
    }

    private postInfo(instance: SupplierAdapter) {
        const info = {
            msgTag: "getAllMembersInfomationBywzomo",
            students: instance.room.state.roomMembers.map(member => {
                return {
                    userId: String(member.memberId),
                    userName: String(member.memberId)
                }
            }),
            teacher: {
                userId: String(instance.room.observerId),
                userName: String(instance.room.observerId),
            },
            myPosition: instance.room.state.roomMembers.findIndex(m => m.memberId === instance.room.observerId)
        }
        instance.postMessage(info)
    }

    private isReplay(room: Room) {
        return "isPlayable" in room;
    }
}