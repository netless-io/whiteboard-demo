import Fetcher from "@netless/fetch-middleware";
import { netlessToken } from "../appToken";
import { region } from "../region";

const fetcher = new Fetcher(5000, "https://api.netless.link/v5");
export class RoomOperator {
    public async createRoomApi(name: string, limit: number): Promise<any> {
        const json = await fetcher.post<any>({
            path: `rooms`,
            headers: {
                token: netlessToken.sdkToken,
                region,
            },
            body: {
                name: name,
                limit: limit,
            },
        });
        return json as any;
    }

    public async joinRoomApi(uuid: string): Promise<any> {
        const json = await fetcher.post<any>({
            path: `tokens/rooms/${uuid}`,
            headers: {
                token: netlessToken.sdkToken,
                region,
            },
            body: {
                lifespan: 0,
                role: "admin",
            },
        });
        return json as any;
    }

    public async getCover(
        uuid: string,
        path: string,
        width: number,
        height: number,
        token: string,
    ): Promise<any> {
        const json = await fetcher.post<any>({
            path: `rooms/${uuid}/screenshots`,
            headers: {
                token: token,
                region,
            },
            body: {
                path: path,
                width: width,
                height: height,
            },
        });
        return json as any;
    }
}
