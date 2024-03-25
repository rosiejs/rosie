const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')
const sinon = require('sinon')

describe('Factory.prototype.build', function () {
  let factory, key, value

  beforeEach(function () {
    key = faker.lorem.word()
    value = faker.number.int({ min: 1, max: 10 })
  })

  context('without a constructor', function () {
    beforeEach(function () {
      factory = new Factory().attr(key, value)
    })

    it('returns the same as attributes', function () {
      expect(factory.build()).to.eql(factory.attributes())
    })
  })

  context('with a constructor', function () {
    let Model
    beforeEach(function () {
      Model = class {
        constructor (options = {}) {
          for (const key in options) {
            this[key] = options[key]
          }
        }
      }
      factory = new Factory(Model)
    })

    it('returns the same as attributes', function () {
      expect(factory.build()).to.be.an.instanceOf(Model)
    })
  })

  context('beforeBuild hooks', function () {
    context('that do not return a value', function () {
      beforeEach(function () {
        factory = new Factory()
          .attr(key, value)
          .beforeBuild((object, options) => {
            object.beforeBuild = true
          })
      })

      it('uses the modified object', function () {
        expect(factory.build().beforeBuild).to.be.true
      })
    })

    context('that do return a value', function () {
      beforeEach(function () {
        factory = new Factory()
          .attr(key, value)
          .afterBuild((object, options) => {
            object.beforeBuild = true
            return { something: 'else' }
          })
      })

      it('uses the returned value', function () {
        expect(factory.build()).to.eql({ something: 'else' })
      })

      it('can run more than once', function () {
        expect(factory.build()).to.eql({ something: 'else' })
        expect(factory.build()).to.eql({ something: 'else' })
      })
    })
  })

  context('attributes', function () {
    beforeEach(function () {
      factory = new Factory().attr(key, value)
      sinon.spy(factory, 'attributes')
    })

    it('calls attributes with the correct arguments', function () {
      factory.build()
      expect(factory.attributes).to.have.been.calledWith({}, {})
    })

    it('calls attributes with the correct arguments', function () {
      factory.build({ attr: 1 }, { opt: 1 })
      expect(factory.attributes).to.have.been.calledWith({ attr: 1 },{ opt: 1 })
    })
  })

  context('afterBuild hooks', function () {
    it('recieve the correct arguments', function () {
      const attributes = { [faker.lorem.word()]: faker.lorem.word() }
      const options = { [faker.lorem.word()]: faker.lorem.word() }
      const hook = sinon.fake()
      new Factory().afterBuild(hook).build(attributes, options)
      expect(hook).to.have.been.calledWith(attributes, options)
    })

    context('that do not return a value', function () {
      beforeEach(function () {
        factory = new Factory()
          .afterBuild((object, options) => {
            object.afterBuild = true
          })
      })

      it('uses the modified object', function () {
        expect(factory.build().afterBuild).to.be.true
      })
    })

    context('that do return a value', function () {
      beforeEach(function () {
        factory = new Factory()
          .afterBuild((object, options) => {
            object.afterBuild = true
            return { something: 'else' }
          })
      })

      it('uses the returned value', function () {
        expect(factory.build().something).to.eql('else')
        expect(factory.build().afterBuild).to.not.exist
      })
    })
  })

  describe('sync and async build hooks', function () {
    beforeEach(function () {
      factory = new Factory().attr('firstName', 'Jon')
    })

    it('returns when hooks are all sync', function () {
      factory.beforeBuild(() => {}).afterBuild(() => {})

      expect(factory.build()).to.eql({ firstName: 'Jon' })
    })

    it('resolves when hooks are all async', async function () {
      factory.beforeBuild(async () => {}).afterBuild(async () => {})

      await expect(factory.build()).to.eventually.eql({ firstName: 'Jon' })
    })

    it('resolves when beforeBuild is sync and afterBuild is async', async function () {
      factory.beforeBuild(() => {}).afterBuild(async () => {})

      await expect(factory.build()).to.eventually.eql({ firstName: 'Jon' })
    })

    it('resolves when beforeBuild is async and afterBuild is sync', async function () {
      factory.beforeBuild(() => {}).afterBuild(async () => {})

      await expect(factory.build()).to.eventually.eql({ firstName: 'Jon' })
    })

    it('can go sync to async to sync again', async function () {
      factory.beforeBuild((attributes) => {
        attributes.firstCall = 'sync'
      }).beforeBuild(async (attributes) => {
        attributes.secondCall = 'async'
      }).beforeBuild((attributes) => {
        attributes.thirdCall = 'sync'
      })

      await expect(factory.build()).to.eventually.eql({
        firstName: 'Jon',
        firstCall: 'sync',
        secondCall: 'async',
        thirdCall: 'sync'
      })
    })
  })
})
