const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')
const sinon = require('sinon')

describe('Factory.prototype.beforeCreate', function () {
  let factory, spyOne, spyTwo

  beforeEach(function () {
    factory = new Factory()
    spyOne = sinon.spy(() => {})
    spyTwo = sinon.spy(() => {})
    factory.beforeCreate(spyOne)
    factory.beforeCreate(spyTwo)
  })

  it('adds a method to the list of before create methods', function () {
    expect(factory.beforeCreateHooks).to.eql([spyOne, spyTwo])
  })
})
