import { Select } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { languagesWithName } from "./i18n";

export interface SwitchLanguageProps {
  id?: string;
}

export const SwitchLanguage: React.FC<SwitchLanguageProps> = ({ id }) => {
  const { i18n } = useTranslation();
  const onChange = (lang: string) => i18n.changeLanguage(lang);

  return (
    <Select
      id={id}
      defaultValue={i18n.language}
      size="small"
      style={{ width: 100 }}
      onChange={onChange}
    >
      {languagesWithName.map(({ lang, name }) => (
        <Select.Option key={lang} value={lang}>
          {name}
        </Select.Option>
      ))}
    </Select>
  );
};
