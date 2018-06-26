import { default as FormDisplay } from '../src/components/FormDisplay'
import getServiceAccount from '../getServiceAccount'
import { renderToString } from 'react-dom/server'
import template from '../build/template'
import bodyParser from 'body-parser'
import admin from 'firebase-admin'
import express from 'express'
import React from 'react'
import path from 'path'

const cert = getServiceAccount()

admin.initializeApp({
  credential: admin.credential.cert(cert),
  databaseURL: 'https://forms-integration-93a90.firebaseio.com'
})
const tasksRef = admin.database().ref('/tasks')

const api = require('../routers/api/index')
const app = express()
app.use(express.static(path.resolve(__dirname, '../build')))
app.use(bodyParser.json())

app.get('/teacher/:id', async (req, res) => {
  const { id } = req.params
  const snap = await tasksRef
    .child(id)
    .child('summary')
    .once('value')
  const url = snap.val()
  if (!url) {
    return res.send('not found')
  }
  return res.redirect(url)
})

app.get('/form/:id', async (req, res) => {
  const snap = await tasksRef
    .child(req.params.id)
    .child('json')
    .once('value')

  if (!snap.exists()) return res.send('not found')

  const taskId = req.query.id
  res.write(
    template(renderToString(<FormDisplay data={snap.val()} taskId={taskId} />))
  )
  res.end()
})

api(app)
app.listen(process.env.PORT || 5000)
