import FormField, {
  TextField,
  CheckboxField
} from '../../../../../FieldContainer'
import PropTypes from 'prop-types'
import getProp from '@f/get-prop'
import { Checkbox, Icon, Row, Col } from 'antd'
import React from 'react'
import './Checkboxes.less'

const temp =
  'http://www.piniswiss.com/wp-content/uploads/2013/05/image-not-found-4a963b95bf081c3ea02923dceaeb3f8085e1a654fc54840aac61a57a60903fef-300x199.png'

class Checkboxes extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      otherChoiceRef: React.createRef()
    }
  }
  focusOther = () => {
    const { formProps, widgets } = this.props
    const { id } = widgets[0]
    !(getProp(id, formProps.values) || []).includes('__other_option__') &&
      this.state.otherChoiceRef.current.input.current.focus()
  }
  addOther = () => {
    const { formProps, widgets } = this.props
    const { id } = widgets[0]
    return formProps.setFieldValue(
      id,
      uniqueAdd(getProp(id, formProps.values) || [], '__other_option__')
    )
  }
  render () {
    const { widgets, formProps, hasImages } = this.props
    const { id, options } = widgets[0]
    const values = getProp(id, formProps.values) || []
    console.log(options)

    return (
      <FormField
        {...formProps}
        update={(prev, next) =>
          prev.values[`other_option_response_${id}`] !==
          next.values[`other_option_response_${id}`]
        }
        component={CheckboxField}
        className='formfield-checkbox'
        name={id}
        key={id}>
        {options.map((c, i) => {
          const value = c.custom ? '__other_option__' : c.label
          return (
            <div
              key={i}
              onClick={c.custom && this.focusOther}
              className={`form-checkbox-wrap ${checkClass(values, value)}`}>
              <label className='form-checkbox'>
                {hasImages && (
                  <div className='option-image'>
                    <div style={{ backgroundImage: `url(${c.src || temp})` }} />
                  </div>
                )}
                <div className='flex-row'>
                  <CheckBoxDisplay label={c.label || 'Other: '} />

                  <Checkbox className='hide' value={value} />
                  {c.custom && (
                    <Other
                      addOther={this.addOther}
                      otherChoiceRef={this.state.otherChoiceRef}
                      {...this.props} />
                  )}
                </div>
              </label>
            </div>
          )
        })}
      </FormField>
    )
  }
}

const Other = ({ formProps, widgets, addOther, otherChoiceRef }) => {
  const { id } = widgets[0]
  const name = `other_option_response_${id}`
  return (
    <span className='checkbox-other other-input'>
      <FormField
        {...formProps}
        update={(prev, next) =>
          getProp(id, prev.values) !== getProp(id, next.values)
        }
        component={TextField}
        ref={otherChoiceRef}
        onChange={addOther}
        name={name}
        key={name}
        id={name}
        noItem />
    </span>
  )
}

const CheckBoxDisplay = ({ label }) => (
  <Row align='middle' type='flex' className='checkbox-display'>
    <Col className='checkbox'>
      <Icon type='check' />
    </Col>
    <Col>{label}</Col>
  </Row>
)

function isChecked (values = [], name) {
  return values.indexOf(name) > -1
}

function checkClass (values = [], name) {
  return isChecked(values, name) ? 'checked' : ''
}

function uniqueAdd (arr, val) {
  if (arr.indexOf(val) === -1) {
    return arr.concat(val)
  }
  return arr
}

Checkboxes.propTypes = {
  widgets: PropTypes.array.isRequired,
  formProps: PropTypes.object
}

export default Checkboxes
