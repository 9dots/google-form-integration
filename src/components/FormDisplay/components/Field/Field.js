import * as FieldItems from './FieldItems'
import PropTypes from 'prop-types'
import React from 'react'

import './Field.less'

const Field = ({ field, formProps }) => {
  const { id, label, typeid, desc, widgets } = field
  const widget = (widgets || [])[0] || {}
  return (
    <fieldset>
      <legend htmlFor={id}>{label}</legend>
      <div className='form-group'>
        {desc && <p> {desc} </p>}
        {widget.src && typeid !== 11 && <img src={widget.src} />}
        {React.createElement(FieldTypes[typeid] || 'div', {
          ...field,
          formProps
        })}
      </div>
    </fieldset>
  )
}

export default Field

const FieldTypes = [
  FieldItems.Short, // 0
  FieldItems.Paragraph, // 1
  FieldItems.Choice, // 2
  'div', // 3 dropdown
  FieldItems.Checkboxes, // 4
  'div', // 5 linear
  'div', // 6 title
  'div', // 7 grid
  'div', // 8 section
  'div', // 9 date
  'div', // 10 time
  FieldItems.Image // 11
  // 'video', // 12
  // 'upload' // 13
]
