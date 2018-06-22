import PropTypes from 'prop-types'
import React from 'react'
import './Title.less'

const Title = props => {
  const { title, desc } = props
  return (
    <fieldset>
      <h2>
        {title}
        <br />
        <small>{desc}</small>
      </h2>
    </fieldset>
  )
}

Title.propTypes = {
  title: PropTypes.string.isRequired,
  desc: PropTypes.string
}

export default Title
