'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('shipments', 'route_distance_km', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'route_duration_minutes', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'estimated_eta', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'route_provider', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'route_geometry', {
      type: Sequelize.JSONB,
      allowNull: true
    });

    await queryInterface.sequelize.query(`
      UPDATE shipments
      SET route_distance_km = estimated_distance
      WHERE estimated_distance IS NOT NULL
        AND route_distance_km IS NULL
    `);

    await queryInterface.addIndex('shipments', ['route_provider'], {
      name: 'shipments_route_provider_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('shipments', 'shipments_route_provider_idx');
    await queryInterface.removeColumn('shipments', 'route_geometry');
    await queryInterface.removeColumn('shipments', 'route_provider');
    await queryInterface.removeColumn('shipments', 'estimated_eta');
    await queryInterface.removeColumn('shipments', 'route_duration_minutes');
    await queryInterface.removeColumn('shipments', 'route_distance_km');
  }
};
