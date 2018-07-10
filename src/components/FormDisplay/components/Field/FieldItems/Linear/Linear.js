import FormField, { RadioField } from '../../../../../FieldContainer'
import PropTypes from 'prop-types'
import { Radio } from 'antd'
import React from 'react'
import './Linear.less'

const Linear = ({ widgets, formProps }) => {
  const { options, id, required, legend } = widgets[0]
  console.log(options)
  return (
    <span>
      <FormField
        {...formProps}
        name={id}
        component={RadioField}
        key={id}
        className='radio-group'>
        {options.map((c, i) => (
          <Radio key={i} name={id} required={required} value={c.label}>
            {c.label}
          </Radio>
        ))}
      </FormField>
      <div> {legend.first}</div>
      <div> {legend.last}</div>
    </span>
  )
}

Linear.propTypes = {
  widgets: PropTypes.array.isRequired,
  formProps: PropTypes.object
}

export default Linear
