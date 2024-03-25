const { Factory } = require('../../src/rosie')
const { expect } = require('chai')
const sinon = require('sinon')

describe('Factory.build', function () {
  let factory

  beforeEach(function () {
    factory = new Factory()
    sinon.stub(Factory, 'get').callsFake(() => factory)
    sinon.stub(factory, 'build').callsFake(sinon.fake.returns('fake result'))
    result = Factory.build('factory', 'attrs', 'options')
  })

  it('gets the correct factory fom the registrar', function () {
    expect(Factory.get).to.have.been.calledWith('factory')
  })

  it('calls factory.build with the provided args', function () {
    Factory.build('factory', 'attrs', 'options')
    expect(factory.build).to.have.been.calledWith('attrs', 'options')
  })

  it('returns the built factory', function () {
    expect(result).to.equal('fake result')
  })
})
