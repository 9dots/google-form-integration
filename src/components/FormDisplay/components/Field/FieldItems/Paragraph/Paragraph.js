import FormField, { TextAreaField } from '../../../../../FieldContainer'
import PropTypes from 'prop-types'
import React from 'react'
import './Paragraph.less'

const Paragraph = ({ widgets, formProps }) => (
  <FormField
    {...formProps}
    id={widgets[0].id}
    name={widgets[0].id}
    className='form-paragraph'
    required={widgets[0].required}
    component={TextAreaField} />
)

Paragraph.propTypes = {
  widgets: PropTypes.array.isRequired,
  formProps: PropTypes.object
}

export default Paragraph
