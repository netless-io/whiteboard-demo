import * as React from "react";
import {Room, RoomState} from "white-web-sdk";
import TweenOne from "rc-tween-one";
import "./index.less";
export type ScaleControllerState = {
    scaleAnimation: boolean;
    reverseState: boolean;
    isMouseOn: boolean;
    roomState: RoomState;
};

export type ScaleControllerProps = {
    room: Room;
};

export default class ScaleController extends React.Component<ScaleControllerProps, ScaleControllerState> {

    private static readonly syncDuration: number = 200;
    private static readonly dividingRule: ReadonlyArray<number> = Object.freeze(
        [
            0.10737418240000011,
            0.13421772800000012,
            0.16777216000000014,
            0.20971520000000016,
            0.26214400000000015,
            0.3276800000000002,
            0.4096000000000002,
            0.5120000000000001,
            0.6400000000000001,
            0.8,
            1,
            1.26,
            1.5876000000000001,
            2.000376,
            2.5204737600000002,
            3.1757969376000004,
            4.001504141376,
            5.041895218133761,
            6.352787974848539,
            8.00451284830916,
            10,
        ],
    );

    private tempRuleIndex?: number;
    private syncRuleIndexTimer: any = null;

    public constructor(props: ScaleControllerProps) {
        super(props);
        this.state = {
            scaleAnimation: true,
            reverseState: false,
            isMouseOn: false,
            roomState: props.room.state,
        };
        this.arrowControllerHotKey = this.arrowControllerHotKey.bind(this);
    }

    private delaySyncRuleIndex(): void {
        if (this.syncRuleIndexTimer !== null) {
            clearTimeout(this.syncRuleIndexTimer);
            this.syncRuleIndexTimer = null;
        }
        this.syncRuleIndexTimer = setTimeout(() => {
            this.syncRuleIndexTimer = null;
            this.tempRuleIndex = undefined;

        }, ScaleController.syncDuration);
    }

    private static readRuleIndexByScale(scale: number): number {
        const {dividingRule} = ScaleController;

        if (scale < dividingRule[0]) {
            return 0;
        }
        for (let i = 0; i < dividingRule.length; ++i) {
            const prePoint = dividingRule[i - 1];
            const point = dividingRule[i];
            const nextPoint = dividingRule[i + 1];

            const begin = prePoint === undefined ? Number.MIN_SAFE_INTEGER : (prePoint + point) / 2;
            const end = nextPoint === undefined ? Number.MAX_SAFE_INTEGER : (nextPoint + point) / 2;

            if (scale >= begin && scale <= end) {
                return i;
            }
        }
        return dividingRule.length - 1;
    }

    private moveTo100(): void {
        this.tempRuleIndex = ScaleController.readRuleIndexByScale(1);
        this.delaySyncRuleIndex();
        this.zoomChange(1);
    }

    private zoomChange = (scale: number): void => {
        const {room} = this.props;
        room.moveCamera({
            centerX: 0,
            centerY: 0,
            scale: scale,
        });
    }
    private arrowControllerHotKey(evt: KeyboardEvent): void {
        if (evt.key === "=" && evt.ctrlKey) {
            this.moveRuleIndex(+1);
        } else if (evt.key === "-" && evt.ctrlKey) {
            this.moveRuleIndex(-1);
        }

    }

    public componentDidMount(): void {
        const {room} = this.props;
        room.disableSerialization = false;
        room.callbacks.on("onRoomStateChanged", (modifyState: Partial<RoomState>): void => {
            this.setState({roomState: {...room.state, ...modifyState}});
        });
        document.body.addEventListener("keydown", this.arrowControllerHotKey);
    }

    public componentWillUnmount(): void {
        document.body.removeEventListener("keydown", this.arrowControllerHotKey);
    }

    private moveRuleIndex(deltaIndex: number): void {

        if (this.tempRuleIndex === undefined) {
            this.tempRuleIndex = ScaleController.readRuleIndexByScale(this.state.roomState.zoomScale);
        }
        this.tempRuleIndex += deltaIndex;

        if (this.tempRuleIndex > ScaleController.dividingRule.length - 1) {
            this.tempRuleIndex = ScaleController.dividingRule.length - 1;

        } else if (this.tempRuleIndex < 0) {
            this.tempRuleIndex = 0;
        }
        const targetScale = ScaleController.dividingRule[this.tempRuleIndex];

        this.delaySyncRuleIndex();
        this.zoomChange(targetScale);
    }

    public render(): React.ReactNode {
        return (
            <TweenOne
                animation={{
                    duration: 300,
                    height: 32,
                    width: 104,
                }}
                onMouseEnter={() => {
                    this.setState({
                        scaleAnimation: false,
                        reverseState: false,
                        isMouseOn: true,
                    });
                }}
                onMouseLeave={() => {
                    this.setState({
                        scaleAnimation: false,
                        reverseState: true,
                        isMouseOn: false,
                    });
                }}
                style={{
                    height: 32,
                    width: 62,
                }}
                reverse={this.state.reverseState}
                paused={this.state.scaleAnimation}
                className="scale-controller-box">
                <div className="scale-controller-num"
                     onClick={() => this.moveTo100()}>
                    {Math.ceil(this.state.roomState.zoomScale * 100)} %
                </div>
                <TweenOne animation={{
                    delay: 150,
                    display: "flex",
                    duration: 150,
                    opacity: 1,
                    width: 40,
                    marginLeft: 4,
                }}
                          reverse={this.state.reverseState}
                          paused={this.state.scaleAnimation}
                          style={{
                              display: "none",
                              opacity: 0,
                              width: 0,
                              marginLeft: 0,
                          }}>
                    <div className="scale-controller-icon"
                         onClick={() => this.moveRuleIndex(-1)}>
                        -
                    </div>
                    <div className="scale-controller-icon"
                         onClick={() => this.moveRuleIndex(+1)}>
                        +
                    </div>
                </TweenOne>
            </TweenOne>
        );
    }
}
