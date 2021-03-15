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

export let region: Region = "cn-hz";

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
