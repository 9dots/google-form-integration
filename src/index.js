import FormDisplay from './components/FormDisplay'
import toRegexp from 'path-to-regexp'
import ReactDOM from 'react-dom'
import firebase from 'firebase'
import React from 'react'

const pathRe = toRegexp('/form/:id')

firebase.initializeApp({
  apiKey: 'AIzaSyBZh6xZT0FXkl_Gg1a2PI-NWaW9PUOQca8',
  databaseURL: 'https://forms-integration-93a90.firebaseio.com',
  projectId: 'forms-integration-93a90'
})

const [, id] = pathRe.exec(document.location.pathname)
firebase
  .database()
  .ref('/tasks')
  .child(id)
  .child('json')
  .once('value')
  .then(snap => snap.val())
  .then(data =>
    ReactDOM.hydrate(
      <FormDisplay data={data} />,
      document.querySelector('#root')
    )
  )