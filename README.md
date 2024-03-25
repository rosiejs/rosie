<a href="http://promisesaplus.com/">
  <img src="https://promises-aplus.github.io/promises-spec/assets/logo-small.png" align="right" valign="top" alt="Promises/A+ logo" />
</a>

# Rosie-As-Promised

Rosie-As-Promised is based on [RosieJS](https://github.com/rosiejs/rosie) and is comptabile with the RosieJS API.  Rosie is inspired by [factory_girl](https://github.com/thoughtbot/factory_girl).


Rosie-As-Promised is a factory for building JavaScript objects, mostly useful for setting up test data. Rosie-As-Promised provides pre and post lifecycle hooks for the build and create steps. These lifecycle hooks can be asynchronous. However, Rosie-As-Promised will remain synchronous until an asynchronous hooks is encountered. Meaning, Rosie-As-Promised maintains compatability with the RosieJS interface by staying synchronous until and asynchronous step is met. All lifecycle hooks can be defined as synchronous or asynchronous. Rosie-As-Promised will only return a promise if one of the lifecycle hooks returns a promise.

To use Rosie-As-Promised you first define a _factory_. The _factory_ is defined in terms of _attributes_, _sequences_, _options_, and _hooks_. A factory can inherit from other factories. Once the factory is defined you use it to build _objects_.

## Contents
- [All Options Example](#all-options-example)
- [Defining a Factory](#factory)
  - [New](#new)
  - [Attribute](#attribute)
  - [Attributes in bulk](#attributes-in-bulk)
  - [Sequential Attribute](#sequential-attributes)
  - [Build Options](#build-options)
  - [Attribute Dependencies](#attribute-dependencies)
  - [Extending Factories](#extending-factories)

- [Using a factory](#using-a-facttry)

### Factory

#### New

Factories are defined by constructing a factory instance. Factories can also be registered view [Factory.define](#define) which allows access to the factory instance through convience methods.

```javascript
// anonymous
const gameFactory = new Factory() // factory
game.attributes() // {}
```

A Factory can be defined with a constructor

```javascript
class Game {}

// anonymous
const gameFactory = new Factory(Game)
game.attributes() instanceOf Object // true
game.build() instanceOf Game // true
```

#### Attribute

```javascript
const gameFactory = new Factory()
  .attr('isOver', false)
  .attr('createdAt', () => new Date())

game.attributes() // { isOver: false, createdAt: [date] }
```

#### Attributes in Bulk

```javascript
const gameFactory = new Factory()
  .attrs({
    isOver: false,
    createdAt: () => new Date()
  })

game.attributes() // { isOver: false, createdAt: [date] }
```

#### Sequential Attributes

```javascript
const gameFactory = new Factory()
  .sequence('id')
  .sequence('slug', (n) => `game-${id}`)

game.attributes() // { id: 1, slug: 'game-1' }
```

#### Build Options

You can specify options that are used to programmatically generate attributes. `numberOfPlayers` is defined as an option, not as an attribute. Therefore `numberOfPlayers` is not part of the output, it is only used to generate the `players` array.

```javascript
const playerFactory = new Factory()
  .attr('position', () => {
    const positions = ['pitcher', 'catcher']
    const index = Math.floor(Math.random() * postitions.length)
    return positions[index]
  })

const gameFactory = new Factory()
  .option('numberOfPlayers', 2)
  .attr('players', ['numberOfPlayers'], (numberOfPlayers) => {
    const players = []
    for (let i = 0; i < numberOfPlayers; i++) {
      players.push(player.attributes())
    }
    return players
  })

game.attributes() // { players: [{ position: /* 'pitcher' or 'catcher' */ }, { position: /* 'pitcher' or 'catcher' */ }] }
```

#### Attribute Dependencies

In this updated example, `id` is defined as a sequence attribute, therefore it appears in the output, and can also be used in the generator function that creates the `players` array.

```javascript
const playerFactory = new Factory()
  .sequence('id')
  .attr('position', ['id'], (id) => {
    const positions = ['pitcher', 'catcher']
    const index = id % 2
    return positions[index]
  })

const gameFactory = new Factory()
  .attr('players', () => {
    return [
      player.attributes(),
      player.attributes()
    ]
  })

gameFactory.attributes() // { players: [{ id: 1, position: 'pitcher' }, { id: 2, position: 'catcher' }] }
```

Attributes can depend on override data passed into `attributes`, `build`, and `create`.

```javascript
const playerFactory = new Factory()
  .sequence('id')
  .attr('position', ['id'], (id) => {
    const positions = ['pitcher', 'catcher', '1st base', '2nd base', '3rd base', 'short stop']
    const index = 
    return positions[id % positions.length]
  })

const gameFactory = new Factory()
  .attr('players', ['players'], (players) => {
    return players.map(player => Factory.attributes(player))
  })

gameFactory.attributes({ players: [{ position: 'pitcher' }, { position: 'short stop' }] }) // { players: [{ id: 1, position: 'pitcher' }, { id: 2, position: 'short stop' }] }
```

#### Extending a Factory

Extend a factory to share configuration or to create specific factories

```javascript
const playerFactory = new Factory()
  .sequence('id')
  .attr('isRetired', false)
  .attr('position', ['id'], (id) => {
    const positions = ['pitcher', 'catcher', '1st base', '2nd base', '3rd base', 'short stop']
    const index = 
    return positions[id % positions.length]
  })

  const retiredPlayerFactory = new Factory()
    .extend(player)
    .attr('isRetired', true)

playerFactory.attributes() // { id: 1, isRetired: false, position: 'catcher' }
retiredPlayerFactory.attributes() // { id: 1, isRetired: true, position: 'catcher' }
```
-----

### Using a Factory

```javascript
class Player {}

const playerFactory = new Factory(Player)
  .sequence('id')
  .attr('isRetired', false)
  .attr('position', ['id'], (id) => {
    const positions = ['pitcher', 'catcher', '1st base', '2nd base', '3rd base', 'short stop']
    const index = 
    return positions[id % positions.length]
  })
```

#### Attributes

```javascript
playerFactory.attributes()          // { id: 1, isRetired: false, position: 'catcher' }
playerFactory.attributes({ id: 4 }) // { id: 4, isRetired: false, position: '3rd base' }
```

#### Build

```javascript
playerFactory.build()          // Player { id: 1, isRetired: false, position: 'catcher' }
playerFactory.build({ id: 4 }) // Player { id: 4, isRetired: false, position: '3rd base' }
```

#### Create

The `onCreateHandler` is registered in the factory definition. The `.create` method exists as an inflection point to allow for [beforeCreate]() and [afterCreate]() hooks to be registered.

```javascript
playerFactory.onCreate((object, options) => {
  // perform sync or async work
  object.createLifeCycleWorkPerformedAt = new Date()
})

await playerFactory.create()                    // Player { id: 3, isRetired: false, position: '2nd base', createLifeCycleWorkPerformedAt: [date] }
await playerFactory.create({ isRetired: true }) // Player { id: 4, isRetired: true, position: '3rd base', createLifeCycleWorkPerformedAt: [date] }
```

### Lifecycle Hooks

Multiple callbacks can be registered, and they will be executed in the order they are registered. The callbacks can manipulate the built object before it is returned to the callee.

If the callback doesn't return anything, rosie will return build object as final result. If the callback returns a value, rosie will use that as final result instead.

#### beforeBuild
chain method to register hooks to run before objects are built

```javascript
const teamFactory = new Factory()
  .sequence('id')
  .sequence('name', (n) => `team-${n}`)

const playerFactory
  .sequence('teamId')
  .attr('team', ['teamId'], (teamId) => team.attributes({ id: teamId }))
  .beforeBuild((attributes, options) => {
    if (attributes?.team?.id) attributes.teamId = attributes.team.id
  })

const team = teamFactory.build({ id: 12 })
player.build({ team }) // Player { id: 1, isRetired: false, position: 'catcher', teamId: 12, team: { id: 12, name: 'team-12' } }
```

#### after

alias for [afterBuild](#afterbuild) to maintain backwards compatibility 

#### afterBuild
chain method to register hooks to run after objects are built

```javascript
const playerFactory
  .sequence('teamId')

const teamFactory = new Factory()
  .sequence('id')
  .sequence('name', (n) => `team-${n}`)
  .attrs('players', ['id'], (teamId) => {
    const count = Math.floor(Math.random() * 4) + 1 // up to 4
    const players = []
    for (let i=0; i<count; i++){
      players.push(playerFactory.build(( teamId ))
    }
    return players
  })
  .afterbuild((object, options) => {
    object.playerCount = object.players.length
  })

teamFactory.build() // { id: 1, name: 'team-1', players: [ { teamId: 1, /* ... */}, { teamId: 1, /* ... */}, { teamId: 1, /* ... */} ], playerCount: 3 }
```

#### beforeCreate
chain method to register hooks to run before the create hook is called

```javascript
async function isSlugUnique (slug) {
  // check data store for uniqueness
}

const teamFactory = new Factory()
  .sequence('id')
  .sequence('name', 'blue jays')
  .sequence('slug', ['name'], (name) => name.slice(0, 4))
  .beforeCreate(async (object, options) => {
    let i = 0
    let strSlug = object.slug

    while (await isSlugUnique(strSlug) === false) {
      strSlug = object.slug + `-${i++}`
    }

    object.slug = strSlug
  })

await teamFactory.create({ name: 'blue hornets'}) // { ..., slug: 'blue', ... }
await teamFactory.create({ name: 'blue birds' })  // { ..., slug: 'blue-0', ... }
```

#### onCreate
builder method to register the "create" functionality for the factory

```javascript
const dbRecordFactory = new Factory()
  .onCreate(async (object, options) => {
    object = await persistToDataStore(object)
  })

const teamFactory = new Factory()
  .extend(dbRecordFactory)
  .sequence('name', 'blue jays')

await teamFactory.create({ name: 'blue hornets'}) // { id: 1, name: 'blue hornets', createdAt: [date], updatedAt: [date], _version: 1 }
```

#### afterCreate
factory builder chain method to register hooks to run after the onCreateHandler is called

```javascript
const gameFactory = new Factory()
  .extend(dbRecordFactory)
  .attr('matchDate', () => new Date())
  .attr('homeTeamId', () => Factory.create('team').then(r => r.id)
  .attr('awayTeamId', () => Factory.create('team').then(r => r.id)
  .afterCreate((object, options) => {
    object = await hydrateRelationships(object)
  })

await gameFactory.create() // Game { id: 1, ..., homeTeam: Team { players: [ Player {}, Player {} ] }, awayTeam: Team { players: [ Player {}, Player {} ] } }
```

### Convenience Methods

```javascript
class Game {}
```

#### Factory.define

```javascript
Factory.define('Game', Game)
// is equivalent to
Factory.factories['Game'] = new Factory(Game)
```

#### Factory.attributes

```javascript
Factory.attributes('Game', attributes, options)
// is equivalent to
Factory.factories['Game'].attributes(attributes, options)
```

#### Factory.build

```javascript
Factory.build('Game', attributes, options)
// is equivalent to
Factory.factories['Game'].build(attributes, options)
```

#### Factory.buildList

```javascript
Factory.buildList('Game', number, attributes, options)
// is equivalent to
Factory.factories['Game'].buildList(number, attributes, options)
```

#### Factory.create

```javascript
Factory.create('Game', attributes, options)
// is equivalent to
Factory.factories['Game'].create(attributes, options)
```

#### Factory.createList

```javascript
Factory.createList('Game', number, attributes, options)
// is equivalent to
Factory.factories['Game'].createList(number, attributes, options)
```

## Usage in Node.js

To use Rosie in node, you'll need to import it first:

```js
import { Factory } from 'rosie';
// or with `require`
const Factory = require('rosie').Factory

require('./factories') // folder with factory defintions

module.exports { Factory }
```

You might also choose to use unregistered factories, as it fits better with node's module pattern:

```js
// factories/game.js
import { Factory } from 'rosie';

export default new Factory().sequence('id').attr('is_over', false);
// etc
```

To use the unregistered `Game` factory defined above:

```js
import Game from './factories/game';

const game = Game.build({ is_over: true });
```

A tool like [babel](https://babeljs.io) is currently required to use this syntax.

You can also extend an existing unregistered factory:

```js
// factories/scored-game.js
import { Factory } from 'rosie';
import Game from './game';

export default new Factory().extend(Game).attrs({
  score: 10,
});
```

## Rosie API

As stated above the rosie factory signatures can be broken into factory definition and object creation.

Additionally factories can be defined and accessed via the Factory singleton, or they can be created and maintained by the callee.

### Factory declaration functions

Once you have an instance returned from a `Factory.define` or a `new Factory()` call, you do the actual of work of defining the objects. This is done using the methods below (note these are typically chained together as in the examples above):

#### Factory.define

- **Factory.define(`factory_name`)** - Defines a factory by name. Return an instance of a Factory that you call `.attr`, `.option`, `.sequence`, and `.after` on the result to define the properties of this factory.
- **Factory.define(`factory_name`, `constructor`)** - Optionally pass a constuctor function, and the objects produced by `.build` will be passed through the `constructor` function.

#### instance.attr:

Use this to define attributes of your objects

- **instance.attr(`attribute_name`, `default_value`)** - `attribute_name` is required and is a string, `default_value` is the value to use by default for the attribute
- **instance.attr(`attribute_name`, `generator_function`)** - `generator_function` is called to generate the value of the attribute
- **instance.attr(`attribute_name`, `dependencies`, `generator_function`)** - `dependencies` is an array of strings, each string is the name of an attribute or option that is required by the `generator_function` to generate the value of the attribute. This list of `dependencies` will match the parameters that are passed to the `generator_function`

#### instance.attrs:

Use this as a convenience function instead of calling `instance.attr` multiple times

- **instance.attrs(`{attribute_1: value_1, attribute_2: value_2, ...}`)** - `attribute_i` is a string, `value_i` is either an object or generator function.

See `instance.attr` above for details. Note: there is no way to specify dependencies using this method, so if you need that, you should use `instance.attr` instead.

#### instance.option:

Use this to define options. Options do not appear in the generated object, but they can be used in a `generator_function` that is used to configure an attribute or sequence that appears in the generated object. See the [Programmatic Generation Of Attributes](#programmatic-generation-of-attributes) section for examples.

- **instance.option(`option_name`, `default_value`)** - `option_name` is required and is a string, `default_value` is the value to use by default for the option
- **instance.option(`option_name`, `generator_function`)** - `generator_function` is called to generate the value of the option
- **instance.option(`option_name`, `dependencies`, `generator_function`)** - `dependencies` is an array of strings, each string is the name of an option that is required by the `generator_function` to generate the value of the option. This list of `dependencies` will match the parameters that are passed to the `generator_function`

#### instance.sequence:

Use this to define an auto incrementing sequence field in your object

- **instance.sequence(`sequence_name`)** - define a sequence called `sequence_name`, set the start value to 1
- **instance.sequence(`sequence_name`, `generator_function`)** - `generator_function` is called to generate the value of the sequence. When the `generator_function` is called the pre-incremented sequence number will be passed as the first parameter, followed by any dependencies that have been specified.
- **instance.sequence(`sequence_name`, `dependencies`, `generator_function`)** - `dependencies` is an array of strings, each string is the name of an attribute or option that is required by the `generator_function` to generate the value of the option. The value of each specified dependency will be passed as parameters 2..N to the `generator_function`, noting again that the pre-incremented sequence number is passed as the first parameter.

#### instance.after:

- **instance.after(`callback`)** - register a `callback` function that will be called at the end of the object build process. The `callback` is invoked with two params: (`build_object`, `object_options`). See the [Post Build Callback](#post-build-callback) section for examples.

### Object building functions

#### build

Returns an object that is generated by the named factory. `attributes` and `options` are optional parameters. The `factory_name` is required when calling against the rosie Factory singleton.

- **Factory.build(`factory_name`, `attributes`, `options`)** - when build is called against the rosie Factory singleton, the first param is the name of the factory to use to build the object. The second is an object containing attribute override key value pairs, and the third is a object containing option key value pairs
- **instance.build(`attributes`, `options`)** - when build is called on a factory instance only the `attributes` and `options` objects are necessary

#### buildList

Identical to `.build` except it returns an array of built objects. `size` is required, `attributes` and `options` are optional

- **Factory.buildList(`factory_name`, size, `attributes`, `options`)** - when buildList is called against the rosie Factory singleton, the first param is the name of the factory to use to build the object. The `attributes` and `options` behave the same as the call to `.build`.
- **instance.buildList(size, `attributes`, `options`)** - when buildList is called on a factory instance only the size, `attributes` and `options` objects are necessary (strictly speaking only the size is necessary)

### Testing

You may find `resetAll` useful when working with testing frameworks such as Jest. It resets any build state, such as sequences, to their original values:

```js
import Factory from 'rosie';

beforeEach(() => {
  Factory.resetAll();
});
```

Or call `reset` on a specific factory:

```js
import Game from './game';

beforeEach(() => {
  Game.reset();
});
```

## Contributing

1.  Fork it
1.  Create your feature branch (`git checkout -b my-new-feature`)
1.  Install the test dependencies (`npm install` - requires NodeJS)
1.  Make your changes and make sure the tests pass (`npm test`)
1.  Commit your changes (`git commit -am 'Added some feature'`)
1.  Push to the branch (`git push origin my-new-feature`)
1.  Create new Pull Request

## Credits

Thanks to [Daniel Morrison](http://twitter.com/danielmorrison/status/58883772040486912) for the name and [Jon Hoyt](http://twitter.com/jonmagic) for inspiration and brainstorming the idea.
