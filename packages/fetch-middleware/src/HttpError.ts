
export default class HttpError extends Error {
    public statusCode: number;
    public message: string;
    public extras: any;

    public constructor(statusCode: number, message: string, extras: any) {
        super(message);
        this.extras = extras;
        this.statusCode = statusCode;
        this.message = message;
    }
}