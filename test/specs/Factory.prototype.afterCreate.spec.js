const { Factory } = require('../../')
const { expect } = require('chai')
const sinon = require('sinon')

describe('Factory.prototype.afterCreate', function () {
  let factory, spyOne, spyTwo

  beforeEach(function () {
    factory = new Factory()
    spyOne = sinon.spy(() => {})
    spyTwo = sinon.spy(() => {})
    factory.afterCreate(spyOne)
    factory.afterCreate(spyTwo)
  })

  it('adds a method to the list of before create methods', function () {
    expect(factory.afterCreateHooks).to.eql([spyOne, spyTwo])
  })
})
