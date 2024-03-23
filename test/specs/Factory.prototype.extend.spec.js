const { Factory } = require('../../')
const { expect } = require('chai')
const sinon = require('sinon')

describe('Factory.prototype.extend', function () {
  let factoryOne, factoryTwo
  let constructor
  let beforeBuild, afterBuild
  let beforeCreate, onCreate, afterCreate

  beforeEach(function () {
    constructor = sinon.spy()
    beforeBuild = sinon.spy()
    afterBuild = sinon.spy()
    beforeCreate = sinon.spy()
    onCreate = sinon.spy()
    afterCreate = sinon.spy()

    factoryOne = new Factory(constructor)
      .sequence('id')
      .attr('key', 'key1')
      .option('opt', 'opt1')
      .beforeBuild(beforeBuild)
      .afterBuild(afterBuild)
      .beforeCreate(beforeCreate)
      .afterCreate(afterCreate)
      .onCreate(onCreate)

    factoryTwo = new Factory().extend(factoryOne)
  })

  it('copies the constructor', function () {
    expect(factoryTwo.construct).to.eql(constructor)
  })

  it('copies the attribute definitions', function () {
    expect(factoryTwo._attrs).to.eql(factoryOne._attrs)
  })

  it('copies the option definitions', function () {
    expect(factoryTwo.opts).to.eql(factoryOne.opts)
  })

  it('copies the beforeBuild hooks', function () {
    expect(factoryTwo.beforeBuildHooks).to.eql(factoryOne.beforeBuildHooks)
  })

  it('copies the afterBuild hooks', function () {
    expect(factoryTwo.afterBuildHooks).to.eql(factoryOne.afterBuildHooks)
  })

  it('copies the beforeCreate hooks', function () {
    expect(factoryTwo.beforeCreateHooks).to.eql(factoryOne.beforeCreateHooks)
  })

  it('copies the onCreate hook', function () {
    expect(factoryTwo.createHandler).to.eql(factoryOne.createHandler)
  })

  it('copies the afterCreate hooks', function () {
    expect(factoryTwo.afterCreateHooks).to.eql(factoryOne.afterCreateHooks)
  })
})
