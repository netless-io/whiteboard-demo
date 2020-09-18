import * as React from "react";
import * as ReactDOM from "react-dom";
import {AppRoutes} from "./AppRoutes";
import "antd/dist/antd.less";

ReactDOM.render(
    <AppRoutes/>,
  document.getElementById("root") as HTMLElement,
);

navigator.serviceWorker.register('worker.js').then(function() {
  console.log("install")
}).catch(function(error) {
  console.log('An error happened during installing the service worker:');
  console.log(error.message);
});
