'use strict';

const {
  VEHICLE_STATUS,
  VEHICLE_VERIFICATION_STATUS,
  VEHICLE_AVAILABILITY_STATUS
} = require('../src/constants/vehicleConstants');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vehicles', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      vehicle_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      vehicle_type_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'vehicle_types',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      brand: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      model: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      manufacturing_year: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fuel_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      capacity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      insurance_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      insurance_expiry: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      registration_number: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      registration_expiry: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(...VEHICLE_STATUS),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      verification_status: {
        type: Sequelize.ENUM(...VEHICLE_VERIFICATION_STATUS),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      availability_status: {
        type: Sequelize.ENUM(...VEHICLE_AVAILABILITY_STATUS),
        allowNull: false,
        defaultValue: 'AVAILABLE'
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

    await queryInterface.addIndex('vehicles', ['vehicle_type_id']);
    await queryInterface.addIndex('vehicles', ['status']);
    await queryInterface.addIndex('vehicles', ['verification_status']);
    await queryInterface.addIndex('vehicles', ['availability_status']);
    await queryInterface.addIndex('vehicles', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vehicles');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_vehicles_status";');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_vehicles_verification_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_vehicles_availability_status";'
    );
  }
};
