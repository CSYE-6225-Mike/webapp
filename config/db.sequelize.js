const config = require('../config/db.config')
const Sequelize = require('sequelize');
const { Model } = require('sequelize');

const sequelize = new Sequelize(config.db.database, config.db.user, config.db.password, {
    host: config.db.host,
    dialect: config.db.dialect,
    operatorsAliases: false,
    port: config.db.port,
    pool: {
        max: config.db.pool.max,
        min: config.db.pool.min,
        acquire: config.db.pool.acquire,
        idle: config.db.pool.idle
    }
})

module.exports = sequelize