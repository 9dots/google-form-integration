import * as FieldItems from './FieldItems'
import PropTypes from 'prop-types'
import React from 'react'
import { Row, Col } from 'antd'

import './Field.less'

const Field = ({ field, formProps, page }) => {
  const { id, label, typeid, desc, widgets } = field
  const widget = (widgets || [])[0] || {}
  const { options } = widget
  const hasImages = options && options.some(({ image }) => image)

  return (
    <Row
      type='flex'
      align='middle'
      className={`field ${hasImages ? 'image-options' : ''}`}>
      <Col span='24'>
        <fieldset>
          <legend htmlFor={id}>
            <div>
              <span className='page-number'>{page + 1}.</span>
              {label}
            </div>
          </legend>
          <div className='form-group'>
            {desc && <p> {desc} </p>}
            {widget.src &&
              typeid !== 11 && (
              <img className='form-main-image' src={widget.src} />
            )}
            {React.createElement(FieldTypes[typeid] || 'div', {
              ...field,
              formProps,
              hasImages
            })}
          </div>
        </fieldset>
      </Col>
    </Row>
  )
}

export default Field

const FieldTypes = [
  FieldItems.Short, // 0
  FieldItems.Paragraph, // 1
  FieldItems.Choice, // 2
  'div', // 3 dropdown
  FieldItems.Checkboxes, // 4
  FieldItems.Linear, // 5 linear
  'div', // 6 title
  'div', // 7 grid
  'div', // 8 section
  'div', // 9 date
  'div', // 10 time
  FieldItems.Image // 11
  // 'video', // 12
  // 'upload' // 13
]
