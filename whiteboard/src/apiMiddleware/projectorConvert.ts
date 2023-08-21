import Fetcher from "@netless/fetch-middleware";
import { region } from "../region";

async function delay(time: number) {
    return new Promise<void>(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

export type ProjectType = "dynamic" | "static";
const fetcher = new Fetcher(5000, 'https://api.netless.link');
export async function createProjectorDynamicTask(url: string, stsToken: string, type: ProjectType) {
    const json = await fetcher.post<any>({
        path: `v5/projector/tasks`,
        headers: {
            token: stsToken,
            region,
        },
        body: {
            type,
            preview: true,
            scale: 2,
            resource: url,
        },
    });
    return json as any;
}

export async function getTaskProgress(taskId: string, stsToken: string) {
    const json = await fetcher.get<any>({
        path: "v5/projector/tasks/" + taskId,
        headers: {
            token: stsToken,
            region,
        },
        query: {
            uuid: taskId,
        }
    })
    return json as any;
}

export async function utilConvertFinish(taskId: string, stsToken: string, onProgress: (progress: number) => void, delayTime = 1000): Promise<any> {
    const result = await getTaskProgress(taskId, stsToken);
    onProgress(result.convertedPercentage);
    if (result.convertedPercentage === 100) {
        return result;
    }
    await delay(delayTime);
    return await utilConvertFinish(taskId, stsToken, onProgress);
}
