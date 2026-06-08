'use strict';

const {
  VEHICLE_ASSIGNMENT_STATUS
} = require('../src/constants/vehicleConstants');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      entity_type: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      entity_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      performed_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      details: {
        type: Sequelize.JSONB,
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

    await queryInterface.createTable('vehicle_assignments', {
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
        onDelete: 'RESTRICT'
      },
      driver_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'drivers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      assigned_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      returned_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(...VEHICLE_ASSIGNMENT_STATUS),
        allowNull: false,
        defaultValue: 'ASSIGNED'
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

    await queryInterface.addColumn('vehicles', 'assigned_driver_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'drivers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('vehicles', 'assigned_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('drivers', 'vehicle_assigned', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('drivers', 'assigned_vehicle_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'vehicles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addIndex('audit_logs', ['entity_type', 'entity_id']);
    await queryInterface.addIndex('audit_logs', ['performed_by']);
    await queryInterface.addIndex('vehicle_assignments', ['vehicle_id']);
    await queryInterface.addIndex('vehicle_assignments', ['driver_id']);
    await queryInterface.addIndex('vehicle_assignments', ['assigned_by']);
    await queryInterface.addIndex('vehicle_assignments', ['status']);
    await queryInterface.addIndex('vehicles', ['assigned_driver_id']);
    await queryInterface.addIndex('drivers', ['assigned_vehicle_id']);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS vehicle_assignments_vehicle_active_unique
      ON vehicle_assignments (vehicle_id)
      WHERE status = 'ASSIGNED'
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS vehicle_assignments_driver_active_unique
      ON vehicle_assignments (driver_id)
      WHERE status = 'ASSIGNED'
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO vehicle_assignments (
        id,
        vehicle_id,
        driver_id,
        assigned_by,
        assigned_at,
        returned_at,
        status,
        created_at,
        updated_at
      )
      SELECT
        dva.id,
        dva.vehicle_id,
        dva.driver_id,
        (
          SELECT id
          FROM users
          ORDER BY created_at ASC
          LIMIT 1
        ) AS assigned_by,
        dva.assigned_at,
        dva.unassigned_at,
        CASE
          WHEN dva.status = 'ACTIVE' THEN 'ASSIGNED'
          ELSE 'RETURNED'
        END::enum_vehicle_assignments_status AS status,
        dva.created_at,
        dva.updated_at
      FROM driver_vehicle_assignments dva
      WHERE EXISTS (
        SELECT 1
        FROM users
        LIMIT 1
      )
      ON CONFLICT (id) DO NOTHING
    `);

    await queryInterface.sequelize.query(`
      UPDATE vehicles v
      SET
        assigned_driver_id = va.driver_id,
        assigned_at = va.assigned_at,
        availability_status = 'ASSIGNED',
        updated_at = CURRENT_TIMESTAMP
      FROM vehicle_assignments va
      WHERE va.vehicle_id = v.id
        AND va.status = 'ASSIGNED'
    `);

    await queryInterface.sequelize.query(`
      UPDATE drivers d
      SET
        vehicle_assigned = true,
        assigned_vehicle_id = va.vehicle_id,
        availability_status = 'BUSY',
        updated_at = CURRENT_TIMESTAMP
      FROM vehicle_assignments va
      WHERE va.driver_id = d.id
        AND va.status = 'ASSIGNED'
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS vehicle_assignments_vehicle_active_unique;'
    );
    await queryInterface.sequelize.query(
      'DROP INDEX IF EXISTS vehicle_assignments_driver_active_unique;'
    );

    await queryInterface.removeColumn('drivers', 'assigned_vehicle_id');
    await queryInterface.removeColumn('drivers', 'vehicle_assigned');
    await queryInterface.removeColumn('vehicles', 'assigned_at');
    await queryInterface.removeColumn('vehicles', 'assigned_driver_id');

    await queryInterface.dropTable('vehicle_assignments');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_vehicle_assignments_status";'
    );

    await queryInterface.dropTable('audit_logs');
  }
};
