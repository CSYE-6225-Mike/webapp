require('dotenv').config()
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
const uuid = require('uuid')
const AWS = require('aws-sdk')

var ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
const addUserToken = async(username) => {
    const userToken = uuid.v4()
    const time = new Date().getTime() / 1000 + 300

    const params = {
        TableName: process.env.DynamoDB_TableOne,
        Item: {
            username: {
                S: username
            },
            userToken: {
                S: userToken
            },
            ttl: {
                N: time.toString()
            }
        }
    }

    await ddb.putItem(params).promise()
    return userToken
}

const verifyUserToken = async(username, userToken) => {
    const params = {
        TableName: process.env.DynamoDB_TableOne,
        Key: {
            username: {
                S: username
            }
        }
    }

    const data = await ddb.getItem(params).promise()
    if (data.Item && data.Item.userToken && data.Item.ttl) {
        const existUserToken = data.Item.userToken.S
        const tokenTTL = data.Item.ttl.N
        const curTime = new Date().getTime() / 1000
        if (existUserToken == userToken && curTime < tokenTTL) {
            return true
        }
    }

    return false
}

router.get('/c', (req, res) => {
    res.json({ message: "Welcome to the web application!" })
})

router.get('/healthz', (req, res) => {
    sdc.increment('Test healthz')
    logger.info("GET /healthz")
    res.status(200).send()
})

router.post('/v1/account', async(req, res, next) => {
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

    const salt = await bcrypt.genSalt(10)
    const user = await models.build({
        id: uuid.v4(),
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: await bcrypt.hash(req.body.password, salt),
        username: req.body.username,
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: false
    })

    const randomToken = await addUserToken(user.username)

    const message = {
        username: user.username,
        userToken: randomToken,
        firstname: user.firstname,
        lastname: user.lastname,
        message_type: "verify_user"
    }

    const sns = new AWS.SNS({
        region: process.env.AWS_REGION
    })

    const params = {
        Message: JSON.stringify(message),
        TopicArn: process.env.SNS_TOPIC
    }

    // Create promise and SNS service object
    var publishTextPromise = await sns.publish(params).promise();

    // Handle promise's fulfilled/rejected states
    console.log(publishTextPromise)

    const newUser = await user.save()
    delete newUser.dataValues.password
    res.status(201).send(newUser)
})

router.get('/v1/verifyUserEmail', async(req, res) => {
    sdc.increment('Verify user email')
    logger.info('GET /v1/verifyUserEmail')
    const email = req.query.email
    const token = req.query.userToken

    const isValid = await verifyUserToken(email, token)
    if (isValid) {
        logger.info('Email and userToken is valid')
        const user = await models.findOne({
            where: { username: email }
        })

        user.isVerified = true
        user.updatedAt = new Date()

        try {
            await user.save()
        } catch (err) {
            logger.error(err)
            return res.status(500).send({ message: 'Server error' })
        }

        res.status(200).send({ message: 'Email verified successfully' })
    } else {
        res.status(400).send({
            message: 'Email or token is not verified due to some errors'
        })
    }
})

router.get('/v1/account/:id', basicAuthentication, async(req, res) => {
    sdc.increment('Test get.v1.account.id')
    logger.info('GET /v1/account/:id')
    const authenticatedUser = req.authenticatedUser
    if (authenticatedUser.isVerified == false) {
        res.status(400).send({ message: 'Unverified user' })
    }
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
        firstname: user.dataValues.firstname,
        lastname: user.dataValues.lastname,
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

    if (authenticatedUser.isVerified == false) {
        res.status(400).send({ message: 'Unverified user' })
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
