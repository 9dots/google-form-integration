const bodyParser = require('body-parser')
const fetch = require('isomorphic-fetch')
const express = require('express')
const {
  fetchFormCopies,
  parseIdFromTask,
  createInstances,
  addPermission,
  getNewForms,
  mergeCopies,
  getInstance,
  getTitle
} = require('./utils')

module.exports = function (app) {
  const route = express.Router()
  route.use(bodyParser.json())
  app.use('/api', route)

  route.post('/unfurl', async (req, res) => {
    const { access_token, taskUrl } = req.body
    const id = parseIdFromTask(taskUrl)
    return addPermission(id, access_token)
      .then(() => getTitle(taskUrl))
      .then(tasks => res.json({ ok: true, tasks: [tasks] }))
      .catch(e => res.json({ ok: false, error: e }))
  })

  route.post('/externalUpdate', async (req, res) => {
    const update = await getInstance(req.body.id, 'update')
    try {
      const response = await fetch(update.host, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Apikey ' + process.env.API_KEY
        },
        body: JSON.stringify(req.body)
      })
      const body = await response.json()
      return res.send(body)
    } catch (e) {
      return res.send({ ok: false, error: e })
    }
  })

  route.post('/copy', async (req, res) => {
    const { tasks = [], access_token } = req.body
    return fetchFormCopies(getNewForms(tasks), access_token)
      .then(mergeCopies(tasks))
      .then(createInstances)
      .then(instances => res.json({ ok: true, instances }))
      .catch(e => {
        return res.json({ ok: false, error: e })
      })
  })
}
