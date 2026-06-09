'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('shipments', 'pickup_address_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'customer_addresses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('shipments', 'delivery_address_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'customer_addresses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('shipments', 'delivery_address_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'customer_addresses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await queryInterface.changeColumn('shipments', 'pickup_address_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'customer_addresses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  }
};
