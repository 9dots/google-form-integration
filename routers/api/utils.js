const toRegexp = require('path-to-regexp')
const fetch = require('isomorphic-fetch')
const htmlToJson = require('../lib/form')
const admin = require('firebase-admin')
const cheerio = require('cheerio')
const url = require('url')
const drive = require('./google')

const formsUrl = process.env.FORMS_APP_SCRIPT
const tasksRef = admin.firestore().collection('tasks')
const pathRe = toRegexp('/forms/d/:id/edit')
const responsesRef = admin.firestore().collection('responses')

module.exports = {
  fetchFormCopies,
  createInstances,
  parseIdFromTask,
  addPermission,
  getNewForms,
  getInstance,
  mergeCopies,
  getTitle
}

async function addPermission (id, access_token, email) {
  const authedDrive = drive(access_token)
  const addPermission = authedDrive.permissions.create(
    { fileId: id, supportsTeamDrives: true },
    {
      role: 'reader',
      type: 'user',
      emailAddress: email || process.env.APP_EMAIL_ADDRESS
    }
  )
  const setReaderCanCopy = authedDrive.files.update(
    { fileId: id, supportsTeamDrives: true },
    {
      viewersCanCopyContent: true,
      copyRequiresWriterPermission: false
    }
  )
  return Promise.all([addPermission, setReaderCanCopy]).catch(e => {
    return Promise.reject('insufficient_permissions')
  })
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

async function getInstance (id, field) {
  return responsesRef
    .doc(id)
    .get()
    .then(snap => (field ? snap.get(field) : snap.data()))
}

async function createInstances (tasks) {
  const batch = admin.firestore().batch()
  const writes = tasks.reduce(
    (acc, task) =>
      acc.set(responsesRef.doc(task.update.id), {
        update: task.update,
        task: task.task
      }),
    batch
  )
  writes.commit()
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
      .then(html => {
        return htmlToJson(html)
      })
  }

  async function maybeFetch (task, snap, token) {
    if (snap.exists) {
      return Promise.resolve({ form: snap.get('form') })
    }
    const { ok, error, form, published, summary } = await makeCopy(task, token)
    if (!ok) return Promise.reject(error)
    const json = await publishedToJson(published)
    tasksRef.doc(task.task).set({ form, json, summary })
    return { form }
  }
}

async function makeCopy (task, token) {
  const id = await parseIdFromTask(task.taskUrl)
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

async function parseIdFromTask (taskUrl) {
  try {
    const path = url.parse(taskUrl).pathname
    const [, id] = pathRe.exec(path)
    return id
  } catch (e) {
    throw 'invalid_form'
  }
}

function getNewForms (tasks) {
  return tasks.reduce(
    (acc, task) =>
      acc.find(act => act.task === task.task) ? acc : acc.concat(task),
    []
  )
}
