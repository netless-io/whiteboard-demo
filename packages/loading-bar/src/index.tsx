import * as React from "react";
import TweenOne from "rc-tween-one";
import "./index.less";

export type TopLoadingBarProps = {
    loadingPercent: number;
    style?: React.CSSProperties;
};

export type TopLoadingBarStates = {
    lastPercent: number;
    continuousTimer: any;
};

export default class TopLoadingBar extends React.Component<TopLoadingBarProps, TopLoadingBarStates> {

    public constructor(props: TopLoadingBarProps) {
        super(props);
        this.state = {
            lastPercent: 100,
            continuousTimer: null,
        };
    }

    public render(): React.ReactNode {
        return (
            <TweenOne
                animation={{
                    duration: 150,
                    width: `${this.props.loadingPercent}%`,
                    display: (this.props.loadingPercent === 100) ? "none" : "flex",
                }}
                style={{...this.props.style}}
                className={"process-top-bar"}
            />
        );
    }
}