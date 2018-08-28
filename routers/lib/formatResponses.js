module.exports = function getData (data, fields) {
  return getResponses(data, fields)
}

function getResponses (data, fields) {
  return fields.map(field => ({
    label: field.label,
    id: field.id,
    value: getValues(field)
  }))

  function getValues (field) {
    return field.widgets
      .map(getWidgetIds)
      .map(ids => getValue(data, ids))
      .map(normalizeValues)
      .reduce((acc, next) => (acc ? normalizeValues(acc.concat(next)) : next))
  }
}

function normalizeValues (values) {
  if (Array.isArray(values)) return values.join(', ')
  if (values === null) return null
  if (typeof values === 'object') return JSON.stringify(values)
  return String(values)
}

function getValue (data = {}, ids) {
  return data[ids] || ''
}

function getWidgetIds (widget) {
  return widget.id
}
