const SyncTimeInterval = 2;

export class ProgressSyncNode {

    private isFirstSync: boolean = true;

    public constructor(
        private readonly player: HTMLVideoElement,
    ) {}

    public syncProgress(progressTime: number): void {
        if (this.isFirstSync) {
            this.isFirstSync = false;
            this.player.currentTime = progressTime;
        } else {
            const delta = Math.abs(this.player.currentTime - progressTime);
            if (delta >= SyncTimeInterval) {
                this.player.currentTime = progressTime;
            }
        }
    }
}