import * as Components from './components'
import PropTypes from 'prop-types'
import enhancer from './enhancer'
import pick from '@f/pick'
import React from 'react'
import { Col, Row, Progress, Layout } from 'antd'

import './FormDisplay.less'
import FormControl from '../FormControl/FormControl'
import Completed from '../Completed/Completed'

const FormDisplay = props => {
  const { data, page, onKeyPress, submitted } = props
  const { fields = [], title, desc } = data
  const formProps = pick(fieldFormProps, props)
  const field = fields[page]
  const isLast = page === fields.length - 1
  const isFirst = !page

  const percent = submitted ? 100 : Math.ceil((page / fields.length) * 100)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header className='form-header'>
        <Row type='flex' align='middle' justify='space-between'>
          <Col>{title && <h2>{title}</h2>}</Col>
          <Col style={{ minWidth: 200 }}>
            {/* <div> */}
            <Progress strokeWidth={15} percent={percent} />
            <div className='page-display'>
              {submitted ? 'Completed' : `Page ${page + 1} of ${fields.length}`}
            </div>
            {/* </div> */}
          </Col>
        </Row>
      </Layout.Header>
      <Layout.Content
        className='form-layout-content'
        style={{ margin: '0 auto' }}>
        {props.submitted ? (
          <Completed />
        ) : (
          <form onKeyPress={onKeyPress} autoComplete='off'>
            <input type='hidden' autoComplete='false' />
            <Components.Field
              formProps={formProps}
              key={field.id}
              field={field}
              page={page} />
          </form>
        )}
      </Layout.Content>
      <FormControl {...props} isFirst={isFirst} isLast={isLast} />
    </Layout>
  )
}

FormDisplay.propTypes = {}

export default enhancer(FormDisplay)

const fieldFormProps = [
  'setFieldTouched',
  'setFieldValue',
  'handleSubmit',
  'errors',
  'touched',
  'values'
]
