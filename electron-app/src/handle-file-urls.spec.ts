import { getAssetPath } from './handle-file-urls';

describe('getAssetPath', () => {
  it('returns the correct path when the file exists', async () => {
    const emberAppDir = '/path/to/ember/app';
    const url = 'file:///path/to/ember/app/assets/image.png';
    const expectedPath = '/path/to/ember/app/assets/image.png';

    const result = await getAssetPath(emberAppDir, url);

    expect(result).toBe(expectedPath);
  });

  it('returns the path from the original URL when the file does not exist', async () => {
    const emberAppDir = '/path/to/ember/app';
    const url = 'file:///path/to/ember/app/assets/non-existent-file.png';
    const expectedPath = '/path/to/ember/app/assets/non-existent-file.png';

    const result = await getAssetPath(emberAppDir, url);

    expect(result).toBe(expectedPath);
  });
});
