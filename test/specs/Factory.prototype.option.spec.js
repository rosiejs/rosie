const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')

describe('Factory.prototype.option', function () {
  let factory
  beforeEach(function () {
    factory = new Factory()
  })

  context('static option', function () {
    let field, value

    beforeEach(function () {
      field = faker.lorem.word()
      value = faker.lorem.word()

      factory.option(field, value)
    })

    it('has an entry for the field', function () {
      expect(factory.opts).to.have.property(field)
    })

    it('has a builder for the field', function () {
      expect(factory.opts[field]).to.have.property('builder').that.is.a('function')
    })

    it('returns the value', function () {
      expect(factory.opts[field].builder()).to.eql(value)
    })

    it('has no dependencies', function () {
      expect(factory.opts[field].dependencies).to.be.empty
    })
  })

  context('dynamic option', function () {
    let field, value

    beforeEach(function () {
      field = faker.lorem.word()
      value = faker.number.int()

      factory.option(field, () => value + 1)
    })

    it('returns the value', function () {
      expect(factory.opts[field].builder()).to.eql(value + 1)
    })

    it('has no dependencies', function () {
      expect(factory.opts[field].dependencies).to.be.empty
    })
  })

  context('with dependencies', function () {
    let fieldOne, valueOne, fieldTwo, valueTwo

    beforeEach(function () {
      fieldOne = faker.lorem.word()
      valueOne = faker.number.int()

      fieldTwo = faker.lorem.word()
      valueTwo = faker.number.int()

      factory
        .option(fieldOne, valueOne)
        .option(fieldTwo, [fieldOne], (valueOne) => valueTwo + valueOne)
    })

    it('knows the required dependencies', function () {
      expect(factory.opts[fieldTwo].dependencies).to.include(fieldOne)
    })
  })
})
