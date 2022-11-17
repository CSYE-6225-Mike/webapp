const Sequelize = require('sequelize')
const sequelize = require('../config/db.sequelize')

const user = sequelize.define('User', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    firstname: {
        type: Sequelize.STRING,
    },
    lastname: {
        type: Sequelize.STRING,
    },
    password: {
        type: Sequelize.STRING,
        select: false,
        writeonly: true
    },
    username: {
        type: Sequelize.STRING,
        unique: true
    },
    isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
})

module.exports = user