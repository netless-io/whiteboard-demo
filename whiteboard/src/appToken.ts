export const netlessToken = {
    sdkToken: process.env.SDKTOKEN!,
    appIdentifier: process.env.APPIDENTIFIER!,
};

export type OSSConfigObjType = {
    accessKeyId: string;
    accessKeySecret: string;
    region: string;
    bucket: string;
    folder: string;
    prefix: string;
};

export const ossConfigObj: OSSConfigObjType = {
    accessKeyId: process.env.AK!,
    accessKeySecret: process.env.SK!,
    region: process.env.OSSREGION!,
    bucket: process.env.BUCKET!,
    folder: process.env.FOLDER!,
    prefix: process.env.PREFIX!,
};

export const h5DemoUrl = process.env.H5DEMOURL!;
export const h5DemoUrl2 = process.env.H5DEMOURL2!;
export const h5DemoUrl3 = process.env.H5DEMOURL3!;