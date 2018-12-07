const getUserEmail = require('../middleware/getUserEmail')
const formatResponses = require('../lib/formatResponses')
const bodyParser = require('body-parser')
const fetch = require('isomorphic-fetch')
const express = require('express')
const {
  fetchFormCopies,
  parseIdFromTask,
  createInstances,
  getErrorMessage,
  addPermission,
  getNewForms,
  mergeCopies,
  getInstance,
  addTemplate,
  formatTask,
  makeCopy,
  getTask
} = require('../lib/utils')

module.exports = function (app) {
  const route = express.Router()
  route.use(bodyParser.json())
  app.use('/api', route)

  route.post('/unfurl', getUserEmail, async (req, res) => {
    const { access_token, taskUrl } = req.body
    try {
      const id = await parseIdFromTask(taskUrl)
      await addPermission(id, access_token)
      const copy = await makeCopy(id, req.userEmail)
      addTemplate(copy)
      const task = await formatTask(copy)
      return res.json({ ok: true, tasks: [task] })
    } catch (e) {
      return res.json({ ok: false, ...getErrorMessage(e) })
    }
  })

  route.post('/copy', async (req, res) => {
    const { tasks = [] } = req.body
    return fetchFormCopies(getNewForms(tasks))
      .then(mergeCopies(tasks))
      .then(createInstances)
      .then(instances => {
        return res.json({ ok: true, instances })
      })
      .catch(e => {
        console.error('error', e)
        return res.json({ ok: false, ...getErrorMessage(e) })
      })
  })

  route.post('/externalUpdate', async (req, res) => {
    const { update, task, data } = await getInstance(req.body.id)
    try {
      const taskData = await getTask(task)
      const response = await fetch(update.host, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Apikey ' + process.env.API_KEY
        },
        body: JSON.stringify({
          ...req.body,
          responses: formatResponses(data, taskData.json.fields)
        })
      })
      const body = await response.json()
      return res.send(body)
    } catch (e) {
      console.error(e)
      return res.send({ ok: false, ...getErrorMessage(e) })
    }
  })
}
