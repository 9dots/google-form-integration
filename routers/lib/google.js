const { google } = require('googleapis')

export default function driveApi (access_token) {
  return google.drive({ version: 'v3' })
}
