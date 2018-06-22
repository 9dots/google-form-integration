import React from 'react'
import ReactDOM from 'react-dom'
import Linear from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<Linear />, div)
})
