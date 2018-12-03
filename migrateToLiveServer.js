const admin = require('firebase-admin')
const cert = require('./getServiceAccount')()
const chunkBatch = require('./chunkBatch')
admin.initializeApp({
  credential: admin.credential.cert(cert)
})

const responsesRef = admin.firestore().collection('responses')

responsesRef
  .get()
  .then(qSnap =>
    qSnap.docs
      .reduce(
        (batch, doc) =>
          batch.update(doc.ref, {
            'update.host': 'https://api.9dots.org/external/activity.update'
          }),
        chunkBatch(admin.firestore())
      )
      .commit()
  )
  .then(() => console.log('done'))
  .catch(console.error)
