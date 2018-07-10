import PropTypes from 'prop-types'
import { Row, Col, Progress, Button, Icon } from 'antd'
import React from 'react'
import './FormControl.less'

const FormControl = props => {
  const {
    next,
    back,
    page,
    data: { fields }
  } = props

  return (
    <div className='form-control-wrap'>
      <Row
        type='flex'
        align='center'
        justify='space-between'
        className='form-control'>
        <Col>
          <Button className='form-control-btn' type='secondary' onClick={back}>
            <Icon type='left' />
            Back
          </Button>
          <Button className='form-control-btn' type='primary' onClick={next}>
            Next
            <Icon type='right' />
          </Button>
        </Col>
        <Col style={{ minWidth: 200 }}>
          <Progress
            strokeWidth={15}
            percent={Math.ceil((page / fields.length) * 100)} />
          <div className='page-display'>
            Page {page + 1} of {fields.length}
          </div>
        </Col>
      </Row>
    </div>
  )
}

FormControl.propTypes = {}

export default FormControl
