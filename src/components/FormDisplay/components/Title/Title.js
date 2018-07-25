import PropTypes from 'prop-types'
import React from 'react'
import { Layout } from 'antd'
import './Title.less'

const Title = props => {
  const { title, desc } = props
  return (
    <h2>
      {title}
      {/* <br /> */}
      {/* <small>{desc}</small> */}
    </h2>
  )
}

Title.propTypes = {
  title: PropTypes.string.isRequired,
  desc: PropTypes.string
}

export default Title
