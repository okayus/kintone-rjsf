import React, { useEffect, useState } from "react";

import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";

import { CacheAPI } from "../common/util/CacheAPI";

import type { IChangeEvent } from "@rjsf/core";
import type { FieldProps, RJSFSchema, UiSchema } from "@rjsf/utils";

interface AppProps {
  pluginId: string;
  cacheAPI: CacheAPI;
}

const log = (type: string) => console.log.bind(console, type);
type FieldType = {
  type: string;
  code: string;
  label: string;
  noLabel: boolean;
  required?: boolean;
  enabled?: boolean;
};

interface CustomPrimaryKeyFieldProps extends FieldProps {
  appId?: string;
  cacheAPI: CacheAPI;
}

const CustomPrimaryKeyField: React.FC<CustomPrimaryKeyFieldProps> = ({
  formData,
  onChange,
  uiSchema,
  cacheAPI,
}) => {
  const [options, setOptions] = useState<any[]>([]);
  const appId = uiSchema?.appId;

  useEffect(() => {
    const fetchPrimaryKeyFieldOptions = async () => {
      if (appId) {
        const fields = await cacheAPI.getFields(appId);
        const filteredOptions = Object.entries(fields)
          .filter(
            ([_, field]) => (field as FieldType).type === "SINGLE_LINE_TEXT",
          )
          .map(([_, field]) => ({
            const: (field as FieldType).label,
            title: (field as FieldType).code,
          }));
        setOptions([{ const: "", title: "" }, ...filteredOptions]);
      }
    };

    fetchPrimaryKeyFieldOptions();
  }, [appId, cacheAPI]);

  return (
    <select value={formData || ""} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <option key={option.const} value={option.const}>
          {option.title}
        </option>
      ))}
    </select>
  );
};

const CustomPrimaryKeyFieldWrapper = (cacheAPI: CacheAPI) => {
  const WrappedCustomPrimaryKeyField = (props: FieldProps) => (
    <CustomPrimaryKeyField {...props} cacheAPI={cacheAPI} />
  );

  WrappedCustomPrimaryKeyField.displayName = "WrappedCustomPrimaryKeyField";

  return WrappedCustomPrimaryKeyField;
};

const App: React.FC<AppProps> = ({ pluginId, cacheAPI }) => {
  const [appOptions, setAppOptions] = useState<any[]>([]);
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
          setFormData(JSON.parse(responseConfig.config).config);
        }
      } catch (error) {
        console.error("Failed to fetch apps:", error);
      }
    };

    fetchApps();
  }, [pluginId, cacheAPI]);

  const handleSubmit = (data: IChangeEvent<any>) => {
    const configSetting = { config: data.formData };
    kintone.plugin.app.setConfig(
      { config: JSON.stringify(configSetting) },
      function () {
        alert("設定が保存されました。");
        window.location.href = "../../flow?app=" + kintone.app.getId();
      },
    );
  };

  const dynamicSchema = {
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
              oneOf: appOptions,
            },
            primaryKeyField: {
              type: "string",
              title: "患者・カルテID",
            },
          },
        },
      },
    },
  };

  const uiSchema = {
    settings: {
      items: {
        app: {
          "ui:widget": "select",
        },
        primaryKeyField: {
          "ui:field": "customPrimaryKeyField",
          appId: (formData.settings || []).map((setting: any) => setting.app),
        },
      },
    },
  };

  return (
    <Form
      schema={dynamicSchema as RJSFSchema}
      uiSchema={uiSchema as UiSchema}
      validator={validator}
      formData={formData}
      onSubmit={handleSubmit}
      onChange={(data) => setFormData(data.formData)}
      // eslint-disable-next-line new-cap
      fields={{ customPrimaryKeyField: CustomPrimaryKeyFieldWrapper(cacheAPI) }}
      onError={log("errors")}
    />
  );
};

export default App;
