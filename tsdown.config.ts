import { readFileSync } from 'node:fs';
import type { Plugin } from 'rolldown';
import { defineConfig } from 'tsdown';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string };

/**
 * Rolldown plugin that replaces `__HIERO_VERSION__` with the version from package.json.
 */
function versionInjector(): Plugin {
  return {
    name: 'version-injector',
    transform(code) {
      if (code.includes('__HIERO_VERSION__')) {
        return {
          code: code.replace(/__HIERO_VERSION__/g, JSON.stringify(pkg.version)),
        };
      }
      return null;
    },
  };
}

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    utils: 'src/utils/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  hash: false,
  fixedExtension: true,
  plugins: [versionInjector()],
});
