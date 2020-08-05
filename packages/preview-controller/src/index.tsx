import * as React from "react";
import {Room} from "white-web-sdk";
import MenuBox from "@netless/menu-box";
import "./index.less";
import MenuAnnexBox from "./MenuAnnexBox";
export type PreviewControllerState = {
    isMenuVisible: boolean;
};

export type PreviewControllerProps = {
    room: Room;
};

export default class PreviewController extends React.Component<PreviewControllerProps, PreviewControllerState> {

    public constructor(props: PreviewControllerProps) {
        super(props);
        this.state = {
            isMenuVisible: false,
        };
    }
    private handleAnnexBoxMenuState = async (): Promise<void> => {
        this.setState({
            isMenuVisible: !this.state.isMenuVisible,
        });
    }

    public render(): React.ReactNode {
        const {isMenuVisible} = this.state;
        const {room} = this.props;
        return (
            <div className="preview-controller">
                <MenuBox
                    isVisible={isMenuVisible}
                >
                    <MenuAnnexBox
                        room={room}
                        handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}/>
                </MenuBox>
                <div
                    className="preview-controller-btn"
                    onClick={() => {
                        this.setState({isMenuVisible: !this.state.isMenuVisible});
                    }}
                >
                    预览
                </div>
            </div>
        );
    }
}
