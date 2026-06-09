'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('shipments', 'pickup_address', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'pickup_city', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'pickup_state', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'pickup_country', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'pickup_pincode', {
      type: Sequelize.STRING(20),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'delivery_address', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'delivery_city', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'delivery_state', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'delivery_country', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
    await queryInterface.addColumn('shipments', 'delivery_pincode', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    await queryInterface.addColumn('customer_addresses', 'place_id', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.addColumn('customer_addresses', 'formatted_address', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('customer_addresses', 'is_favorite', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.sequelize.query(`
      UPDATE shipments
      SET
        pickup_address = COALESCE(NULLIF(pickup_address_snapshot, ''), pickup_address),
        delivery_address = COALESCE(NULLIF(delivery_address_snapshot, ''), delivery_address),
        pickup_city = COALESCE(pickup_city, pickup_source.city),
        pickup_state = COALESCE(pickup_state, pickup_source.state),
        pickup_country = COALESCE(pickup_country, pickup_source.country),
        pickup_pincode = COALESCE(pickup_pincode, pickup_source.pincode),
        delivery_city = COALESCE(delivery_city, delivery_source.city),
        delivery_state = COALESCE(delivery_state, delivery_source.state),
        delivery_country = COALESCE(delivery_country, delivery_source.country),
        delivery_pincode = COALESCE(delivery_pincode, delivery_source.pincode)
      FROM customer_addresses AS pickup_source, customer_addresses AS delivery_source
      WHERE pickup_source.id = shipments.pickup_address_id
        AND delivery_source.id = shipments.delivery_address_id
    `);

    await queryInterface.sequelize.query(`
      UPDATE customer_addresses
      SET formatted_address = CONCAT_WS(
        ', ',
        NULLIF(address_line_1, ''),
        NULLIF(address_line_2, ''),
        NULLIF(landmark, ''),
        NULLIF(city, ''),
        NULLIF(state, ''),
        NULLIF(country, ''),
        NULLIF(pincode, '')
      )
    `);

    await queryInterface.changeColumn('shipments', 'pickup_address', {
      type: Sequelize.TEXT,
      allowNull: false
    });
    await queryInterface.changeColumn('shipments', 'delivery_address', {
      type: Sequelize.TEXT,
      allowNull: false
    });
    await queryInterface.changeColumn('shipments', 'pickup_address_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'customer_addresses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    await queryInterface.changeColumn('shipments', 'delivery_address_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'customer_addresses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addIndex('shipments', ['pickup_city'], {
      name: 'shipments_pickup_city_idx'
    });
    await queryInterface.addIndex('shipments', ['delivery_city'], {
      name: 'shipments_delivery_city_idx'
    });
    await queryInterface.addIndex('customer_addresses', ['place_id'], {
      name: 'customer_addresses_place_id_idx'
    });
    await queryInterface.addIndex('customer_addresses', ['is_favorite'], {
      name: 'customer_addresses_is_favorite_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('customer_addresses', 'customer_addresses_is_favorite_idx');
    await queryInterface.removeIndex('customer_addresses', 'customer_addresses_place_id_idx');
    await queryInterface.removeIndex('shipments', 'shipments_delivery_city_idx');
    await queryInterface.removeIndex('shipments', 'shipments_pickup_city_idx');

    await queryInterface.changeColumn('shipments', 'delivery_address_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'customer_addresses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    await queryInterface.changeColumn('shipments', 'pickup_address_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'customer_addresses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });

    await queryInterface.removeColumn('customer_addresses', 'is_favorite');
    await queryInterface.removeColumn('customer_addresses', 'formatted_address');
    await queryInterface.removeColumn('customer_addresses', 'place_id');

    await queryInterface.removeColumn('shipments', 'delivery_pincode');
    await queryInterface.removeColumn('shipments', 'delivery_country');
    await queryInterface.removeColumn('shipments', 'delivery_state');
    await queryInterface.removeColumn('shipments', 'delivery_city');
    await queryInterface.removeColumn('shipments', 'delivery_address');
    await queryInterface.removeColumn('shipments', 'pickup_pincode');
    await queryInterface.removeColumn('shipments', 'pickup_country');
    await queryInterface.removeColumn('shipments', 'pickup_state');
    await queryInterface.removeColumn('shipments', 'pickup_city');
    await queryInterface.removeColumn('shipments', 'pickup_address');
  }
};
