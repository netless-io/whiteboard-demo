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
    public calculateCache = async () => {
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

    public deleteTaskUUID = async (uuid: string) =>  {
        if (this.netlessCaches) {
            const cache = await this.netlessCaches;
            const keys = await cache.keys();
            for (const request of keys) {
                if (request.url.indexOf(uuid) !== -1) {
                    await cache.delete(request);
                }
            }
        }
    }

    public hasTaskUUID = async (uuid: string): Promise<boolean> =>  {
        if (this.netlessCaches) {
            const cache = await this.netlessCaches;
            const keys = await cache.keys();
            for (const request of keys) {
                if (request.url.indexOf(uuid) !== -1) {
                    return true;
                }
            }
        }
        return false;
    }
}

export const netlessCaches = new NetlessCaches();
