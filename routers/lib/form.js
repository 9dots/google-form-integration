const cheerio = require('cheerio')

module.exports = function (html) {
  const doc = cheerio.load(html)
  return getText(doc)
    .then(JSON.parse)
    .then(getForm)
    .then(extractImages(doc))
}

async function getText (doc) {
  return doc('script')
    .filter((i, s) => {
      return doc(s)
        .html()
        .includes('var FB_PUBLIC_LOAD_DATA_')
    })
    .first()
    .html()
    .replace('var FB_PUBLIC_LOAD_DATA_ =', '')
    .replace(';', '')
    .trim()
}

function getForm (data) {
  const extraData = data[1]
  const fields = getFields(extraData[1]).filter(val => !!val)
  const sectionCount = fields.reduce(
    (acc, field) => (field.typeid === 8 ? acc + 1 : acc),
    1
  )
  return {
    title: data[3],
    path: data[2],
    action: data[14],
    fields,
    sectionCount
  }
}

function getFields (data) {
  return data.map(newFieldFromData)
}

function newFieldFromData (data) {
  const f = {
    id: data[0].toString(),
    label: data[1],
    desc: data[2],
    typeid: data[3],
    widgets: []
  }
  switch (f.typeid) {
    case 0:
    case 1:
      const widgets = data[4]
      const [widget] = widgets
      f.widgets.push({ id: widget[0].toString(), required: !!widget[2] })
      return f
    case 2:
    case 3:
    case 4:
      return formatMultipleChoice(data, f)
    case 5:
      return formatLinear(data, f)
    case 11:
      const extra = data[6]
      const opts = extra[2]
      f.widgets = [
        {
          id: extra[0],
          res: {
            w: opts[0],
            h: opts[1],
            showText: f.desc !== ''
          }
        }
      ]
      return f
  }
  return f
}

function formatLinear (data, f) {
  const widgets = data[4]
  const [widget] = widgets
  const legend = widget[3]
  const opts = widget[1]
  const options = opts.map(o => ({
    label: o[0]
  }))
  f.widgets = {
    id: widget[0],
    required: !!widget[2],
    options,
    legend: {
      first: legend[0],
      last: legend[1]
    }
  }
}

function formatMultipleChoice (data, f) {
  const field = Object.assign({}, f)
  const widgets = data[4]
  const [widget] = widgets
  const [, opts] = widget
  if (data.length > 9) {
    field.image = true
  }
  const options = opts.map(o => ({
    label: o[0],
    src: '',
    href: o[2],
    custom: !!o[4],
    image: o.length > 5
  }))

  field.widgets = [
    {
      id: widget[0].toString(),
      required: !!widget[2],
      src: '',
      options
    }
  ]
  return field
}

function extractImages (doc) {
  return form => {
    const fields = form.fields.map(field => {
      if (field.typeid === 11) {
        const imgEl = doc(`[data-item-id=${field.id}] img`)
        return { ...field, src: imgEl.attr('src') || '' }
      } else {
        const widget = field.widgets.slice()[0]
        const imgs = doc(`[data-item-id=${field.id}] img`).get()
        imgs.forEach(img => {
          if (field.image && !widget.src) {
            widget.src = img.attribs.src || ''
          }
          for (let i = 0; i < (widget.options || []).length; i++) {
            let o = widget.options[i]
            if (o.image && !o.src) {
              o = { ...o, src: img.attribs.src || '' }
              break
            }
          }
        })
        return { ...field, widget }
      }
    })
    return { ...form, fields }
  }
}
