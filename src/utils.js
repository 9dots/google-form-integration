import fetch from 'isomorphic-fetch'

export function f (url, body, auth, opts) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: auth },
    body: JSON.stringify(body),
    ...opts
  })
}
