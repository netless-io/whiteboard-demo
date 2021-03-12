import * as React from "react";
import * as ReactDOM from "react-dom";
import {AppRoutes} from "./AppRoutes";
import "antd/dist/antd.less";
import './i18n'
import FloatLink from "./FloatLink";

ReactDOM.render(
        <>
            <FloatLink/>
            <AppRoutes/>
        </>,
  document.getElementById("root") as HTMLElement,
);
