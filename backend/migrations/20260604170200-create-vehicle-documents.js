'use strict';

const {
  VEHICLE_DOCUMENT_TYPES,
  VEHICLE_VERIFICATION_STATUS
} = require('../src/constants/vehicleConstants');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vehicle_documents', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
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
      document_type: {
        type: Sequelize.ENUM(...VEHICLE_DOCUMENT_TYPES),
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
        type: Sequelize.ENUM(...VEHICLE_VERIFICATION_STATUS),
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

    await queryInterface.addIndex('vehicle_documents', ['vehicle_id']);
    await queryInterface.addIndex('vehicle_documents', ['document_type']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vehicle_documents');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_vehicle_documents_document_type";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_vehicle_documents_verification_status";'
    );
  }
};
