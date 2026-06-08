'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const shipmentsTable = await queryInterface.describeTable('shipments');

    if (!shipmentsTable.cancelled_at) {
      await queryInterface.addColumn('shipments', 'cancelled_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    if (!shipmentsTable.cancelled_by) {
      await queryInterface.addColumn('shipments', 'cancelled_by', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    if (!shipmentsTable.cancellation_reason) {
      await queryInterface.addColumn('shipments', 'cancellation_reason', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    await queryInterface.addIndex('shipments', ['cancelled_at'], {
      name: 'shipments_cancelled_at_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('shipments', 'shipments_cancelled_at_idx');
    await queryInterface.removeColumn('shipments', 'cancellation_reason');
    await queryInterface.removeColumn('shipments', 'cancelled_by');
    await queryInterface.removeColumn('shipments', 'cancelled_at');
  }
};
