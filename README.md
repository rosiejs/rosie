# Rosie

![Rosie the Riveter](http://upload.wikimedia.org/wikipedia/commons/thumb/1/12/We_Can_Do_It%21.jpg/220px-We_Can_Do_It%21.jpg)

Rosie is a factory for building JavaScript objects, mostly useful for setting up test data. It is inspired by [factory_girl](https://github.com/thoughtbot/factory_girl).

## Usage

Define your factory, giving it a name and optionally a constructor function:

```js
Factory.define('game', Game)
  .sequence('id')
  .attr('is_over', false)
  .attr('created_at', function() { return new Date(); })
  .attr('random_seed', function() { return Math.random(); })

  // Default to two players. If players were given, fill in
  // whatever attributes might be missing.
  .attr('players', ['players'], function(players) {
    if (!players) { players = [{}, {}]; }
    return players.map(function(data) {
      return Factory.attributes('player', data);
    });
  });

Factory.define('player')
  .sequence('id')
  .sequence('name', function(i) { return 'player' + i; })

  // Define `position` to depend on `id`.
  .attr('position', ['id'], function(id) {
    var positions = ['pitcher', '1st base', '2nd base', '3rd base'];
    return positions[id % positions.length];
  });

Factory.define('disabled-player').extend('player').attr('state', 'disabled')
```

Now you can build an object, passing in attributes that you want to override:

```js
var game = Factory.build('game', {is_over:true});
```

Which returns an object that looks roughly like:

```js
{
    id:           1,
    is_over:      true,   // overriden when building
    created_at:   Fri Apr 15 2011 12:02:25 GMT-0400 (EDT),
    random_seed:  0.8999513240996748,
    players: [
                {id: 1, name:'Player 1'},
                {id: 2, name:'Player 2'}
    ]
}
````

For a factory with a constructor, if you want just the attributes:

```js
Factory.attributes('game') // return just the attributes
```

You can also define a callback function to be run after building an object:

```js
Factory.define('coach')
  .option('buildPlayer', false)
  .sequence('id')
  .attr('players', ['id', 'buildPlayer'], function(id, buildPlayer) {
    if (buildPlayer) {
      return [Factory.build('player', {coach_id: id})];
    }
  })
  .after(function(coach, options) {
    if (options.buildPlayer) {
      console.log('built player:', coach.players[0]);
    }
  });

Factory.build('coach', {}, {buildPlayer: true});
```

## Contributing

0. Fork it
0. Create your feature branch (`git checkout -b my-new-feature`)
0. Install the test dependencies (`script/bootstrap` - requires NodeJS and npm)
0. Make your changes and make sure the tests pass (`npm test`)
0. Commit your changes (`git commit -am 'Added some feature'`)
0. Push to the branch (`git push origin my-new-feature`)
0. Create new Pull Request

## Credits

Thanks to [Daniel Morrison](http://twitter.com/danielmorrison/status/58883772040486912) for the name and [Jon Hoyt](http://twitter.com/jonmagic) for inspiration and brainstorming the idea.
