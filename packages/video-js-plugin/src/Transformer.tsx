import React, { PropsWithChildren } from "react";

export interface TransformerProps {
    size: { width: number; height: number };
    scale: number;
}

export function Transformer(props: PropsWithChildren<TransformerProps>) {
    const scale = props.scale || 1;

    return (
        <div
            style={{
                width: props.size.width / scale,
                height: props.size.height / scale,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                display: "flex",
            }}
        >
            {props.children}
        </div>
    );
}
