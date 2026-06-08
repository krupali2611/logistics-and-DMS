const AppError = require('./AppError');

const normalizeOptionalText = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
};

const assertFutureOrTodayDate = (value, label = 'Expiry date') => {
  if (!value) {
    return;
  }

  const inputDate = new Date(`${value}T00:00:00Z`);
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

  if (Number.isNaN(inputDate.getTime())) {
    throw new AppError(`${label} must be a valid date.`, 422);
  }

  if (inputDate.getTime() < todayUtc) {
    throw new AppError(`${label} cannot be in the past.`, 422);
  }
};

const assertDocumentNameRules = (documentType, documentName) => {
  const normalizedDocumentName = normalizeOptionalText(documentName);

  if (documentType === 'OTHER' && !normalizedDocumentName) {
    throw new AppError('Document name is required when document type is OTHER.', 422);
  }

  if (documentType !== 'OTHER' && normalizedDocumentName) {
    throw new AppError('Document name can only be provided when document type is OTHER.', 422);
  }

  return normalizedDocumentName;
};

const assertUniqueDocumentType = ({
  documents,
  ownerKey,
  ownerId,
  documentType,
  excludeId = null
}) => {
  if (!documentType || documentType === 'OTHER') {
    return;
  }

  const duplicate = documents.find(
    (document) =>
      document[ownerKey] === ownerId &&
      document.document_type === documentType &&
      document.id !== excludeId
  );

  if (duplicate) {
    throw new AppError(`${documentType} document already exists.`, 409);
  }
};

module.exports = {
  normalizeOptionalText,
  assertFutureOrTodayDate,
  assertDocumentNameRules,
  assertUniqueDocumentType
};
