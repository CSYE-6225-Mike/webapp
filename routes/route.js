const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
var basicAuth = require('basic-Auth')
const models = require('../models/user')
var validator = require('email-validator')
const { where } = require('sequelize')
const sequelize = require('../config/db.sequelize')
const user = require('../models/user')
const { userInfo } = require('os')
const basicAuthentication = require('../middleware/basicAuthentication')

const authenticate = async(req, res, next) => {

}

router.get('/', (req, res) => {
    res.json({ message: "Welcome to the web application!" })
})

router.get('/healthz', (req, res) => {
    res.status(200).send()
})


router.post('/v1/account', async(req, res, next) => {
    try {
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
    const authenticatedUser = req.authenticatedUser
    if (!authenticatedUser) {
        return res.status(401).send({ message: 'Unauthorized' })
    }

    const id = Number.parseInt(req.params.id)

    if (Number.isNaN(id)) {
        res.status(403).send({ message: 'Forbidden' })
    }

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
    const authenticatedUser = req.authenticatedUser
    if (!authenticatedUser) {
        return res.status(401).send({ message: 'Unauthorized' })
    }

    if (!Object.keys(req.body).length) {
        res.status(204).send({ message: 'No Content' })
    }

    const id = Number.parseInt(req.params.id)
    if (Number.isNaN(id)) {
        res.status(403).send({ message: 'Forbidden' })
    }

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
})

module.exports = router