const { Factory } = require('../../')
const { expect } = require('chai')

describe('Factory', function () {
  describe('.factories', function () {
    it('is an empty object', function () {
      expect(Factory.factories).to.be.a('object').that.is.empty
    })
  })
})
