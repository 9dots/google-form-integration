const lessToJs = require('less-vars-to-js')
const fs = require('fs')

const dirname = 'src/theme/vars/'

const fileNames = fs.readdirSync(dirname)

fileNames.forEach(file => {
  if (/\.less$/.test(file)) {
    const content = fs.readFileSync(dirname + file, 'utf8')
    const newFile = 'module.exports = ' + JSON.stringify(lessToJs(content))
    fs.writeFileSync(dirname + file.slice(0, -4) + 'js', newFile)
  }
})
