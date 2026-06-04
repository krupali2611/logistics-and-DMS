'use strict';

const {
  CUSTOMER_TYPES,
  CUSTOMER_STATUS,
  CUSTOMER_VERIFICATION_STATUS
} = require('../src/constants/customerConstants');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customers', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      customer_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      customer_type: {
        type: Sequelize.ENUM(...CUSTOMER_TYPES),
        allowNull: false
      },
      company_name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      contact_person: {
        type: Sequelize.STRING(150),
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
      alternate_phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      gst_number: {
        type: Sequelize.STRING(30),
        allowNull: true
      },
      pan_number: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(...CUSTOMER_STATUS),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      verification_status: {
        type: Sequelize.ENUM(...CUSTOMER_VERIFICATION_STATUS),
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

    await queryInterface.addIndex('customers', ['customer_code']);
    await queryInterface.addIndex('customers', ['customer_type']);
    await queryInterface.addIndex('customers', ['status']);
    await queryInterface.addIndex('customers', ['verification_status']);
    await queryInterface.addIndex('customers', ['company_name']);
    await queryInterface.addIndex('customers', ['contact_person']);
    await queryInterface.addIndex('customers', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('customers');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_customers_customer_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_customers_status";');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_customers_verification_status";'
    );
  }
};
