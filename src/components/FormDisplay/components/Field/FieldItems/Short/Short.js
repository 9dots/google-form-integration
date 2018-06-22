import FormField, { TextField } from '../../../../../FieldContainer'
import PropTypes from 'prop-types'
import React from 'react'
import './Short.less'

const Short = ({ widgets, formProps }) => (
  <FormField
    {...formProps}
    id={widgets[0].id}
    type='text'
    name={widgets[0].id}
    required={widgets[0].required}
    component={TextField} />
)

Short.propTypes = {
  widgets: PropTypes.array.isRequired,
  formProps: PropTypes.object
}

export default Short
