const express = require('express')
const { syncBuiltinESMExports } = require('module')
const app = express()
const db = require('./config/db.sequelize')
const userRoutes = require('./routes/route')
const bodyParser = require('body-parser')


app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))

db.sync({ force: false }).then()

app.use(userRoutes)

app.listen(8080, () => {
    console.log("Web application is running at port: 8080!")
})