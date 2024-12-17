import type { Compiler, RspackPluginInstance } from '@rspack/core';
import fs from 'fs-extra';
import path from 'path';

const assertionTsConfigPath = (tsConfigPath?: string) => {
  if (!tsConfigPath) {
    throw new Error('tsConfigPath is required');
  }

  if (!path.isAbsolute(tsConfigPath)) {
    throw new Error(
      'tsConfigPath must be an absolute path. actual path:' + tsConfigPath,
    );
  }

  if (!fs.existsSync(tsConfigPath)) {
    throw new Error(
      'tsconfig.json file does not exist, actual path:' + tsConfigPath,
    );
  }
};

export class TsPathsToRelativePathRspackPlugin implements RspackPluginInstance {
  private pluginName = 'tsPathsToRelativePathRspackPlugin';

  private defaultTsConfigPath: string | undefined;

  constructor(tsConfigPath?: string) {
    if (tsConfigPath) {
      this.defaultTsConfigPath = tsConfigPath;
    }
  }

  private getTsConfigPath(compiler: Compiler) {
    if (this.defaultTsConfigPath) {
      return this.defaultTsConfigPath;
    }

    const config = compiler.options.resolve.tsConfig;

    if (config) {
      if (typeof config === 'string') {
        return config;
      } else {
        return config.configFile;
      }
    }

    return '';
  }

  apply(compiler: Compiler) {
    const tsConfigPath = this.getTsConfigPath(compiler);

    assertionTsConfigPath(tsConfigPath);

    const { compilerOptions = {} } = fs.readJsonSync(tsConfigPath, 'utf-8');
    const { baseUrl, paths } = compilerOptions;

    compiler.hooks.normalModuleFactory.tap(
      this.pluginName,
      (normalModuleFactory) => {
        normalModuleFactory.hooks.beforeResolve.tapAsync(
          this.pluginName,
          (resolveData, callback) => {
            for (const p in paths) {
              const v = paths[p] as string[];
              const alias = p.replace('*', '');

              if (resolveData.request.startsWith(alias)) {
                const aliasPath = path.join(baseUrl, v[0].replace('*', ''));

                const fullAliasPath = `${path.resolve(path.dirname(tsConfigPath), aliasPath)}/`;

                // Replace path alias
                const fullPath = resolveData.request.replace(
                  alias,
                  fullAliasPath,
                );

                // Convert to relative path.
                resolveData.request = `./${path.relative(path.dirname(resolveData.contextInfo.issuer), fullPath)}`;
                break;
              }
            }

            callback();
          },
        );
      },
    );
  }
}
