const { Factory } = require('../');
const chai = require('chai')

chai.use(require('chai-as-promised'))
chai.use(require('sinon-chai'))

const sinon = require('sinon')

exports.mochaHooks = {
  afterEach () {
    Factory.implode();

    sinon.restore()
  }
}
