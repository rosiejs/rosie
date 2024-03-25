const { Factory } = require('../../src/rosie')
const { expect } = require('chai')
const sinon = require('sinon')

describe('Factory.build', function () {
  let factory

  beforeEach(function () {
    factory = Factory.define('factory')
    sinon.stub(factory, 'build').callsFake(() => 'fake result')
  })

  it('calls factory.build with the provided args', function () {
    Factory.build('factory', 'attrs', 'options')
    expect(factory.build).to.have.been.calledWith('attrs', 'options')
  })

  it('returns the built factory', function () {
    expect(Factory.build('factory')).to.equal('fake result')
  })
})