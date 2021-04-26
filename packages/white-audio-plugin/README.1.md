# white-audio-plugin

https://www.npmjs.com/package/@netless/white-audio-plugin

**注**：以下是 `1.x` 版本的接口文档，和 `2.x` 不兼容。如果你没有需要兼容 `1.x` 的项目，强烈建议升级到 `2.x`。

`1.x` 有以下 bug, _won't fix_:

- 同步时间戳可能由于网络延迟，差距变得很大
- 必须和 white-web-sdk 使用 **同一份** mobx

## 用法

```typescript
// 创建 plugins
const plugins = createPlugins({ "audio": audioPlugin });
plugins.setPluginContext("audio", {
    identity: identity === Identity.creator ? "host" : ""
});
// 初始化 sdk 时添加 plugins
let sdk = new WhiteWebSdk({ plugins });

let room = await sdk.joinRoom(...);
// 在房间内添加插件教具
room.insertPlugin("audio", {
    originX: -240, originY: -43, width: 480, height: 86,
    attributes: { pluginAudioUrl: url, isNavigationDisable: false },
});
```

## 参数

```ts
interface Context {
    /** 必填，有操作权限者为 "host"，观看者为 "guest" */
    identity："host" | "guest";
}

// 注意：这些类型并没有存在于 d.ts 中，需要使用者用 as any 混过去
interface Attributes {
    /** 音频地址 */
    pluginAudioUrl: string;
    /** 是否隐藏标题栏 */
    isNavigationDisable?: boolean;
}
```

## License

The MIT License.
