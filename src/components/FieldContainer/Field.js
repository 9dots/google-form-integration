import { Form, Input, Select, Checkbox, Radio } from 'antd'
import React, { createElement } from 'react'
import PropTypes from 'prop-types'
import getProp from '@f/get-prop'
import omit from '@f/omit'

import './Field.less'

class BaseComponent extends React.Component {
  constructor (props) {
    super(props)
    this.input = React.createRef()
  }
  shouldComponentUpdate (nextProps) {
    const {
      children = [],
      options,
      submitCount,
      name,
      update = () => {}
    } = this.props
    const optsChanged = options !== nextProps.options
    const nameChanged = name !== nextProps.name
    const childrenChanged =
      children.length !== (nextProps.children || []).length
    const submitChange = submitCount !== nextProps.submitCount
    return (
      submitChange ||
      optsChanged ||
      nameChanged ||
      childrenChanged ||
      update(this.props, nextProps) ||
      isChanged(this.props, nextProps)
    )
  }
  componentDidUpdate (prevProps) {
    if (
      this.props.scrollOnError &&
      this.props.submitCount !== prevProps.submitCount &&
      !this.props.isValid &&
      getProp(this.props.name, this.props.errors)
    ) {
      this.input.current.focus()
    }
  }
  render () {
    const {
      itemProps = {},
      touched = {},
      errors = {},
      component,
      noItem,
      label,
      name
    } = this.props

    return createElement(
      noItem ? 'div' : Form.Item,
      noItem
        ? itemProps
        : {
          // hasFeedback: !!getProp(name, touched) && !!getProp(name, errors),
          validateStatus:
              getProp(name, touched) && getProp(name, errors) && 'error',
          help: getProp(name, touched) && getProp(name, errors),
          label,
          ...itemProps
        },
      createElement(
        component,
        omit('component', { itemRef: this.input, ...this.props })
      )
    )
  }
}

BaseComponent.propTypes = {}

const TextField = props => {
  const {
    onChange = () => {},
    setFieldTouched,
    setFieldValue,
    handleSubmit,
    placeholder,
    itemRef,
    values,
    name,
    ...rest
  } = props

  return (
    <Input
      {...omit(formProps, rest)}
      ref={itemRef}
      placeholder={placeholder}
      value={getProp(name, values)}
      onChange={event => {
        setFieldValue(name, event.target.value, true)
        onChange(event)
      }}
      onBlur={() => setFieldTouched(name, true, true)}
      onPressEnter={handleSubmit} />
  )
}

const RadioField = props => {
  const {
    setFieldTouched,
    setFieldValue,
    handleSubmit,
    options = [],
    values,
    name,
    ...rest
  } = props
  return (
    <Radio.Group
      {...rest}
      value={getProp(name, values)}
      onChange={event => setFieldValue(name, event.target.value, true)}>
      {props.children ||
        options.map(({ value, label }, i) => (
          <Radio key={i} value={value}>
            {label}
          </Radio>
        ))}
    </Radio.Group>
  )
}

const TextAreaField = props => {
  const {
    onChange = () => {},
    setFieldTouched,
    setFieldValue,
    handleSubmit,
    placeholder,
    values,
    name,
    ...rest
  } = props
  return (
    <Input.TextArea
      {...omit(formProps, rest)}
      placeholder={placeholder}
      value={getProp(name, values)}
      onChange={event => {
        setFieldValue(name, event.target.value, true)
        onChange(event)
      }}
      onBlur={() => setFieldTouched(name, true, true)} />
  )
}

const SelectField = props => {
  const {
    setFieldTouched,
    notFoundContent,
    setFieldValue,
    defaultValue,
    placeholder,
    children,
    options,
    values,
    name,
    mode,
    ...rest
  } = props

  const val =
    typeof getProp(name, values) === 'undefined'
      ? defaultValue
      : getProp(name, values)

  return (
    <Select
      {...omit(formProps, rest)}
      onBlur={() => setFieldTouched(name, true, true)}
      onChange={value => setFieldValue(name, value)}
      notFoundContent={notFoundContent}
      placeholder={placeholder}
      options={options}
      value={val}
      mode={mode}>
      {children ||
        options.map(({ label, value }, i) => (
          <Select.Option label={label} key={i} value={value}>
            {label}
          </Select.Option>
        ))}
    </Select>
  )
}

const CheckboxField = props => {
  const {
    setFieldTouched,
    setFieldValue,
    handleSubmit,
    placeholder,
    children,
    itemRef,
    values,
    name,
    ...rest
  } = props

  return (
    <Checkbox.Group
      {...omit(formProps, rest)}
      ref={itemRef}
      value={getProp(name, values)}
      onChange={value => setFieldValue(name, value, true)}>
      {children}
    </Checkbox.Group>
  )
}

export default BaseComponent
export { TextField, SelectField, TextAreaField, CheckboxField, RadioField }

function isChanged (props, next, watchProps = ['errors', 'values']) {
  return watchProps.some(
    val => getProp(props.name, props[val]) !== getProp(next.name, next[val])
  )
}

const formProps = [
  'editing',
  'visible',
  'class',
  'onOk',
  'onCancel',
  'edit',
  'courseId',
  'noItem',
  'studentSignIn',
  'rpc',
  'setUrl',
  'confirmLoading',
  'isAuthenticating',
  'isAuthenticated',
  'staticContext',
  'dispatch',
  'redirectPath',
  'itemProps',
  'setLoading',
  'close',
  'errors',
  'touched',
  'isSubmitting',
  'resetForm',
  'submitForm',
  'validateForm',
  'setError',
  'setErrors',
  'setFieldError',
  'setStatus',
  'setSubmitting',
  'setTouched',
  'setValues',
  'setFormikState',
  'dirty',
  'isValid',
  'initialValues',
  'handleBlur',
  'handleChange',
  'handleReset',
  'validateOnChange',
  'validateOnBlur',
  'scrollOnError'
]

const inputProps = [
  'addonAfter',
  'addonBefore',
  'autosize',
  'defaultValue',
  'enterButton',
  'disabled',
  'id',
  'onPressEnter',
  'onSearch',
  'prefix',
  'size',
  'suffix',
  'type',
  'value'
]

const selectProps = [
  'allowClear',
  'autoFocus',
  'defaultActiveFirstOption',
  'defaultValue',
  'disabled',
  'dropdownClassName',
  'dropdownMatchSelectWidth',
  'dropdownStyle',
  'filterOption',
  'firstActiveValue',
  'getPopupContainer',
  'labelInValue',
  'maxTagCount',
  'maxTagPlaceholder',
  'mode',
  'notFoundContent',
  'optionFilterProp',
  'optionLabelProp',
  'placeholder',
  'showSearch',
  'showArrow',
  'size',
  'tokenSeparators',
  'value',
  'onBlur',
  'onChange',
  'onDeselect',
  'onFocus',
  'onInputKeyDown',
  'onMouseEnter',
  'onMouseLeave',
  'onPopupScroll',
  'onSearch',
  'onSelect'
]
