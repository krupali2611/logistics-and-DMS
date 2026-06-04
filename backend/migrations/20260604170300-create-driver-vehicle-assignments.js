'use strict';

const { DRIVER_VEHICLE_ASSIGNMENT_STATUS } = require('../src/constants/vehicleConstants');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('driver_vehicle_assignments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'drivers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      vehicle_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'vehicles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      unassigned_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(...DRIVER_VEHICLE_ASSIGNMENT_STATUS),
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

    await queryInterface.addIndex('driver_vehicle_assignments', ['driver_id']);
    await queryInterface.addIndex('driver_vehicle_assignments', ['vehicle_id']);
    await queryInterface.addIndex('driver_vehicle_assignments', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('driver_vehicle_assignments');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_driver_vehicle_assignments_status";'
    );
  }
};
