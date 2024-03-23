const { Factory } = require('../../')
const { expect } = require('chai')
const sinon = require('sinon')

describe('Factory.prototype.onCreate', function () {
  let factory, spy

  beforeEach(function () {
    factory = new Factory()
    spy = sinon.spy(() => {})
    factory.onCreate(spy)
  })

  it('sets the onCreateHandler', function () {
    expect(factory.createHandler).to.eql(spy)
  })
})
