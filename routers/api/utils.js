const toRegexp = require('path-to-regexp')
const fetch = require('isomorphic-fetch')
const htmlToJson = require('../lib/form')
const admin = require('firebase-admin')
const cheerio = require('cheerio')
const url = require('url')

const formsUrl = process.env.FORMS_APP_SCRIPT
const tasksRef = admin.firestore().collection('tasks')
const pathRe = toRegexp('/forms/d/:id/edit')

module.exports = {
  fetchFormCopies,
  createInstances,
  parseIdFromTask,
  addPermission,
  getNewForms,
  mergeCopies,
  getTitle
}

async function addPermission (id, access_token) {
  const permissionPromise = fetch(
    `https://www.googleapis.com/drive/v3/files/${id}/permissions?supportsTeamDrives=true&access_token=${access_token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    }
  )
  return Promise.all([
    permissionPromise,
    setReaderCanCopy(id, access_token)
  ]).catch(() => 'insufficient_permissions')
}

function setReaderCanCopy (id, access_token) {
  return fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?supportsTeamDrives=true&access_token=${access_token}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        viewersCanCopyContent: true,
        copyRequiresWriterPermission: false
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
    type: 'practice',
    url: taskUrl
  }
}

async function createInstances (tasks) {
  return tasks.map(task => ({
    instance: url.resolve(
      process.env.REACT_APP_API_HOST,
      `form/${task.task}?id=${task.update.id}`
    ),
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
      const snap = await tasksRef.doc(task.task).get()
      return maybeFetch(task, snap, token).then(res =>
        Object.assign({}, task, res)
      )
    })
  )

  function publishedToJson (url) {
    return fetch(url)
      .then(res => res.text())
      .then(htmlToJson)
  }

  async function maybeFetch (task, snap, token) {
    if (snap.exists) {
      return Promise.resolve({ form: snap.get('form') })
    }
    const { ok, error, form, published, summary } = await makeCopy(task, token)
    console.log(ok, error)
    const json = await publishedToJson(published)
    tasksRef.doc(task.task).set({ form, json, summary })
    return { form }
  }
}

async function makeCopy (task, token) {
  const id = parseIdFromTask(task.taskUrl)
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}/copy?supportsTeamDrives=true`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      }
    }
  )
  const body = await res.json()
  await addPermission(body.id, token)
  return fetch(formsUrl, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type: 'copy', formId: body.id })
  }).then(res => res.json())
}

function parseIdFromTask (taskUrl) {
  const path = url.parse(taskUrl).pathname
  const [, id] = pathRe.exec(path)
  return id
}

function getNewForms (tasks) {
  return tasks.reduce(
    (acc, task) =>
      acc.find(act => act.task === task.task) ? acc : acc.concat(task),
    []
  )
}
