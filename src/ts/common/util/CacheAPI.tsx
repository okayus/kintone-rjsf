import Sdk from "./kintoneSdk";

export class CacheAPI {
  private apps: any = [];
  private forms: any = {};
  private layouts: any = {};

  public async getApps() {
    if (this.apps.length === 0) {
      this.apps = await Sdk.getApps();
    }
    return this.apps;
  }

  public async getFields(appId: number | null) {
    if (appId === null) {
      return {};
    }

    if (!this.forms[appId]) {
      this.forms[appId] = await Sdk.getFields(appId);
    }
    return this.forms[appId];
  }

  public async getFormLayout(appId: number | null) {
    if (appId === null) {
      return {};
    }

    if (!this.layouts[appId]) {
      this.layouts[appId] = await Sdk.getFormLayout(appId);
    }
    return this.layouts[appId];
  }
}
