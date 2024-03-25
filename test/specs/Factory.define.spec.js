const { Factory } = require('../../')
const { expect } = require('chai')

describe('Factory.define', function () {
  it('registers a factory in the global factory cache', function () {
    const factory = Factory.define('factory')
    expect(Factory.factories).to.have.property('factory').that.eqls(factory)
  })
})
