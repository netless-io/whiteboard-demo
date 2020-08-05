import * as React from "react";
import {Room} from "white-web-sdk";
import "./index.less";
export type DocsCenterStates = {
};

export type DocsCenterProps = {
    room: Room;
};

export default class DocsCenter extends React.Component<DocsCenterProps, DocsCenterStates> {

    public constructor(props: DocsCenterProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <div>
            </div>
        );
    }
}
