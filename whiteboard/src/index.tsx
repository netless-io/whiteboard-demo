import * as React from "react";
import * as ReactDOM from "react-dom";
import {AppRoutes} from "./AppRoutes";
import "antd/dist/antd.less";

ReactDOM.render(
    <AppRoutes/>,
  document.getElementById("root") as HTMLElement,
);
if (navigator.serviceWorker && navigator.serviceWorker.register) {
    navigator.serviceWorker.register('./worker.js').then(function(registration) {
      console.log("install")
    }).catch(function(error) {
      console.log('An error happened during installing the service worker:');
      console.log(error.message);
    });
}
