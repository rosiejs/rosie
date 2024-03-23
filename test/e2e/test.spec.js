const { Factory } = require('../../')
const { expect } = require('chai')
const { faker } = require('@faker-js/faker')
const sinon = require('sinon')

describe('not sure yet', function () {
  const tick = () => new Promise((res) => setImmediate(res))

  class BaseModel {
    constructor (attrs) {
      for (const attr in attrs) {
        this[attr] = attrs[attr]
      }
    }

    async save () {
      return tick().then(() => this)
    }
  }

  class User extends BaseModel { }
  class Post extends BaseModel { }
  class Comment extends BaseModel { }

  let user, userTwo, post, comment

  beforeEach(async function () {
    Factory
      .define('Record')
      .attr('createdAt', () => faker.date.recent())
      .attr('updatedAt', () => faker.date.recent())
      .onCreate((record) => record.save())

    Factory
      .define('Post', Post)
      .extend('Record')
      .attr('content', () => faker.lorem.paragraphs())
      .option('commentsCount', 2)
      .attr('comments', ['postsCount'], (count) => Factory.buildList('Comment', count))
      .sequence('authorId')
      .attr('author', ['authorId'], (id) => Factory.build('User', { id }))
      .beforeBuild((attributes, options) => {
        if (attributes.author) attributes.authorId = attributes.author.id
      })

    Factory
      .define('User', User)
      .extend('Record')
      .attr('firstName', () => faker.person.firstName())
      .attr('lastName', () => faker.person.lastName())
      .attr('email', ['firstName', 'lastName'], (firstName, lastName) => faker.internet.exampleEmail({ firstName, lastName }))

    Factory
      .define('Comment', Comment)
      .extend('Record')
      .attr('content', () => faker.lorem.paragraphs())
      .sequence('authorId')
      .attr('author', ['authorId'], (id) => Factory.build('User', { id }))
      .beforeBuild((attributes, options) => {
        if (attributes.author) attributes.authorId = attributes.author.id
      })

    user = Factory.build('User')
    userTwo = await Factory.create('User')
    comment = await Factory.create('Comment', { author: userTwo })
    post = await Factory.create('Post', { author: user, comments: [ comment ] })
  })

  it('one', function () {
    expect(post.author.id).to.eql(user.id)
  })

  it('two', function () {
    expect(post.comments[0].id).to.eql(comment.id)
    expect(post.comments[0].authorId).to.eql(comment.authorId)
    expect(post.comments[0].author).to.eql(userTwo)
  })
})
