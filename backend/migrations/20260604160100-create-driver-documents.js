'use strict';

const {
  DRIVER_DOCUMENT_TYPES,
  DRIVER_VERIFICATION_STATUS
} = require('../src/constants/driverConstants');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('driver_documents', {
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
      document_type: {
        type: Sequelize.ENUM(...DRIVER_DOCUMENT_TYPES),
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
      expiry_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      verification_status: {
        type: Sequelize.ENUM(...DRIVER_VERIFICATION_STATUS),
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

    await queryInterface.addIndex('driver_documents', ['driver_id']);
    await queryInterface.addIndex('driver_documents', ['document_type']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('driver_documents');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_driver_documents_document_type";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_driver_documents_verification_status";'
    );
  }
};
