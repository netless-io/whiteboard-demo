import * as React from "react";
import "./FloatLink.less";
import gift from "./assets/image/gift.svg";
import { withTranslation, WithTranslation } from "react-i18next";

class FloatLink extends React.Component<WithTranslation, {}> {
    public constructor(props: WithTranslation) {
        super(props);
    }
    public render(): React.ReactNode {
        const { t, i18n } = this.props;
        return (
            <a href={`https://sso.agora.io/${i18n.language === "zh-CN" ? "cn" : "en"}/v3/signup`} target={"_blank"}>
                <div className="float-link">
                    <img src={gift} alt="gift" />
                    <div className="float-link-text">{t('free-10000')}</div>
                </div>
            </a>
        );
    }
}

export default withTranslation()(FloatLink);
