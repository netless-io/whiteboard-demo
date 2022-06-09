declare namespace NodeJS {
    interface ProcessEnv {
        OSSREGION: string;
        BUCKET: string;
        FOLDER: string;
        PREFIX: string;
    }
}
