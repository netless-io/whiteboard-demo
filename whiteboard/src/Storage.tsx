import * as React from "react";
import "./Storage.less";
import * as zip_icon from "./assets/image/zip.svg";
import "@netless/zip";
import fetchProgress from "@netless/fetch-progress";
import {netlessCaches} from "./NetlessCaches";
import {pptDatas} from "./pptDatas";
import {WhiteScene} from "white-web-sdk";
import {Button} from "antd";

const contentTypesByExtension = {
    "css": "text/css",
    "js": "application/javascript",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "html": "text/html",
    "htm": "text/html"
};
const resourcesHost = "convertcdn.netless.link";
export type ServiceWorkTestStates = {
    space: number;
    progress: number;
};

export default class Storage extends React.Component<{}, ServiceWorkTestStates> {

    public constructor(props: {}) {
        super(props);
        this.state = {
            space: 0,
            progress: 0,
        }
    }

    private getZipReader = (data: any): Promise<any> => {
        return new Promise((fulfill, reject) => {
            zip.createReader(new zip.ArrayBufferReader(data), fulfill, reject);
        });
    }
    private startDownload = async (url): Promise<void> => {
        const that = this;
        const res = await fetch(url).then(fetchProgress({
            onProgress(progress) {
                that.setState({progress: progress.percentage})
            },
        }));
        const buffer = await res.arrayBuffer();
        const zipReader = await this.getZipReader(buffer);
        await this.refreshSpaceData();
        return await this.cacheContents(zipReader);
    }

    private cacheContents = (reader: any): Promise<void> => {
        return new Promise((fulfill, reject) => {
            reader.getEntries((entries) => {
                console.log('Installing', entries.length, 'files from zip');
                Promise.all(entries.map(this.cacheEntry)).then(fulfill as any, reject);
            });
        });
    }

    public async componentDidMount(): Promise<void> {
        await this.refreshSpaceData();
    }

    private refreshSpaceData = async (): Promise<void> => {
        const res = await this.calculateCache();
        this.setState({space: Math.round(res/(1024 * 1024))});
    }

    private cacheEntry = (entry: any): Promise<void> => {
        if (entry.directory) {
            return Promise.resolve();
        }
        return new Promise((fulfill, reject) => {
            entry.getData(new zip.BlobWriter(), (data) => {
                return netlessCaches.openCache("netless").then((cache) => {
                    const location = this.getLocation(entry.filename);
                    const response = new Response(data, {
                        headers: {
                            "Content-Type": this.getContentType(entry.filename)
                        }
                    });
                    if (entry.filename === "index.html") {
                        cache.put(this.getLocation(), response.clone());
                    }
                    return cache.put(location, response);
                }).then(fulfill, reject);
            });
        });
    }

    private getContentType = (filename: any): string => {
        const tokens = filename.split(".");
        const extension = tokens[tokens.length - 1];
        return contentTypesByExtension[extension] || "text/plain";
    }

    private deleteCache = async () => {
        const cache = await netlessCaches.openCache("netless");
        const result = await caches.delete("netless");
        await this.refreshSpaceData();
        console.log(`remove netless cache successfully: ${result}`);
    }

    /**
     * 计算 cache 占用空间，大小单位为 Byte，/1024 为 KiB 大小。
     */
    private calculateCache = async () => {
        const cache = await netlessCaches.openCache("netless");
        const keys = await cache.keys();
        let size = 0;
        for (const request of keys) {
            const response = await cache.match(request)!;
            if (response) {
                size += await (await response.blob()).size
            }
        }
        return size;
    }

    private getLocation = (filename?: string): string => {
        return `https://${resourcesHost}/dynamicConvert/${filename}`;
    }

    private renderZipCells = (): React.ReactNode => {
        return pptDatas.map((pptData: string, index: number) => {
            const scenes: WhiteScene[] = JSON.parse(pptData);
            let icon = zip_icon;
            let zipUrl;
            if (scenes[0] && scenes[0].ppt) {
                const regex = /dynamicConvert\/([^\/]+)/gm;
                const inner = scenes[0].ppt.src.match(regex);
                if (inner) {
                    const taskUuid = inner[0].replace("dynamicConvert/", "")
                    zipUrl = `https://${resourcesHost}/dynamicConvert/${taskUuid}.zip`
                }
                if (scenes[0].ppt.previewURL) {
                    icon = scenes[0].ppt.previewURL;
                }
            }

            if (zipUrl) {
                return (
                    <div key={`zip-${index}`}
                         style={{backgroundColor: "#F2F2F2"}}
                         onClick={() => this.startDownload(zipUrl)} className="service-box-zip">
                        <img src={icon} alt={"zip"}/>
                    </div>
                )
            } else {
                return null;
            }
        });
    }

    public render(): React.ReactNode {
        return (
            <div className="service-box">
                {this.state.space}
                <Button onClick={async () => {
                    await this.deleteCache();
                }}>
                    清空
                </Button>
                {this.renderZipCells()}
            </div>
        );
    }
}
