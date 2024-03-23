const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')
const sinon = require('sinon')

describe('Factory.prototype.attrs', function () {
  let factory
  let keyOne, keyTwo, keyThree
  beforeEach(function () {
    keyOne = faker.lorem.word()
    keyTwo = faker.lorem.word()

    factory = new Factory()
    sinon.spy(factory, 'attr')

    const attributes = Object.create({ keyThree })
    attributes.keyOne = keyOne
    attributes.keyTwo = keyTwo

    factory.attrs(attributes)
  })

  it('calls attr for each own key value pair', function () {
    expect(factory.attr).to.have.been.calledTwice
    expect(factory.attr).to.have.been.calledWith('keyOne', keyOne)
    expect(factory.attr).to.have.been.calledWith('keyTwo', keyTwo)
    expect(factory.attr).to.not.have.been.calledWith('keyThree', keyThree)
  })
})
