import * as React from "react";
import Editor from "react-monaco-editor";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { MonacoPlugin, MonacoPluginAttributes } from "./index";
import {ApplianceNames, Room, RoomState} from "white-web-sdk";
import { Rnd } from "react-rnd";
import "./wrapper.less";

const eventName = "onDidChangeModelContent"
let onExecuteEdits = false;

export class MonacoPluginWrapper extends React.Component<{}, { width: string, height: string }> {
    private editor: monacoEditor.editor.IStandaloneCodeEditor | undefined;
    static monacoPluginInstance: MonacoPlugin | null;
    public constructor(props: {}) {
        super(props);
        this.state = {
            width: "640",
            height: "480",
        };
    }

    componentDidMount() {
        const instance = MonacoPlugin.displayer.getInvisiblePlugin(MonacoPlugin.kind);
        MonacoPluginWrapper.monacoPluginInstance = instance as any;
        const observerId = (MonacoPlugin.displayer as Room).observerId;
        if (instance) {
            const attributes =  instance.attributes as MonacoPluginAttributes;
            if (attributes.modelValue) {
                onExecuteEdits = true;
                this.editor?.getModel()?.setValue(attributes.modelValue);
                onExecuteEdits = false;
            }
        }
        MonacoPlugin.displayer.addMagixEventListener(eventName, (data: any) => {
            if (observerId !== data.authorId) {
                if (this.editor) {
                    (window as any).editor = this.editor;
                    onExecuteEdits = true;
                    this.editor.executeEdits(String(data.authorId), JSON.parse(data.payload));
                    onExecuteEdits = false;
                }
            }
        })

        MonacoPlugin.displayer.callbacks.on("onRoomStateChanged", (state: RoomState) => {
            if (state.memberState) {
                this.setState({ currentApplianceName: state.memberState.currentApplianceName });
            }
        })
    }

    handleEditorDidMount(editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: any) {
        const displayer = MonacoPlugin.displayer as Room;

        editor.onDidChangeModelContent(e => {
            if (!onExecuteEdits) {
                displayer.dispatchMagixEvent(eventName, JSON.stringify(e.changes));
                MonacoPluginWrapper.monacoPluginInstance?.setAttributes({
                    modelValue: editor.getModel()?.getValue()
                })
            }
        })
        editor.onDidFocusEditorWidget(() => {
            // const instance = MonacoPluginWrapper.monacoPluginInstance;
            // if (instance?.attributes.editorId) {
            //     editor.updateOptions({ readOnly: true });
            // } else {
            //     instance?.setAttributes({
            //         editorId: displayer.observerId
            //     })
            // }
            displayer.setMemberState({currentApplianceName: ApplianceNames.clicker});
        })
        editor.onDidBlurEditorWidget(() => {
            // const instance = MonacoPluginWrapper.monacoPluginInstance;
            // if (instance?.attributes.editorId) {
            //     instance.setAttributes({ editorId: undefined })
            // }
            // displayer.setMemberState({currentApplianceName: ApplianceNames.pencil});
        })
    }

    private onWindowFocus = (): void => {
        const room = MonacoPlugin.displayer as Room;
        room.setMemberState({currentApplianceName: ApplianceNames.clicker});
    }

    private onWindowBlur = (): void => {
        const room = MonacoPlugin.displayer as Room;
        room.setMemberState({currentApplianceName: ApplianceNames.pencil});
    }

    componentWillUnmount() {
        console.log("unmount")
    }

    render() {
        if (!this.setState || this.state?.currentApplianceName !== "clicker") {
            this.editor?.updateOptions({ readOnly: true });
        } else {
            this.editor?.updateOptions({ readOnly: false });
        }
        return (
            <React.Fragment>
                {this.props.children}
                
                    <Rnd
                        dragHandleClassName={"window-drag-bar"}
                        style={{
                            width: this.state.width,
                            height: this.state.height,
                        }}
                        className="window-box"
                        onResize={(e, direction, ref, delta, position) => {
                            this.setState({
                                width: ref.style.width,
                                height: ref.style.height,
                            })
                        }}
                        minHeight={320}
                        minWidth={480}
                        default={{
                            x: window.innerWidth / 2 - 320,
                            y: window.innerHeight / 2 - 240,
                            width: this.state.width,
                            height: this.state.height,
                        }}
                    >
                        <div
                            className="window-drag-bar">
                            <div style={{backgroundColor: "#FF6058"}} className="window-drag-btn"/>
                            <div style={{backgroundColor: "#FEBC2D"}} className="window-drag-btn"/>
                            <div style={{backgroundColor: "#29C83F"}} className="window-drag-btn"/>
                        </div>
                        <Editor
                            width={this.state.width}
                            height={`${parseInt(this.state.height) - 24}`}
                            theme="vs-dark"
                            language="javascript"
                            editorDidMount={this.handleEditorDidMount as any}
                            ref={(ref: any) => this.editor = ref?.editor} />
                    </Rnd>
            </React.Fragment>
        )
    }
}
