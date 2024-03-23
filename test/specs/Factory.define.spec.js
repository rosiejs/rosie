const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')
const sinon = require('sinon')

describe('Factory.define', function () {
  it('registers a factory in the global factory cache', function () {
    const factory = Factory.define('factory')
    expect(Factory.factories).to.have.property('factory').that.eqls(factory)
  })
})
