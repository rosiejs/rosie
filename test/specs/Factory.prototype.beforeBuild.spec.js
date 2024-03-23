const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')
const sinon = require('sinon')

describe('Factory.prototype.beforeBuild', function () {
  let factory, spyOne, spyTwo

  beforeEach(function () {
    factory = new Factory()
    spyOne = sinon.spy(() => {})
    spyTwo = sinon.spy(() => {})
    factory.beforeBuild(spyOne)
    factory.beforeBuild(spyTwo)
  })

  it('adds a method to the list of before create methods', function () {
    expect(factory.beforeBuildHooks).to.eql([spyOne, spyTwo])
  })
})
