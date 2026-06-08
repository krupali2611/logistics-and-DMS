const isFormControl = (element) =>
  element instanceof HTMLInputElement ||
  element instanceof HTMLSelectElement ||
  element instanceof HTMLTextAreaElement;

const getFieldLabel = (field) => {
  const explicitLabel = field.getAttribute('data-label') || field.getAttribute('aria-label');
  if (explicitLabel) {
    return explicitLabel.trim();
  }

  const label = field.closest('label');
  const labelText = label?.querySelector('span')?.textContent?.replace('*', '').trim();
  if (labelText) {
    return labelText;
  }

  return field.name
    ?.replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase()) || 'This field';
};

const getValidationMessage = (field) => {
  const label = getFieldLabel(field);
  const { validity, type, min, max } = field;

  if (validity.valueMissing) {
    return `${label} is required.`;
  }

  if (validity.typeMismatch && type === 'email') {
    return 'Please enter a valid email address.';
  }

  if (validity.tooShort) {
    return `${label} is too short.`;
  }

  if (validity.tooLong) {
    return `${label} is too long.`;
  }

  if (validity.patternMismatch) {
    return `Please enter a valid ${label.toLowerCase()}.`;
  }

  if (validity.rangeUnderflow) {
    return `${label} must be ${min || 'higher'} or above.`;
  }

  if (validity.rangeOverflow) {
    return `${label} must be ${max || 'lower'} or below.`;
  }

  if (validity.badInput) {
    return `Please enter a valid ${label.toLowerCase()}.`;
  }

  return field.validationMessage || `Please check ${label.toLowerCase()}.`;
};

const syncFieldValidity = (field) => {
  field.setCustomValidity('');

  if (!field.validity.valid) {
    field.setCustomValidity(getValidationMessage(field));
  }
};

export const validateForm = (form) => {
  const fields = Array.from(form.elements).filter(isFormControl);
  let firstInvalidField = null;

  for (const field of fields) {
    if (field.disabled) {
      continue;
    }

    syncFieldValidity(field);

    if (!field.checkValidity() && !firstInvalidField) {
      firstInvalidField = field;
    }
  }

  if (firstInvalidField) {
    firstInvalidField.reportValidity();
    firstInvalidField.focus();
    firstInvalidField.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return false;
  }

  return true;
};

export const getFormValidationProps = () => ({
  noValidate: true,
  onInvalidCapture: (event) => {
    if (isFormControl(event.target)) {
      syncFieldValidity(event.target);
    }
  },
  onInputCapture: (event) => {
    if (isFormControl(event.target)) {
      event.target.setCustomValidity('');
    }
  },
  onChangeCapture: (event) => {
    if (isFormControl(event.target)) {
      event.target.setCustomValidity('');
    }
  }
});
