import * as React from "react";

export type IconProps = {
    color?: string;
    className?: string;
};

export class StrokeWidth extends React.Component<IconProps, {}> {

    public constructor(props: IconProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <div className={this.props.className}>
                <svg width="242" height="32" viewBox="0 0 269 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M252 31.9693V32L0 16V15L252 0V0.030742C252.331 0.0103478 252.664 0 253 0C261.837 0 269 7.16344 269 16C269 24.8366 261.837 32 253 32C252.664 32 252.331 31.9897 252 31.9693Z"
                        fill={this.props.color}/>
                </svg>
            </div>
        );
    }
}
