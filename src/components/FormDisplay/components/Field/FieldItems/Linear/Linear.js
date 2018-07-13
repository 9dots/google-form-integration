import FormField, { RadioField } from '../../../../../FieldContainer'
import { Radio, Row, Col } from 'antd'
import getProp from '@f/get-prop'
import PropTypes from 'prop-types'
import React from 'react'
import './Linear.less'

const Linear = ({ widgets, formProps }) => {
  const { options, id, required, legend } = widgets[0]
  const value = getProp(`values.${id}`, formProps)

  return (
    <FormField
      {...formProps}
      className='linear-group-wrap'
      component={RadioField}
      required={required}
      name={id}
      key={id}>
      <div className='linear-group'>
        {options.map((c, i) => (
          <label
            className={`form-linear ${radioClass(value, c.label)}`}
            key={i}>
            <Radio name={id} className='hide' value={c.label} />
            {c.label}
          </label>
        ))}
      </div>
      <Row type='flex' justify='space-between' className='legend'>
        <Col>{legend.first}</Col>
        <Col>{legend.last}</Col>
      </Row>
    </FormField>
  )
}

function radioClass (value, thisValue) {
  return value === thisValue ? 'checked' : ''
}

Linear.propTypes = {
  widgets: PropTypes.array.isRequired,
  formProps: PropTypes.object
}

export default Linear
