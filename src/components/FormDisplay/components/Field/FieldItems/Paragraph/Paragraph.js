import FormField, { TextAreaField } from '../../../../../FieldContainer'
import PropTypes from 'prop-types'
import React from 'react'
import './Paragraph.less'

const Paragraph = ({ widgets, formProps }) => (
  <FormField
    {...formProps}
    placeholder='Type your response here…'
    required={widgets[0].required}
    className='form-paragraph'
    component={TextAreaField}
    autosize
    name={widgets[0].id}
    id={widgets[0].id} />
)

Paragraph.propTypes = {
  widgets: PropTypes.array.isRequired,
  formProps: PropTypes.object
}

export default Paragraph
