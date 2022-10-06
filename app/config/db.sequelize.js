const Sequelize = require('sequelize');
const { Model } = require('sequelize');
const sequelize = new Sequelize('webapp', 'user1', '123456', {
    host: 'localhost',
    dialect: 'mysql',
    dialectOptions: {
        timezone: "-4:00"
    },
    timezone: "-4:00",
})

module.exports = sequelize