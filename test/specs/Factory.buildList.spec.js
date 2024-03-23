const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')
const sinon = require('sinon')

describe('Factory.buildList', function () {
  beforeEach(function () {
    sinon.stub(Factory, 'build').callsFake(() => {})
  })

  it('calls Factory.build n times with the provided args', function () {
    Factory.buildList('factory', 2, 'attrs', 'options')
    expect(Factory.build).to.have.been.calledTwice
    expect(Factory.build).to.have.been.calledWith('factory', 'attrs', 'options')
    expect(Factory.build).to.have.been.calledWith('factory', 'attrs', 'options')
  })

  it('returns an array of length n', function () {
    expect(Factory.buildList('factory', 2, 'attrs', 'options')).to.have.lengthOf(2)
  })
})
