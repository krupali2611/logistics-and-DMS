const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

const icons = {
  view: (
    <path d="M1.5 12s3.8-6 10.5-6 10.5 6 10.5 6-3.8 6-10.5 6S1.5 12 1.5 12Z" />
  ),
  edit: (
    <>
      <path d="M4 20l4-.9L19.5 7.6a1.8 1.8 0 0 0 0-2.5l-.6-.6a1.8 1.8 0 0 0-2.5 0L4.9 16 4 20Z" />
      <path d="M14.5 5.5l4 4" />
    </>
  ),
  address: (
    <>
      <path d="M12 21s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  document: (
    <>
      <path d="M7 2.5h7l4 4V21a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z" />
      <path d="M14 2.5V7h4.5" />
    </>
  ),
  notes: (
    <>
      <path d="M5 4.5h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 3v-3H5a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  verify: (
    <path d="m5 12 4 4 10-10" />
  ),
  activate: (
    <>
      <path d="M12 2v20" />
      <path d="M5 9l7-7 7 7" />
    </>
  ),
  deactivate: (
    <>
      <path d="M12 22V2" />
      <path d="m19 15-7 7-7-7" />
    </>
  ),
  delete: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4.5h6V7" />
      <path d="M7.5 7l1 12.5h7L16.5 7" />
      <path d="M10 11.5v5M14 11.5v5" />
    </>
  ),
  assign: (
    <>
      <path d="M7 12h10" />
      <path d="m13 8 4 4-4 4" />
      <path d="M7 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  return: (
    <>
      <path d="M17 12H7" />
      <path d="m11 8-4 4 4 4" />
      <path d="M17 6h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2" />
    </>
  ),
  history: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
      <path d="M3.5 4v4h4" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  open: (
    <>
      <path d="M14 4h6v6" />
      <path d="M10 14 20 4" />
      <path d="M20 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h6" />
    </>
  )
};

const ActionIcon = ({ name }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...iconProps}>
    {icons[name] || icons.view}
  </svg>
);

export default ActionIcon;
