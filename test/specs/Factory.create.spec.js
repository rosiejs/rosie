const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')
const sinon = require('sinon')

describe('Factory.create', function () {
  let factory
  beforeEach(function () {
    factory = Factory.define('factory')
    sinon.spy(factory, 'create')
  })

  it('throws an error when the factory is not registered', function () {
    expect(function () {
      Factory.build('other')
    }).to.throw(Error, 'The "other" factory is not defined.')
  })

  it('calls build on the registered factory with the provided arguments', function () {
    Factory.create('factory', 'attrs', 'options')
    expect(factory.create).to.have.been.calledWith('attrs', 'options')
  })
})
