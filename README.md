# TsPathsToRelativePathRspackPlugin

this is rspack plguin.

Files compiled in the bundleless mode of rslib retain TypeScript path aliases. Using this plugin, path aliases can be converted to relative paths.

# Getting Started

To begin, you'll need to install eslint-webpack-plugin:

> npm install ts-paths-to-relative-path-rspack-plugin --save-dev

or

> yarn add -D ts-paths-to-relative-path-rspack-plugin

or

> pnpm add -D ts-paths-to-relative-path-rspack-plugin

# Options

## `tsConfigPath`

Specify the absolute path of the tsconfig file; by default, it takes the value from `config.resolve.tsConfig` in the rspack configuration.

# For example:

add the plugin to your rslib config.

```ts
import { defineConfig } from '@rslib/core';
import { TsPathsToRelativePathRspackPlugin } from 'ts-paths-to-relative-path-rspack-plugin';

export default defineConfig({
  // ...
  tools: {
    rspack: (config) => {
      config.plugins = config.plugins || [];

      config.plugins.push(new TsPathsToRelativePathRspackPlugin());

      return config;
    },
  },
  // ...
});
```
