import * as Components from './components'
import PropTypes from 'prop-types'
import enhancer from './enhancer'
import pick from '@f/pick'
import React from 'react'

import './FormDisplay.less'
import { Layout } from 'antd'
import FormControl from '../FormControl/FormControl'

const FormDisplay = props => {
  const { data, page } = props
  const { fields = [], title, desc, askEmail, emailAddress } = data
  const formProps = pick(fieldFormProps, props)
  const field = fields[page]
  const isLast = page === fields.length - 1
  const isFirst = !page

  if (props.submitted) return <span> Done </span>

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {title && <Components.Title title={title} desc={desc} />}
      <Layout.Content style={{ margin: '0 auto', width: 700 }}>
        <form style={{ width: '100%' }}>
          {askEmail && (
            <Components.Email
              formProps={formProps}
              emailAddress={emailAddress} />
          )}
          {/* {fields.map(field => ( */}
          <Components.Field
            formProps={formProps}
            key={field.id}
            field={field}
            page={page} />
          {/* ))} */}
          {/* <Button onClick={props.handleSubmit}>Submit</Button> */}
        </form>
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
