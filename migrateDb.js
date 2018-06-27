const admin = require('firebase-admin')
const cert = require('./getServiceAccount')()
admin.initializeApp({
  credential: admin.credential.cert(cert),
  databaseURL: 'https://forms-integration-93a90.firebaseio.com'
})
const firestore = admin.firestore()

admin
  .database()
  .ref('/tasks')
  .once('value')
  .then(snap => snap.val())
  .then(data => {
    return Object.keys(data).map(key => {
      const value = data[key]
      return firestore
        .collection('tasks')
        .doc(key)
        .set(value)
    })
  })
  .then(() => console.log('done'))
  .catch(console.error)
