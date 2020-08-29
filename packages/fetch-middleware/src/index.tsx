import {stringify} from "query-string";
import HttpError from "./HttpError";

export type FetcherParams = {
    path: string;
    body?: Object | RequestInit["body"];
    query?: Object;
    headers?: HeadersInit;
};

export default class Fetcher {

    private readonly apiOrigin: string;
    private readonly fetchTimeout: number = 15000;

    public constructor(fetchTimeout: number, apiOrigin: string) {
        this.apiOrigin = apiOrigin;
        this.fetchTimeout = fetchTimeout;
    }

    public get<T>(params: Readonly<FetcherParams> | string): Promise<T> {
        return this.fetchWithMethod("GET", params);
    }

    public post<T>(params: Readonly<FetcherParams> | string): Promise<T> {
        return this.fetchWithMethod("POST", params);
    }

    public put<T>(params: Readonly<FetcherParams> | string): Promise<T> {
        return this.fetchWithMethod("PUT", params);
    }

    public patch<T>(params: Readonly<FetcherParams> | string): Promise<T> {
        return this.fetchWithMethod("PATCH", params);
    }

    public delete<T>(params: Readonly<FetcherParams> | string): Promise<T> {
        return this.fetchWithMethod("DELETE", params);
    }

    private async fetchWithMethod(method: string, inputParams: Readonly<FetcherParams> | string): Promise<any> {
        const params = this.standardizeFetcherParams(inputParams);

        if (params.body && typeof params.body === "object" && params.body.constructor === Object) {
            params.body = JSON.stringify(params.body);
        }
        if (params.headers) {
            params.headers["content-type"] = "application/json";
            params.headers["Accept"] = "application/json";
        } else {
            params.headers = {
                "content-type": "application/json",
                "Accept": "application/json",
            };
        }
        let url = `${this.apiOrigin}/${params.path}`;
        if (params.query) {
            url += "?" + stringify(params.query);
        }
        const requestInit: RequestInit = params as any;
        requestInit.method = method;
        const response = await this.fetchWithTimeout(url, requestInit);
        const isSuccess = response.status >= 200 && response.status < 300;
        if (!isSuccess) {
            const message = await this.readErrorMessageFromResponse(response) || response.statusText;
            console.log("response ", message, response);
            throw new HttpError(response.status, message, response);
        }

        const myResponse = await response.json();
        if (myResponse.code === 403) {
            console.log("Permission not verified");
        }
        return myResponse;
    }

    private standardizeFetcherParams(inputParams: Readonly<FetcherParams> | string): FetcherParams {
        let params: FetcherParams;
        if (typeof inputParams === "string") {
            params = {path: inputParams};
        } else {
            params = {...inputParams};
        }
        return params;
    }

    private async readErrorMessageFromResponse(response: Response): Promise<string | null> {
        if (!response.body) {
            return null;
        }
        try {
            const result = await response.json();
            const errorMessage = result.error || result.errorMessage || result.message || result.code;

            if (typeof errorMessage === "string") {
                return errorMessage;
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    private async fetchWithTimeout(input: string, init?: RequestInit): Promise<Response> {
        let timeoutTimer: any = null;
        const timeoutPromise = new Promise<undefined>(({}, reject) => {
            timeoutTimer = setTimeout(() => {
                timeoutTimer = null;
                reject(new Error(`fetch ${input} timeout`));
            }, this.fetchTimeout);
        });
        const response = await Promise.race([fetch(input, init), timeoutPromise]);

        if (timeoutTimer !== null) {
            clearTimeout(timeoutTimer);
        }
        return response!;
    }
}