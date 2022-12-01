require('dotenv').config()
const express = require('express')
const basicAuthentication = require('../middleware/basicAuthentication')
const router = express.Router()
const models = require('../models/document')
const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const upload = multer({ dest: 'uploads/' })
const fs = require('fs')
const logger = require('../config/winston')
const SDC = require('statsd-client')
const sdc = new SDC({ host: 'localhost', port: 8125 })

const s3 = new AWS.S3({
    region: process.env.AWS_REGION
})


const uploadFile = async(file) => {
    const fileStream = fs.createReadStream(file.path)
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: file.filename,
        Body: fileStream
    }
    return await s3.upload(params).promise()
}

const deleteFile = async(fileName) => {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName
    }
    return await s3.deleteObject(params).promise();
}

router.post('/v1/documents', basicAuthentication, upload.single('file'), async(req, res) => {
    try {
        sdc.increment('Test post.v1.documents')
        logger.info('POST /v1/documents')
        const authenticatedUser = req.authenticatedUser
        if (!authenticatedUser) {
            return res.status(401).send({ message: 'Unauthorized' })
        }

        if (authenticatedUser.isVerified == false) {
            res.status(400).send({ message: 'Unverified user' })
        }

        if (req.body == null) {
            res.status(400).send({ message: 'Bad request!' })
        }

        const file = req.file
        const result = await uploadFile(file)
            //results has a key, key == name in the s3 bucket

        const document = await models.create({
            user_id: authenticatedUser.id,
            name: result.Key,
            s3_bucket_path: result.Location
        })

        res.status(201).send(document)
    } catch (err) {
        console.log(err)
    }

})

router.get('/v1/documents', basicAuthentication, async(req, res) => {
    sdc.increment('Test get.v1.documents')
    logger.info('GET /v1/documents')
    const authenticatedUser = req.authenticatedUser
    if (!authenticatedUser) {
        return res.status(401).send({ message: 'Unauthorized' })
    }

    if (authenticatedUser.isVerified == false) {
        res.status(400).send({ message: 'Unverified user' })
    }

    const id = authenticatedUser.id
    const posts = await models.findAll({ where: { user_id: id } })
    res.status(200).send({ posts })
})

router.get('/v1/documents/:id', basicAuthentication, async(req, res) => {
    try {
        sdc.increment('TEST get.v1.documents.id')
        logger.info('GET /v1/documents/:id')
        const authenticatedUser = req.authenticatedUser
        if (!authenticatedUser) {
            return res.status(401).send({ message: 'Unauthorized' })
        }

        if (authenticatedUser.isVerified == false) {
            res.status(400).send({ message: 'Unverified user' })
        }

        const doc_id = req.params.id
        const document = await models.findOne({ where: { doc_id: doc_id } })
        if (!document) {
            res.status(400).send({ message: 'Bad request' })
        }

        if (document.user_id != authenticatedUser.id) {
            res.status(403).send({ message: 'Forbidden' })
        }

        res.status(200).send(document)
    } catch (err) {
        console.log(err)
    }
})

router.delete('/v1/documents/:id', basicAuthentication, async(req, res) => {
    try {
        sdc.increment('Test delete.v1.documents.id')
        logger.info('DELETE /v1/documents/:id')
        const authenticatedUser = req.authenticatedUser
        if (!authenticatedUser) {
            return res.status(401).send({ message: 'Unauthorized' })
        }

        if (authenticatedUser.isVerified == false) {
            res.status(400).send({ message: 'Unverified user' })
        }

        const doc_id = req.params.id
        const document = await models.findOne({ where: { doc_id: doc_id } })
        console.log(document)
        if (!document) {
            res.status(404).send({ message: "Not Found!" })
        }

        filename = document.name
        await deleteFile(filename)
        await models.destroy({ where: { doc_id: doc_id } })
        res.status(204).send({ message: "File has successfully been deleted!" })
    } catch (err) {
        console.log(err)
    }
})

module.exports = router