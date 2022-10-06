const models = require('../models/user')
const bcrypt = require('bcrypt')


module.exports = async(req, res, next) => {
    // Basic authorization
    const authorization = req.headers.authorization;
    if (authorization) {
        //Basic user1@gmail.com:password
        const encoded = authorization.substring(6)
        const decoded = Buffer.from(encoded, 'base64').toString('ascii')
        const [username, password] = decoded.split(':') //['user1@gmail.com', 'password']

        const authenticatedUser = await models.findOne({ where: { username: username } })
        if (authenticatedUser) {
            const match = await bcrypt.compare(password, authenticatedUser.password)
            if (match) {
                req.authenticatedUser = authenticatedUser
            }
        }
    }
    next()
}