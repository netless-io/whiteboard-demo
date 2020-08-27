import * as React from "react";
import {CursorAdapter, CursorDescription, Cursor, RoomMember} from "white-web-sdk";
import {BackgroundColorProperty} from "csstype";
import selector from "./image/selector.svg";
import pencil from "./image/pencil.svg";
import text from "./image/text.svg";
import eraser from "./image/eraser.svg";
import ellipse from "./image/ellipse.svg";
import rectangle from "./image/rectangle.svg";
import straight from "./image/straight.svg";
import arrow from "./image/arrow.svg";
import hand from "./image/hand.svg";
import "./index.less";
export type CursorComponentProps = {
    roomMember: RoomMember;
};
type ApplianceDescription = {
    readonly iconUrl: string;
    readonly hasColor: boolean;
    readonly hasStroke: boolean;
};

class CursorComponent extends React.Component<CursorComponentProps, {}> {
    public constructor(props: CursorComponentProps) {
        super(props);
    }
    private static readonly descriptions: {readonly [applianceName: string]: ApplianceDescription} = Object.freeze({
        selector: Object.freeze({
            iconUrl: selector,
            hasColor: false,
            hasStroke: false,
        }),
        pencil: Object.freeze({
            iconUrl: pencil,
            hasColor: true,
            hasStroke: true,
        }),
        text: Object.freeze({
            iconUrl: text,
            hasColor: true,
            hasStroke: false,
        }),
        eraser: Object.freeze({
            iconUrl: eraser,
            hasColor: false,
            hasStroke: false,
        }),
        ellipse: Object.freeze({
            iconUrl: ellipse,
            hasColor: true,
            hasStroke: true,
        }),
        rectangle: Object.freeze({
            iconUrl: rectangle,
            hasColor: true,
            hasStroke: true,
        }),
        straight: Object.freeze({
            iconUrl: straight,
            hasColor: true,
            hasStroke: true,
        }),
        arrow: Object.freeze({
            iconUrl: arrow,
            hasColor: true,
            hasStroke: true,
        }),
        hand: Object.freeze({
            iconUrl: hand,
            hasColor: true,
            hasStroke: true,
        }),
    });

    private iconUrl = (name: string): string | undefined => {
        if (CursorComponent.descriptions[name]) {
            return CursorComponent.descriptions[name].iconUrl;
        } else {
            return  undefined;
        }
    }

    private renderAvatar = (roomMember: RoomMember): React.ReactNode => {
        if (roomMember.payload) {
            if (roomMember.payload.avatar) {
                return <img style={{width: 28}} src={roomMember.payload.avatar}/>;
            } else if (roomMember.payload.id) {
                return (
                    <div style={{width: 28, height: 28, backgroundColor: "green"}}/>
                );
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    private renderToolImage = (name: string, color: BackgroundColorProperty): React.ReactNode => {
        if (CursorComponent.descriptions[name]) {
            return (
                <div style={{backgroundColor: color}} className="cursor-box-tool">
                    <img src={this.iconUrl(name)}/>
                </div>
            )
        } else {
            return null;
        }
    }

    public render(): React.ReactNode {
        const {roomMember} = this.props;
        const color = `rgb(${roomMember.memberState.strokeColor[0]}, ${roomMember.memberState.strokeColor[1]}, ${roomMember.memberState.strokeColor[2]})`;
        return <div>
            <div style={{borderColor: color}} className="cursor-box">
                {this.renderAvatar(roomMember)}
            </div>
            {this.renderToolImage(roomMember.memberState.currentApplianceName, color)}
        </div>;

    }
}

export class CursorTool implements CursorAdapter {
    private readonly cursors: {[memberId: number]: Cursor} = {};
    private roomMembers: ReadonlyArray<RoomMember> = [];
    public createCursor(): CursorDescription {
        return {x: 16, y: 16, width: 32, height: 32};
    }
    public onAddedCursor(cursor: Cursor): void {
        for (const roomMember of this.roomMembers) {
            if (roomMember.memberId === cursor.memberId) {
                cursor.setReactNode((
                    <CursorComponent roomMember={roomMember} />
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
    public setColorAndAppliance(roomMembers: ReadonlyArray<RoomMember>): void {
        this.roomMembers = roomMembers;
        for (const roomMember of roomMembers) {
            const cursor = this.cursors[roomMember.memberId];
            if (cursor) {
                cursor.setReactNode((
                    <CursorComponent roomMember={roomMember} />
                ));
            }
        }
    }
}