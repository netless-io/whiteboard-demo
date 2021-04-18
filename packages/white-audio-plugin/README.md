# white-audio-plugin

https://www.npmjs.com/package/@netless/white-audio-plugin

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
    attributes: { src: url, isNavigationDisable: false },
});
```

## 参数

```ts
interface Context {
    /** 必填，有操作权限者为 "host"，观看者为 "guest" */
    identity："host" | "guest";
}

interface Attributes {
    /** 音频地址 */
    src: string;
    /** 是否隐藏标题栏 */
    isNavigationDisable?: boolean;
}
```

## License

The MIT License.
