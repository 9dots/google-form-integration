import PropTypes from 'prop-types'
import { Row, Col, Progress, Button, Icon } from 'antd'
import React from 'react'
import './FormControl.less'

const FormControl = props => {
  const {
    next,
    back,
    page,
    data: { fields },
    submitted,
    handleSubmit,
    submit,
    isFirst,
    isLast
  } = props

  const percent = submitted ? 100 : Math.ceil((page / fields.length) * 100)

  return (
    <div className='form-control-wrap'>
      <Row
        type='flex'
        align='center'
        justify='space-between'
        className='form-control'>
        <Col>
          {!submitted && (
            <span>
              <Button
                disabled={isFirst}
                className='form-control-btn'
                type='secondary'
                onClick={back}>
                <Icon type='left' />
                Back
              </Button>
              <Button
                className='form-control-btn'
                type='primary'
                onClick={isLast ? submit : next}>
                {isLast ? 'Submit' : 'Next'}
                <Icon type='right' />
              </Button>
            </span>
          )}
        </Col>
        <Col style={{ minWidth: 200 }}>
          <Progress strokeWidth={15} percent={percent} />
          <div className='page-display'>
            {submitted ? 'Completed' : `Page ${page + 1} of ${fields.length}`}
          </div>
        </Col>
      </Row>
    </div>
  )
}

FormControl.propTypes = {}

export default FormControl
