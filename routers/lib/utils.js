import drive from './google'

const toRegexp = require('path-to-regexp')
const fetch = require('isomorphic-fetch')
const admin = require('firebase-admin')
const htmlToJson = require('./form')
const url = require('url')

const templatesRef = admin.firestore().collection('templates')
const responsesRef = admin.firestore().collection('responses')
const tasksRef = admin.firestore().collection('tasks')

const formsUrl = process.env.FORMS_APP_SCRIPT
const pathRe = toRegexp('/forms/d/:id/edit')

module.exports = {
  fetchFormCopies,
  createInstances,
  parseIdFromTask,
  getErrorMessage,
  addPermission,
  getNewForms,
  getInstance,
  mergeCopies,
  addTemplate,
  formatTask,
  makeCopy
}

function getErrorMessage (err) {
  const errorMap = {
    invalid_form: [
      {
        field: 'url',
        message:
          'Google Form url is invalid. Please make sure to use the edit link from the browser.'
      }
    ]
  }
  return { error: err, errorDetails: errorMap[err] }
}

async function addTemplate (copy) {
  const id = await parseIdFromTask(copy.form)
  return templatesRef.doc(id).set(copy)
}

async function addPermission (id, access_token) {
  const authedDrive = drive(access_token)
  const addPermission = authedDrive.permissions.create({
    fileId: id,
    supportsTeamDrives: true,
    access_token: access_token,
    requestBody: {
      role: 'reader',
      type: 'anyone'
    }
  })
  const setReaderCanCopy = authedDrive.files.update({
    fileId: id,
    supportsTeamDrives: true,
    access_token: access_token,
    requestBody: {
      viewersCanCopyContent: true,
      copyRequiresWriterPermission: false
    }
  })
  return Promise.all([addPermission, setReaderCanCopy]).catch(e => {
    return Promise.reject('insufficient_permissions')
  })
}

function formatTask ({ title, form }) {
  return {
    displayName: title,
    type: 'practice',
    url: form
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

async function fetchFormCopies (newForms, viewer) {
  return Promise.all(
    newForms.map(async task => {
      const snap = await tasksRef.doc(task.task).get()
      return maybeFetch(task, snap, viewer).then(res =>
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

  async function maybeFetch (task, snap, viewer) {
    if (snap.exists) {
      return Promise.resolve({ form: snap.get('form') })
    }
    const id = await parseIdFromTask(task.taskUrl)
    const template = await getTemplate(id)
    const { ok, error, form, published, summary } = await makeCopy(id, viewer)
    if (!ok) return Promise.reject(error)
    const [json, { action }] = await Promise.all([
      publishedToJson(published),
      publishedToJson(template)
    ]).catch(console.error)
    tasksRef
      .doc(task.task)
      .set({ form, summary, json: { ...json, action: [json.action, action] } })
    return { form }
  }
}

async function getTemplate (id) {
  const snap = await templatesRef.doc(id).get()
  if (snap.exists) {
    return snap.get('published')
  }
  return appScriptRequest('getPublished', id).then(({ published }) => published)
}

async function makeCopy (id, viewer) {
  return appScriptRequest('copy', id, viewer)
}

function appScriptRequest (type, formId, viewer) {
  return fetch(formsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type, formId, viewer })
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
