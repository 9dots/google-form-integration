import { compose, withProps } from 'recompose'
import fetch from 'isomorphic-fetch'
import { withFormik } from 'formik'
import setProp from '@f/set-prop'

export default compose(
  withProps(({ data = {} }) => ({
    fields: data.fields || [],
    widgets: (data.fields || [])
      .reduce((acc, f) => acc.concat(f.widgets), [])
      .filter(w => !!w)
  })),
  withFormik({
    displayName: 'displayForm',
    handleSubmit: (values, { props }) => {
      const vals = cast(values).concat({
        key: 'pageHistory',
        value: Array.from(
          { length: props.data.sectionCount },
          (v, i) => i
        ).join(',')
      })
      const params = new URLSearchParams()
      vals
        .filter(val => !!val.value)
        .forEach(val => params.append(val.key, val.value))
      params.append('emailAddress', 'taco@9dotsapp.com')
      fetch(`http://localhost:8000/api/activity.externalUpdate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Apikey ${process.env.API_KEY}`
        },
        body: JSON.stringify({
          progress: 100,
          completed: true,
          id: props.taskId
        })
      }).catch(console.error)
      fetch(
        `https://docs.google.com${props.data.path}/d/${
          props.data.action
        }/formResponse`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
          },
          // mode: 'no-cors',
          body: params
        }
      )
        .then(res => console.log('done'))
        .catch(e => console.log('done', e))
    },
    validate: (values, props) => {
      const errors = props.widgets.reduce((acc, w) => {
        if (w.required && !values[w.id]) {
          return setProp(w.id, acc, 'Required')
        }
        return acc
      }, {})
      return { ...errors, ...checkEmail(props.data, values) }
    },
    mapPropsToValues: props => initValues(props.data, props.widgets)
  })
)

function initValues (data, widgets) {
  const fieldValues = widgets.reduce(
    (acc, w) => ({ ...acc, [w.id]: undefined }),
    {}
  )
  const addEmail = data.askEmail ? { emailAddress: undefined } : {}
  return {
    ...fieldValues,
    ...addEmail
  }
}

function checkEmail (data, values) {
  if (data.askEmail && !values.emailAddress) {
    return { emailAddress: 'Required' }
  }
  return {}
}

function cast (values) {
  const toObjWithValues = toObj(values)
  return Object.keys(values).reduce((acc, id) => {
    const val = values[id]
    if (id.startsWith('other_option_response')) return acc
    if (id.startsWith('emailAddress')) {
      return acc.concat({ key: 'emailAddress', value: val })
    }

    if (Array.isArray(val)) {
      return acc.concat(
        val
          .map(v => toObjWithValues(id, v))
          .reduce((acc, val) => acc.concat(val), [])
      )
    }
    return acc.concat(toObjWithValues(id, val))
  }, [])
}

function toObj (values) {
  return (id, value) => {
    const list = []
    const key = `entry.${id}`
    if (value === '__other_option__') {
      list.push({
        key: `${key}.other_option_response`,
        value: values[`other_option_response_${id}`]
      })
    }
    return list.concat({ key, value })
  }
}
