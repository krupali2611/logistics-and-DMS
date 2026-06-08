export const OTHER_DOCUMENT_VALUE = 'OTHER';

export const driverDocumentTypes = [
  'DRIVING_LICENSE',
  'AADHAR_CARD',
  'PAN_CARD',
  'VEHICLE_PERMIT',
  OTHER_DOCUMENT_VALUE
];

export const vehicleDocumentTypes = [
  'RC_BOOK',
  'INSURANCE',
  'PUC',
  'FITNESS_CERTIFICATE',
  'PERMIT',
  OTHER_DOCUMENT_VALUE
];

export const customerDocumentTypes = [
  'GST_CERTIFICATE',
  'PAN_CARD',
  'AADHAR_CARD',
  'BUSINESS_LICENSE',
  OTHER_DOCUMENT_VALUE
];

export const driverOtherDocumentNames = [
  'PASSPORT',
  'VOTER_ID',
  'MEDICAL_CERTIFICATE',
  'BANK_PASSBOOK'
];

export const vehicleOtherDocumentNames = [
  'ROAD_TAX',
  'TOLL_PERMIT',
  'NOC',
  'STATE_PERMIT'
];

export const customerOtherDocumentNames = [
  'CANCELLED_CHEQUE',
  'ADDRESS_PROOF',
  'TRADE_LICENSE',
  'AGREEMENT_COPY'
];

export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const day = `${today.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const normalizeDocType = (value) => value || '';

export const getDocumentDisplayName = (document) =>
  document?.document_type === OTHER_DOCUMENT_VALUE && document?.document_name
    ? document.document_name
    : document?.document_type || '';

export const getAvailableDocumentTypes = ({
  allTypes,
  currentType,
  rows = [],
  currentIndex = -1,
  existingDocuments = [],
  editingId = null
}) => {
  const reservedTypes = new Set();

  rows.forEach((row, index) => {
    if (index === currentIndex) {
      return;
    }

    const type = normalizeDocType(row.document_type);
    if (type && type !== OTHER_DOCUMENT_VALUE) {
      reservedTypes.add(type);
    }
  });

  existingDocuments.forEach((document) => {
    if (document.id === editingId) {
      return;
    }

    const type = normalizeDocType(document.document_type);
    if (type && type !== OTHER_DOCUMENT_VALUE) {
      reservedTypes.add(type);
    }
  });

  return allTypes.filter(
    (type) =>
      type === OTHER_DOCUMENT_VALUE ||
      type === currentType ||
      !reservedTypes.has(type)
  );
};

export const hasDuplicateNonOtherDocument = ({
  documentType,
  rows = [],
  currentIndex = -1,
  existingDocuments = [],
  editingId = null
}) => {
  if (!documentType || documentType === OTHER_DOCUMENT_VALUE) {
    return false;
  }

  const duplicateInRows = rows.some(
    (row, index) => index !== currentIndex && row.document_type === documentType
  );

  if (duplicateInRows) {
    return true;
  }

  return existingDocuments.some(
    (document) => document.id !== editingId && document.document_type === documentType
  );
};
