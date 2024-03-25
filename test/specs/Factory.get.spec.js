const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')
const sinon = require('sinon')

describe('Factory.get', function () {
  let mock
  beforeEach(function () {
    mock = sinon.mock({})

    Factory.factories['factory'] = mock
  })

  it('returns the registered factory', function () {
    expect(Factory.get('factory')).to.eql(mock)
  })

  it('throws an error when the requested factory is not registered', function () {
    expect(function () {
      Factory.get('other')
    }).to.throw(Error, 'The "other" factory is not defined.')
  })
})
