import  * as React from "react";
import {BrowserRouter} from "react-router-dom";
import {Route, Switch} from "react-router";
import {message} from "antd";
import WhiteboardCreatorPage from "./WhiteboardCreatorPage";
import IndexPage from "./IndexPage";
import WhiteboardPage from "./WhiteboardPage";
import ReplayPage from "./ReplayPage";
import ReplaySyncPage from "./ReplaySyncPage";
import JoinPage from "./JoinPage";
import AddNamePage from "./AddNamePage";
import HistoryPage from "./HistoryPage"
import Storage from "./Storage";
import CreatePage from "./CreatePage";
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
                    <Route path="/replay/:identity/:uuid/:userId/" component={ReplayPage} />
                    <Route path="/replaySync/:identity/:uuid/:userId/" component={ReplaySyncPage} />
                    <Route path="/whiteboard/:identity/:uuid/:userId/" component={WhiteboardPage} />
                    <Route path="/whiteboard/:identity/:uuid?/" component={WhiteboardCreatorPage} />
                    <Route path="/history/" component={HistoryPage} />
                    <Route path="/join/" component={JoinPage}/>
                    <Route path="/create/" component={CreatePage}/>
                    <Route path="/name/:uuid?/" component={AddNamePage}/>
                    <Route path="/storage/" component={Storage}/>
                    <Route path="/" component={IndexPage}/>
                </Switch>
            </BrowserRouter>
      );
    }
}
