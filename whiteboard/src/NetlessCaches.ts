export class NetlessCaches {
    private netlessCaches: Promise<Cache> | null = null;
    public openCache = (cachesName: string): Promise<Cache> => {
        if (!this.netlessCaches) {
            this.netlessCaches = caches.open(cachesName);
        }
        return this.netlessCaches;
    }
}

export const netlessCaches = new NetlessCaches();
