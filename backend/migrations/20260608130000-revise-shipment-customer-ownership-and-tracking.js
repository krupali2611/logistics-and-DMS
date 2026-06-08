'use strict';

const {
  SHIPMENT_ASSIGNMENT_TYPES,
  SHIPMENT_ASSIGNMENT_STATUSES,
  SHIPMENT_TRACKING_SOURCES
} = require('../src/constants/shipmentConstants');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_enum
          WHERE enumlabel = 'DRIVER_ACCEPTED'
            AND enumtypid = 'enum_shipments_status'::regtype
        ) THEN
          ALTER TYPE "enum_shipments_status" ADD VALUE 'DRIVER_ACCEPTED' AFTER 'ASSIGNED';
        END IF;
      EXCEPTION
        WHEN undefined_object THEN NULL;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_enum
          WHERE enumlabel = 'DRIVER_ACCEPTED'
            AND enumtypid = 'enum_shipment_status_history_old_status'::regtype
        ) THEN
          ALTER TYPE "enum_shipment_status_history_old_status" ADD VALUE 'DRIVER_ACCEPTED' AFTER 'ASSIGNED';
        END IF;
      EXCEPTION
        WHEN undefined_object THEN NULL;
      END $$;
    `);

    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_enum
          WHERE enumlabel = 'DRIVER_ACCEPTED'
            AND enumtypid = 'enum_shipment_status_history_new_status'::regtype
        ) THEN
          ALTER TYPE "enum_shipment_status_history_new_status" ADD VALUE 'DRIVER_ACCEPTED' AFTER 'ASSIGNED';
        END IF;
      EXCEPTION
        WHEN undefined_object THEN NULL;
      END $$;
    `);

    await queryInterface.addColumn('shipments', 'pickup_address_snapshot', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'delivery_address_snapshot', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'pickup_latitude', {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'pickup_longitude', {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'delivery_latitude', {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'delivery_longitude', {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'pickup_place_id', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'delivery_place_id', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'current_driver_latitude', {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'current_driver_longitude', {
      type: Sequelize.DECIMAL(10, 7),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'current_eta', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'current_location_updated_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.sequelize.query(`
      UPDATE shipments AS s
      SET
        pickup_address_snapshot = TRIM(BOTH ', ' FROM CONCAT_WS(', ',
          p.address_line_1,
          NULLIF(p.address_line_2, ''),
          NULLIF(p.landmark, ''),
          p.city,
          p.state,
          p.country,
          p.pincode
        )),
        delivery_address_snapshot = TRIM(BOTH ', ' FROM CONCAT_WS(', ',
          d.address_line_1,
          NULLIF(d.address_line_2, ''),
          NULLIF(d.landmark, ''),
          d.city,
          d.state,
          d.country,
          d.pincode
        )),
        pickup_latitude = COALESCE(s.pickup_latitude, p.latitude),
        pickup_longitude = COALESCE(s.pickup_longitude, p.longitude),
        delivery_latitude = COALESCE(s.delivery_latitude, d.latitude),
        delivery_longitude = COALESCE(s.delivery_longitude, d.longitude)
      FROM customer_addresses AS p, customer_addresses AS d
      WHERE s.pickup_address_id = p.id
        AND s.delivery_address_id = d.id;
    `);

    await queryInterface.changeColumn('shipments', 'pickup_address_snapshot', {
      type: Sequelize.TEXT,
      allowNull: false
    });
    await queryInterface.changeColumn('shipments', 'delivery_address_snapshot', {
      type: Sequelize.TEXT,
      allowNull: false
    });

    await queryInterface.createTable('shipment_assignments', {
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
      driver_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'drivers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      vehicle_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'vehicles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      assignment_type: {
        type: Sequelize.ENUM(...SHIPMENT_ASSIGNMENT_TYPES),
        allowNull: false,
        defaultValue: 'MANUAL'
      },
      status: {
        type: Sequelize.ENUM(...SHIPMENT_ASSIGNMENT_STATUSES),
        allowNull: false,
        defaultValue: 'PENDING'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      assigned_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      accepted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejected_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      auto_assignment_score: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notes: {
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

    await queryInterface.createTable('shipment_tracking_events', {
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
      shipment_assignment_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'shipment_assignments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false
      },
      longitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: false
      },
      location_label: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(
          'DRAFT',
          'PENDING_ASSIGNMENT',
          'ASSIGNED',
          'DRIVER_ACCEPTED',
          'PICKUP_STARTED',
          'PICKED_UP',
          'IN_TRANSIT',
          'OUT_FOR_DELIVERY',
          'DELIVERED',
          'CANCELLED',
          'FAILED'
        ),
        allowNull: true
      },
      eta: {
        type: Sequelize.DATE,
        allowNull: true
      },
      source: {
        type: Sequelize.ENUM(...SHIPMENT_TRACKING_SOURCES),
        allowNull: false,
        defaultValue: 'SYSTEM'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      recorded_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      recorded_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('shipments', ['pickup_place_id'], {
      name: 'shipments_pickup_place_id_idx'
    });
    await queryInterface.addIndex('shipments', ['delivery_place_id'], {
      name: 'shipments_delivery_place_id_idx'
    });
    await queryInterface.addIndex('shipments', ['current_eta'], {
      name: 'shipments_current_eta_idx'
    });
    await queryInterface.addIndex('shipment_assignments', ['shipment_id'], {
      name: 'shipment_assignments_shipment_id_idx'
    });
    await queryInterface.addIndex('shipment_assignments', ['driver_id'], {
      name: 'shipment_assignments_driver_id_idx'
    });
    await queryInterface.addIndex('shipment_assignments', ['vehicle_id'], {
      name: 'shipment_assignments_vehicle_id_idx'
    });
    await queryInterface.addIndex('shipment_assignments', ['status'], {
      name: 'shipment_assignments_status_idx'
    });
    await queryInterface.addIndex('shipment_assignments', ['is_active'], {
      name: 'shipment_assignments_is_active_idx'
    });
    await queryInterface.addIndex('shipment_tracking_events', ['shipment_id'], {
      name: 'shipment_tracking_events_shipment_id_idx'
    });
    await queryInterface.addIndex('shipment_tracking_events', ['shipment_assignment_id'], {
      name: 'shipment_tracking_events_assignment_id_idx'
    });
    await queryInterface.addIndex('shipment_tracking_events', ['recorded_at'], {
      name: 'shipment_tracking_events_recorded_at_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('shipment_tracking_events', 'shipment_tracking_events_recorded_at_idx');
    await queryInterface.removeIndex('shipment_tracking_events', 'shipment_tracking_events_assignment_id_idx');
    await queryInterface.removeIndex('shipment_tracking_events', 'shipment_tracking_events_shipment_id_idx');
    await queryInterface.removeIndex('shipment_assignments', 'shipment_assignments_is_active_idx');
    await queryInterface.removeIndex('shipment_assignments', 'shipment_assignments_status_idx');
    await queryInterface.removeIndex('shipment_assignments', 'shipment_assignments_vehicle_id_idx');
    await queryInterface.removeIndex('shipment_assignments', 'shipment_assignments_driver_id_idx');
    await queryInterface.removeIndex('shipment_assignments', 'shipment_assignments_shipment_id_idx');
    await queryInterface.removeIndex('shipments', 'shipments_current_eta_idx');
    await queryInterface.removeIndex('shipments', 'shipments_delivery_place_id_idx');
    await queryInterface.removeIndex('shipments', 'shipments_pickup_place_id_idx');

    await queryInterface.dropTable('shipment_tracking_events');
    await queryInterface.dropTable('shipment_assignments');

    await queryInterface.removeColumn('shipments', 'current_location_updated_at');
    await queryInterface.removeColumn('shipments', 'current_eta');
    await queryInterface.removeColumn('shipments', 'current_driver_longitude');
    await queryInterface.removeColumn('shipments', 'current_driver_latitude');
    await queryInterface.removeColumn('shipments', 'delivery_place_id');
    await queryInterface.removeColumn('shipments', 'pickup_place_id');
    await queryInterface.removeColumn('shipments', 'delivery_longitude');
    await queryInterface.removeColumn('shipments', 'delivery_latitude');
    await queryInterface.removeColumn('shipments', 'pickup_longitude');
    await queryInterface.removeColumn('shipments', 'pickup_latitude');
    await queryInterface.removeColumn('shipments', 'delivery_address_snapshot');
    await queryInterface.removeColumn('shipments', 'pickup_address_snapshot');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_shipment_tracking_events_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_shipment_tracking_events_source";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_shipment_assignments_assignment_type";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_shipment_assignments_status";'
    );
  }
};
