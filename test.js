// We'll use this to override require calls in routes
var proxyquire = require('proxyquire')
// This will create stubbed functions for our overrides
var sinon = require('sinon')
// Supertest allows us to make requests against an express object
var supertest = require('supertest')
var admin = require('firebase-admin')
// Natural language-like assertions
var expect = require('chai').expect
var serviceAccount = require('./secrets.json')

var express = require('express')
const { assert } = require('chai')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://forms-integration-93a90.firebaseio.com'
})

describe('API', function () {
  this.timeout(15000)
  var app, request, route

  beforeEach(function () {
    // Create an express application object
    app = express()

    // Get our router module, with a stubbed out users dependency
    // we stub this out so we can control the results returned by
    // the users module to ensure we execute all paths in our code
    route = require('./routers/api/index')

    // Bind a route to our application
    route(app)

    // Get a supertest instance so we can make requests
    request = supertest(app)
  })

  // it('Should post /unfurl', done => {
  //   request
  //     .post('/api/unfurl')
  //     .send({
  //       taskUrl:
  //         'https://docs.google.com/forms/d/e/1FAIpQLScvJciJAJ1XfH6f8VZ9l69CTp0GBV1JLTWKfrkRJrLmYzJdaQ/viewform?usp=sf_link'
  //     })
  //     .set('Accept', 'application/json')
  //     .expect(200)
  //     .then(res => assert.equal(res.body.ok, true, 'not ok'))
  //     .then(done)
  //     .catch(done)
  // })

  it('Should post /copy', done => {
    const tasks = [
      {
        task: 'aiviase-asefkase-asefasefas-asefassss',
        taskUrl:
          'https://docs.google.com/forms/d/1ux2SRrYx2-uQcP42hAXbjsD7YC7rE_xE-UK5VtAeKSs/edit',
        update: {
          host: 'tacos',
          id: 'abc123'
        }
      },
      {
        task: 'aiviase-asefkase-asefasefas-asefassss',
        taskUrl:
          'https://docs.google.com/forms/d/1ux2SRrYx2-uQcP42hAXbjsD7YC7rE_xE-UK5VtAeKSs/edit',
        update: {
          host: 'tacos',
          id: 'abc123'
        }
      },
      {
        task: 'aiviase-asefkase-asefasefas-asefa',
        taskUrl:
          'https://docs.google.com/forms/d/1ux2SRrYx2-uQcP42hAXbjsD7YC7rE_xE-UK5VtAeKSs/edit',
        update: {
          host: 'tacos',
          id: 'abc123'
        }
      }
    ]
    request
      .post('/api/copy')
      .send({ tasks })
      .set('Accept', 'application/json')
      .then(res => assert.equal(res.body.ok, true, 'not ok'))
      .then(done)
      .catch(done)
  })
})
