import * as React from "react";
import "./ServiceWorkTest.less";
import * as zip from "./assets/image/zip.svg";

export default class ServiceWorkTest extends React.Component<{}, {}> {
    public constructor(props: {}) {
        super(props);
    }
    public render(): React.ReactNode {
        return (
            <div className="service-box">
                <div className="service-box-zip">
                    <img src={zip} alt={"zip"}/>
                </div>
            </div>
        );
    }
}
