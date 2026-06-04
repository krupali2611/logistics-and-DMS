'use strict';

const {
  DRIVER_STATUS,
  DRIVER_AVAILABILITY_STATUS,
  DRIVER_VERIFICATION_STATUS
} = require('../src/constants/driverConstants');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('drivers', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      driver_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      gender: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      pincode: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      profile_image: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(...DRIVER_STATUS),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      availability_status: {
        type: Sequelize.ENUM(...DRIVER_AVAILABILITY_STATUS),
        allowNull: false,
        defaultValue: 'OFFLINE'
      },
      verification_status: {
        type: Sequelize.ENUM(...DRIVER_VERIFICATION_STATUS),
        allowNull: false,
        defaultValue: 'PENDING'
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

    await queryInterface.addIndex('drivers', ['status']);
    await queryInterface.addIndex('drivers', ['availability_status']);
    await queryInterface.addIndex('drivers', ['verification_status']);
    await queryInterface.addIndex('drivers', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('drivers');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_drivers_status";');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_drivers_availability_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_drivers_verification_status";'
    );
  }
};
