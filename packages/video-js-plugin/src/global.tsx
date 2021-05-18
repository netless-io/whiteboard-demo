import { VideoJsPlayer } from "video.js";
import { Instance, PluginContext } from "./types";

interface PluginAndPlayer {
    plugin: Instance;
    player: VideoJsPlayer;
}

export class VideoJsPluginManager {
    readonly plugins: Record<string, PluginAndPlayer> = {};
    /** called by plugin */
    add(plugin: Instance, player: VideoJsPlayer) {
        this.plugins[plugin.identifier] = { plugin, player };
    }
    /** called by plugin */
    remove(plugin: Instance) {
        delete this.plugins[plugin.identifier];
    }
    /** get plugin instance by id */
    getPlugin(id: string) {
        return this.plugins[id].plugin;
    }
    /** get videojs player by plugin id */
    getPlayer(id: string) {
        return this.plugins[id].player;
    }
    /** set all plugin instance context */
    setContext(context: PluginContext) {
        for (const key in this.plugins) {
            this.plugins[key].plugin.context.identity = context.identity;
            break;
        }
    }
    /** get all plugin instance context, returns undefined if not on the whiteboard */
    getContext() {
        for (const key in this.plugins) {
            return this.plugins[key].plugin.context;
        }
        return undefined;
    }
}

export const manager = new VideoJsPluginManager();
