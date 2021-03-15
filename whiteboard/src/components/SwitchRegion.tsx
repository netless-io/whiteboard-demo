import { Select } from "antd";
import React from "react";
import i18n from "../i18n";
import { Language, Region, region, regions, setRegion } from "../region";
import "./SwitchRegion.less";

const { Option } = Select;

export interface SwitchRegionProps {
    onChange?: (region: string) => void;
}

export default class SwitchRegion extends React.Component<SwitchRegionProps> {
    public render(): React.ReactNode {
        return (
            <div className="switch-region">
                <span style={{ paddingRight: 12 }}>{this.renderRegion()}:</span>
                <Select value={region} onSelect={this.onChange} style={{ width: this.getWidth() }}>
                    {regions[this.getLang()].map(({ name, region, emoji }) => (
                        <Option key={region} value={region}>{emoji} {name}</Option>
                    ))}
                </Select>
            </div>
        );
    }

    private getLang(): Language {
        return i18n.language as Language;
    }

    private getWidth = (): number => {
        if (this.getLang() === "zh-CN") {
            return 114;
        } else {
            return 138;
        }
    }

    private renderRegion = (): string => {
        if (this.getLang() === "zh-CN") {
            return "区域";
        } else {
            return "Region";
        }
    }

    public onChange = (_region: Region): void => {
        setRegion(_region);
        this.props.onChange?.(_region);
        this.forceUpdate();
    }
}
