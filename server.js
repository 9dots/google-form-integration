const express = require('express')
const api = require('./api')

const app = express()

api(app)
app.listen(process.env.port || 5000)
