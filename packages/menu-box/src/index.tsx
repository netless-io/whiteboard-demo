import * as React from "react";
import "./index.less";
const Menu = require("react-burger-menu/lib/menus/slide");

const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type MenuBoxStyleState = {
    menuStyles: any,
    isMenuOpen: boolean,
};

export enum PagePreviewPositionEnum {
    left = "left",
    right = "right",
}


const styles: any = {
    bmMenu: {
        boxShadow: "0 8px 24px 0 rgba(0,0,0,0.15)",
    },
    bmBurgerButton: {
        display: "none",
    },
};

const styles2: any = {
    bmBurgerButton: {
        display: "none",
    },
};


export type MenuBoxProps = {
    isVisible: boolean;
    width?: number;
    pagePreviewPosition?: PagePreviewPositionEnum;
};

export default class MenuBox extends React.Component<MenuBoxProps, MenuBoxStyleState> {

    public constructor(props: MenuBoxProps) {
        super(props);
        this.state = {
            menuStyles: this.props.isVisible ? styles : styles2,
            isMenuOpen: false,
        };
    }

    private async getMenuStyle(isOpen: boolean): Promise<void> {
        if (isOpen) {
            this.setState({
                menuStyles: styles,
            });
        } else {
            await timeout(200);
            this.setState({
                menuStyles: styles2,
            });
        }
    }

    public render(): React.ReactNode {
        const {pagePreviewPosition, width} = this.props;
        const isRight = pagePreviewPosition !== PagePreviewPositionEnum.left;
        return (
            <Menu
                width={width}
                noOverlay
                styles={this.state.menuStyles}
                right={isRight}
                isOpen={this.props.isVisible}
                onStateChange={async (menuState: any) => {
                    if (!menuState.isOpen) {
                        await this.getMenuStyle(false);
                    }
                    else {
                        await this.getMenuStyle(true);
                    }
                }}>
                {this.props.children}
            </Menu>
        );
    }
}