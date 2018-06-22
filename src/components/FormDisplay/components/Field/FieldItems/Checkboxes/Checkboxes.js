import FormField, {
  TextField,
  CheckboxField
} from '../../../../../FieldContainer'
import PropTypes from 'prop-types'
import getProp from '@f/get-prop'
import { Checkbox } from 'antd'
import React from 'react'
import './Checkboxes.less'

class Checkboxes extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      otherChoiceRef: React.createRef()
    }
  }
  render () {
    const { widgets, formProps } = this.props
    const { id, options } = widgets[0]
    const checkboxStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
      marginLeft: '5px'
    }
    return (
      <FormField
        {...formProps}
        update={(prev, next) =>
          prev.values[`other_option_response_${id}`] !==
          next.values[`other_option_response_${id}`]
        }
        component={CheckboxField}
        name={id}
        key={id}>
        {options.map(
          (c, i) =>
            c.custom ? (
              <div key={i}>
                <Checkbox
                  style={checkboxStyle}
                  key={i}
                  name={id}
                  onClick={() =>
                    !(getProp(id, formProps.values) || []).includes(
                      '__other_option__'
                    ) && this.state.otherChoiceRef.current.input.current.focus()
                  }
                  value={'__other_option__'}>
                  {c.label || 'Other: '}
                  <FormField
                    {...formProps}
                    itemProps={{
                      style: { marginLeft: '5px', display: 'inline-block' }
                    }}
                    id={`other_option_response_${id}`}
                    ref={this.state.otherChoiceRef}
                    update={(prev, next) =>
                      getProp(id, prev.values) !== getProp(id, next.values)
                    }
                    onChange={() =>
                      formProps.setFieldValue(
                        id,
                        uniqueAdd(
                          getProp(id, formProps.values) || [],
                          '__other_option__'
                        )
                      )
                    }
                    noItem
                    key={`other_option_response_${id}`}
                    component={TextField}
                    name={`other_option_response_${id}`} />
                </Checkbox>
              </div>
            ) : (
              <Checkbox style={checkboxStyle} key={i} value={c.label}>
                {c.label}
              </Checkbox>
            )
        )}
      </FormField>
    )
  }
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
