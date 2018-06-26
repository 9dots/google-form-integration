const bodyParser = require('body-parser')
const express = require('express')
const {
  fetchFormCopies,
  createInstances,
  addPermission,
  getNewForms,
  mergeCopies,
  getTitle
} = require('./utils')

module.exports = function (app) {
  const route = express.Router()
  route.use(bodyParser.json())
  app.use('/api', route)

  route.post('/unfurl', async (req, res) => {
    const { access_token, taskUrl } = req.body
    return addPermission(taskUrl, access_token)
      .then(() => getTitle(taskUrl))
      .then(tasks => res.json({ ok: true, tasks: [tasks] }))
      .catch(e => res.json({ ok: false, error: e }))
  })

  route.post('/copy', async (req, res) => {
    const { tasks = [] } = req.body
    const instances = await fetchFormCopies(getNewForms(tasks))
      .then(mergeCopies(tasks))
      .then(createInstances)
      .catch(e => res.json({ ok: false, error: e }))
    return res.json({ ok: true, instances })
  })
}
