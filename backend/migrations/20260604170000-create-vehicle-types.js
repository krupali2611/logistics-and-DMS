'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vehicle_types', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      type_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      min_capacity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      max_capacity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('vehicle_types', ['status']);
    await queryInterface.addIndex('vehicle_types', ['type_name']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vehicle_types');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_vehicle_types_status";');
  }
};
