/**
 * 类似 NetlessCaches.ts 和 DownloadLogic.ts 的功能
 * 提前加载下一页资源，优先使用 zip 包
 */
import type { Room, RoomState } from "white-web-sdk";
import { netlessCaches } from "../NetlessCaches";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const resourceHost = "convertcdn.netless.link";
const dynamicConvertRE = /^pptx:\/\/(\S+?)\/dynamicConvert\/([0-9a-f]{32})\/(\d+)\.slide$/i;
const resourceRE = /resource(\d+)\.zip$/i;

const layoutZipUrl = (uuid: string) => `https://${resourceHost}/dynamicConvert/${uuid}/layout.zip`;
const resourceZipUrl = (uuid: string, index: number) =>
    `https://${resourceHost}/dynamicConvert/${uuid}/resources/resource${index}.zip`;
const shareUrl = (uuid: string) => `https://${resourceHost}/dynamicConvert/${uuid}/share.json`;

type Share = Record<number, { name: string; size: number; slides: number[] }[]>;

// TODO: visited = localStorage.getItem()
const visited: Record<string, { layout: boolean; slides: Set<number>; share?: Share }> = {};

export function markLayoutHasCached(uuid: string) {
    if (uuid in visited) {
        visited[uuid].layout = true;
    } else {
        visited[uuid] = { layout: true, slides: new Set() };
    }
}

// NOTE: it does not affect browser cache
export function markAsNotCached(uuid: string) {
    delete visited[uuid];
}

export function markSlideHasCached(uuid: string, slideId: number) {
    if (uuid in visited) {
        visited[uuid].slides.add(slideId);
    } else {
        const slides = new Set([slideId]);
        visited[uuid] = { layout: false, slides };
    }
}

export function setShare(uuid: string, share?: Share) {
    if (uuid in visited) {
        visited[uuid].share = share;
    } else if (share) {
        visited[uuid] = { layout: false, slides: new Set(), share };
    }
}

let currentPPT: {
    uuid: string;
    slides: number[];
    index: number;
} = {
    uuid: "",
    slides: [],
    index: -1,
};

let abortController: AbortController | undefined;

let isRequesting = false;
let mainLoopLock = true;

function downloadFail(error: Error) {
    console.log(`failed to download ${currentPPT.uuid}: ${error}`);
}

// not in a hurry
const slowly = (window as any).requestIdleCallback || setTimeout;
function justFetch(url: string) {
    slowly(() => fetch(url).catch(downloadFail));
}

async function mainLoop() {
    mainLoopLock = true;
    while (mainLoopLock) {
        // 如果频繁点击下一页，等待两秒来防止发起的请求太多
        if (isRequesting) {
            isRequesting = false;
            await delay(2000);
            // 总是从下一页开始下载
            currentPPT.index = findNextSlide();
        }
        const { uuid, slides, index } = currentPPT;
        if (!(uuid in visited)) {
            visited[uuid] = { layout: false, slides: new Set() };
        }
        const { layout } = visited[uuid];
        if (uuid) {
            // 总是先下载 layout.zip
            if (!layout) {
                // NOTE: download "layout" first, then "share"
                //       in case that "share.json" is cached before in "layout.zip"
                await downloadZip(layoutZipUrl(uuid)).catch(downloadFail);
                if (index === -1) {
                    currentPPT.index = findNextSlide();
                }
                if (!visited[uuid].share) {
                    // in case there's no share.json in layout.zip, try download it manually
                    try {
                        abortController = new AbortController();
                        const r = await fetch(shareUrl(uuid), {
                            signal: abortController.signal,
                        });
                        abortController = undefined;
                        if (r.status === 404) {
                            // ok, no share
                        } else {
                            const share = await r.json();
                            setShare(uuid, share);
                        }
                    } catch {
                        console.log("[ProgressivePPT] parse share.json failed, uuid =", uuid);
                    }
                }
            } else {
                const resourceId = slides[index];
                if (resourceId >= 0) {
                    const share = visited[uuid].share?.[slides[index]].map((e) => e.name);
                    if (share?.length) {
                        for (const name of share) {
                            justFetch(`https://${resourceHost}/${name}`);
                        }
                    }
                    if (visited[uuid].slides.has(resourceId)) {
                        console.log("[ProgressivePPT] skip slide %o of %o", resourceId, uuid);
                    } else {
                        await downloadZip(resourceZipUrl(uuid, resourceId)).catch(downloadFail);
                    }
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
    const { uuid } = currentPPT;
    const isLayout = zipUrl.endsWith("layout.zip");
    const resourceId = Number(zipUrl.match(resourceRE)?.[1]); // NaN or 1, 2, 3
    console.log("[ProgressivePPT] downloading zip", zipUrl);
    return new Promise<void>(async (resolve, reject) => {
        try {
            abortController = new AbortController();
            const r = await fetch(zipUrl, { signal: abortController.signal });
            abortController = undefined;
            // mark resource has been cached
            // NOTE: if response not ok (404 or another), also mark it as cached
            if (isLayout) {
                markLayoutHasCached(uuid);
            }
            if (!Number.isNaN(resourceId)) {
                markSlideHasCached(uuid, resourceId);
            }
            if (r.status === 404) {
                // ok, not exist
                return resolve();
            }
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
                await cache.put(location, response.clone());

                if (entry.filename.endsWith("share.json")) {
                    const share = await response.json();
                    setShare(uuid, share);
                }
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
                const [_, _host, uuid_, i] = m;
                uuid = uuid_;
                slides.push(+i);
            } else {
                slides.push(-1);
            }
        }
        currentPPT = { uuid, slides, index };
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
