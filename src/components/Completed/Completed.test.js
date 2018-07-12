import React from 'react'
import ReactDOM from 'react-dom'
import Completed from '.'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<Completed />, div)
})
