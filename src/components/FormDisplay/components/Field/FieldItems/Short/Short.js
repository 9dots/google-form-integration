import FormField, { TextField } from '../../../../../FieldContainer'
import PropTypes from 'prop-types'
import React from 'react'
import './Short.less'

const Short = ({ widgets, formProps }) => (
  <FormField
    {...formProps}
    placeholder='Type your response…'
    required={widgets[0].required}
    className='form-short'
    component={TextField}
    name={widgets[0].id}
    id={widgets[0].id}
    type='text' />
)

Short.propTypes = {
  widgets: PropTypes.array.isRequired,
  formProps: PropTypes.object
}

export default Short
