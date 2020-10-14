enum Phase {
    Waiting, Delay, Invoking
}

export class AsyncRefresher {

    public readonly delayTime: number;
    private readonly asyncHandler: () => Promise<void>;

    private phase: Phase = Phase.Waiting;
    private delayTimer: any = null;
    private shouldInvokeAfterInvoke = false;

    public constructor(delayTime: number, asyncHandler: () => Promise<void>) {
        this.delayTime = delayTime;
        this.asyncHandler = asyncHandler;
    }

    public invoke(): void {
        switch (this.phase) {
            case Phase.Waiting: {
                this.delayTimer = setTimeout(this.onTimeout, this.delayTime);
                this.phase = Phase.Delay;
                break;
            }
            case Phase.Invoking: {
                this.shouldInvokeAfterInvoke = true;
                break;
            }
        }
    }

    public cancel(): void {
        switch (this.phase) {
            case Phase.Delay: {
                clearTimeout(this.delayTimer);
                this.delayTimer = null;
                this.phase = Phase.Waiting;
                break;
            }
            case Phase.Invoking: {
                this.shouldInvokeAfterInvoke = false;
                break;
            }
        }
    }

    private onTimeout = async (): Promise<void> => {
        if (this.phase === Phase.Delay) {
            this.phase = Phase.Invoking;
            try {
                await this.asyncHandler();

            } catch (error) {
                console.error(error);

            } finally {
                if (this.shouldInvokeAfterInvoke) {
                    this.shouldInvokeAfterInvoke = false;
                    this.delayTimer = setTimeout(this.onTimeout, this.delayTime);
                    this.phase = Phase.Delay;
                } else {
                    this.phase = Phase.Waiting;
                }
            }
        }
        this.delayTimer = null;
    }
}