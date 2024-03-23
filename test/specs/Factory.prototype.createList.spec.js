const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')
const sinon = require('sinon')

describe('Factory.prototype.createList', function () {
  let factory, key, value, attrs, options, stub

  beforeEach(function () {
    key = faker.lorem.word()
    value = faker.number.int({ min: 1, max: 10 })
    factory = new Factory().attr(key, value)

    stub = sinon.stub(factory, 'create')

    attrs = { [faker.lorem.word()]: faker.number.int({ min: 0, max: 100 }) }
    options = { [faker.lorem.word()]: faker.number.int({ min: 0, max: 100 }) }
  })

  context('sync build', function () {
    beforeEach(function () {
      stub
        .onFirstCall().returns({})
        .onSecondCall().returns({})
    })

    it('returns an array with n items', function () {
      expect(factory.createList(2)).to.have.lengthOf(2)
    })

    it('calls build n times with the provided args', function () {
      factory.createList(2)
      expect(factory.create).to.have.been.calledTwice
    })

    it('calls build n times with the provided args', function () {
      factory.createList(2, attrs, options)
      expect(factory.create).to.have.been.calledWith(attrs, options)
    })
  })

  context('async create', function () {
    beforeEach(function () {
      stub
        .onFirstCall().returns({})
        .onSecondCall().resolves({})
    })

    it('returns an array with n items', function () {
      expect(factory.createList(2)).to.eventually.have.lengthOf(2)
    })

    it('calls create n times with the provided args', async function () {
      await factory.createList(2)
      expect(factory.create).to.have.been.calledTwice
    })

    it('calls create n times with the provided args', async function () {
      await factory.createList(2, attrs, options)
      expect(factory.create).to.have.been.calledWith(attrs, options)
    })
  })
})
