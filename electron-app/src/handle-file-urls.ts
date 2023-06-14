import { net, protocol } from 'electron';
import ElectronLog from 'electron-log';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const access = promisify(fs.access);

//
// Patch asset loading -- Ember apps use absolute paths to reference their
// assets, e.g. `<img src="/images/foo.jpg">`. When the current URL is a `file:`
// URL, that ends up resolving to the absolute filesystem path `/images/foo.jpg`
// rather than being relative to the root of the Ember app. So, we intercept
// `file:` URL request and look to see if they point to an asset when
// interpreted as being relative to the root of the Ember app. If so, we return
// that path, and if not we leave them as-is, as their absolute path.
//

export async function getAssetPath(emberAppDir: string, url: string) {
  const urlPath = fileURLToPath(url);
  ElectronLog.info(`     urlPath ${urlPath}`);
  // Get the root of the path -- should be '/' on MacOS or something like
  // 'C:\' on Windows
  const { root } = path.parse(urlPath);
  ElectronLog.info(`        root ${root}`);
  // Get the relative path from the root to the full path
  const relPath = path.relative(root, urlPath);
  ElectronLog.info(`     relPath ${relPath}`);

  // Join the relative path with the Ember app directory
  const appPath = path.join(emberAppDir, relPath);
  try {
    await access(appPath);
    ElectronLog.info(`     appPath ${appPath} exists\n`);
    return appPath;
  } catch (e) {
    ElectronLog.info(`     appPath ${appPath} does not exists\n`);
    return urlPath;
  }
}

export default function handleFileURLs(emberAppDir: string) {
  ElectronLog.info(`setup file url handling ${emberAppDir}`);

  const result = protocol.interceptFileProtocol(
    'file',
    async ({ url }, callback) => {
      callback(await getAssetPath(emberAppDir, url));
    }
  );

  if (result) {
    ElectronLog.debug('onReadyHandler: Interception Configuration succeeded');
  } else {
    ElectronLog.error('onReadyHandler: Interception Configuration failed');
  }

  // protocol.handle('file', async (request) => {
  //   ElectronLog.info(
  //     `Handling ${emberAppDir} ${request.url} => ${await getAssetPath(
  //       emberAppDir,
  //       request.url
  //     )}`
  //   );

  //   return net.fetch(await getAssetPath(emberAppDir, request.url));
}

// const result = await protocol.interceptFileProtocol(
//   'file',
//   async ({ url }, callback) => {
//     console.log(`Intercepting ${emberAppDir} ${url}`);
//     callback(await getAssetPath(emberAppDir, url));
//   }
// );

// if (result) {
//   console.log('onReadyHandler: Interception Configuration succeeded');
// } else {
//   console.error('onReadyHandler: Interception Configuration failed');
// }

// return result;
// };
