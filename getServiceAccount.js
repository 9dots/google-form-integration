module.exports = function getServiceAccount (env) {
  return getProd()
}

// function getDev() {
//   return require('./devSecrets.json')
// }

function getProd () {
  try {
    return require('./secrets.json')
  } catch (e) {
    console.log(process.env)
    return {
      projectId: process.env.PROJECT_ID,
      clientEmail: process.env.CLIENT_EMAIL,
      privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
    }
  }
}
