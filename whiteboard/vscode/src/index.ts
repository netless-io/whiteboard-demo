import { InvisiblePlugin, InvisiblePluginContext, Room, Displayer } from "white-web-sdk";

export type MonacoPluginAttributes = {
    modelValue?: string,
    [key: string]: any
}

export type InsertOptions = {
    readonly room: Room;
} ;

export class MonacoPlugin extends InvisiblePlugin<MonacoPluginAttributes> {
    public static readonly kind: string = "MonacoPlugin";
    public static displayer: Displayer;

    public constructor(context: InvisiblePluginContext) {
        super(context);
        MonacoPlugin.displayer = context.displayer;
    }

    public static async insert(options: InsertOptions): Promise<MonacoPlugin | undefined> {
        const plugin = options.room.getInvisiblePlugin(MonacoPlugin.kind);
        if (plugin) {
            console.warn("plugin already inserted, can't re-insert");
            return;
        }
        return options.room.createInvisiblePlugin(MonacoPlugin, {});;
    }
}

export * from "./wrapper";