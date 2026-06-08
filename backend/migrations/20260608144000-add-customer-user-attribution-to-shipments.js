'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('shipments', 'created_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await queryInterface.addColumn('shipments', 'created_by_customer_user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'customer_users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.changeColumn('shipment_status_history', 'updated_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await queryInterface.addColumn('shipment_status_history', 'updated_by_customer_user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'customer_users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addIndex('shipments', ['created_by_customer_user_id']);
    await queryInterface.addIndex('shipment_status_history', ['updated_by_customer_user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('shipment_status_history', ['updated_by_customer_user_id']);
    await queryInterface.removeIndex('shipments', ['created_by_customer_user_id']);
    await queryInterface.removeColumn('shipment_status_history', 'updated_by_customer_user_id');
    await queryInterface.changeColumn('shipment_status_history', 'updated_by', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    await queryInterface.removeColumn('shipments', 'created_by_customer_user_id');
    await queryInterface.changeColumn('shipments', 'created_by', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  }
};
