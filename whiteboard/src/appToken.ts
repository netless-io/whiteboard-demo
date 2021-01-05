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

export const h5DemoUrl = "https://demo-h5.netless.group/docs/";
export const h5DemoUrl2 = "https://h5tapi-uat.acadsoc.com.cn/H5tTemplate/index.html?role=0&version=zttqxgb6t7r";
export const h5DemoUrl3 = "https://demo-h5.netless.group/dist2020/";
