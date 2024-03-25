const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')
const sinon = require('sinon')

const clone = (o) => JSON.parse(JSON.stringify(o))

describe('Factory.prototype.create', function () {
  let factory, builtObject, attributes, options

  beforeEach(function () {
    builtObject = { [faker.lorem.word()]: faker.number.int({ min: 1, max: 10 }) }
    attributes = { [faker.lorem.word()]: faker.number.int({ min: 1, max: 10 }) }
    options = { [faker.lorem.word()]: faker.number.int({ min: 1, max: 10 }) }

    factory = new Factory()
    sinon.stub(factory, 'build').returns(builtObject)
  })

  it('calls build', async function () {
    await factory.create(attributes, options)
    expect(factory.build).to.have.been.calledWith(attributes, options)
  })

  context('beforeCreate hooks', function () {
    let hookOne, hookTwo, builtObjectClone, result

    beforeEach(async function () {
      hookOne = sinon.spy((object, options) => {
        object.callOne = true
        return { object }
      })
      hookTwo = sinon.spy(async (object, options) => {
        new Promise(res => setImmediate(res))
        return { callTwo: true }
      })

      factory
        .beforeCreate(hookOne)
        .beforeCreate(hookTwo)

      builtObjectClone = clone(builtObject)

      result = await factory.create(attributes, options)
    })

    it('are called', function () {
      expect(hookOne).to.have.been.calledWith(builtObject, options)
      expect(hookTwo).to.have.been.calledWith({ object: { ...builtObjectClone, callOne: true } }, options)
    })

    it('are called in the correct order', function () {
      expect(hookOne).to.have.been.calledBefore(hookTwo)
    })

    it('can return a value different than the object', function () {
      expect(result).to.eql({ callTwo: true })
    })
  })

  context('onCreate hook', function () {
    it('calls the onCreate Hook',  async function () {
      const onCreate = sinon.spy((object, options) => { })
      factory.onCreate(onCreate)
      await factory.create(attributes, options)
      expect(onCreate).to.have.been.calledWith(builtObject, options)
    })

    it('modifies the object without returning it', async function () {
      const onCreate = sinon.spy((object, options) => { object.created = true })
      factory.onCreate(onCreate)
      const result = await factory.create(attributes, options)
      expect(result).to.eql({ ...builtObject, created: true })
    })

    it('overrides the object by returning something', async function () {
      const onCreate = sinon.spy((object, options) => { return { created: true } })
      factory.onCreate(onCreate)
      const result = await factory.create(attributes, options)
      expect(result).to.eql({ created: true })
    })
  })

  context('afterCreate hooks', function () {
    let hookOne, hookTwo, builtObjectClone, result

    beforeEach(async function () {
      hookOne = sinon.spy((object, options) => {
        object.callOne = true
        return { object }
      })
      hookTwo = sinon.spy(async (object, options) => {
        new Promise(res => setImmediate(res))
        return { callTwo: true }
      })

      factory
        .afterCreate(hookOne)
        .afterCreate(hookTwo)

      builtObjectClone = clone(builtObject)

      result = await factory.create(attributes, options)
    })

    it('are called', function () {
      expect(hookOne).to.have.been.calledWith(builtObject, options)
      expect(hookTwo).to.have.been.calledWith({ object: { ...builtObjectClone, callOne: true } }, options)
    })

    it('are called in the correct order', function () {
      expect(hookOne).to.have.been.calledBefore(hookTwo)
    })

    it('can return a value different than the object', function () {
      expect(result).to.eql({ callTwo: true })
    })
  })

  context('create lifecycle', function () {
    let beforeCreate, onCreate, afterCreate

    beforeEach(async function () {
      beforeCreate = sinon.spy(() => { })
      onCreate = sinon.spy(async () => { })
      afterCreate = sinon.spy(() => { })

      factory
        .afterCreate(afterCreate)
        .beforeCreate(beforeCreate)
        .onCreate(onCreate)

      await factory.create(attributes, options)
    })

    it('are called', function () {
      expect(beforeCreate).to.have.been.calledWith(builtObject, options)
      expect(onCreate).to.have.been.calledWith(builtObject, options)
      expect(afterCreate).to.have.been.calledWith(builtObject, options)
    })

    it('are called in the correct order', function () {
      expect(beforeCreate).to.have.been.calledBefore(onCreate)
      expect(afterCreate).to.have.been.calledAfter(onCreate)
    })
  })

  describe('sync and async create hooks', function () {
    beforeEach(function () {
      factory = new Factory().attr('firstName', 'Jon')
    })

    it('returns when hooks are all sync', function () {
      factory
        .beforeCreate(() => {})
        .onCreate(() => {})
        .afterCreate(() => {})

      expect(factory.create()).to.eql({ firstName: 'Jon' })
    })

    it('resolves when hooks are all async', async function () {
      factory
        .beforeCreate(async () => {})
        .onCreate(async () => {})
        .afterCreate(async () => {})

      await expect(factory.create()).to.eventually.eql({ firstName: 'Jon' })
    })

    it('resolves when beforeCreate is async, onCreate is sync, and afterCreate is sync', async function () {
      factory
        .beforeCreate(async () => {})
        .onCreate(() => {})
        .afterCreate(() => {})

      await expect(factory.create()).to.eventually.eql({ firstName: 'Jon' })
    })

    it('resolves when beforeCreate is sync, onCreate is async, and afterCreate is sync', async function () {
      factory
        .beforeCreate(() => {})
        .onCreate(async () => {})
        .afterCreate(() => {})

      await expect(factory.create()).to.eventually.eql({ firstName: 'Jon' })
    })

    it('resolves when beforeCreate is sync, onCreate is sync, and afterCreate is async', async function () {
      factory
        .beforeCreate(() => {})
        .onCreate(() => {})
        .afterCreate(async () => {})

      await expect(factory.create()).to.eventually.eql({ firstName: 'Jon' })
    })

    it('can go sync to async to sync again', async function () {
      factory.beforeCreate((attributes) => {
        attributes.firstCall = 'sync'
      }).beforeCreate(async (attributes) => {
        attributes.secondCall = 'async'
      }).beforeCreate((attributes) => {
        attributes.thirdCall = 'sync'
      })

      await expect(factory.create()).to.eventually.eql({
        firstName: 'Jon',
        firstCall: 'sync',
        secondCall: 'async',
        thirdCall: 'sync'
      })
    })
  })
})
