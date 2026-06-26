module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo (SDK 54) automatically adds `react-native-worklets/plugin`
    // when react-native-worklets is installed. Do NOT add it manually here, or the
    // worklets transform runs twice and breaks at runtime
    // ("Exception in HostFunction: <unknown>").
    presets: ['babel-preset-expo'],
  };
};
