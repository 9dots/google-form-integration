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
    submit,
    isFirst,
    isLast
  } = props

  // const percent = submitted ? 100 : Math.ceil((page / fields.length) * 100)

  return (
    <span>
      {!submitted && (
        <span>
          <Button
            disabled={isFirst}
            onClick={back}
            className='form-float-btn back'>
            <Icon type='left' />
          </Button>
          <Button
            type='primary'
            onClick={isLast ? submit : next}
            className={`form-float-btn next ${isLast && 'last'}`}>
            {isLast && 'Submit '}
            <Icon type='right' />
          </Button>
        </span>
      )}
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
          {/* <Col style={{ minWidth: 200 }}>
            <Progress strokeWidth={15} percent={percent} />
            <div className='page-display'>
              {submitted ? 'Completed' : `Page ${page + 1} of ${fields.length}`}
            </div>
          </Col> */}
        </Row>
      </div>
    </span>
  )
}

FormControl.propTypes = {}

export default FormControl
