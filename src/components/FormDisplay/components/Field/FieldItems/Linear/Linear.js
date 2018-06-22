import FormField, { RadioField } from '../../../../../FieldContainer'
import PropTypes from 'prop-types'
import { Radio } from 'antd'
import React from 'react'
import './Linear.less'

const Linear = ({ widgets, formProps }) => {
  const { options, id, required, legend } = widgets[0]
  return (
    <span>
      <div> {legend.first}</div>
      <FormField
        {...formProps}
        name={id}
        component={RadioField}
        key={id}
        className='radio'>
        {options.map((c, i) => (
          <Radio key={i} name={id} value={c.label} required={required}>
            {c.label}
          </Radio>
        ))}
      </FormField>
      <div> {legend.last}</div>
    </span>
  )
}

Linear.propTypes = {
  widgets: PropTypes.array.isRequired,
  formProps: PropTypes.object
}

export default Linear
