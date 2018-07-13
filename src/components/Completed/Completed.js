import PropTypes from 'prop-types'
import React from 'react'
import './Completed.less'
import { Icon } from 'antd'

const Completed = () => {
  return (
    <div className='completed'>
      <Icon type='check-circle-o' className='complete-icon' />
      <h2>You Finished!</h2>
    </div>
  )
}

Completed.propTypes = {}

export default Completed
