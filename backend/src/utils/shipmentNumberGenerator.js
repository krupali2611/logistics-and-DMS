const padSequence = (value) => String(value).padStart(6, '0');

const generateShipmentNumber = async ({ sequelize, transaction, date = new Date() }) => {
  const year = date.getFullYear();
  const prefix = `SHP-${year}-`;

  const [rows] = await sequelize.query(
    `
      SELECT shipment_number
      FROM shipments
      WHERE shipment_number LIKE :prefix
      ORDER BY shipment_number DESC
      LIMIT 1
      FOR UPDATE
    `,
    {
      transaction,
      replacements: {
        prefix: `${prefix}%`
      }
    }
  );

  const lastNumber = rows[0]?.shipment_number;
  const lastSequence = lastNumber ? Number(lastNumber.slice(-6)) : 0;
  return `${prefix}${padSequence(lastSequence + 1)}`;
};

module.exports = {
  generateShipmentNumber
};
