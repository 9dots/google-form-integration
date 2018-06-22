const toRegexp = require('path-to-regexp')
const bodyParser = require('body-parser')
const fetch = require('isomorphic-fetch')
const htmlToJson = require('./lib/form')
const admin = require('firebase-admin')
const express = require('express')
const cheerio = require('cheerio')
const url = require('url')

const formsUrl =
  'https://script.google.com/macros/s/AKfycbw0cFBNz4_32nEzfEx8gIKmnd_1mdS7sRE0_kzAMFQN_TvHxlrl/exec'
const tasksRef = admin.database().ref('tasks')
const pathRe = toRegexp('/forms/d/:id/edit')

module.exports = function (app) {
  const route = express.Router()
  route.use(bodyParser.json())
  app.use('/api', route)

  route.post('/teacherView', async (req, res) => {
    const { task } = req.body
    const snap = await tasksRef.child(task).once('value')
    const url = snap.val()
    return res.json({ ok: true, view: `${url}#responses` })
  })

  route.post('/unfurl', async (req, res) => {
    const { access_token, taskUrl } = req.body
    return addPermission(taskUrl, access_token)
      .then(() => getTitle(taskUrl))
      .then(tasks => res.json({ ok: true, tasks: [tasks] }))
      .catch(console.error)
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

async function addPermission (taskUrl, access_token) {
  const path = url.parse(taskUrl).pathname
  const [, id] = pathRe.exec(path)
  return fetch(
    `https://www.googleapis.com/drive/v3/files/${id}/permissions?access_token=${access_token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'writer',
        type: 'anyone'
      })
    }
  ).catch(() => 'insufficient_permissions')
}

async function getTitle (taskUrl) {
  const form = await fetch(taskUrl, {
    headers: { Accept: 'text/html' }
  })
  const html = await form.text()
  const $ = cheerio.load(html)
  const title = $('title').text()
  return {
    displayName: title,
    type: 'test',
    url: taskUrl
  }
}

async function createInstances (tasks) {
  return tasks.map(task => ({
    instance: `http://localhost:5000/form/${task.task}?id=${task.update.id}`,
    id: task.update.id
  }))
}

function mergeCopies (tasks) {
  return copies =>
    copies.reduce(
      (acc, res) =>
        acc.map(task => ({
          ...task,
          taskUrl: res.task === task.task ? res.form : task.taskUrl
        })),
      tasks
    )
}

async function fetchFormCopies (newForms, token) {
  return Promise.all(
    newForms.map(async task => {
      const snap = await tasksRef.child(task.task).once('value')
      return maybeFetch(task, snap).then(res => Object.assign({}, task, res))
    })
  )

  function publishedToJson (url) {
    return fetch(url)
      .then(res => res.text())
      .then(htmlToJson)
  }

  async function maybeFetch (task, snap) {
    if (snap.exists()) {
      return { form: snap.val().form }
    }
    const { form, published, summary } = await makeCopy(task)
    const json = await publishedToJson(published)
    tasksRef.child(task.task).set({ form, json, summary })
    return { form }
  }
}

function makeCopy (task) {
  return fetch(formsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type: 'copy', formUrl: task.taskUrl })
  }).then(res => res.json())
}

function getNewForms (tasks) {
  return tasks.reduce(
    (acc, task) =>
      acc.find(act => act.task === task.task) ? acc : acc.concat(task),
    []
  )
}
