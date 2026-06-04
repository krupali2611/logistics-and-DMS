'use strict';

const {
  CUSTOMER_DOCUMENT_TYPES,
  CUSTOMER_VERIFICATION_STATUS
} = require('../src/constants/customerConstants');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer_documents', {
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
      document_type: {
        type: Sequelize.ENUM(...CUSTOMER_DOCUMENT_TYPES),
        allowNull: false
      },
      document_number: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      document_file: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      verification_status: {
        type: Sequelize.ENUM(...CUSTOMER_VERIFICATION_STATUS),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
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

    await queryInterface.addIndex('customer_documents', ['customer_id']);
    await queryInterface.addIndex('customer_documents', ['document_type']);
    await queryInterface.addIndex('customer_documents', ['verification_status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('customer_documents');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_customer_documents_document_type";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_customer_documents_verification_status";'
    );
  }
};
