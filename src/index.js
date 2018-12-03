import toRegexp from 'path-to-regexp'
import firebase from 'firebase/app'
import ReactDOM from 'react-dom'
import 'firebase/firestore'
import 'firebase/database'
import React from 'react'
import './index.less'

try {
  window.Sentry.init({
    dsn: 'https://bef85b8f97274f2c96b311f815b50999@sentry.io/1336170'
  })
} catch (e) {
  console.error('can not connect to sentry')
}

const pathRe = toRegexp('/form/:id')

firebase.initializeApp({
  apiKey: 'AIzaSyBZh6xZT0FXkl_Gg1a2PI-NWaW9PUOQca8',
  databaseURL: 'https://forms-integration-93a90.firebaseio.com',
  projectId: 'forms-integration-93a90'
})

const firestore = firebase.firestore()
firestore.settings({ timestampsInSnapshots: true })

const FormDisplay = require('./components/FormDisplay').default
const activityId = getUrlParameter('id')
const [, id] = pathRe.exec(document.location.pathname)

const respPromise = activityId
  ? firestore
    .collection('responses')
    .doc(activityId)
    .get()
    .then(snap => (snap.exists ? snap.data() : {}))
  : Promise.resolve({})
const dataPromise = firestore
  .collection('tasks')
  .doc(id)
  .get()
  .then(doc => doc.get('json'))

Promise.all([dataPromise, respPromise]).then(([data, response = {}]) =>
  ReactDOM.hydrate(
    <FormDisplay
      data={data}
      activityId={activityId}
      response={response.data}
      submitted={response.submitted} />,
    document.querySelector('#root')
  )
)

function getUrlParameter (name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
  var results = regex.exec(window.location.search)
  return results === null
    ? ''
    : decodeURIComponent(results[1].replace(/\+/g, ' '))
}
