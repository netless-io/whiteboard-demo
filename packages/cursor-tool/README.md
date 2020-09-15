# Cursor Tool

## 实时房间装载

```typescript
    const cursorAdapter = new CursorTool(); // Step1：初始化（必选）
    const room = await whiteWebSdk.joinRoom({
            uuid: uuid,
            roomToken: roomToken,
            cursorAdapter: cursorAdapter, // Step2：载入（必选）
            userPayload: {
                userId: userId,
                cursorName: cursorName, // Step4：cursorName 显示名称
                avatar: "url", // Step5：avatar 显示头像地址
            },
            ...
        },
        {
            onPhaseChanged: phase => {
                this.setState({phase: phase});
            },
            ...
        });
    cursorAdapter.setRoom(room); // Step3：装载 room 实例（必选）
```

## 回放房间装载


```typescript
        const cursorAdapter = new CursorTool(); // Step1：初始化（必选）
        const player = await whiteWebSdk.replayRoom(
            {
                room: uuid,
                roomToken: roomToken,
                cursorAdapter: cursorAdapter, // Step2：载入（必选）
                ...
            }, {
                onPhaseChanged: phase => {
                    this.setState({phase: phase});
                },
                ...
            });
        cursorAdapter.setPlayer(player); // Step3：装载 player 实例（必选）
```
