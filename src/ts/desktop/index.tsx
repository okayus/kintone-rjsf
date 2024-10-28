((PLUGIN_ID) => {
  kintone.events.on(["app.record.index.show"], (event) => {
    const responseConfig = kintone.plugin.app.getConfig(PLUGIN_ID);
    if (!responseConfig.config) {
      return event;
    }
    const config = JSON.parse(responseConfig.config).config;
    console.log(config);

    return event;
  });
})(kintone.$PLUGIN_ID);
