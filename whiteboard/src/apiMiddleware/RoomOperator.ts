import Fetcher from "@netless/fetch-middleware";
import { region } from "../region";

const fetcher = new Fetcher(5000, "https://api.netless.link/v5");
const tokenServer = new Fetcher(5000, "https://oss-token-server.netless.link");

export class RoomOperator {
    private rooms: Record<string, string> = {};

    public async createRoomApi(): Promise<any> {
        const json = await tokenServer.post<{ roomUUID: string, roomToken: string }>({
            path: "room/create",
            query: {
                region,
            },
        });
        this.rooms[json.roomUUID] = json.roomToken;
        return { uuid: json.roomUUID };
    }

    public async joinRoomApi(uuid: string): Promise<any> {
        const roomToken = this.rooms[uuid]
        if (roomToken) {
            return roomToken;
        }

        const json = await tokenServer.post<{ roomUUID: string, roomToken: string }>({
            path: 'room/join',
            query: {
                uuid,
                region,
            },
        })
        this.rooms[json.roomUUID] = json.roomToken;

        return json.roomToken;
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
