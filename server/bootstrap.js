require('ignore-styles')
require('babel-polyfill')

require('babel-register')({
  ignore: [/(build|node_modules)/],
  presets: ['env', 'react', 'stage-2']
})

require('./index')
