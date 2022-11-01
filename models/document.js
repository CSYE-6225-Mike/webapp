const Sequelize = require('sequelize')
const sequelize = require('../config/db.sequelize')


const document = sequelize.define('Document', {
    doc_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
    },
    name: {
        type: Sequelize.STRING
    },
    s3_bucket_path: {
        type: Sequelize.STRING
    }
})


module.exports = document