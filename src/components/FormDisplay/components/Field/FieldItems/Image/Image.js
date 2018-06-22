import PropTypes from 'prop-types'
import React from 'react'
import './Image.less'

const Image = ({ widgets }) => {
  return <img src={widgets[0].src} style={{ maxWidth: '100%' }} />
}

Image.propTypes = { widgets: PropTypes.array.isRequired }

export default Image
