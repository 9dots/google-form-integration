import React from 'react'
import ReactDOM from 'react-dom'
import FormDisplay from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<FormDisplay />, div)
})
