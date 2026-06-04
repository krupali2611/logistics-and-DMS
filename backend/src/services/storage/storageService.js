const path = require('path');
const AppError = require('../../utils/AppError');
const LocalStorageProvider = require('./providers/localStorageProvider');

const provider = new LocalStorageProvider({
  rootDirectory: path.resolve(__dirname, '..', '..', '..', 'uploads')
});

const decodeFilePayload = (filePayload) => {
  if (!filePayload?.content || !filePayload?.original_name) {
    throw new AppError('File content and original_name are required.', 422);
  }

  const matches = filePayload.content.match(/^data:(.+);base64,(.+)$/);
  const mimeType = filePayload.mime_type || matches?.[1];
  const base64Content = matches?.[2] || filePayload.content;

  if (!mimeType) {
    throw new AppError('File mime_type is required.', 422);
  }

  try {
    return {
      buffer: Buffer.from(base64Content, 'base64'),
      mimeType,
      originalName: filePayload.original_name
    };
  } catch (error) {
    throw new AppError('Invalid base64 file content.', 422);
  }
};

const uploadFile = async ({ folder, filePayload, allowedMimeTypes }) => {
  const decodedFile = decodeFilePayload(filePayload);

  if (allowedMimeTypes?.length && !allowedMimeTypes.includes(decodedFile.mimeType)) {
    throw new AppError('Uploaded file type is not supported.', 422);
  }

  return provider.upload({
    folder,
    buffer: decodedFile.buffer,
    mimeType: decodedFile.mimeType,
    originalName: decodedFile.originalName
  });
};

const deleteFile = async (filePath) => provider.delete(filePath);

module.exports = {
  uploadFile,
  deleteFile
};
