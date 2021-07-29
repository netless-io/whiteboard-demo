import { InvisiblePlugin, InvisiblePluginContext, Room, Event, View, ViewVisionMode, CameraState } from "white-web-sdk";
import Emittery from "emittery";
import { loadPlugin } from "./loader";
import { WindowManagerWrapper } from "./wrapper";

// import "winbox/dist/css/winbox.min.css";
// import "winbox/dist/css/themes/modern.min.css";
import "./box/css/winbox.less";
import "./box/css/themes/white.less";
import "./style.css";
import { WinBox } from "./box/src/winbox";

export type WindowMangerAttributes = {
    modelValue?: string,
    [key: string]: any,
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
    WindowCreated = "WindowCreated",
}

export enum PluginAttributes {
    Size = "size",
    Position = "position",
}

export class WindowManager extends InvisiblePlugin<WindowMangerAttributes> {
    public static kind: string = "WindowManager";
    public static instance: WindowManager;
    public static boardElement: HTMLDivElement | null = null;
    private instancePlugins: Map<string, Plugin> = new Map();
    public viewMap: Map<string, View> = new Map();

    constructor(context: InvisiblePluginContext) {
        super(context);
        emitter.onAny(this.eventListener);
        this.displayer.addMagixEventListener(EventNames.PluginMove, this.pluginMoveListener);
        this.displayer.addMagixEventListener(EventNames.PluginFocus, this.pluginFocusListener);
        this.displayer.addMagixEventListener(EventNames.PluginResize, this.pluginResizeListener);
        WindowManager.instance = this;
    }

    public static onCreate(instance: WindowManager) {
        const plugins = instance.attributes.plugins as Plugins;
        if (plugins) {
            for (const [_, plugin] of Object.entries(plugins)) {
                instance.addPlugin(plugin.name, plugin.url, false);
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

    public updatePluginAttributes(name: string, keys: string[], value: any) {
        this.updateAttributes([name, ...keys], value);
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
        const pluginAttributes = this.attributes[name];
        const position = pluginAttributes?.[PluginAttributes.Position];
        const focus = this.attributes.focus;
        const size = pluginAttributes?.[PluginAttributes.Size];
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
                this.updateAttributes([payload.name, PluginAttributes.Position], { x: payload.x, y: payload.y });
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
                this.updateAttributes([payload.name, PluginAttributes.Size], { width: payload.width, height: payload.height })
                break;
            }
            case "init": {
                this.onPluginBoxInit(payload.name);
                break;
            }
            case "close": {
                this.instancePlugins.delete(payload.name);
                break;
            }
            default:
                break;
        }
    }

    public static async use(room: Room): Promise<WindowManager> {
        let manger = room.getInvisiblePlugin(WindowManager.kind);
        if (!manger) {
            manger = await room.createInvisiblePlugin(WindowManager, {});
        }
        WindowManager.boardElement = (room as any).cameraObserver.mainView.divElement;
        return manger as WindowManager;
    }

    public async addPlugin(name: string, url: string, isFirst = true) {
        const scriptText = await loadPlugin(url);
        try {
            this.excuteFuntion(scriptText, name, url, isFirst);
        } catch (error) {
            if (error.message.includes("Can only have one anonymous define call per script file")) {
                // @ts-ignore
                const define = window.define;
                if("function" == typeof define && define.amd) {
                    delete define.amd;
                }
                this.excuteFuntion(scriptText, name, url, isFirst);
            }
        }
    }

    private excuteFuntion(scriptText: string, name: string, url: string, isFirst: boolean) {
        let moduleResult = Function(scriptText)();
        if (typeof moduleResult === "undefined") {
            // @ts-ignore
            moduleResult = window[name];
        }
        this.insertToSDK(this.displayer, moduleResult, name);
        this.addPluginToAttirbutes({ name, url });
        if (isFirst) {
            this.setAttributes({ [name]: {
                [PluginAttributes.Size]: { width: 0, height: 0 },
                [PluginAttributes.Position]: { x: 0, y: 0 }
            } });
        }
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
            console.log("insertToSDK error", error);
        }
    }

    public resize(name: string, width: number, height: number): void {
        const cameraState = this.displayer.state.cameraState;
        const newWidth = width / cameraState.width;
        const newHeight = height / cameraState.height;
        emitter.emit(EventNames.PluginResize, { name, width: newWidth, height: newHeight });
    }

    public getWindow(name: string): WinBox | undefined {
        return WindowManagerWrapper.winboxMap.get(name);
    }

    public createView(name: string): any {
        const room = this.displayer as Room;
        if (room) {
            const view = room.views.createView();
            view.mode = ViewVisionMode.Writable;
            this.viewMap.set(name, view);
            return view;
        }
    }

    public getRoomCameraState(): CameraState {
        return this.displayer.state.cameraState;
    }

    public onWindowCreated(name: string, listener: any) {
        emitter.on(`${name}${EventNames.WindowCreated}`, listener);
    }

    public onDestroy() {
        emitter.offAny(this.eventListener);
    }
}

export * from "./wrapper";
