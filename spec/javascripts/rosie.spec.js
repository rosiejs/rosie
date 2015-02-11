describe('Factory', function() {
  afterEach(function() {
    Factory.factories = {};
  });

  describe('build', function() {
    describe('with a normal constructor', function() {
      var Thing = function(attrs) {
        for(var attr in attrs) {
          this[attr] = attrs[attr];
        }
      };

      beforeEach(function() {
        Factory.define('thing', Thing).attr('name', 'Thing 1').after(function(obj) {
          obj.afterCalled = true;
        });
      });

      it('should return a new instance of that constructor', function() {
        expect(Factory.build('thing') instanceof Thing).toBe(true);
        expect(Factory.build('thing').constructor).toBe(Thing);
      });

      it('should set attributes', function() {
        expect(Factory.build('thing')).toEqual({name: 'Thing 1', afterCalled: true});
      });

      describe('running callbacks', function() {
        beforeEach(function() {
          Factory.define('thing', Thing).option('isAwesome', true).after(function(obj, options) {
            obj.afterCalled = true;
            obj.isAwesomeOption = options.isAwesome;
          });
        });

        it('should run callbacks', function() {
          expect(Factory.build('thing').afterCalled).toBe(true);
        });

        it('should pass options to the after callback', function(){
          expect(Factory.build('thing').isAwesomeOption).toBe(true); 
        });
      });
    });

    describe('with a constructor with a .create() function', function() {
      var afterArgs;
      var createArgs;
      var built;
      var created;

      // i.e. an Ember class
      var Thing = {
        create: function() {
          createArgs = [].slice.call(arguments);
          created = {};
          return created;
        }
      };

      beforeEach(function() {
        createArgs = afterArgs = null;
        Factory.define('thing', Thing).attr('name', 'Thing 1').after(function() {
          afterArgs = [].slice.call(arguments);
        });
        built = Factory.build('thing');
      });

      it('should run callbacks', function() {
        expect(afterArgs).toEqual([created, {}]);
      });

      it('should call .create on the class with the attributes', function() {
        expect(createArgs).toEqual([{name: 'Thing 1'}]);
      });

      it('should return the value returned by create', function() {
        expect(created).toBe(built);
      });
    });

    describe('without a constructor', function() {
      beforeEach(function() {
        Factory.define('thing').attr('name', 'Thing 1');
      });

      it('should return object with attributes set', function() {
        expect(Factory.build('thing')).toEqual({name:'Thing 1'});
      });

      it('should allow overriding attributes', function() {
        expect(Factory.build('thing', {name:'changed'})).toEqual({name:'changed'});
      });

      it('throws error if the factory is not defined', function() {
        expect(function(){Factory.build('nothing')})
          .toThrow('The "nothing" factory is not defined.');
      });
    });
  });

  describe('buildList', function () {
    beforeEach(function() {
      Factory.define('thing').attr('name', 'Thing 1');
    });

    it('should return array of objects', function() {
       expect(Factory.buildList('thing', 10).length).toEqual(10);
    });

    it('should return array of objects with default attributes', function() {
      var things = Factory.buildList('thing', 10);
      for(var i = 0; i < 10; i++) {
        expect(things[i]).toEqual({name: 'Thing 1'});
      }
    });

    it('should return array of objects with specified attributes', function() {
      var things = Factory.buildList('thing', 10, {name:'changed'});
      for(var i = 0; i < 10; i++) {
        expect(things[i]).toEqual({name: 'changed'});
      }
    });

    it('should return an array of objects with a sequence', function() {
      Factory.define('thing').sequence('id');
      var things = Factory.buildList('thing', 4);
      for(var i = 0; i < 4; i++) {
        expect(things[i]).toEqual({id: i + 1});
      }
    });

    it('should return an array of objects with a sequence and with specified attributes', function() {
      Factory.define('thing').sequence('id').attr('name', 'Thing 1');
      var things = Factory.buildList('thing', 4, {name: 'changed'});
      for(var i = 0; i < 4; i++) {
        expect(things[i]).toEqual({id: i + 1, name: 'changed'});
      }
    });
  });

  describe('extend', function() {
    var Thing = function(attrs) {
      for(var attr in attrs) {
        this[attr] = attrs[attr];
      }
    };
    var Thingy = function(attrs) {
      for(var attr in attrs) {
        this[attr] = attrs[attr];
      }
    };

    beforeEach(function() {
      Factory.define('thing', Thing).attr('name', 'Thing 1').after(function(obj) {
        obj.afterCalled = true;
      });
      Factory.define('anotherThing').extend('thing').attr('title', 'Title 1');
      Factory.define('differentThing', Thingy).extend('thing').attr('title', 'Title 1');
    });

    it('should extend the constructor', function() {
      expect(Factory.build('anotherThing') instanceof Thing).toBe(true);
      expect(Factory.build('differentThing') instanceof Thingy).toBe(true);
    });

    it('should extend attributes', function() {
      expect(Factory.build('anotherThing')).toEqual({name:'Thing 1', title:'Title 1', afterCalled: true});
    });

    it('should extend callbacks', function() {
      expect(Factory.build('anotherThing').afterCalled).toBe(true);
    });
  });

  describe('attributes', function() {
    beforeEach(function() {
      Factory.define('thing').attr('name', 'Thing 1');
    });

    it('should return object with attributes set', function() {
      expect(Factory.attributes('thing')).toEqual({name:'Thing 1'});
    });

    it('should allow overriding attributes', function() {
      expect(Factory.attributes('thing', {name:'changed'})).toEqual({name:'changed'});
    });
  });

  describe('prototype', function() {
    var factory;

    beforeEach(function() {
      factory = new Factory();
    });

    describe('attr', function() {
      it('should add given value to attributes', function() {
        factory.attr('foo', 'bar');
        expect(factory.attributes().foo).toEqual('bar');
      });

      it('should invoke function', function() {
        var calls = 0;
        factory.attr('dynamic', function() { return ++calls; });
        expect(factory.attributes().dynamic).toEqual(1);
        expect(factory.attributes().dynamic).toEqual(2);
      });

      it('should return the factory', function() {
        expect(factory.attr('foo', 1)).toBe(factory);
      });

      it('should allow depending on other attributes', function() {
        factory
          .attr('fullName', ['firstName', 'lastName'], function(first, last) {
            return first + ' ' + last;
          })
          .attr('firstName', 'Default')
          .attr('lastName', 'Name');

        expect(factory.attributes())
          .toEqual({
            firstName: 'Default',
            lastName: 'Name',
            fullName: 'Default Name'
          });

        expect(factory.attributes({ firstName: 'Michael', lastName: 'Bluth' }))
          .toEqual({
            fullName: 'Michael Bluth',
            firstName: 'Michael',
            lastName: 'Bluth'
          });

        expect(factory.attributes({ fullName: 'Buster Bluth' }))
          .toEqual({
            fullName: 'Buster Bluth',
            firstName: 'Default',
            lastName: 'Name'
          });
      });

      it('throws when building when a dependency cycle is unbroken', function() {
        factory
          .option('rate', 0.0275)
          .attr('fees', ['total', 'rate'], function(total, rate){ return total * rate; })
          .attr('total', ['fees', 'rate'], function(fees, rate){ return fees / rate; });

        expect(function(){ factory.build(); }).toThrow('detected a dependency cycle: fees -> total -> fees');
      });

      it('always calls dynamic attributes when they depend on themselves', function() {
        factory.attr('person', ['person'], function(person) {
          if (!person) { person = {}; }
          if (!person.name) { person.name = 'Bob'; }
          return person;
        });

        expect(factory.attributes({ person: { age: 55 }})).toEqual({
          person: { name: 'Bob', age: 55 }
        });
      });
    });

    describe('sequence', function() {
      it('should return the factory', function() {
        expect(factory.sequence('id')).toBe(factory);
      });

      it('should return an incremented value for each invocation', function() {
        factory.sequence('id');
        expect(factory.attributes().id).toEqual(1);
        expect(factory.attributes().id).toEqual(2);
        expect(factory.attributes().id).toEqual(3);
      });

      it('should increment different sequences independently', function() {
        factory.sequence('id');
        factory.sequence('count');

        expect(factory.attributes()).toEqual({id: 1, count: 1});
        expect(factory.attributes()).toEqual({id: 2, count: 2});
      });

      it('should share the sequence when extending a factory', function() {
        var User = Factory.define('User').sequence('id');
        var AdminUser = Factory.define('AdminUser').extend('User');

        var adminUser = AdminUser.build();
        var user = User.build();

        expect(adminUser.id).toEqual(1);
        expect(user.id).toEqual(2);
      });

      it('should use custom function', function() {
        factory.sequence('name', function(i) { return 'user' + i; });
        expect(factory.attributes().name).toEqual('user1');
      });

      it('should be able to depend on one option', function() {
        var startTime = 5;

        factory.option('startTime', startTime).sequence('time', ['startTime'], function(i, startTime) {
          return startTime + i;
        });

        expect(factory.attributes()).toEqual({time: startTime + 1});
        expect(factory.attributes()).toEqual({time: startTime + 2});
        expect(factory.attributes()).toEqual({time: startTime + 3});
      });

      it('should be able to depend on one attribute', function() {
        var startTime = 5;

        factory.attr('startTime', startTime).sequence('time', ['startTime'], function(i, startTime) {
          return startTime + i;
        });

        expect(factory.attributes()).toEqual({startTime: startTime, time: startTime + 1});
        expect(factory.attributes()).toEqual({startTime: startTime, time: startTime + 2});
        expect(factory.attributes()).toEqual({startTime: startTime, time: startTime + 3});
      });

      it('should be able to depend on several attributes and options', function() {
        var startTime = 5;
        var endTime = 7;

        factory
          .attr('startTime', startTime)
          .attr('endTime', endTime)
          .option('checkEndTime', true)
          .sequence('time', ['startTime', 'endTime', 'checkEndTime'], function(i, startTime, endTime, checkEndTime) {
            return checkEndTime ? Math.min(startTime + i, endTime) : startTime + i;
        });

        expect(factory.attributes()).toEqual({startTime: startTime, endTime: endTime, time: startTime + 1});
        expect(factory.attributes()).toEqual({startTime: startTime, endTime: endTime, time: startTime + 2});
        expect(factory.attributes()).toEqual({startTime: startTime, endTime: endTime, time: startTime + 2});
      });
    });

    describe('attributes', function() {
      beforeEach(function() {
        factory.attr('foo', 1).attr('bar', 2);
      });

      it('should allow overriding an attribute', function() {
        expect(factory.attributes({bar:3})).toEqual({foo:1, bar:3});
      });

      it('should allow overriding an attribute with a falsy value', function() {
        expect(factory.attributes({bar:false})).toEqual({foo:1, bar:false});
      });

      it('should allow adding new attributes', function() {
        expect(factory.attributes({baz:3})).toEqual({foo:1, bar:2, baz:3});
      });
    });

    describe('option', function() {
      beforeEach(function() {
        factory.option('useCapsLock', false);
      });

      it('should return the factory', function() {
        expect(factory.option('rate')).toBe(factory);
      });

      it('should not create attributes in the build result', function() {
        expect(factory.attributes().useCapsLock).toBeUndefined();
      });

      it('throws when no default or value is given', function() {
        factory.option('someOptionWithoutAValue');
        expect(function(){ factory.attributes(); }).toThrow('option `someOptionWithoutAValue` has no default value and none was provided');
      });

      it('should be usable by attributes', function() {
        var useCapsLockValues = [];
        factory.attr('name', ['useCapsLock'], function(useCapsLock) {
          useCapsLockValues.push(useCapsLock);
          var name = 'Madeline';
          if (useCapsLock) {
            return name.toUpperCase();
          } else {
            return name;
          }
        });
        // use default values
        expect(factory.attributes().name).toEqual('Madeline');
        // override default values
        expect(factory.attributes({}, { useCapsLock: true }).name).toEqual('MADELINE');
        expect(useCapsLockValues).toEqual([false, true]);
      });
    });
  });
});
