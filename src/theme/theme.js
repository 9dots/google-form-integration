const palette = require('./vars/palette.js')
const vars = require('./vars/vars.js')

module.exports = {
  'font-family': vars['@font-family'],
  'heading-color': vars['@heading-color'],
  // 'error-color': palette['@red'],
  // 'success-color': palette['@green'],
  // 'primary-color': palette['@blue'],
  'progress-remaining-color': '#DDDDDD',
  'layout-header-background': palette['@primary-color'],
  'layout-sider-background': palette['@primary-color']
  // 'menu-dark-bg': palette['@blue'],
  // 'menu-dark-submenu-bg': palette['@blue'],
  // 'body-background': palette['@off-white'],
  // 'layout-body-background': palette['@off-white'],
  // 'card-padding-base': '24px',
  // 'card-padding-wider': '24px',
  // 'link-color': palette['@blue-light']
}
