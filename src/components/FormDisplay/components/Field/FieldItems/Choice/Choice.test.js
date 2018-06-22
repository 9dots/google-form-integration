import React from 'react'
import ReactDOM from 'react-dom'
import Choice from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<Choice />, div)
})
