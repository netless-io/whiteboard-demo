# white-video-plugin

> https://www.npmjs.com/package/@netless/white-video-plugin

## 一、在白板初始化的时候注册 plugin

**初始化 SDK 的时候注入 plugin 代码**

```typescript
whiteWebSdk = new WhiteWebSdk({ 
deviceType: "desktop",
handToolKey: " ",
plugins: [WhiteVideoPlugin] // 在 new WhiteWebSdk 对象的时候注册完成
});
```

## 二、声明身份

**什么身份，以便控制 plugin 的编辑操作权限，目前声明后不再支持改变**

userId：string // 必填
identity："host" | "guest" // 必填，有操作权限者为 "host"，观看者为 "guest"

代码
```typescript
whiteWebSdk.joinRoom({
                    uuid: uuid,
                    roomToken: roomToken,
                    cursorAdapter: this.cursor,
                    userPayload: {
                        userId: userId, // 必填
                        identity: identity,// 必填
                        name: userName,
                        avatar: userAvatarUrl,
                   
                    }}）
```

## 二、声明身份

**什么身份，以便控制 plugin 的编辑操作权限，目前声明后不再支持改变**

userId：string // 必填
identity："host" | "guest" // 必填，有操作权限者为 "host"，观看者为 "guest"

## 三、插入 plugin

**将 plugin 插入白板**

```typescript
room.insertPlugin({
                protocal: "video", // 视频必须填写为 Video
                centerX: 0, // 插入位置 x
                centerY: 0, // 插入位置 y
                width: 480, // 宽 witdh
                height: 270, // gao height
                props: {
                    videoUrl: url, // 视频地址
                },
            });
```
