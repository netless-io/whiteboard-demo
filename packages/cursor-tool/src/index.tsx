import * as React from "react";
import {
    ApplianceNames,
    Cursor,
    CursorAdapter,
    CursorDescription,
    Player,
    Room,
    RoomMember,
    RoomState
} from "white-web-sdk";
import pencilCursor from "./image/pencil-cursor.png";
import selectorCursor from "./image/selector-cursor.png";
import eraserCursor from "./image/eraser-cursor.png";
import shapeCursor from "./image/shape-cursor.svg";
import textCursor from "./image/text-cursor.svg";
import "./index.less";

export type CursorComponentProps = {
    roomMember: RoomMember;
};

class CursorComponent extends React.Component<CursorComponentProps, {}> {
    public constructor(props: CursorComponentProps) {
        super(props);
    }

    private renderAvatar = (roomMember: RoomMember): React.ReactNode => {
        const color = `rgb(${roomMember.memberState.strokeColor[0]}, ${roomMember.memberState.strokeColor[1]}, ${roomMember.memberState.strokeColor[2]})`;

        if (this.detectAvatar(roomMember)) {
            const isHaveName = this.detectCursorName(roomMember);
            return (
                <img className="cursor-selector-avatar"
                     style={{
                         width: isHaveName ? 19 : 28,
                         height: isHaveName ? 19 : 28,
                         position: isHaveName ? "initial" : "absolute",
                         borderColor: isHaveName ? "white" : color,
                         marginRight: isHaveName ? 4 : 0}}
                     src={roomMember.payload.avatar}
                     alt={"avatar"}/>
            );
        } else {
            return null;
        }
    }

    private getOpacity = (roomMember: RoomMember): number => {
        const cursorName = this.getCursorName(roomMember);
        const avatar = this.detectAvatar(roomMember);
        if (cursorName === undefined && avatar === undefined) {
            return 0;
        } else {
            return 1;
        }
    }

    private getCursorName = (roomMember: RoomMember): string | undefined => {
        if (roomMember.payload && roomMember.payload.cursorName) {
            return roomMember.payload.cursorName;
        } else {
            return undefined;
        }
    }

    private detectCursorName = (roomMember: RoomMember): boolean => {
        return !!(roomMember.payload && roomMember.payload.cursorName);
    }

    private detectAvatar = (roomMember: RoomMember): boolean => {
        return !!(roomMember.payload && roomMember.payload.avatar);
    }
    public render(): React.ReactNode {
        const {roomMember} = this.props;
        const cursorName = this.getCursorName(roomMember);
        const isHaveName = this.detectCursorName(roomMember);
        const color = `rgb(${roomMember.memberState.strokeColor[0]}, ${roomMember.memberState.strokeColor[1]}, ${roomMember.memberState.strokeColor[2]}, ${isHaveName ? 1 : 0})`;
        const appliance = roomMember.memberState.currentApplianceName;
        switch (appliance) {
            case ApplianceNames.pencil: {
                return (
                    <div className="cursor-box">
                        <div className="cursor-pencil-mid">
                            <div style={{opacity: this.getOpacity(roomMember)}} className="cursor-pencil-inner">
                                <span style={{backgroundColor: color}}>
                                     {this.renderAvatar(roomMember)}
                                    {cursorName}
                                </span>
                            </div>
                            <img className="cursor-pencil-image" src={pencilCursor} alt={"pencilCursor"}/>
                        </div>
                    </div>
                );
            }
            case ApplianceNames.selector: {
                return (
                    <div className="cursor-box">
                        <div className="cursor-selector-mid">
                            <img className="cursor-selector-image" src={selectorCursor} alt={"selectorCursor"}/>
                            <div style={{opacity: this.getOpacity(roomMember)}} className="cursor-selector-inner">
                                <span style={{backgroundColor: color}}>
                                    {this.renderAvatar(roomMember)}
                                    {cursorName}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            }
            case ApplianceNames.eraser: {
                return (
                    <div className="cursor-box">
                        <div className="cursor-pencil-mid">
                            <div style={{opacity: this.getOpacity(roomMember)}} className="cursor-pencil-inner">
                                <span style={{backgroundColor: color}}>
                                    {this.renderAvatar(roomMember)}
                                    {cursorName}
                                </span>
                            </div>
                            <img className="cursor-pencil-image" src={eraserCursor} alt={"selectorCursor"}/>
                        </div>
                    </div>
                );
            }
            case ApplianceNames.text: {
                return (
                    <div className="cursor-box">
                        <div className="cursor-text-mid">
                            <div style={{opacity: this.getOpacity(roomMember)}} className="cursor-shape-inner">
                                <span style={{backgroundColor: color}}>
                                    {this.renderAvatar(roomMember)}
                                    {cursorName}
                                </span>
                            </div>
                            <img src={textCursor} alt={"selectorCursor"}/>
                        </div>
                    </div>
                );
            }
            default: {
                return (
                    <div className="cursor-box">
                        <div className="cursor-shape-mid">
                            <div style={{opacity: this.getOpacity(roomMember)}} className="cursor-shape-inner">
                              <span style={{backgroundColor: color}}>
                                    {this.renderAvatar(roomMember)}
                                  {cursorName}
                                </span>
                            </div>
                            <img src={shapeCursor} alt={"shapeCursor"}/>
                        </div>
                    </div>
                );
            }
        }
    }
}

export class CursorTool implements CursorAdapter {
    private readonly cursors: { [memberId: number]: Cursor } = {};
    private roomMembers: ReadonlyArray<RoomMember> = [];
    private isFirstFrameReady: boolean = false;

    public createCursor(): CursorDescription {
        return {x: 64, y: 64, width: 128, height: 128};
    }

    public onAddedCursor(cursor: Cursor): void {
        for (const roomMember of this.roomMembers) {
            if (roomMember.memberId === cursor.memberId && !this.isCursorDisappear(roomMember)) {
                cursor.setReactNode((
                    <CursorComponent roomMember={roomMember}/>
                ));
                break;
            }
        }
        this.cursors[cursor.memberId] = cursor;
    }

    public onRemovedCursor(cursor: Cursor): void {
        delete this.cursors[cursor.memberId];
    }

    public onMovingCursor(): void {
    }

    private isCursorDisappear = (roomMember: RoomMember): boolean => {
        return !!(roomMember.payload && roomMember.payload.disappearCursor);
    }


    public setRoom(room: Room): void {
        this.setColorAndAppliance(room.state.roomMembers);
        room.callbacks.on("onRoomStateChanged", (modifyState: Partial<RoomState>): void => {
            if (modifyState.roomMembers) {
                this.setColorAndAppliance(modifyState.roomMembers);
            }
        });
    }

    public setPlayer(player: Player): void {
        if (this.isFirstFrameReady) {
            this.setColorAndAppliance(player.state.roomMembers);
        }
        player.callbacks.on("onPlayerStateChanged", (modifyState: Partial<RoomState>): void => {
            if (modifyState.roomMembers) {
                this.setColorAndAppliance(modifyState.roomMembers);
            }
        });
        player.callbacks.on("onLoadFirstFrame", (): void => {
            this.isFirstFrameReady = true;
            this.setColorAndAppliance(player.state.roomMembers);
        })
    }

    private setColorAndAppliance(roomMembers: ReadonlyArray<RoomMember>): void {
        this.roomMembers = roomMembers;
        for (const roomMember of roomMembers) {
            const cursor = this.cursors[roomMember.memberId];
            if (cursor && !this.isCursorDisappear(roomMember)) {
                cursor.setReactNode((
                    <CursorComponent roomMember={roomMember}/>
                ));
            }
        }
    }
}
