const express = require('express')
const basicAuthentication = require('../middleware/basicAuthentication')
const router = express.Router()
const s3Controller = require('../middleware/s3.controller')
const models = require('../models/document')
const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const upload = multer({ dest: 'uploads/' })


const s3 = new AWS.S3({
    region: process.env.AWS_REGION
})

router.post('/v1/documents', basicAuthentication, upload.single('file'), async(req, res) => {
    const authenticatedUser = req.authenticatedUser
    if (!authenticatedUser) {
        return res.status(401).send({ message: 'Unauthorized' })
    }

    if (req.body == null) {
        res.status(400).send({ message: 'Bad request!' })
    }

    try {
        const file = req.file
        const result = await s3Controller.uploadFile(file)

        const document = await models.create({
            doc_id: authenticatedUser.id,
            name: file.originalname,
            s3_bucket_path: result.Location
        })

        res.status(201).send(document)
    } catch (err) {
        console.log(err)
    }

})

router.get('/v1/documents', basicAuthentication, async(req, res) => {

    const authenticatedUser = req.authenticatedUser
    if (!authenticatedUser) {
        return res.status(401).send({ message: 'Unauthorized' })
    }
    const id = authenticatedUser.id
    var documents = {}
    models.find({}, function(err, document) {
        documents[document.user_id] = id
    })

    res.status(200).send(documents)
})

router.get('/v1/documents/:id', basicAuthentication, async(req, res) => {
    try {
        const authenticatedUser = req.authenticatedUser
        if (!authenticatedUser) {
            return res.status(401).send({ message: 'Unauthorized' })
        }

        const doc_id = Number.parseInt(req.params.id)
        const document = models.findByPk({ where: { doc_id: doc_id } })
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
        const authenticatedUser = req.authenticatedUser
        if (!authenticatedUser) {
            return res.status(401).send({ message: 'Unauthorized' })
        }

        const doc_id = Number.parseInt(req.params.id)
        const document = models.findByPk({ where: { doc_id: doc_id } })
        if (document == null || document == undefined) {
            res.status(404).send({ message: "Not Found!" })
        }

        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: document.name
        }

        s3.deleteObjects(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data); // successful response
        });

        res.status(204).send({ message: "File has successfully been deleted!" })
    } catch (err) {
        console.log(err)
    }
})

module.exports = router