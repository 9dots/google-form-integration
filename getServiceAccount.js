module.exports = function getServiceAccount (env) {
  return getProd()
}

// function getDev() {
//   return require('./devSecrets.json')
// }

function getProd () {
  try {
    return require('./secret.json')
  } catch (e) {
    return {
      projectId: process.env.PROJECT_ID,
      clientEmail: process.env.CLIENT_EMAIL,
      privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
    }
  }
}
