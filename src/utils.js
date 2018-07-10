import fetch from 'isomorphic-fetch'

const defaultHeaders = {
  'Content-Type': 'application/json'
}

export function f (url, body, headers = {}, opts = {}) {
  return fetch(url, {
    method: 'POST',
    headers: { ...defaultHeaders, ...headers },
    body,
    ...opts
  })
}
