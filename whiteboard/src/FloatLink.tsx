import * as React from "react";
import "./FloatLink.less";
import logo from "./assets/image/logo.png";
import clock from "./assets/image/clock.svg";
import close from "./assets/image/close.svg";
// import gift from "./assets/image/gift.svg";
import { withTranslation, WithTranslation } from "react-i18next";

class FloatLink extends React.Component<WithTranslation, { visible: boolean }> {
    public constructor(props: WithTranslation) {
        super(props);
        this.state = { visible: true };
    }

    public render(): React.ReactNode {
        const { t, i18n } = this.props;
        const href = `https://sso.agora.io/${i18n.language === "zh-CN" ? "cn" : "en"}/v3/signup`;
        if (!this.state.visible) return null;
        return (
            <div className="float-link">
                <img src={logo} alt="agora" />
                <span className="float-link-content">
                    <img src={clock} alt="" />
                    <div className="float-link-text">{t("free-10000")}</div>
                    <a href={href} target="_blank">
                        {t("get-it")}
                    </a>
                </span>
                <span className="float-link-close" onClick={this.hide}>
                    <img src={close} alt="close" />
                </span>
            </div>
        );
    }

    private hide = () => {
        this.setState({ visible: false });
    };
}

export default withTranslation()(FloatLink);
