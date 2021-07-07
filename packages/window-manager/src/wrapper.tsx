import * as React from "react";
import Winbox from "winbox/src/js/winbox";
import type WinBox  from "winbox";
import { emitter, EventNames } from "./index";
import debounce from "lodash.debounce";
 
export class WindowManagerWrapper extends React.Component {
    public static componentsMap = new Map<string, any>();
    public winboxMap = new Map<string, WinBox>();

    constructor(props: any) {
        super(props);
        emitter.on(EventNames.PluginMove, this.pluginMoveListener);
        emitter.on(EventNames.PluginFocus, this.pluginFocusListener);
        emitter.on(EventNames.PluginResize, this.pluginResizeListener);
        emitter.on(EventNames.UpdateWindowManagerWrapper, this.messageListener);
    }

    private pluginMoveListener = (payload: any) => {
        const pluginBox = this.winboxMap.get(payload.name);
        if (pluginBox) {
            pluginBox.onmove = () => {};
            pluginBox.focus();
            pluginBox.move(payload.x, payload.y);
            pluginBox.onmove = this.boxOnMove(payload.name);
        }
    }

    private pluginFocusListener = (payload: any) => {
        const pluginBox = this.winboxMap.get(payload.name);
        if (pluginBox) {
            pluginBox.focus();
        }
    }

    private pluginResizeListener = (payload: any) => {
        const pluginBox = this.winboxMap.get(payload.name);
        if (pluginBox) {
            pluginBox.onresize = () => {};
            pluginBox.focus();
            pluginBox.resize(payload.width, payload.height);
            pluginBox.onresize = this.boxOnResize(payload.name);
        }
    }

    private boxOnMove = (name: string) => {
        return debounce(function(x, y) {
            emitter.emit("move", { name, x, y });
        }, 10);
    }

    private boxOnFocus = (name: string) => {
        return () => {
            emitter.emit("focus", { name });
        };
    }

    private boxOnResize = (name: string) => {
        return debounce(function(width: number, height: number) {
            emitter.emit("resize", { name, width, height });
        }, 10);
    }

    private boxOnClose = (name: string) => {
        return () => {
            emitter.emit("close", { name });
            WindowManagerWrapper.componentsMap.delete(name);
            this.winboxMap.delete(name);
            const wrapperDom = document.querySelector(`.${name}-wrapper`) as HTMLDivElement;
            if (wrapperDom) {
                wrapperDom.style.display = "none";
            }
            setTimeout(() => {
                this.forceUpdate();
            });
            return true;
        };
    }

    componentDidCatch(error: any) {
        console.log(error);
        return (
            <div>error</div>
        );
    }

    componentWillUnmount(): void {
        emitter.clearListeners();
        this.winboxMap.forEach(box => {
            box.unmount();
        });
        this.winboxMap.clear();
    }

    private messageListener = () => {
        this.forceUpdate();
    }

    public static addComponent(name: string, node: React.ReactNode): void {
        WindowManagerWrapper.componentsMap.set(name, node);
        emitter.emit(EventNames.UpdateWindowManagerWrapper, true);
    }

    private setRef = (name: string, ref: HTMLDivElement | null) => {
        if (!this.winboxMap.has(name) && ref) {
            emitter.emit("init", { name });
            const box = new Winbox(name, {
                class: "modern plugin-winbox",
                border: 0,
            }) as WinBox;
            this.winboxMap.set(name, box);
            emitter.once(EventNames.InitReplay).then((payload) => {
                const box = this.winboxMap.get(name);
                if (box) {
                    box.mount(ref);
                    if (payload.x && payload.y) {
                        box.move(payload.x, payload.y);
                    }
                    if (payload.focus) {
                        box.focus();
                    }
                    if (payload.width && payload.height) {
                        box.resize(payload.width, payload.height);
                    }
                    box.onmove = this.boxOnMove(name);
                    box.onfocus = this.boxOnFocus(name);
                    box.onresize = this.boxOnResize(name);
                    box.onclose = this.boxOnClose(name);
                } 
            });
        }
    }

    private renderComponent(name: string, Comp: any): React.ReactNode {
        return (
            <div ref={(ref) => {
                this.setRef(name, ref);
            }} key={`plugin-${name}`} className={`${name}-wrapper`}
            style={{ width: "100%", height: "100%" }}>
                <Comp />
            </div>
        );
    }

    private renderMaps(): React.ReactNode {
        const componentsMap = WindowManagerWrapper.componentsMap;
        const names = Array.from(componentsMap.keys());
        return (
            <>
                {names.map(name => {
                    const Component = componentsMap.get(name);
                    return this.renderComponent(name, Component);
                })}
            </>
        );
    }

    render(): React.ReactNode {
        return (
            <>
                {this.props.children}
                <div className="window-manger" style={{
                    width: "100vw", height: "100vh", position: "absolute", left: 0, top: 0
                }}>
                    {this.renderMaps()}
                </div>
            </>
        )
    }
}