const express = require('express')
const app = express()

app.get('/healthz', (req, res) => {
    res.send().status(200)
})

app.listen(3000, () => {
    console.log("Web application is running at port: 3000!")
})