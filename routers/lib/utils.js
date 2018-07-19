import drive from './google'
const toRegexp = require('path-to-regexp')
const fetch = require('isomorphic-fetch')
const admin = require('firebase-admin')
const htmlToJson = require('./form')
const url = require('url')

const formsUrl = process.env.FORMS_APP_SCRIPT
const tasksRef = admin.firestore().collection('tasks')
const pathRe = toRegexp('/forms/d/:id/edit')
const responsesRef = admin.firestore().collection('responses')

module.exports = {
  fetchFormCopies,
  createInstances,
  parseIdFromTask,
  makeCopy,
  addPermission,
  getNewForms,
  getInstance,
  mergeCopies,
  formatTask
}

async function addPermission (id, access_token, email) {
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
    console.error(e)
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
    const { ok, error, form, published, summary } = await makeCopy(id, viewer)
    if (!ok) return Promise.reject(error)
    const json = await publishedToJson(published)
    tasksRef.doc(task.task).set({ form, json, summary })
    return { form }
  }
}

async function makeCopy (id, viewer) {
  return fetch(formsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type: 'copy', formId: id, viewer })
  }).then(res => res.json())
}

// async function makeCopy (id, token) {
//   const res = await fetch(
//     `https://www.googleapis.com/drive/v3/files/${id}/copy?supportsTeamDrives=true`,
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: 'Bearer ' + token
//       }
//     }
//   )
//   return res.json()
// }

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
