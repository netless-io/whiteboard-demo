export type Language = "en" | "zh-CN";

export type Region = "cn-hz" | "us-sv" | "in-mum" | "gb-lon" | "sg";

interface RegionWithTranslation {
    region: Region;
    name: string;
    emoji: string;
}

export const regions: Record<Language, RegionWithTranslation[]> = {
    "zh-CN": [
        { region: "cn-hz", name: "中国", emoji: "🇨🇳" },
        { region: "us-sv", name: "美国", emoji: "🇺🇸" },
        { region: "in-mum", name: "印度", emoji: "🇮🇳" },
        { region: "gb-lon", name: "英国", emoji: "🇬🇧" },
        { region: "sg", name: "新加坡", emoji: "🇸🇬" },
    ],
    en: [
        { region: "cn-hz", name: "China", emoji: "🇨🇳" },
        { region: "us-sv", name: "America", emoji: "🇺🇸" },
        { region: "in-mum", name: "India", emoji: "🇮🇳" },
        { region: "gb-lon", name: "Britain", emoji: "🇬🇧" },
        { region: "sg", name: "Singapore", emoji: "🇸🇬" },
    ],
};

interface OSSConfigWithRegion {
    bucket: string;
    region: string;
}

export const ossConfigForRegion: Record<Region, OSSConfigWithRegion> = {
    "cn-hz": { bucket: "beings", region: "oss-cn-hangzhou" },
    "us-sv": { bucket: "whiteboard-demo-courseware-us-sv", region: "oss-us-west-1" },
    "in-mum": { bucket: "whiteboard-demo-courseware-in-mum", region: "oss-ap-south-1" },
    "gb-lon": { bucket: "whiteboard-demo-courseware-gb-lon", region: "oss-eu-west-1" },
    "sg": { bucket: "whiteboard-demo-courseware-sg", region: "oss-ap-southeast-1" },
};

export let region: Region =
    (new URL(location.href).searchParams.get("rg") as Region) ||
    (navigator.language.startsWith("zh") ? "cn-hz" : "us-sv");

export function setRegion(_region: Region): void {
    region = _region;
}

export function getRegionName(_region: Region, lang: Language): string {
    for (const { region, name } of regions[lang]) {
        if (region === _region) {
            return name;
        }
    }
    return "unknown";
}
