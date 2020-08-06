import * as React from "react";
import {Room} from "white-web-sdk";
import "./index.less";
import MenuBox, {PagePreviewPositionEnum} from "@netless/menu-box";
import WhiteboardFile from "./WhiteboardFile";

export type DocsCenterStates = {
    isFileOpen: boolean;
};

export type DocsCenterProps = {
    room: Room;
};

export default class DocsCenter extends React.Component<DocsCenterProps, DocsCenterStates> {

    public constructor(props: DocsCenterProps) {
        super(props);
        this.state = {
            isFileOpen: false,
        };
    }

    private handleFileState = (): void => {
        this.setState({isFileOpen: !this.state.isFileOpen});
    }


    public render(): React.ReactNode {
        const {room} = this.props;
        const {isFileOpen} = this.state;
        return (
            <div className="docs-center">
                <MenuBox
                    pagePreviewPosition={PagePreviewPositionEnum.left}
                    isVisible={isFileOpen}
                >
                    <WhiteboardFile
                        handleFileState={this.handleFileState}
                        room={room}/>
                </MenuBox>
                <div
                    className="docs-center-btn"
                    onClick={() => {
                        this.setState({isFileOpen: !this.state.isFileOpen});
                    }}
                >
                    预览
                </div>
            </div>
        );
    }
}
