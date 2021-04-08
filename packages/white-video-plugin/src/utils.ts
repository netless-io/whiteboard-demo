export async function play(player: HTMLVideoElement) {
    try {
        await player.play();
        return true;
    } catch {
        player.muted = true;
        await player.play();
        return false;
    }
}

export const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export class ChangedMap {
    map = new Map<string, any>();

    changed(tag: string, value: any) {
        if (!this.map.has(tag) || !isEqual(this.map.get(tag), value)) {
            this.map.set(tag, value);
            return true;
        } else {
            return false;
        }
    }

    clear() {
        this.map.clear();
    }
}

function isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (Array.isArray(a)) return a.every((x, i) => isEqual(x, b[i]));
    return false;
}

// https://stackoverflow.com/questions/44145740/how-does-double-requestanimationframe-work
export function doubleRAF(callback: () => void) {
    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(callback);
    });
}
