import { InvisiblePlugin, InvisiblePluginContext, Room, Event } from "white-web-sdk";
import Emittery from "emittery";
import { loadPlugin } from "./loader";
import { WindowManagerWrapper } from "./wrapper";

import "winbox/dist/css/winbox.min.css";
import "winbox/dist/css/themes/modern.min.css";
import "./style.css";

export type WindowMangerAttributes = {
    modelValue?: string,
    [key: string]: any
}

export type Plugin = { name: string, url: string };

export type Plugins = {
    [key: string]: Plugin
}

export const emitter: Emittery = new Emittery();

export enum EventNames {
    PluginMove = "PluginMove",
    PluginFocus = "PluginFocus",
    PluginResize = "PluginResize",
    GetAttributes = "GetAttributes",
    UpdateWindowManagerWrapper = "UpdateWindowManagerWrapper",
    InitReplay = "InitReplay",
}

export class WindowManager extends InvisiblePlugin<WindowMangerAttributes> {
    public static kind: string = "WindowManager";
    private instancePlugins: Map<string, Plugin> = new Map();

    constructor(context: InvisiblePluginContext) {
        super(context);
        emitter.onAny(this.eventListener);
        this.displayer.addMagixEventListener(EventNames.PluginMove, this.pluginMoveListener);
        this.displayer.addMagixEventListener(EventNames.PluginFocus, this.pluginFocusListener);
        this.displayer.addMagixEventListener(EventNames.PluginResize, this.pluginResizeListener);
    }

    public static onCreate(instance: WindowManager) {
        const plugins = instance.attributes.plugins as Plugins;
        if (plugins) {
            for (const [_, plugin] of Object.entries(plugins)) {
                instance.addPlugin(plugin.name, plugin.url);
            }
        }
    }

    public onAttributesUpdate(attributes: any) {
        const plugins = attributes.plugins as Plugins;
        if (plugins) {
            for (const [name, plugin] of Object.entries(plugins)) {
                if (!this.instancePlugins.has(name)) {
                    this.addPlugin(name, plugin.url);
                }
            }
        }
    }

    private pluginMoveListener = (event: Event) => {
        if (event.authorId !== this.displayer.observerId) {
            emitter.emit(EventNames.PluginMove, event.payload);
        }
    };

    private pluginFocusListener = (event: Event) => {
        if (event.authorId !== this.displayer.observerId) {
            emitter.emit(EventNames.PluginFocus, event.payload);
        }
    };

    private pluginResizeListener = (event: Event) => {
        if (event.authorId !== this.displayer.observerId) {
            emitter.emit(EventNames.PluginResize, event.payload);
        }
    };

    private onPluginBoxInit = (name: string) => {
        const position = this.attributes[`${name}-position`];
        const focus = this.attributes.focus;
        const size = this.attributes[`${name}-size`];
        let payload = {};
        if (position) {
            payload = { name: name, x: position.x, y: position.y };
        }
        if (focus) {
            payload = { ...payload, focus: true };
        }
        if (size) {
            payload = { ...payload, width: size.width, height: size.height };
        }
        emitter.emit(EventNames.InitReplay, payload);
    }

    private eventListener = (eventName: string, payload: any) => {
        switch (eventName) {
            case "move": {
                const room = this.displayer as Room;
                room.dispatchMagixEvent(EventNames.PluginMove, payload);
                this.setAttributes({
                    [`${payload.name}-position`]: { x: payload.x, y: payload.y }
                });
                break;
            }
            case "focus": {
                const room = this.displayer as Room;
                room.dispatchMagixEvent(EventNames.PluginFocus, payload);
                this.setAttributes({ focus: payload.name });
                break;
            }
            case "resize": {
                const room = this.displayer as Room;
                room.dispatchMagixEvent(EventNames.PluginResize, payload);
                this.setAttributes({ 
                    [`${payload.name}-size`]: { width: payload.width, height: payload.height }
                });
                break;
            }
            case "init": {
                this.onPluginBoxInit(payload.name);
                break;
            }
            default:
                break;
        }
    }

    public static async use(room: Room): Promise<WindowManager> {
        let manger = await room.getInvisiblePlugin(WindowManager.kind);
        if (!manger) {
            manger = await room.createInvisiblePlugin(WindowManager, {});
        }
        return manger as WindowManager;
    }

    public async addPlugin(name: string, url: string) {
        const scriptText = await loadPlugin(url);
        let moduleResult = Function(scriptText)();
        if (typeof moduleResult === "undefined") {
            // @ts-ignore
            moduleResult = window[name];  
        }
        console.log("moduleResult", moduleResult)
        this.insertToSDK(this.displayer, moduleResult, name);
        this.addPluginToAttirbutes({
            name, url
        });
    }

    private addPluginToAttirbutes(payload: any): void {
        const currentPlugins = this.attributes.plugins;
        if (!currentPlugins) {
            this.setAttributes({ plugins: { [payload.name]: payload } });
        } else {
            this.setAttributes({ plugins: { ...currentPlugins, [payload.name]: payload  } });
        }
        this.instancePlugins.set(payload.name, payload);
    }

    public insertToSDK(room: any, moduleResult: any, name: string): void {
        try {
            room.invisiblePluginNode.pluginClasses = { ...room.invisiblePluginNode.pluginClasses, ...room.invisiblePluginNode.createPluginClasses([moduleResult[name]])};
            room.invisiblePluginNode.refreshPlugin(moduleResult[name]);
            if (!room.getInvisiblePlugin(moduleResult[name].kind)) {
                room.createInvisiblePlugin(moduleResult[name], {});
            }
            WindowManagerWrapper.addComponent(String(name), moduleResult[`${name}Wrapper`]);
        } catch (error) {
            console.log("insertToSDK error");
        }
    }

    public resize(name: string, width: number, height: number): void {
        emitter.emit(EventNames.PluginResize, { name, width: width + 20, height });
    }

    public onDestroy() {
        emitter.offAny(this.eventListener);
    }
}

export * from "./wrapper";
