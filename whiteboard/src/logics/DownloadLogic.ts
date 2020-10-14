import { netlessCaches } from "../NetlessCaches";

export type DownloadLogicState = {
    mode: DownloadingMode;
    pptStates: readonly PPTState[];
};

export type DownloadLogicCallbacks = {
    readonly onUpdateState: (state: Partial<DownloadLogicState>) => void;
    readonly onSpaceUpdate: () => void;
    readonly onCatchDownloadingError: (error: Error, task: PPTTask) => void;
};

export type PPTTask = {
    readonly uuid: string;
    readonly name: string;
};

export type PPTState = PPTTask & {
    readonly phase: TaskPhase;
    readonly progress: number;
};

export enum TaskPhase {
    NotCached,
    Downloading,
    Cached,
}

export enum DownloadingMode {
    OneByOne, Freedom,
}

type PPTTaskNode = PPTTask & {
    phase: TaskPhase;
    downloading?: Downloading;
};

type Downloading = {
    readonly controller: AbortController;
    progress: number;
};

type DownloadingOneByOneState = {
    index: number;
};

export class DownloadLogic {

    public static async create(tasks: readonly PPTTask[], callbacks: DownloadLogicCallbacks): Promise<DownloadLogic> {
        const nodePromises = tasks.map(async task => {
            const isCached = await netlessCaches.hasTaskUUID(task.uuid);
            const phase = isCached ? TaskPhase.Cached : TaskPhase.NotCached;
            return {...task, phase};
        });
        return new DownloadLogic(await Promise.all(nodePromises), callbacks);
    }

    private readonly taskNodes: readonly PPTTaskNode[];
    private readonly callbacks: DownloadLogicCallbacks;

    private mode: DownloadingMode = DownloadingMode.Freedom;
    private pptStates: readonly PPTState[];
    private oneByOneState: DownloadingOneByOneState | null = null;

    private constructor(taskNodes: PPTTaskNode[], callbacks: DownloadLogicCallbacks) {
        this.taskNodes = Object.freeze(taskNodes);
        this.callbacks = Object.freeze({...callbacks});
        this.pptStates = this.taskNodes.map(task => this.createPPTState(task));
    }

    public get state(): Readonly<DownloadLogicState> {
        return {
            mode: this.mode,
            pptStates: this.pptStates,
        };
    }

    public startTask(uuid: string): void {
        if (this.mode === DownloadingMode.Freedom) {
            const index = this.taskNodes.findIndex(task => task.uuid === uuid);
            if (index !== -1) {
                const taskNode = this.taskNodes[index];
                if (taskNode.phase === TaskPhase.NotCached) {
                    this.download(index)
                        .catch(error => this.callbacks.onCatchDownloadingError(error, {
                            uuid: taskNode.uuid,
                            name: taskNode.name,
                        }));
                }
            }
        }
    }

    public startOneByOne(): void {
        if (this.mode === DownloadingMode.Freedom) {
            this.oneByOneState = {index: 0};
            this.refreshState(DownloadingMode.OneByOne);
            this.downloadNextOneByOne();
        }
    }

    public abortTask(uuid: string): void {
        if (this.mode === DownloadingMode.Freedom) {
            const index = this.taskNodes.findIndex(task => task.uuid === uuid);
            if (index !== -1) {
                const taskNode = this.taskNodes[index];
                if (taskNode.phase === TaskPhase.Downloading) {
                    // 如果取不到 downloading 对象，标记一下 phase，也会让 controller 在首次获取后自动 abort
                    taskNode.downloading?.controller.abort();
                    taskNode.phase = TaskPhase.NotCached;
                    taskNode.downloading = undefined;
                    this.refreshState(this.mode, index);
                }
            }
        }
    }

    public abort(): void {
        if (this.mode === DownloadingMode.OneByOne) {
            const indexes: number[] = [];

            for (let i = 0; i < this.taskNodes.length; ++ i) {
                const taskNode = this.taskNodes[i];
                if (taskNode.phase === TaskPhase.Downloading) {
                    // 如果取不到 downloading 对象，标记一下 phase，也会让 controller 在首次获取后自动 abort
                    taskNode.downloading?.controller.abort();
                    taskNode.phase = TaskPhase.NotCached;
                    indexes.push(i);
                }
            }
            this.refreshState(DownloadingMode.Freedom, ...indexes);
        }
    }

    public removeTask(uuid: string): void {
        if (this.mode === DownloadingMode.Freedom) {
            const index = this.taskNodes.findIndex(task => task.uuid === uuid);
            if (index !== -1) {
                const taskNode = this.taskNodes[index];
                if (taskNode.phase === TaskPhase.Downloading ||
                    taskNode.phase === TaskPhase.Cached) {
                    taskNode.downloading?.controller.abort();
                    taskNode.phase = TaskPhase.NotCached;
                    netlessCaches.deleteTaskUUID(taskNode.uuid)
                                 .catch(error => console.error(error));
                    this.refreshState(this.mode, index);
                }
            }
        }
    }

    public removeAll(): void {
        if (this.mode === DownloadingMode.Freedom) {
            const indexes: number[] = [];

            for (let i = 0; i < this.taskNodes.length; ++ i) {
                const taskNode = this.taskNodes[i];
                if (taskNode.phase === TaskPhase.Downloading ||
                    taskNode.phase === TaskPhase.Cached) {
                    taskNode.downloading?.controller.abort();
                    taskNode.phase = TaskPhase.NotCached;
                    netlessCaches.deleteTaskUUID(taskNode.uuid)
                                 .catch(error => console.error(error));
                    indexes.push(i);
                }
            }
            this.refreshState(this.mode, ...indexes);
        }
    }

    private async downloadNextOneByOne(): Promise<void> {
        if (this.oneByOneState) {
            let index = this.oneByOneState.index;
            let taskNode: PPTTaskNode;
            try {
                do {
                    taskNode = this.taskNodes[index];

                    if (taskNode.phase === TaskPhase.NotCached) {
                        await this.download(index);
                        index ++;
                        break;
                    } else {
                        index ++;
                    }
                } while (index < this.taskNodes.length);

                if (index < this.taskNodes.length) {
                    this.downloadNextOneByOne();

                } else {
                    this.oneByOneState = null;
                    this.refreshState(DownloadingMode.Freedom);
                }
            } catch (error) {
                this.oneByOneState = null;
                this.refreshState(DownloadingMode.Freedom);
                this.callbacks.onCatchDownloadingError(error, {
                    uuid: taskNode!.uuid,
                    name: taskNode!.name,
                });
            }
        }
    }

    private async download(index: number): Promise<void> {
        const taskNode = this.taskNodes[index];
        taskNode.phase = TaskPhase.Downloading;
        this.refreshState(this.mode, index);
        try {
            await netlessCaches.startDownload(taskNode.uuid, (progress, controller) => {
                if (taskNode.phase !== TaskPhase.Downloading) {
                    // 如果在获取首个 controller 对象之前就被取消了的话
                    // 无奈因为调用不到 controller.abort() 方法，只能标记一下然后取消
                    controller.abort();

                } else if (!taskNode.downloading) {
                    taskNode.downloading = {
                        progress: progress,
                        controller: controller,
                    };
                    this.refreshState(this.mode, index);

                } else if (taskNode.downloading.progress !== progress) {
                    taskNode.downloading.progress = progress;
                    this.refreshState(this.mode, index);
                }
            });
            taskNode.phase = TaskPhase.Cached;

        } catch (error) {
            taskNode.phase = TaskPhase.NotCached;
            throw error;

        } finally {
            taskNode.downloading = undefined;
            this.refreshState(this.mode, index);
        }
    }

    private refreshState(mode: DownloadingMode, ...indexes: number[]): void {
        const updatedState: Partial<DownloadLogicState> = {};
        let didSpaceUpdate = false;

        if (this.mode !== mode) {
            updatedState.mode = this.mode = mode;
        }
        if (indexes.length > 0) {
            const newPPTStates = [...this.pptStates];
            for (const index of indexes) {
                const originState = newPPTStates[index];
                const newState = this.createPPTState(this.taskNodes[index]);

                if (originState.phase !== newState.phase) {
                    didSpaceUpdate = true;
                }
                newPPTStates[index] = newState;
            }
            updatedState.pptStates = this.pptStates = Object.freeze(newPPTStates);
        }
        if (didSpaceUpdate) {
            this.callbacks.onSpaceUpdate();
        }
        this.callbacks.onUpdateState(updatedState);
    }

    private createPPTState(taskNode: PPTTaskNode): PPTState {
        let progress = 0;
        switch (taskNode.phase) {
            case TaskPhase.Cached: {
                progress = 100;
                break;
            }
            case TaskPhase.Downloading: {
                if (taskNode.downloading) {
                    progress = taskNode.downloading.progress;
                }
                break;
            }
        }
        return {
            uuid: taskNode.uuid,
            name: taskNode.name,
            phase: taskNode.phase,
            progress: progress,
        };
    }
}