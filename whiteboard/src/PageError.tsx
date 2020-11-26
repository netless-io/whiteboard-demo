import * as React from "react";
import "./PageError.less";
import room_not_find from "./assets/image/room_not_find.svg";
import {Button} from "antd";
import { Link } from "react-router-dom";
import { withTranslation, WithTranslation } from 'react-i18next';


class PageError extends React.Component<WithTranslation, {}> {
    public constructor(props: WithTranslation) {
        super(props);
    }
    public render(): React.ReactNode {
        const { t } = this.props
        return (
            <div className="page404-box">
                <div className="page404-image-box">
                    <img className="page404-image-inner"
                         src={room_not_find}
                         alt={"room_not_find"}/>
                    <div className="page404-inner">
                        <div className="page404-inner-title">
                            {t('pageErrorTitle')}
                        </div>
                        <div className="page404-inner-script">
                            {t('pageErrorInner')}
                        </div>
                        <Link to={"/"}>
                            <Button size={"large"} style={{width: 118}}>çç
                                {t('backHomePage')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default withTranslation()(PageError)