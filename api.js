const bodyParser = require('body-parser')
const fetch = require('isomorphic-fetch')
const express = require('express')
const cheerio = require('cheerio')

const byActivityId = {}

module.exports = function (app) {
  const route = express.Router()
  route.use(bodyParser.json())
  app.use('/api', route)

  route.post('/unfurl', async (req, res) => {
    const form = await fetch(req.body.taskUrl, {
      headers: { Accept: 'text/html' }
    })
    const html = await form.text()
    const $ = cheerio.load(html)
    const title = $('title').text()
    return res.json({
      ok: true,
      dispayName: title,
      type: 'test',
      url: req.body.taskUrl
    })
  })

  route.post('/copy', (req, res) => {
    const { tasks } = req.body
    return res.json({ ok: true })
  })
}
