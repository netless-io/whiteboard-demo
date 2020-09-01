import Fetcher from "@netless/fetch-middleware";
const fetcher = new Fetcher(5000, "https://shunt-api.netless.link/v5");

export default class TaskOperator {

    public async createPPTTaskInf(pptURL: string, type: string, preview: boolean, sdkToken: string): Promise<any> {
        const json = await fetcher.post<any>({
            path: `services/conversion/tasks`,
            headers: {
                token: sdkToken,
            },
            body: {
                resource: pptURL,
                type: type,
                preview: preview,
            },
        });
        return json as any;
    }

    // roomToken ro sdkToken
    public async getCover(uuid: string, path: string, width: number, height: number, token: string): Promise<any> {
        const json = await fetcher.post<any>({
            path: `rooms/${uuid}/screenshots`,
            headers: {
                token: token,
            },
            body: {
                path: path,
                width: width,
                height: height
            },
        });
        return json as any;
    }

    public async createTaskToken(taskUuid: string, lifespan: number, role: string, sdkToken: string): Promise<string> {
        const json = await fetcher.post<any>({
            path: `tokens/tasks/${taskUuid}`,
            headers: {
                token: sdkToken,
            },
            body: {
                lifespan: lifespan,
                role: role,
            },
        });
        return json as string;
    }
}
