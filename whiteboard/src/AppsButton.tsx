// import "./AppsButton.less";
// import React, { ReactElement, SVGProps } from "react";
// import { Tooltip, Modal, Button } from "antd";


// const apps: { id: string; url: string; name: string }[] = [
//     {
//         id: "MonacoPlugin",
//         url: "https://cdn.jsdelivr.net/npm/@l1shen/vscode@0.0.36/dist/index.js",
//         name: "Code Editor",
//     },
// ];

// function MdiAppsIcon(props: SVGProps<SVGSVGElement>) {
//     return (
//         <svg focusable="false" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
//             <path
//                 d="M16 20h4v-4h-4m0-2h4v-4h-4m-6-2h4V4h-4m6 4h4V4h-4m-6 10h4v-4h-4m-6 4h4v-4H4m0 10h4v-4H4m6 4h4v-4h-4M4 8h4V4H4v4z"
//                 fill="currentColor"
//             ></path>
//         </svg>
//     );
// }

// interface Props {
// }

// interface State {
//     appStoreIsVisible: boolean;
//     loading: boolean;
// }

// export class AppsButton extends React.Component<Props, State> {
//     public constructor(props: Props) {
//         super(props);
//         this.state = {
//             appStoreIsVisible: false,
//             loading: false,
//         };
//     }

//     public render(): ReactElement {
//         return (
//             <>
//                 <Tooltip placement="right" key="apps" title="Apps">
//                     <div className="apps-button" onClick={this.showAppStore}>
//                         <MdiAppsIcon />
//                     </div>
//                 </Tooltip>
//                 <Modal
//                     visible={this.state.appStoreIsVisible}
//                     footer={null}
//                     onCancel={this.hideAppStore}
//                     title="App Store"
//                     destroyOnClose
//                 >
//                     {apps.map((e) => (
//                         <Button
//                             key={e.id}
//                             loading={this.state.loading}
//                             disabled={(this.props.manager as any)?.instancePlugins.has(e.id)}
//                             onClick={() => this.loadApp(e.id)}
//                         >
//                             {e.name}
//                         </Button>
//                     ))}
//                 </Modal>
//             </>
//         );
//     }

//     private showAppStore = (): void => {
//         this.setState({ appStoreIsVisible: true });
//     };

//     private hideAppStore = (): void => {
//         this.setState({ appStoreIsVisible: false });
//     };

//     private async loadApp(id: string): Promise<void> {
//         const app = apps.find((e) => e.id === id)!;
//         this.setState({ loading: true });
//         await this.props.manager?.addPlugin(app.id, app.url);
//         this.setState({ loading: false, appStoreIsVisible: false });
//     }
// }
