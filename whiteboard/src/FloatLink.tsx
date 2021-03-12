import * as React from "react";
import "./FloatLink.less";
import gift from "./assets/image/gift.svg";

export default class FloatLink extends React.Component<{}, {}> {
    public constructor(props: {}) {
        super(props);
    }
    public render(): React.ReactNode {
        return (
            <a href={"https://sso.agora.io/cn/v3/signup"} target={"_blank"}>
                <div className="float-link">
                    <img src={gift} alt={"gift"}/>
                    <div>免费领取 10,000 分钟使用时长</div>
                </div>
            </a>
        );
    }
}
