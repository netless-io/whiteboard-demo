# white-video-plugin2

https://www.npmjs.com/package/@netless/white-video-plugin2

**注**：注意包名为 `@netless/white-video-plugin2`，为了兼容 `1.x` 发了个新包。

**注**：以下是 `2.x` 版本的接口，和 `1.x` 不兼容。如果你有回放中使用了 `1.x`，可以参考 [本项目](https://github.com/netless-io/flat-web/blob/7db5a0bf2e351999c1b330eb99cf74de12628022/whiteboard/src/WhiteboardPage.tsx#L186-L193) 做兼容性处理。

## 用法

```typescript
// 创建 plugins
const plugins = createPlugins({ "video2": videoPlugin2 });
plugins.setPluginContext("video2", {
    identity: identity === Identity.creator ? "host" : ""
});
// 初始化 sdk 时添加 plugins
let sdk = new WhiteWebSdk({ plugins });

let room = await sdk.joinRoom(...);
// 在房间内添加插件教具
room.insertPlugin("video2", {
    originX: -240, originY: -43, width: 480, height: 86,
    attributes: { src: url, poster: url2, isNavigationDisable: false },
});
```

## 参数

```ts
interface Context {
    /** 必填，有操作权限者为 "host"，观看者为 "guest" */
    identity："host" | "guest";
}

interface Attributes {
    /** 视频地址 */
    src: string;
    /** 封面地址 */
    poster?: string;
    /** 是否隐藏标题栏 */
    isNavigationDisable?: boolean;
}
```

## License

The MIT License.
