import * as React from "react";
import Editor from "react-monaco-editor";
import * as monacoEditor from "monaco-editor/esm/vs/editor/editor.api";
import { MonacoPlugin, MonacoPluginAttributes } from "./index";
import { Room, RoomState } from "white-web-sdk";


const eventName = "onDidChangeModelContent"
let onExecuteEdits = false;

export class MonacoPluginWrapper extends React.Component<{}, { currentApplianceName: string }> {
    private editor: monacoEditor.editor.IStandaloneCodeEditor | undefined;
    static monacoPluginInstance: MonacoPlugin | null;
    
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
            const instance = MonacoPluginWrapper.monacoPluginInstance;
            if (instance?.attributes.editorId) {
                // editor.updateOptions({ readOnly: true });
            } else {
                instance?.setAttributes({
                    editorId: displayer.observerId
                })
            }
        })
        editor.onDidBlurEditorWidget(() => {
            const instance = MonacoPluginWrapper.monacoPluginInstance;
            if (instance?.attributes.editorId) {
                instance.setAttributes({ editorId: undefined })
            }
        })
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
                <div style={{position: "absolute", top: 10, left: 50, height: "100%", width: "100%"}}>
                        <div className="box no-cursor">
                            <div className="handle">click here</div>
                            <Editor 
                                height="1200px"
                                width="900px"
                                theme="vs-dark"
                                language="javascript"
                                editorDidMount={this.handleEditorDidMount as any} 
                                ref={(ref: any) => this.editor = ref?.editor} />
                        </div>
                </div>
            </React.Fragment>
        )
    }
}