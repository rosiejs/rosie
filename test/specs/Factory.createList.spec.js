const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')
const sinon = require('sinon')

describe('Factory.createList', function () {
  beforeEach(function () {
    sinon.stub(Factory, 'create').callsFake(sinon.fake.resolves())
  })

  it('returns a promise', function () {
    expect(Factory.createList('factory', 2, 'attrs', 'options')).to.be.a('promise')
  })

  it('calls Factory.create n times with the provided args', function () {
    Factory.createList('factory', 2, 'attrs', 'options')
    expect(Factory.create).to.have.been.calledTwice
    expect(Factory.create).to.have.been.calledWith('factory', 'attrs', 'options')
    expect(Factory.create).to.have.been.calledWith('factory', 'attrs', 'options')
  })

  it('returns an array of length n', async function () {
    await expect(Factory.createList('factory', 2, 'attrs', 'options')).to.eventually.have.lengthOf(2)
  })
})
