import FormField, { RadioField } from '../../../../../FieldContainer'
import PropTypes from 'prop-types'
import OtherInput from '../../../../../OtherInput/'
import { Radio, Row, Col } from 'antd'
import getProp from '@f/get-prop'
import React from 'react'
import './Choice.less'

const temp =
  'http://www.piniswiss.com/wp-content/uploads/2013/05/image-not-found-4a963b95bf081c3ea02923dceaeb3f8085e1a654fc54840aac61a57a60903fef-300x199.png'

class Choice extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      otherRef: React.createRef()
    }
  }
  focusOther = () => {
    this.state.otherRef.current.input.current.focus()
  }
  addOther = () => {
    const { formProps, widgets } = this.props
    const { id } = widgets[0]
    return formProps.setFieldValue(id, '__other_option__')
  }

  render () {
    const { widgets, formProps, hasImages } = this.props
    const { options, id, required } = widgets[0]
    const value = getProp(`values.${id}`, formProps)
    const ref = this.state.otherRef

    return (
      <FormField
        {...formProps}
        update={() => update(id)}
        className='radio-group'
        component={RadioField}
        required={required}
        name={id}
        key={id}>
        {options.map((c, i) => {
          const thisValue = c.custom ? '__other_option__' : c.label
          return (
            <label
              key={i}
              onClick={c.custom ? this.focusOther : undefined}
              className={`form-radio ${radioClass(value, thisValue)}`}>
              <Radio className='hide' value={thisValue} />
              {hasImages && (
                <div className='option-image'>
                  {c.custom ? (
                    <OtherInput
                      addOther={this.addOther}
                      otherRef={ref}
                      {...this.props} />
                  ) : (
                    <div style={{ backgroundImage: `url(${c.src || temp})` }} />
                  )}
                </div>
              )}
              {c.label || 'Other'}
              {c.custom &&
                !hasImages && (
                <span>
                    :<OtherInput
                    addOther={this.addOther}
                    otherRef={ref}
                    {...this.props} />
                </span>
              )}
            </label>
          )
        })}
      </FormField>
    )
  }
}

function update (id) {
  return (prev, next) =>
    prev.values[`other_option_response_${id}`] !==
    next.values[`other_option_response_${id}`]
}

function radioClass (value, thisValue) {
  return value === thisValue ? 'checked' : ''
}

Choice.propTypes = {
  widgets: PropTypes.array.isRequired,
  formProps: PropTypes.object
}

export default Choice
