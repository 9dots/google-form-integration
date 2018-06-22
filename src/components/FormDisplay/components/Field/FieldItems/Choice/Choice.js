import FormField, { TextField, RadioField } from '../../../../../FieldContainer'
import PropTypes from 'prop-types'
import { Radio } from 'antd'
import React from 'react'
import './Choice.less'

class Choice extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      otherChoiceRef: React.createRef()
    }
  }
  render () {
    const { widgets, formProps } = this.props
    const { options, id, required } = widgets[0]
    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px'
    }
    return (
      <FormField
        {...formProps}
        name={id}
        component={RadioField}
        update={(prev, next) =>
          prev.values[`other_option_response_${id}`] !==
          next.values[`other_option_response_${id}`]
        }
        key={id}
        className='radio'>
        {options.map(
          (c, i) =>
            c.custom ? (
              <span key={i}>
                <Radio
                  id='__other_option__'
                  style={radioStyle}
                  onClick={() => {
                    this.state.otherChoiceRef.current.input.current.focus()
                  }}
                  name={id}
                  value='__other_option__'>
                  {c.label || 'Other: '}
                  <FormField
                    {...formProps}
                    itemProps={{
                      style: { marginLeft: '5px', display: 'inline-block' }
                    }}
                    id={`other_option_response_${id}`}
                    ref={this.state.otherChoiceRef}
                    onChange={() =>
                      formProps.setFieldValue(id, '__other_option__')
                    }
                    noItem
                    key={`other_option_response_${id}`}
                    component={TextField}
                    name={`other_option_response_${id}`} />
                </Radio>
              </span>
            ) : (
              <span key={i}>
                {c.src && <img src={c.src} />}
                <Radio
                  style={radioStyle}
                  name={id}
                  value={c.label}
                  required={required}>
                  {c.label}
                </Radio>
              </span>
            )
        )}
      </FormField>
    )
  }
}

Choice.propTypes = {
  widgets: PropTypes.array.isRequired,
  formProps: PropTypes.object
}

export default Choice
