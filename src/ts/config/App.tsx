import React, { useEffect, useState } from "react";

import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";

import { CacheAPI } from "../common/util/CacheAPI";

import type { IChangeEvent } from "@rjsf/core";
import type { RJSFSchema } from "@rjsf/utils";
import type { JSONSchema7 } from "json-schema";

interface AppProps {
  pluginId: string;
  cacheAPI: CacheAPI;
}

const baseSchema: RJSFSchema = {
  title: "プラグインの設定",
  type: "object",
  properties: {
    settings: {
      type: "array",
      title: "設定",
      items: {
        type: "object",
        properties: {
          inputField: {
            type: "string",
            title: "患者マスターアプリ",
            oneOf: [],
          },
          displaySpace: {
            type: "string",
            title: "患者・カルテID",
            oneOf: [],
          },
        },
      },
    },
  },
};

const log = (type: string) => console.log.bind(console, type);
type FieldType = {
  type: string;
  code: string;
  label: string;
  noLabel: boolean;
  required?: boolean;
  enabled?: boolean;
};

type Field = {
  elementId: string;
  size?: {
    width: string;
    height: string;
  };
  type: string;
};

type Row = {
  type: "ROW";
  fields: Field[];
};

type ResultItem = {
  const: string;
  title: string;
};

const App: React.FC<AppProps> = ({ pluginId, cacheAPI }) => {
  const [inputFieldOptions, setInputFieldOptions] = useState<any>([]);
  const [displaySpaceOptions, setDisplaySpaceOptions] = useState<any>([]);
  const [formData, setFormData] = useState<any>({});
  const appId = kintone.app.getId();

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const fields = await cacheAPI.getFields(appId);
        const filteredFieldsOptions = Object.entries(fields)
          .filter(
            ([_, field]) => (field as FieldType).type === "MULTI_LINE_TEXT",
          )
          .map(([_, field]) => ({
            const: (field as FieldType).label,
            title: (field as FieldType).code,
          }));
        filteredFieldsOptions.unshift({ const: "", title: "" });
        setInputFieldOptions(filteredFieldsOptions);

        const layout = await cacheAPI.getFormLayout(appId);
        const displaySpaceOption: ResultItem[] = [];

        const processRow = (row: Row) => {
          row.fields.forEach((field) => {
            if (field.elementId) {
              displaySpaceOption.push({
                const: field.elementId,
                title: field.elementId,
              });
            }
          });
        };

        layout.forEach((item: any) => {
          if (item.type === "ROW") {
            processRow(item);
          } else if (item.type === "GROUP") {
            item.layout.forEach((row: any) => processRow(row));
          }
        });
        displaySpaceOption.unshift({ const: "", title: "" });
        setDisplaySpaceOptions(displaySpaceOption);

        const responseConfig = kintone.plugin.app.getConfig(pluginId);
        if (responseConfig.config) {
          const parsedConfig = JSON.parse(responseConfig.config);
          setFormData(parsedConfig.config);
        }
      } catch (error) {
        console.error("Failed to fetch apps:", error);
      }
    };

    fetchApps();
  }, [pluginId, cacheAPI]);

  const handleSubmit = (data: IChangeEvent<any, RJSFSchema, any>) => {
    const submittedData = data.formData;
    const configSetting = { config: submittedData };
    kintone.plugin.app.setConfig(
      { config: JSON.stringify(configSetting) },
      function () {
        alert("設定が保存されました。");
        window.location.href = "../../flow?app=" + kintone.app.getId();
      },
    );
  };

  const handleChange = (data: IChangeEvent<any, RJSFSchema, any>) => {
    setFormData(data.formData);
  };

  const dynamicSchema = {
    ...baseSchema,
    properties: {
      ...baseSchema.properties,
      settings: {
        ...(typeof baseSchema.properties?.settings === "object" &&
        baseSchema.properties.settings !== null
          ? (baseSchema.properties.settings as JSONSchema7)
          : {}),
        items: {
          type: "object",
          properties: {
            ...(typeof baseSchema.properties?.settings === "object" &&
            baseSchema.properties.settings.items !== null &&
            (baseSchema.properties.settings.items as JSONSchema7).properties
              ? (baseSchema.properties.settings.items as JSONSchema7).properties
              : {}),
            inputField: {
              type: "string",
              oneOf: inputFieldOptions,
            },
            displaySpace: {
              type: "string",
              oneOf: displaySpaceOptions,
            },
          },
        },
      },
    },
  };

  return (
    <Form
      schema={dynamicSchema as RJSFSchema}
      validator={validator}
      onChange={handleChange}
      onSubmit={handleSubmit}
      formData={formData}
      onError={log("errors")}
    />
  );
};

export default App;
