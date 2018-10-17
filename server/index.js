import { default as FormDisplay } from '../src/components/FormDisplay'
import getServiceAccount from '../getServiceAccount'
import { renderToString } from 'react-dom/server'
import template from '../build/template'
import bodyParser from 'body-parser'
import admin from 'firebase-admin'
import express from 'express'
import React from 'react'
import path from 'path'
import cors from 'cors'

const cert = getServiceAccount()

try {
  admin.initializeApp({
    credential: admin.credential.cert(cert),
    databaseURL: 'https://forms-integration-93a90.firebaseio.com'
  })
} catch (e) {}

const firestore = admin.firestore()
const tasksCol = firestore.collection('tasks')
const responsesCol = firestore.collection('responses')

const api = require('../routers/api/index')
const app = express()
app.use(express.static(path.resolve(__dirname, '../build')))
app.use(bodyParser.json())
app.use(cors())

app.get('/teacher/:id', async (req, res) => {
  const { id } = req.params
  const url = await tasksCol
    .doc(id)
    .get()
    .then(doc => doc.get('form'))
  if (!url) {
    return res.send('not found')
  }
  return res.redirect(url + '#responses')
})

app.get('/form/:id', async (req, res) => {
  const data = await tasksCol
    .doc(req.params.id)
    .get()
    .then(doc => doc.get('json'))

  if (!data) return res.send('not found')

  const activityId = req.query.id
  const response = activityId
    ? await responsesCol
      .doc(activityId)
      .get()
      .then(snap => (snap.exists ? snap.data() : {}))
    : {}
  res.write(
    template(
      renderToString(
        <FormDisplay
          data={data}
          activityId={activityId}
          response={response.data}
          submitted={response.submitted} />
      )
    )
  )
  res.end()
})

app.get('/_ah/warmup', (_, res) => {
  try {
    require('../src/components/FormDisplay')
    admin.initializeApp({
      credential: admin.credential.cert(cert),
      databaseURL: 'https://forms-integration-93a90.firebaseio.com'
    })
  } catch (e) {}
  res.json({ ok: true })
})

app.get('ping', (_, res) => res.status(200).end())

api(app)
app.listen(process.env.PORT || 5000, () =>
  console.log('listening on port: ' + (process.env.PORT || 5000))
)
