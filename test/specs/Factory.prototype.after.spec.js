const { Factory } = require('../../src/rosie')
const { expect } = require('chai')
const sinon = require('sinon')

describe('Factory.prototype.after', function () {
  let spy, factory
  beforeEach(function () {
    spy = sinon.spy()
    factory = new Factory()
    sinon.spy(factory, 'afterBuild')
    factory.after(spy)
  })

  it('adds a method to the list of before create methods', function () {
    expect(factory.afterBuild).to.have.been.calledWith(spy)
  })
})
