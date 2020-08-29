import * as React from "react";
import TweenOne from "rc-tween-one";
import "./index.less";
const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type TopLoadingBarProps = {
    loadingPercent: number;
    style?: React.CSSProperties;
};

export type TopLoadingBarStates = {
    displayState: string;
};
export default class TopLoadingBar extends React.Component<TopLoadingBarProps, TopLoadingBarStates> {

    private setInte: any;
    public constructor(props: TopLoadingBarProps) {
        super(props);
        this.state = {
            displayState: "none",
        };
    }

    public componentDidMount(): void {
        this.setInte = setInterval(async () => {
            await this.loadingDisplay();
        }, 100);
    }

    public componentWillUnmount(): void {
        clearInterval(this.setInte);
    }

    private loadingDisplay = async (): Promise<void> => {
        const isLoadingDone = this.props.loadingPercent === 100;
        if (isLoadingDone) {
            await timeout(500);
            this.setState({displayState: "none"});
        } else {
            this.setState({displayState: "flex"});
        }
    }
    public render(): React.ReactNode {
        return (
            <TweenOne
                animation={{
                    duration: 150,
                    width: `${this.props.loadingPercent}%`,
                    display: this.state.displayState,
                }}
                style={{...this.props.style}}
                className={"process-top-bar"}
            />
        );
    }
}