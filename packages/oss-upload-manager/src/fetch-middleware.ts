import Fetcher from "@netless/fetch-middleware";

export default class TaskOperator {
    private readonly fetcher: Fetcher;
    private readonly tokenServer: Fetcher;

    constructor(apiOrigin: string = "https://api.netless.link/v5", readonly region?: string) {
        this.fetcher = new Fetcher(5000, apiOrigin);
        this.tokenServer = new Fetcher(5000, "https://oss-token-server.netless.link");
    }

    public async createTask(pptURL: string, type: string): Promise<any> {
        const json = await this.tokenServer.post<any>({
            path: 'task/create',
            query: {
                resource: pptURL,
                region: this.region,
                type: type
            }
        });
        return json as any;
    }

    // roomToken or sdkToken
    public async getCover(uuid: string, path: string, width: number, height: number, token: string): Promise<any> {
        const json = await this.fetcher.post<any>({
            path: `rooms/${uuid}/screenshots`,
            headers: JSON.parse(JSON.stringify({
                token: token,
                region: this.region,
            })),
            body: {
                path: path,
                width: width,
                height: height
            },
        });
        return json as any;
    }
}
