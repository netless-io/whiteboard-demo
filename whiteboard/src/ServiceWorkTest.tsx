import * as React from "react";
import "./ServiceWorkTest.less";
import * as zip_icon from "./assets/image/zip.svg";
import "@netless/zip";
import {netlessCaches} from "./NetlessCaches";

const contentTypesByExtension = {
    'css': 'text/css',
    'js': 'application/javascript',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'html': 'text/html',
    'htm': 'text/html'
};
export default class ServiceWorkTest extends React.Component<{}, {}> {

    public constructor(props: {}) {
        super(props);
    }

    private getZipReader = async (data): Promise<any> => {
        return new Promise((fulfill, reject) => {
            zip.createReader(new zip.ArrayBufferReader(data), fulfill, reject);
        });
    }
    private startDownload = async (): Promise<void> => {
        const testUrl = "https://white-sdk.oss-cn-beijing.aliyuncs.com/images/test.zip";
        fetch(testUrl).then((res) => res.arrayBuffer()).then(this.getZipReader).then(this.cacheContents);
    }

    private cacheContents = async (reader: any): Promise<void> => {
        return new Promise( (fulfill, reject) => {
            reader.getEntries( (entries) => {
                console.log('Installing', entries.length, 'files from zip');
                Promise.all(entries.map(this.cacheEntry)).then(fulfill as any, reject);
            });
        });
    }


   private cacheEntry =  async (entry: any): Promise<void> => {
        if (entry.directory) {
            return Promise.resolve();
        }
        return new Promise( (fulfill, reject) => {
             entry.getData(new zip.BlobWriter(), (data) => {
                return netlessCaches.openCache("netless").then( (cache) => {
                    const location = this.getLocation(entry.filename);
                    const response = new Response(data, {
                        headers: {
                            'Content-Type': this.getContentType(entry.filename)
                        }
                    });
                    console.log('-> Caching', location,
                        '(size:', entry.uncompressedSize, 'bytes)');
                    if (entry.filename === 'index.html') {
                        cache.put(this.getLocation(), response.clone());
                    }
                    return cache.put(location, response);
                }).then(fulfill, reject);
            });
        });
    }

    private getContentType = (filename: any): string => {
        const tokens = filename.split('.');
        const extension = tokens[tokens.length - 1];
        return contentTypesByExtension[extension] || 'text/plain';
    }

    private getLocation = (filename?: string): string =>  {
        return location.href.replace(/worker\.js$/, filename || '');
    }

    public render(): React.ReactNode {
        return (
            <div className="service-box">
                <div onClick={this.startDownload} className="service-box-zip">
                    <img src={zip_icon} alt={"zip"}/>
                </div>
            </div>
        );
    }
}
