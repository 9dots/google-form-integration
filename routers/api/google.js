const { google } = require('googleapis')

export function driveApi (access_token) {
  return google.drive({ version: 'v3', auth: access_token })
}
