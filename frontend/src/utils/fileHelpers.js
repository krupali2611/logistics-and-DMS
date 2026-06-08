const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const IMAGE_FILE_PATTERN = /\.(jpg|jpeg|png|webp|gif|bmp|svg|avif|jfif)(\?.*)?(#.*)?$/i;

export const toBase64Payload = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () =>
      resolve({
        content: reader.result,
        original_name: file.name,
        mime_type: file.type
      });

    reader.onerror = () => reject(new Error('Unable to read selected file.'));
    reader.readAsDataURL(file);
  });

export const getFileUrl = (filePath) => {
  if (!filePath) {
    return '';
  }

  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${origin}${filePath}`;
};

export const isImageFile = (filePath) => IMAGE_FILE_PATTERN.test(filePath || '');

export const isImageMimeType = (mimeType) => /^image\//i.test(mimeType || '');

export const isImageUrl = (filePath) => IMAGE_FILE_PATTERN.test(filePath || '');
