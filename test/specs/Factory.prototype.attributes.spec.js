const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')

describe('Factory.prototype.attributes', function () {
  let factory, field, value

  beforeEach(function () {
    field = faker.lorem.word()
    value = faker.number.int({ min: 1, max: 100 })

    factory = new Factory()
      .attr(field, value)
      .option('less', 4)
      .attr(`double_${field}`, () => 3 * 2)
      .attr(`squared_${field}`, [`double_${field}`], (doubled) => doubled * doubled)
      .attr(`less_${field}`, ['less'], (less) => value - less)
  })

  it('returns the values for each attribute', function () {
    expect(factory.attributes()).to.eql({
      [field]: value,
      [`double_${field}`]: 6,
      [`squared_${field}`]: 36,
      [`less_${field}`]: (value - 4)
    })
  })

  it('can provide values for attrs', function () {
    expect(factory.attributes({ [field]: 10 })).to.eql({
      [field]: 10,
      [`double_${field}`]: 6,
      [`squared_${field}`]: 36,
      [`less_${field}`]: (value - 4)
    })
  })

  it('can provide values for calculated fields', function () {
    expect(factory.attributes({ [`double_${field}`]: 10 })).to.eql({
      [field]: value,
      [`double_${field}`]: 10,
      [`squared_${field}`]: 100,
      [`less_${field}`]: (value - 4)
    })
  })

  it('can provide options for field dependencies', function () {
    expect(factory.attributes({ }, { less: 3 })).to.eql({
      [field]: value,
      [`double_${field}`]: 6,
      [`squared_${field}`]: 36,
      [`less_${field}`]: (value - 3)
    })
  })
})
