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
  const [primaryKeyFieldOptions, setPrimaryKeyFieldOptions] = useState<any[][]>(
    [[{ const: "", title: "" }]],
  );
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await cacheAPI.getApps();
        const appItemOptions = response.apps.map((app: any) => ({
          const: app.appId,
          title: app.name,
        }));
        setAppOptions(appItemOptions);

        const responseConfig = kintone.plugin.app.getConfig(pluginId);
        if (responseConfig.config) {
          const parsedConfig = JSON.parse(responseConfig.config).config;

          const fieldOptions = await Promise.all(
            parsedConfig.settings.map(async (setting: any) => {
              const fields = await cacheAPI.getFields(setting.app);
              return Object.entries(fields)
                .filter(
                  ([, field]) =>
                    (field as FieldType).type === "SINGLE_LINE_TEXT",
                )
                .map(([, field]) => ({
                  const: (field as FieldType).label,
                  title: (field as FieldType).code,
                }));
            }),
          );

          const initialPrimaryKeyFieldOptions = fieldOptions.map((options) => [
            { const: "", title: "" },
            ...options,
          ]);
          setPrimaryKeyFieldOptions(initialPrimaryKeyFieldOptions);
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
    const updatedPrimaryKeyFieldOptions = await Promise.all(
      data.formData.settings.map(async (setting: any, index: number) => {
        if (setting.app) {
          const fields = await cacheAPI.getFields(setting.app);
          const filteredFieldsOptions = Object.entries(fields)
            .filter(
              ([, field]) => (field as FieldType).type === "SINGLE_LINE_TEXT",
            )
            .map(([, field]) => ({
              const: (field as FieldType).label,
              title: (field as FieldType).code,
            }));
          return [{ const: "", title: "" }, ...filteredFieldsOptions];
        }
        return primaryKeyFieldOptions[index] || [{ const: "", title: "" }];
      }),
    );

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
              oneOf: (formData.settings || []).map((_: any, index: number) => ({
                type: "string",
                title: "患者・カルテID",
                oneOf: primaryKeyFieldOptions[index] || [
                  { const: "", title: "" },
                ],
              })),
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
