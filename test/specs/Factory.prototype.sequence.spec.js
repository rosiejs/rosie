const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')

describe('Factory.prototype.sequence', function () {
  let factory
  beforeEach(function () {
    factory = new Factory()
  })

  context('no builder', function () {
    let field

    beforeEach(function () {
      field = faker.lorem.word()
      factory.sequence(field)
    })

    it('increments numbers', function () {
      expect(factory._attrs[field].builder()).to.eql(1)
      expect(factory._attrs[field].builder()).to.eql(2)
    })

    it('has no dependencies', function () {
      expect(factory._attrs[field].dependencies).to.be.empty
    })
  })

  context('with a builder', function () {
    let field

    beforeEach(function () {
      field = faker.lorem.word()
      factory.sequence(field, (n) => `id-${n}`)
    })

    it('increments numbers', function () {
      expect(factory._attrs[field].builder()).to.eql('id-1')
      expect(factory._attrs[field].builder()).to.eql('id-2')
    })
  })

  context('with dependencies', function () {
    let fieldOne, valueOne, fieldTwo

    beforeEach(function () {
      fieldOne = faker.lorem.word()
      valueOne = faker.number.int()

      fieldTwo = faker.lorem.word()

      factory
        .option(fieldOne, valueOne)
        .sequence(fieldTwo, [fieldOne], (id, valueOne) => `${valueOne}-${id}`)
    })

    it('knows the required dependencies', function () {
      expect(factory._attrs[fieldTwo].dependencies).to.include(fieldOne)
    })
  })
})
