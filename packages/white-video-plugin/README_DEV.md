# 自定义教具接入教程

>Netless 自定义教具必须基于 react 开发，以下以 react + typescript 为例来说明

## 一、怎么编写 netless 自定义教具

创建一个自定义教具的 `react component` ，下面以一个简单的加减数字组件为例。

```tsx
import * as React from "react";
import {CNode, CNodeKind, PluginComponentProps} from "white-web-sdk";

export type CounterComponentProps = PluginComponentProps & {
    readonly count: number;
};

export class CounterComponent extends React.Component<CounterComponentProps> {

    public static readonly protocol: string = "test";
    public static readonly backgroundProps: Partial<CounterComponentProps> = {count: 0};

    public static willInterruptEvent(props: any, event: any): boolean {
        return false;
    }

    public render(): React.ReactNode {
        const {width, height} = this.props;
        return (
            <CNode kind={CNodeKind.HTML}>
                <div style={{width: width, height: height}} className="editor-out-box">
                    <div>count: {this.props.count}</div>
                    <div style={{pointerEvents: "auto"}}>
                        <button style={{pointerEvents: "auto"}} onClick={() => {
                            this.props.setProps(this.props.uuid, {
                                count: this.props.count + 1,
                            });
                        }}>
                            increment
                        </button>
                        <button style={{pointerEvents: "auto"}} onClick={() => {
                            this.props.setProps(this.props.uuid, {
                                count: this.props.count - 1,
                            });
                        }}>
                            decrement
                        </button>
                    </div>
                </div>
            </CNode>
        );
    }
}

```

1、自定义教具组件必须是 CNode  的子组件

```tsx
import * as React from "react";
import {CNode, CNodeKind} from "white-web-sdk";

export class CounterComponent extends React.Component<CounterComponentProps> {
    public render(): React.ReactNode {
        return (
            <CNode kind={CNodeKind.HTML}>
            	{/*  */}
            </CNode>
        );
    }
}
```

2、声明自定义组件的名称，作为后续插入特定自定义教具的 target。比如这个自定义教具是数字加减，所以就起名为`counter`

```tsx
public static readonly protocol: string = "counter";
```

3、声明自定义组件可同步字段的初始数据，如果允许为空则可以不写。比如例子的自定义教具初始数字为 0，所以代码如下。

```tsx
public static readonly backgroundProps: Partial<CounterComponentProps> = {count: 0};
```

4、改变和获取可同步数据，`this.props.uuid`是教具识别标志作为 `setProps`第一个参数必须写成如下方式。`count`是业务定义的同步字段，获取和改变方式如下。

```tsx
// 改变 
this.props.setProps(this.props.uuid, {
                                count: this.props.count + 1,
                            });
// 读取
this.props.count
```

5、获取自定义教具额实时宽高。这对数据会根据互动对自定义教具的拉扯实时变化。

```tsx
const {width, height} = this.props;
```

6、自定义教具编辑与锁定的设置，需要等点击交互的时候将 `style={{pointerEvents: "auto"}}` 不需要交互的时候 `style={{pointerEvents: "none"}}`

```tsx
   <button style={{pointerEvents: "auto"}} onClick={() => {
                            this.props.setProps(this.props.uuid, {
                                count: this.props.count + 1,
                            });
                        }}>
                            increment
                        </button>
```



## 二、怎么在项目中植入自定义教具

1、初始化白板的时候注册上自定义教具。

` plugins`后面可以跟自定义教具的 `Component`列表

```tsx
import {CounterComponent} from "../components/Counter";

whiteWebSdk = new WhiteWebSdk({ deviceType: DeviceType.Surface, plugins:[CounterComponent]});

const room = await whiteWebSdk.joinRoom(...)
```

2、插入自定义教具

```tsx
 this.props.room.insertPlugin({
            protocal: "count", // 自定义教具的名字
            centerX: 0, // 中心点为 0，0
            centerY: 0, // 中心点为 0，0
            width: 600,
            height: 600,
            props: {
                userId: this.props.userId,） // 自定义传入属性，可以不传
            },
        });
```

3、初始化回放的时候注册，便于回放。

```tsx
const whiteWebSdk = new WhiteWebSdk({plugins: [CounterComponentProps]});
const player = await whiteWebSdk.replayRoom(...)
```



## 三、目前缺陷

1、事件拦截，该方法目前失效。正常情况下 ` return true;`可以将教具定在一个固定位置，不被删除、选中。可以做水印等效果。

```tsx
public static willInterruptEvent(props: any, event: any): boolean {
        return true;
    }
```

