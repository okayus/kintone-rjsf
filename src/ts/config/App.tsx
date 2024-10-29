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
          app: {
            type: "string",
            title: "患者マスターアプリ",
            oneOf: [],
          },
          primaryKeyField: {
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

const App: React.FC<AppProps> = ({ pluginId, cacheAPI }) => {
  const [appOptions, setAppOptions] = useState<any>([]);
  const [primaryKeyFieldOptions, setPrimaryKeyFieldOptions] = useState<any>([]);
  const [formData, setFormData] = useState<any>({ settings: [] });

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await cacheAPI.getApps();
        const options = response.apps.map((app: any) => ({
          const: app.appId,
          title: app.name,
        }));
        setAppOptions(options);

        const responseConfig = kintone.plugin.app.getConfig(pluginId);
        if (responseConfig.config) {
          const parsedConfig = JSON.parse(responseConfig.config).config;
          const newPrimaryKeyFieldOptions: any[][] = [];

          for (const setting of parsedConfig.settings) {
            const fields = await cacheAPI.getFields(setting.app);
            const filteredFieldsOptions = Object.entries(fields)
              .filter(
                ([_, field]) =>
                  (field as FieldType).type === "SINGLE_LINE_TEXT",
              )
              .map(([_, field]) => ({
                const: (field as FieldType).label,
                title: (field as FieldType).code,
              }));
            filteredFieldsOptions.unshift({ const: "", title: "" });
            newPrimaryKeyFieldOptions.push(filteredFieldsOptions);
          }

          setPrimaryKeyFieldOptions(newPrimaryKeyFieldOptions);
          setFormData(parsedConfig);
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

  const handleChange = async (data: IChangeEvent<any, RJSFSchema, any>) => {
    if (data.formData.settings.length === 0) {
      return;
    }

    const updatedPrimaryKeyFieldOptions: any[][] = [];
    for (const setting of data.formData.settings) {
      const fields = await cacheAPI.getFields(setting.app);
      const filteredFieldsOptions = Object.entries(fields)
        .filter(
          ([_, field]) => (field as FieldType).type === "SINGLE_LINE_TEXT",
        )
        .map(([_, field]) => ({
          const: (field as FieldType).label,
          title: (field as FieldType).code,
        }));
      filteredFieldsOptions.unshift({ const: "", title: "" });
      updatedPrimaryKeyFieldOptions.push(filteredFieldsOptions);
    }

    setPrimaryKeyFieldOptions(updatedPrimaryKeyFieldOptions);
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
            app: {
              type: "string",
              oneOf: appOptions,
            },
            primaryKeyField: {
              type: "string",
              oneOf:
                primaryKeyFieldOptions.length > 0
                  ? primaryKeyFieldOptions.flat()
                  : [],
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
