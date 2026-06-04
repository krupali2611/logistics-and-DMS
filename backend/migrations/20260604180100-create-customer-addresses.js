'use strict';

const { CUSTOMER_ADDRESS_TYPES } = require('../src/constants/customerConstants');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer_addresses', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      address_type: {
        type: Sequelize.ENUM(...CUSTOMER_ADDRESS_TYPES),
        allowNull: false
      },
      address_line_1: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      address_line_2: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      landmark: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      pincode: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true
      },
      longitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    await queryInterface.addIndex('customer_addresses', ['customer_id']);
    await queryInterface.addIndex('customer_addresses', ['address_type']);
    await queryInterface.addIndex('customer_addresses', ['is_default']);
    await queryInterface.addIndex('customer_addresses', ['city']);
    await queryInterface.addIndex('customer_addresses', ['state']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('customer_addresses');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_customer_addresses_address_type";'
    );
  }
};
