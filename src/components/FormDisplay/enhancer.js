import firebase from 'firebase/app'
import { withFormik } from 'formik'
import setProp from '@f/set-prop'
import { f } from '../../utils'
import filter from '@f/filter'
import 'firebase/firestore'
import {
  compose,
  withProps,
  lifecycle,
  withHandlers,
  withStateHandlers
} from 'recompose'

if (firebase.apps.length === 0) {
  firebase.initializeApp({
    apiKey: 'AIzaSyBZh6xZT0FXkl_Gg1a2PI-NWaW9PUOQca8',
    databaseURL: 'https://forms-integration-93a90.firebaseio.com',
    projectId: 'forms-integration-93a90'
  })
}

const firestore = firebase.firestore()
const responsesCol = firestore.collection('responses')

export default compose(
  withProps(({ data = {} }) => ({
    fields: data.fields || [],
    widgets: (data.fields || [])
      .reduce((acc, f) => acc.concat(f.widgets), [])
      .filter(w => !!w)
  })),
  withStateHandlers(props => ({ submitted: props.submitted }), {
    setSubmitted: () => () => ({ submitted: true })
  }),
  withHandlers({
    updateProgress: props => values => {
      f(
        `http://localhost:8000/api/activity.externalUpdate`,
        JSON.stringify({
          progress: getProgress(values, props.widgets),
          completed: false,
          id: props.activityId
        }),
        { Authorization: `Apikey ${process.env.REACT_APP_API_KEY}` }
      ).catch(console.error)
      responsesCol
        .doc(props.activityId)
        .set(
          { data: filter(val => val !== undefined, values) },
          { merge: true }
        )
    }
  }),
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
      params.append('emailAddress', props.activityId + '@9dotsapp.com')
      f(
        `https://docs.google.com${props.data.path}/d/${
          props.data.action
        }/formResponse`,
        params,
        { 'Content-Type': 'application/x-www-form-urlencoded' },
        { mode: 'no-cors' }
      )
        .then(res => console.log('done'))
        .catch(e => console.log('done', e))
      responsesCol.doc(props.activityId).update({ submitted: true })
      props.setSubmitted()
      f(
        `http://localhost:8000/api/activity.externalUpdate`,
        JSON.stringify({
          progress: 100,
          completed: true,
          id: props.activityId
        }),
        { Authorization: `Apikey ${process.env.REACT_APP_API_KEY}` }
      ).catch(console.error)
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
    mapPropsToValues: props =>
      initValues(props.data, props.widgets, props.response)
  }),
  lifecycle({
    componentWillUpdate (nextProps) {
      if (nextProps.values !== this.props.values) {
        this.props.updateProgress(nextProps.values)
      }
    }
  })
)

function getProgress (values, widgets) {
  const completed = widgets.reduce((acc, w) => {
    if (w.required && !values[w.id]) {
      return acc
    }
    return acc + 1
  }, 0)
  return Math.round((completed / widgets.length) * 100)
}

function initValues (data = {}, widgets, response = {}) {
  const fieldValues = widgets.reduce(
    (acc, w) => ({ ...acc, [w.id]: undefined }),
    {}
  )
  const addEmail = data.askEmail ? { emailAddress: undefined } : {}
  return {
    ...fieldValues,
    ...addEmail,
    ...response
  }
}

function checkEmail (data = {}, values) {
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
