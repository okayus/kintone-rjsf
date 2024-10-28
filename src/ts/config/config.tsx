import React from "react";
import { createRoot } from "react-dom/client";

import { CacheAPI } from "../common/util/CacheAPI";

import App from "./App";

(async (PLUGIN_ID) => {
  const cacheAPI = new CacheAPI();
  createRoot(document.getElementById("config")!).render(
    <App pluginId={PLUGIN_ID as string} cacheAPI={cacheAPI} />,
  );
})(kintone.$PLUGIN_ID);
