'use strict';

const {
  SHIPMENT_TYPES,
  SHIPMENT_PRIORITIES,
  SHIPMENT_STATUSES
} = require('../src/constants/shipmentConstants');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shipments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      shipment_number: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      pickup_address_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customer_addresses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      delivery_address_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customer_addresses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
      shipment_type: {
        type: Sequelize.ENUM(...SHIPMENT_TYPES),
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM(...SHIPMENT_PRIORITIES),
        allowNull: false,
        defaultValue: 'NORMAL'
      },
      package_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      total_weight: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_volume: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
        defaultValue: 0
      },
      estimated_distance: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      estimated_delivery_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      special_instructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(...SHIPMENT_STATUSES),
        allowNull: false,
        defaultValue: 'DRAFT'
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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

    await queryInterface.createTable('shipment_packages', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      shipment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'shipments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      package_name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      package_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      weight: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      length: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      width: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      height: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      declared_value: {
        type: Sequelize.DECIMAL(14, 2),
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

    await queryInterface.createTable('shipment_status_history', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      shipment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'shipments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      old_status: {
        type: Sequelize.ENUM(...SHIPMENT_STATUSES),
        allowNull: true
      },
      new_status: {
        type: Sequelize.ENUM(...SHIPMENT_STATUSES),
        allowNull: false
      },
      remarks: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.createTable('shipment_attachments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      shipment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'shipments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      file_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      uploaded_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('shipments', ['shipment_number']);
    await queryInterface.addIndex('shipments', ['customer_id']);
    await queryInterface.addIndex('shipments', ['status']);
    await queryInterface.addIndex('shipments', ['priority']);
    await queryInterface.addIndex('shipments', ['shipment_type']);
    await queryInterface.addIndex('shipments', ['created_at']);
    await queryInterface.addIndex('shipment_packages', ['shipment_id']);
    await queryInterface.addIndex('shipment_status_history', ['shipment_id']);
    await queryInterface.addIndex('shipment_attachments', ['shipment_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('shipment_attachments');
    await queryInterface.dropTable('shipment_status_history');
    await queryInterface.dropTable('shipment_packages');
    await queryInterface.dropTable('shipments');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_shipments_shipment_type";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_shipments_priority";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_shipments_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_shipment_status_history_old_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_shipment_status_history_new_status";'
    );
  }
};
