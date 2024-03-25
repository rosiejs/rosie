const { Factory } = require('../../')
const { expect } = require('chai')
const sinon = require('sinon')

describe('Factory.create', function () {
  let factory, result

  beforeEach(function () {
    factory = new Factory()
    sinon.stub(Factory, 'get').callsFake(() => factory)
    sinon.stub(factory, 'create').callsFake(sinon.fake.returns('value'))
    result = Factory.create('factory', 'attrs', 'options')
  })

  it('gets the correct factory fom the registrar', function () {
    expect(Factory.get).to.have.been.calledWith('factory')
  })

  it('calls factory.create with the provided args', function () {
    expect(factory.create).to.have.been.calledWith('attrs', 'options')
  })

  it('returns the result of factory.create', function () {
    expect(result).to.eql('value')
  })
})
