# Rosie

![Rosie the Riveter](http://upload.wikimedia.org/wikipedia/commons/thumb/1/12/We_Can_Do_It%21.jpg/220px-We_Can_Do_It%21.jpg)

Rosie is a factory for building JavaScript objects, mostly useful for setting up test data. It is inspired by [factory_girl](https://github.com/thoughtbot/factory_girl).

## Usage

Define your factory, giving it a name and optionally a constructor function:

    Factory.define('game', Game)
      .sequence('id')
      .attr('is_over', false)
      .attr('created_at', function() { return new Date(); })
      .attr('random_seed', function() { return Math.random(); })
      .attr('players', function() {
        return [
          Factory.attributes('player'),
          Factory.attributes('player')
        ];
      });

    Factory.define('player')
      .sequence('id')
      .sequence('name', function(i) { return 'player' + i; });

    Factory.define('disabled-player').extend('player').attr('state', 'disabled')

Now you can build an object, passing in attributes that you want to override:

    var game = Factory.build('game', {is_over:true});

Which returns an object that looks roughly like:

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

For a factory with a constructor, if you want just the attributes:

    Factory.attributes('game') // return just the attributes
    
You can also define a callback function to be run after building an object:

    Factory.define('coach').after(function(coach, options) { if (options.buildPlayer) { Factory.build('player', {coach_id: coach.id}; } })
    
    Factory.build('coach', {}, {buildPlayer: true});

## Credits

Thanks to [Daniel Morrison](http://twitter.com/danielmorrison/status/58883772040486912) for the name and [Jon Hoyt](http://twitter.com/jonmagic) for inspiration and brainstorming the idea.
