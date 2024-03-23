const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')
const sinon = require('sinon')

describe('Factory.attributes', function () {
  let factory, result

  beforeEach(function () {
    factory = Factory.define('factory')
    sinon.stub(factory, 'attributes').callsFake(sinon.fake.returns('value'))
    result = Factory.attributes('factory', 'attrs', 'options')
  })

  it('calls factory.attributes with the provided args', function () {
    expect(factory.attributes).to.have.been.calledWith('attrs', 'options')
  })

  it('returns the result of factory.attributes', function () {
    expect(result).to.eql('value')
  })
})
