const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')

describe('Factory.prototype.attr', function () {
  let factory
  beforeEach(function () {
    factory = new Factory()
  })

  context('static attribute', function () {
    let field, value

    beforeEach(function () {
      field = faker.lorem.word()
      value = faker.lorem.word()

      factory.attr(field, value)
    })

    it('has an entry for the field', function () {
      expect(factory._attrs).to.have.property(field)
    })

    it('has a builder for the field', function () {
      expect(factory._attrs[field]).to.have.property('builder').that.is.a('function');
    })

    it('returns the value', function () {
      expect(factory._attrs[field].builder()).to.eql(value)
    })

    it('has no dependencies', function () {
      expect(factory._attrs[field].dependencies).to.be.empty
    })
  })

  context('dynamic attribute', function () {
    let field, value

    beforeEach(function () {
      field = faker.lorem.word()
      value = faker.number.int()

      factory.attr(field, () => value + 1)
    })

    it('returns the value', function () {
      expect(factory._attrs[field].builder()).to.eql(value + 1)
    })

    it('has no dependencies', function () {
      expect(factory._attrs[field].dependencies).to.be.empty
    })
  })

  context('with dependencies', function () {
    let fieldOne, valueOne, fieldTwo, valueTow

    beforeEach(function () {
      fieldOne = faker.lorem.word()
      valueOne = faker.number.int()

      fieldTwo = faker.lorem.word()
      valueTwo = faker.number.int()

      factory
        .attr(fieldOne, valueOne)
        .attr(fieldTwo, [fieldOne], (valueOne) => valueTwo + valueOne)
    })

    it('knows the required dependencies', function () {
      expect(factory._attrs[fieldTwo].dependencies).to.include(fieldOne)
    })
  })
})
