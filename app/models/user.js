const Sequelize = require('sequelize')
const sequelize = require('../config/db.sequelize')

const user = sequelize.define('User', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
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
    }
}, {
    instanceMethods: {
        toJSON: function() {
            const userObj = Object.assign({}, this.dataValues)
            delete userObj.password
            return userObj
        }
    }

})



module.exports = user