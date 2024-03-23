const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')

describe('Factory.prototype.options', function () {
  let factory, length

  beforeEach(function () {
    length = faker.number.int({ min: 0, max: 100 })
    factory = new Factory()
      .option('count', 4)
      .option('size', 'big')
      .option('length', () => length)
  })

  it('returns the default options', function () {
    expect(factory.options()).to.eql({
      count: 4,
      size: 'big',
      length
    })
  })

  it('can be overridden', function () {
    expect(factory.options({ count: 5, size: 'small', length: 5 })).to.eql({
      count: 5,
      size: 'small',
      length: 5
    })
  })
})
