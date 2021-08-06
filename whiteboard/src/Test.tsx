import * as React from "react";
import FlipDown from "@netless/flip-count-down";

export default class Test extends React.Component<{}, {}> {
    public constructor(props: {}) {
        super(props);
    }
    public render(): React.ReactNode {
        return (
            <div>
                <FlipDown/>
            </div>
        );
    }
}
