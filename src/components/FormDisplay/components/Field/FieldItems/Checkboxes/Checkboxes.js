import FormField, { CheckboxField } from '../../../../../FieldContainer'
import OtherInput from '../../../../../OtherInput/'
import { Checkbox, Icon, Row, Col } from 'antd'
import PropTypes from 'prop-types'
import getProp from '@f/get-prop'
import enhancer from './enhancer'
import React from 'react'
import './Checkboxes.less'

const temp =
  'http://www.piniswiss.com/wp-content/uploads/2013/05/image-not-found-4a963b95bf081c3ea02923dceaeb3f8085e1a654fc54840aac61a57a60903fef-300x199.png'

class Checkboxes extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = { otherRef: React.createRef() }
  }
  focusOther = () => {
    const { formProps, widgets } = this.props
    const { id } = widgets[0]
    if (!(getProp(id, formProps.values) || []).includes('__other_option__')) {
      this.state.otherRef.current.input.current.focus()
    }
  }
  render () {
    const { widgets, formProps, hasImages } = this.props
    const { id, options } = widgets[0]
    const values = getProp(id, formProps.values) || []
    const ref = this.state.otherRef

    return (
      <span>
        <p style={{ paddingBottom: 6, color: '#777' }}>
          |&emsp;Select all that apply
        </p>
        <FormField
          {...formProps}
          className='formfield-checkbox'
          update={() => update(id)}
          component={CheckboxField}
          name={id}
          key={id}>
          {options.map((c, i) => {
            const value = c.custom ? '__other_option__' : c.label
            return (
              <label
                key={i}
                onClick={c.custom ? this.focusOther : undefined}
                className={`form-checkbox ${checkClass(values, value)}`}>
                <Checkbox className='hide' value={value} />
                {hasImages && (
                  <div className='option-image'>
                    {c.custom ? (
                      <OtherInput otherRef={ref} {...this.props} />
                    ) : (
                      <div
                        style={{ backgroundImage: `url(${c.src || temp})` }} />
                    )}
                  </div>
                )}
                <div className='flex-row'>
                  <CheckBoxDisplay label={c.label || 'Other'} />
                  {c.custom &&
                    !hasImages && (
                    <span>
                        :<OtherInput otherRef={ref} {...this.props} />
                    </span>
                  )}
                </div>
              </label>
            )
          })}
        </FormField>
      </span>
    )
  }
}

const CheckBoxDisplay = ({ label }) => (
  <Row align='middle' type='flex' className='checkbox-display'>
    <Col className='checkbox'>
      <Icon type='check' />
    </Col>
    <Col>{label}</Col>
  </Row>
)

function update (id) {
  return (prev, next) =>
    prev.values[`other_option_response_${id}`] !==
    next.values[`other_option_response_${id}`]
}

function checkClass (values = [], name) {
  return values.indexOf(name) > -1 ? 'checked' : ''
}

Checkboxes.propTypes = {
  widgets: PropTypes.array.isRequired,
  formProps: PropTypes.object
}

export default enhancer(Checkboxes)
