const toRegexp = require('path-to-regexp')
const fetch = require('isomorphic-fetch')
const htmlToJson = require('../lib/form')
const admin = require('firebase-admin')
const cheerio = require('cheerio')
const path = require('path')
const url = require('url')

const formsUrl = process.env.FORMS_APP_SCRIPT
const pathRe = toRegexp('/forms/d/:id/edit')
const tasksRef = admin.database().ref('/tasks')

export async function addPermission (taskUrl, access_token) {
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

export async function getTitle (taskUrl) {
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

export async function createInstances (tasks) {
  return tasks.map(task => ({
    instance: path.join(
      process.env.API_HOST,
      'form',
      task.task,
      `?id=${task.update.id}`
    ),
    id: task.update.id
  }))
}

export function mergeCopies (tasks) {
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

export async function fetchFormCopies (newForms, token) {
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

export function getNewForms (tasks) {
  return tasks.reduce(
    (acc, task) =>
      acc.find(act => act.task === task.task) ? acc : acc.concat(task),
    []
  )
}
