require('dotenv').config()
const { S3Client } = require('@aws-sdk/client-s3')
const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const fs = require('fs')

const s3 = new AWS.S3({
    region: process.env.AWS_REGION
})

exports.uploadFile = async(file) => {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: file.name,
        Body: file.buffer
    }
    return await s3.upload(params).promise()
}