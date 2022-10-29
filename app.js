const express = require('express')
const { syncBuiltinESMExports } = require('module')
const app = express()
const db = require('./config/db.sequelize')
const userRoutes = require('./routes/userRoute')
const fileRoutes = require('./routes/fileRoutes')
const bodyParser = require('body-parser')


app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))

db.sync({ force: false }).then()

app.use(userRoutes)
app.use(fileRoutes)

app.listen(3000, () => {
    console.log("Web application is running at port: 3000!")
})