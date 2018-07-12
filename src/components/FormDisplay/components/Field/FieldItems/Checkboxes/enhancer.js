import { compose, withHandlers } from 'recompose'
import getProp from '@f/get-prop'

export default compose(
  withHandlers({
    addOther: props => () => {
      const { formProps, widgets } = props
      const { id } = widgets[0]
      return formProps.setFieldValue(
        id,
        uniqueAdd(getProp(id, formProps.values) || [], '__other_option__')
      )
    }
  })
)

function uniqueAdd (arr, val) {
  if (arr.indexOf(val) === -1) {
    return arr.concat(val)
  }
  return arr
}
