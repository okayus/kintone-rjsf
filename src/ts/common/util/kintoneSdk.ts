import {
  KintoneRestAPIClient,
  KintoneFormFieldProperty,
} from "@kintone/rest-api-client";

export interface ParamsToGetRecords {
  app: number;
  condition?: string;
  fields?: string[];
}

export interface ParamsToAddRecords {
  app: number;
  records: any[];
}

interface ParamsToDeleteRecord {
  id: number;
}

export interface ParamsToDeleteRecords {
  app: number;
  records: ParamsToDeleteRecord[];
}

export class KintoneUrlUtil {
  // private fields: Record<string, KintoneFormFieldProperty.OneOf> = {};

  public getRestApiClient(): KintoneRestAPIClient {
    return new KintoneRestAPIClient({});
  }

  public fetchFields = async (appId: number, preview: boolean = true) => {
    const restApiClient = this.getRestApiClient();
    const fields = (
      await restApiClient.app.getFormFields({ app: appId, preview })
    ).properties;
    return fields;
  };

  public getFormLayout = async (appId: number, preview: boolean = true) => {
    const restApiClient = this.getRestApiClient();
    const formLayout = (
      await restApiClient.app.getFormLayout({ app: appId, preview })
    ).layout;
    return formLayout;
  };
}

export class Sdk {
  private kintoneUrlUtil: KintoneUrlUtil;

  constructor() {
    this.kintoneUrlUtil = new KintoneUrlUtil();
  }

  public async getFields(appId: number) {
    const res = await this.kintoneUrlUtil.fetchFields(appId);
    return res;
  }

  public async getFormLayout(appId: number) {
    const res = await this.kintoneUrlUtil.getFormLayout(appId);
    return res;
  }
}

export default new Sdk();

export type kintoneType = KintoneFormFieldProperty.OneOf["type"];
