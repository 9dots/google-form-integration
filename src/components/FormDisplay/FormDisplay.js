import * as Components from './components'
import PropTypes from 'prop-types'
import enhancer from './enhancer'
import pick from '@f/pick'
import React from 'react'

import './FormDisplay.less'
import { Layout } from 'antd'
import FormControl from '../FormControl/FormControl'
import Completed from '../Completed/Completed'

const FormDisplay = props => {
  const { data, page, onKeyPress } = props
  const { fields = [], title, desc, askEmail, emailAddress } = data
  const formProps = pick(fieldFormProps, props)
  const field = fields[page]
  const isLast = page === fields.length - 1
  const isFirst = !page

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {title && <Components.Title title={title} desc={desc} />}
      <Layout.Content style={{ margin: '0 auto', width: 700 }}>
        {props.submitted ? (
          <Completed />
        ) : (
          <form
            style={{ width: '100%' }}
            onKeyPress={onKeyPress}
            autoComplete='off'>
            <input type='hidden' autoComplete='false' />
            {askEmail && (
              <Components.Email
                formProps={formProps}
                emailAddress={emailAddress} />
            )}
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
