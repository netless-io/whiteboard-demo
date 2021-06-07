import fetchProgress from "@netless/fetch-progress";
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
export class NetlessCaches {
    private netlessCaches: Promise<Cache> | null = null;
    public openCache = (cachesName: string): Promise<Cache> => {
        if (!this.netlessCaches) {
            this.netlessCaches = caches.open(cachesName);
        }
        return this.netlessCaches;
    }

    public deleteCache = async () => {
        const result = await caches.delete("netless");
        console.log(`remove netless cache successfully: ${result}`);
        this.netlessCaches = null;
    }

    /**
     * 计算 cache 占用空间，大小单位为 Byte，/1024 为 KiB 大小。
     */
    public calculateCache = async (): Promise<number> => {
        const cache = await netlessCaches.openCache("netless");
        const keys = await cache.keys();
        let size = 0;
        for (const request of keys) {
            const response = await cache.match(request)!;
            if (response) {
                size += await (await response.blob()).size
            }
        }
        return size / (1024 * 1024);
    }

    public deleteTaskUUID = async (uuid: string) =>  {
        const cache = await this.openCache("netless");
        const keys = await cache.keys();
        for (const request of keys) {
            if (request.url.indexOf(uuid) !== -1) {
                await cache.delete(request);
            }
        }
    }

    public hasTaskUUID = async (uuid: string): Promise<boolean> =>  {
        const cache = await this.openCache("netless");
        const keys = await cache.keys();
        for (const request of keys) {
            if (request.url.indexOf(uuid) !== -1) {
                return true;
            }
        }
        return false;
    }

    public startDownload = async (taskUuid: string, onProgress?: (progress: number, controller: AbortController) => void): Promise<void> => {
        const controller = new AbortController();
        const signal = controller.signal;
        const zipUrl = `https://${resourcesHost}/dynamicConvert/${taskUuid}.zip`;
        const res = await fetch(zipUrl, {
            method: "get",
            signal: signal,
        }).then(fetchProgress({
            onProgress(progress) {
                if (onProgress) {
                    onProgress(progress.percentage, controller);
                }
            },
        }));
        if (res.status !== 200) {
            throw new Error(`download task ${JSON.stringify(taskUuid)} failed with status ${res.status}`);
        }
        const buffer = await res.arrayBuffer();
        const zipReader = await this.getZipReader(buffer);
        return await this.cacheContents(zipReader);
    }

    private getZipReader = (data: any): Promise<any> => {
        return new Promise((fulfill, reject) => {
            zip.createReader(new zip.ArrayBufferReader(data), fulfill, reject);
        });
    }

    private getContentType = (filename: any): string => {
        const tokens = filename.split(".");
        const extension = tokens[tokens.length - 1];
        return contentTypesByExtension[extension] || "text/plain";
    }


    private getLocation = (filename?: string): string => {
        return `https://${resourcesHost}/dynamicConvert/${filename}`;
    }

    private cacheEntry = (entry: any): Promise<void> => {
        if (entry.directory) {
            return Promise.resolve();
        }
        return new Promise((fulfill, reject) => {
            entry.getData(new zip.BlobWriter(), (data) => {
                return netlessCaches.openCache("netless").then((cache) => {
                    const location = this.getLocation(`8a3cf920c78d11eba5bcdf411b268cfd/${entry.filename}`);
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

    public availableSpace = async (): Promise<number> => {
        if (navigator.storage && navigator.storage.estimate) {
            const quota = await navigator.storage.estimate();
            if (quota.usage) {
                return quota.usage/ (1024 * 1024);
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    private cacheContents = (reader: any): Promise<void> => {
        return new Promise((fulfill, reject) => {
            reader.getEntries((entries) => {
                console.log('Installing', entries.length, 'files from zip');
                Promise.all(entries.map(this.cacheEntry)).then(fulfill as any, reject);
            });
        });
    }
}

export const netlessCaches = new NetlessCaches();
