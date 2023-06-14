/* eslint-disable @typescript-eslint/no-var-requires */
import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import type ICopyPlugin from 'copy-webpack-plugin';

const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyPlugin: typeof ICopyPlugin = require('copy-webpack-plugin');

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new CopyPlugin({
    patterns: [
      {
        from: '**/*',
        context: __dirname + '/ember-dist',
        to: __dirname + '/.webpack/renderer',
        filter: async (resourcePath: string) => {
          if (resourcePath === __dirname + '/ember-dist/index.html') {
            return false;
          }

          return true;
        },
        // Terser skip these files for minimization
        info: { minimized: true },
      },
    ],
  }),
];
