import  * as React from "react";
import {BrowserRouter} from "react-router-dom";
import {Route, Switch} from "react-router";
import {message} from "antd";
import WhiteboardCreatorPage from "./WhiteboardCreatorPage";
import IndexPage from "./IndexPage";
import WhiteboardPage from "./WhiteboardPage";
export class AppRoutes extends React.Component<{}, {}> {

    public constructor(props: {}) {
        super(props);
    }

    public componentDidCatch(error: any, inf: any): void {
        message.error(`网页加载发生错误：${error}`);
    }
    public render(): React.ReactNode {
        return (
            <BrowserRouter>
                <Switch>
                    {/*<Route path="/replay/:uuid/:userId/:startTime?/:endTime?/:mediaUrl?/" component={ReplayPage}/>*/}
                    <Route path="/whiteboard/:identityType/:uuid/:userId/" component={WhiteboardPage}/>
                    <Route path="/whiteboard/:identityType/:uuid?/" component={WhiteboardCreatorPage}/>
                    <Route path="/" component={IndexPage}/>
                </Switch>
            </BrowserRouter>
      );
    }
    // 国际化
    // public render(): React.ReactNode {
    //     return (
    //         <AppRouter historyType={HistoryType.BrowserRouter} language={language} routes={[
    //             {path: "/", component: IndexPage},
    //             {path: "/whiteboard/:identityType/:uuid?/", component: WhiteboardCreatorPage},
    //             {path: "/whiteboard/:identityType/:uuid/:userId/", component: WhiteboardPage},
    //             {path: "/replay/:uuid/:userId/:startTime?/:endTime?/:mediaUrl?/", component: ReplayPage},
    //         ]}/>
    //     );
    // }
}