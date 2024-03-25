const { Factory } = require('../../')
const { expect } = require('chai')
const sinon = require('sinon')

describe('Factory.createList', function () {
  let factory, result

  beforeEach(function () {
    factory = new Factory()
    sinon.stub(Factory, 'get').callsFake(() => factory)
    sinon.stub(factory, 'createList').callsFake(sinon.fake.returns('value'))
    result = Factory.createList('factory', 3, 'attrs', 'options')
  })

  it('gets the correct factory fom the registrar', function () {
    expect(Factory.get).to.have.been.calledWith('factory')
  })

  it('calls factory.createList with the provided args', function () {
    expect(factory.createList).to.have.been.calledWith(3, 'attrs', 'options')
  })

  it('returns the result of factory.createList', function () {
    expect(result).to.eql('value')
  })
})
