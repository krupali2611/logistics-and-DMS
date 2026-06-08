'use strict';

const {
  CUSTOMER_USER_STATUSES,
  CUSTOMER_OTP_TYPES
} = require('../src/constants/customerAuthConstants');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer_users', {
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
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      profile_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(...CUSTOMER_USER_STATUSES),
        allowNull: false,
        defaultValue: 'INACTIVE'
      },
      is_phone_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      last_login: {
        type: Sequelize.DATE,
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

    await queryInterface.createTable('customer_refresh_tokens', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      customer_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customer_users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      expires_at: {
        type: Sequelize.DATE,
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

    await queryInterface.createTable('customer_otps', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()')
      },
      customer_user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customer_users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      otp: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM(...CUSTOMER_OTP_TYPES),
        allowNull: false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      verified_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('customer_users', ['customer_id']);
    await queryInterface.addIndex('customer_users', ['status']);
    await queryInterface.addIndex('customer_users', ['is_email_verified']);
    await queryInterface.addIndex('customer_users', ['is_phone_verified']);
    await queryInterface.addIndex('customer_refresh_tokens', ['customer_user_id']);
    await queryInterface.addIndex('customer_refresh_tokens', ['expires_at']);
    await queryInterface.addIndex('customer_otps', ['customer_user_id']);
    await queryInterface.addIndex('customer_otps', ['type']);
    await queryInterface.addIndex('customer_otps', ['expires_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('customer_otps');
    await queryInterface.dropTable('customer_refresh_tokens');
    await queryInterface.dropTable('customer_users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_customer_users_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_customer_otps_type";');
  }
};
