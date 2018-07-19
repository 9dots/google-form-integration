const fetch = require('isomorphic-fetch')

module.exports = (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer ')
  ) {
    res.status(403).send({ ok: false, error: 'no_authorization_bearer' })
    return
  }
  const idToken = req.headers.authorization.split('Bearer ')[1]
  return fetch(
    `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`
  )
    .then(res => res.json())
    .then(user => {
      req.userEmail = user.email
      return next()
    })
}
