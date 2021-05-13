import React, { FC } from "react";
import { PluginProps } from "white-web-sdk";

/** simple wrapper to locate the element on the whiteboard */
export const Transformer: FC<Pick<PluginProps<unknown, unknown>, "size" | "scale">> = ({
    size: { width, height },
    scale,
    children,
}) => {
    scale = scale || 1;
    return (
        <div
            style={{
                width: width / scale,
                height: height / scale,
                transform: `scale(${scale})`,
            }}
        >
            {children}
        </div>
    );
};
