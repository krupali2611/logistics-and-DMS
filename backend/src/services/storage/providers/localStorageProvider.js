const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const AppError = require('../../../utils/AppError');

const MIME_EXTENSION_MAP = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf'
};

const sanitizeBaseName = (value) =>
  value
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

class LocalStorageProvider {
  constructor({ rootDirectory }) {
    this.rootDirectory = rootDirectory;
  }

  async ensureDirectory(folder) {
    const targetDirectory = path.join(this.rootDirectory, folder);
    await fs.mkdir(targetDirectory, { recursive: true });
    return targetDirectory;
  }

  async upload({ folder, buffer, mimeType, originalName }) {
    const directory = await this.ensureDirectory(folder);
    const parsedOriginalName = path.parse(originalName || 'file');
    const extension =
      path.extname(originalName || '') || MIME_EXTENSION_MAP[mimeType] || '.bin';
    const safeBaseName = sanitizeBaseName(parsedOriginalName.name || 'file');
    const fileName = `${safeBaseName || 'file'}-${crypto.randomUUID()}${extension}`;
    const absolutePath = path.join(directory, fileName);

    await fs.writeFile(absolutePath, buffer);

    return {
      path: `/uploads/${folder.replace(/\\/g, '/')}/${fileName}`,
      fileName,
      mimeType,
      size: buffer.length
    };
  }

  async delete(filePath) {
    if (!filePath) {
      return;
    }

    const normalized = filePath.replace(/^\/+/, '');
    const absolutePath = path.join(path.dirname(this.rootDirectory), normalized);

    try {
      await fs.unlink(absolutePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw new AppError('Failed to remove stored file.', 500);
      }
    }
  }
}

module.exports = LocalStorageProvider;
