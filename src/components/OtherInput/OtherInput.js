import FormField, { TextField } from '../FieldContainer/Field'
import PropTypes from 'prop-types'
import React from 'react'
import './OtherInput.less'

const OtherInput = ({ formProps, widgets, addOther, otherRef }) => {
  const { id } = widgets[0]
  const name = `other_option_response_${id}`
  return (
    <span className='checkbox-other other-input'>
      <FormField
        {...formProps}
        placeholder='Type here…'
        component={TextField}
        onChange={addOther}
        ref={otherRef}
        name={name}
        key={name}
        id={name}
        noItem />
    </span>
  )
}

OtherInput.propTypes = {
  formProps: PropTypes.object.isRequired,
  otherRef: PropTypes.object.isRequired,
  widgets: PropTypes.array.isRequired,
  addOther: PropTypes.func.isRequired
}

export default OtherInput
