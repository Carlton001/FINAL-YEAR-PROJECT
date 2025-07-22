// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// This is the new line you should add in, after the previous lines mainly for firebase auth error
config.resolver.unstable_enablePackageExports = false;
module.exports = config;
