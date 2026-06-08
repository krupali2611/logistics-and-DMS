'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pricing_rules', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
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
      base_fare: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      per_km_rate: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      per_kg_rate: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      minimum_fare: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
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

    await queryInterface.createTable('fare_estimations', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      shipment_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'shipments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
      distance_km: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      weight_kg: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      base_fare: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      distance_charge: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      weight_charge: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      final_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
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

    await queryInterface.addIndex('pricing_rules', ['vehicle_type_id'], {
      unique: true,
      name: 'pricing_rules_vehicle_type_id_unique'
    });
    await queryInterface.addIndex('pricing_rules', ['status']);
    await queryInterface.addIndex('fare_estimations', ['shipment_id'], {
      unique: true,
      where: {
        shipment_id: {
          [Sequelize.Op.ne]: null
        }
      },
      name: 'fare_estimations_shipment_id_unique'
    });
    await queryInterface.addIndex('fare_estimations', ['vehicle_type_id']);
    await queryInterface.addIndex('fare_estimations', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('fare_estimations', 'fare_estimations_shipment_id_unique');
    await queryInterface.removeIndex('pricing_rules', 'pricing_rules_vehicle_type_id_unique');
    await queryInterface.dropTable('fare_estimations');
    await queryInterface.dropTable('pricing_rules');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_pricing_rules_status";');
  }
};
