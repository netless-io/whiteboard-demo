import * as React from "react";
import FlipDown from "../../packages/flip-down-clock/src";

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
