/**
 * 类似 NetlessCaches.ts 和 DownloadLogic.ts 的功能
 * 提前加载下一页资源，优先使用 zip 包
 */
import type { Room, RoomState } from "white-web-sdk";
import { netlessCaches } from "../NetlessCaches";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let resourceHost = "convertcdn.netless.link";
const dynamicConvertRE = /^pptx:\/\/(\S+?)\/dynamicConvert\/([0-9a-f]{32})\/(\d+)\.slide$/i;

const layoutZipUrl = (uuid: string) => `https://${resourceHost}/dynamicConvert/${uuid}/layout.zip`;
const resourceZipUrl = (uuid: string, index: number) =>
    `https://${resourceHost}/dynamicConvert/${uuid}/resources/resource${index}.zip`;
const shareUrl = (uuid: string) => `https://${resourceHost}/dynamicConvert/${uuid}/share.json`;

let currentPPT: {
    uuid: string;
    slides: number[];
    index: number;
    layout: boolean;
} = {
    uuid: "",
    slides: [],
    index: -1,
    layout: false,
};

let abortController: AbortController | undefined;

let isRequesting = false;
let mainLoopLock = true;

function downloadFail(error: Error) {
    console.log(`failed to download ${currentPPT.uuid}: ${error}`);
}

async function mainLoop() {
    while (mainLoopLock) {
        if (isRequesting) {
            isRequesting = false;
            await delay(2000);
        }
        const { uuid, layout, slides, index } = currentPPT;
        if (uuid) {
            if (!layout) {
                await downloadZip(layoutZipUrl(uuid)).catch(downloadFail);
                currentPPT.layout = true;
                if (index === -1) {
                    currentPPT.index = findNextSlide();
                }
            } else {
                if (slides[index] >= 0) {
                    await downloadZip(resourceZipUrl(uuid, slides[index])).catch(downloadFail);
                }
                const nextIndex = findNextSlide();
                if (nextIndex === -1) {
                    currentPPT.uuid = ""; // done
                } else {
                    currentPPT.index = nextIndex;
                }
            }
            await delay(1000);
        } else {
            console.log("[ProgressivePPT] no request, sleeping...");
            await delay(5000);
        }
    }
}

function findNextSlide(overrideIndex?: number) {
    const { index, slides } = currentPPT;
    const currentIndex = overrideIndex ?? index;
    if (currentIndex >= 0) {
        for (let i = currentIndex + 1; i < slides.length; ++i) {
            if (slides[i] >= 0) {
                return i;
            }
        }
    }
    return -1;
}

async function downloadZip(zipUrl: string) {
    abortController?.abort();
    abortController = undefined;
    console.log("[ProgressivePPT] downloading zip", zipUrl);
    return new Promise<void>(async (resolve, reject) => {
        abortController = new AbortController();
        const r = await fetch(zipUrl, { signal: abortController.signal });
        abortController = undefined;
        if (r.status === 404) {
            // silently stop
            return resolve();
        }
        try {
            const reader: any = await new Promise(async (resolve, reject) => {
                zip.createReader(new zip.ArrayBufferReader(await r.arrayBuffer()), resolve, reject);
            });
            reader.getEntries(async (entries: any[]) => {
                console.log("Installing", entries.length, "files from zip");
                Promise.all(entries.map(cacheEntry)).then(resolve as any, reject);
            });
        } catch (error) {
            reject(error);
        }
    });
}

async function cacheEntry(entry: {
    directory: boolean;
    filename: string;
    getData(writer: any, callback: (data: any) => void): void;
}) {
    return new Promise<void>((resolve, reject) => {
        if (entry.directory) return resolve();
        const { uuid } = currentPPT;
        entry.getData(new zip.BlobWriter(), async (data: any) => {
            try {
                const cache = await netlessCaches.openCache("netless");
                const location = `https://${resourceHost}/dynamicConvert/${uuid}/${entry.filename}`;
                const response = new Response(data, {
                    headers: { "Content-Type": netlessCaches.getContentType(entry.filename) },
                });
                await cache.put(location, response);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
}

function onRoomStateChanged(modifyState: Partial<RoomState>) {
    if (modifyState.sceneState) {
        const { scenes, index } = modifyState.sceneState;
        let uuid = "";
        let slides: number[] = [];
        for (const { ppt } of scenes) {
            const m = ppt?.src.match(dynamicConvertRE);
            if (m) {
                const [_, host_, uuid_, i] = m;
                resourceHost = host_;
                uuid = uuid_;
                slides.push(+i);
            } else {
                slides.push(-1);
            }
        }
        currentPPT = { uuid, slides, index, layout: false };
        isRequesting = true;
        console.log("[ProgressivePPT] currentPPT =", currentPPT);
    }
}

export function install(room: Room) {
    room.callbacks.on("onRoomStateChanged", onRoomStateChanged);
    onRoomStateChanged(room.state);
    mainLoop();
}

export function uninstall(room: Room) {
    room.callbacks.off("onRoomStateChanged", onRoomStateChanged);
    mainLoopLock = false;
    abortController?.abort();
}
