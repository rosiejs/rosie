const { Factory } = require('../../')
const { expect } = require('chai')
const sinon = require('sinon')

describe('Factory.buildList', function () {
  let factory, result

  beforeEach(function () {
    factory = new Factory()
    sinon.stub(Factory, 'get').callsFake(() => factory)
    sinon.stub(factory, 'buildList').callsFake(sinon.fake.returns('value'))
    result = Factory.buildList('factory', 2, 'attrs', 'options')
  })

  it('gets the correct factory fom the registrar', function () {
    expect(Factory.get).to.have.been.calledWith('factory')
  })

  it('calls factory.buildList with the provided args', function () {
    expect(factory.buildList).to.have.been.calledWith(2, 'attrs', 'options')
  })

  it('returns the result of factory.buildList', function () {
    expect(result).to.eql('value')
  })
})
