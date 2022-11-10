const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const models = require('../models/user')
var validator = require('email-validator')
const { where } = require('sequelize')
const sequelize = require('../config/db.sequelize')
const user = require('../models/user')
const { userInfo } = require('os')
const basicAuthentication = require('../middleware/basicAuthentication')
const logger = require('../config/winston')
const SDC = require('statsd-client')
const sdc = new SDC({ host: 'localhost', port: 8125 })

router.get('/', (req, res) => {
    res.json({ message: "Welcome to the web application!" })
})

router.get('/healthz', (req, res) => {
    sdc.increment('Test healthz')
    logger.info("GET /healthz -200 ok")
    res.status(200).send()
})

router.post('/v1/account', async(req, res, next) => {
    try {
        sdc.increment('Test post.v1.account')
        logger.info('POST /v1/account')
        const data = await models.findOne({ where: { username: req.body.username } })

        if (data) {
            return res.status(400).send({
                message: 'Please Use a different username!'
            })
        }

        if (!validator.validate(req.body.username)) {
            return res.status(400).send({
                message: "Please use a email!"
            })
        }

        // models.create(User).then(user => res.status(201).send(user.toJSON()))

        const salt = await bcrypt.genSalt(10)
        const user = await models.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            password: await bcrypt.hash(req.body.password, salt),
            username: req.body.username
        })
        delete user.dataValues.password
        res.status(201).send(user)
    } catch (err) {
        console.log(err)
    }
})


router.get('/v1/account/:id', basicAuthentication, async(req, res) => {
    sdc.increment('Test get.v1.account.id')
    logger.info('GET /v1/account/:id')
    const authenticatedUser = req.authenticatedUser
    if (!authenticatedUser) {
        return res.status(401).send({ message: 'Unauthorized' })
    }

    const id = req.params.id

    const user = await models.findOne({ where: { id: id } })
    if (!user) {
        res.status(403).send({ message: 'Forbidden' })
    }

    // res.status(200).send({user})
    res.status(200).send({
        id: user.dataValues.id,
        first_name: user.dataValues.firstname,
        last_name: user.dataValues.lastname,
        username: user.dataValues.username,
        account_created: user.dataValues.createdAt,
        account_updated: user.dataValues.updatedAt,
        isVerified: user.dataValues.isVerified
    });
})


router.put('/v1/account/:id', basicAuthentication, async(req, res) => {
    sdc.increment('Test put.v1.account.id')
    logger.info('PUT /v1/account/:id')
    const authenticatedUser = req.authenticatedUser
    if (!authenticatedUser) {
        return res.status(401).send({ message: 'Unauthorized' })
    }

    if (!Object.keys(req.body).length) {
        res.status(204).send({ message: 'No Content' })
    }

    const id = req.params.id

    if (authenticatedUser.id != id) {
        res.status(403).send({ message: 'Forbidden' })
    }

    const user = await models.findOne({ where: { id: id } })
    if (user.username != req.body.username || req.body.id != null || req.body.created != null || req.body.updated != null) {
        res.status(400).send({ message: 'Bad request' })
    }
    user.firstname = req.body.firstname
    user.lastname = req.body.lastname
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(req.body.password, salt)
    await user.save()
    res.status(204).send()
})


module.exports = router