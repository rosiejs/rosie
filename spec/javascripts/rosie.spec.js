describe('Factory', function() {
  afterEach(function() {
    Factory.factories = {};
  });

  describe('build', function() {
    describe('with a normal constructor', function() {
      var Thing = function(attrs) {
        for (var attr in attrs) {
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
        expect(Factory.build('thing')).toEqual(jasmine.objectContaining({name: 'Thing 1', afterCalled: true}));
      });

      describe('running callbacks', function() {
        describe('callbacks do not return value', function() {
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

        describe('callbacks return new object', function() {
          beforeEach(function() {
            Factory.define('thing', Thing).option('isAwesome', true).attr('name', 'Thing 1').after(function(obj, options) {
              return {
                afterCalled: true,
                isAwesomeOption: options.isAwesome,
                wrapped: obj
              };
            });
          });

          it('should run callbacks', function() {
            expect(Factory.build('thing').afterCalled).toBe(true);
          });

          it('should pass options to the after callback', function(){
            expect(Factory.build('thing').isAwesomeOption).toBe(true);
          });

          it('should return object from callback as the final result', function() {
            expect(Factory.build('thing')).toEqual({
              afterCalled: true,
              isAwesomeOption: true,
              wrapped: new Thing({
                name: 'Thing 1'
              })
            });
          });
        });
      });

      describe('using attrs convenience function', function() {
        beforeEach(function() {
          Factory.define('thing', Thing).attrs({
            name: 'Thing 1',
            attr1: 'value1',
            attr2: 'value2'
          });
        });

        it('should set attributes', function() {
          var thing = Factory.build('thing');
          expect(thing).toEqual(jasmine.objectContaining({name: 'Thing 1', attr1: 'value1', attr2: 'value2'}));
        });
      })
    });

    describe('without a constructor', function() {
      beforeEach(function() {
        Factory.define('thing').attr('name', 'Thing 1');
      });

      it('should return object with attributes set', function() {
        expect(Factory.build('thing')).toEqual({name: 'Thing 1'});
      });

      it('should allow overriding attributes', function() {
        expect(Factory.build('thing', {name: 'changed'})).toEqual({name: 'changed'});
      });

      it('throws error if the factory is not defined', function() {
        expect(function(){ Factory.build('nothing'); })
          .toThrowError(Error, 'The "nothing" factory is not defined.');
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
      for (var i = 0; i < 10; i++) {
        expect(things[i]).toEqual({name: 'Thing 1'});
      }
    });

    it('should return array of objects with specified attributes', function() {
      var things = Factory.buildList('thing', 10, {name: 'changed'});
      for (var i = 0; i < 10; i++) {
        expect(things[i]).toEqual({name: 'changed'});
      }
    });

    it('should return an array of objects with a sequence', function() {
      Factory.define('thing').sequence('id');
      var things = Factory.buildList('thing', 4);
      for (var i = 0; i < 4; i++) {
        expect(things[i]).toEqual({id: i + 1});
      }
    });

    it('should return an array of objects with a sequence and with specified attributes', function() {
      Factory.define('thing').sequence('id').attr('name', 'Thing 1');
      var things = Factory.buildList('thing', 4, {name: 'changed'});
      for (var i = 0; i < 4; i++) {
        expect(things[i]).toEqual({id: i + 1, name: 'changed'});
      }
    });

    it('should evaluate a option for every member of the list', function() {
      Factory.define('thing')
        .option('random', function() { return Math.random(); })
        .attr('number', ['random'], function(random) {
          return random;
        });
      var things = Factory.buildList('thing', 2, {}, {});
      expect(things[0].number).not.toEqual(things[1].number);
    });

    describe('with an unregistered factory', function() {
      var Other = new Factory().attr('name', 'Other 1');

      it('should return array of objects', function() {
        expect(Other.buildList(10).length).toEqual(10);
      });

      it('should return array of objects with default attributes', function() {
        var list = Other.buildList(10);
        list.forEach(function(item) {
          expect(item).toEqual({name: 'Other 1'});
        });
      });

      it('should reutrn array of objects with specified attributes', function() {
        var list = Other.buildList(10, {name: 'changed'});
        list.forEach(function(item) {
          expect(item).toEqual({name: 'changed'});
        });
      });

      it('should return an array of objects with a sequence', function() {
        var Another = new Factory().sequence('id');
        var list = Another.buildList(4);
        list.forEach(function(item, idx) {
          expect(item).toEqual({id: idx + 1});
        });
      });

      it('should return an array of objects with a sequence and with specified attributes', function() {
        var Another = new Factory().sequence('id').attr('name', 'Another 1');
        var list = Another.buildList(4, {name: 'changed'});
        list.forEach(function(item, idx) {
          expect(item).toEqual({id: idx + 1, name: 'changed'});
        });
      });

      it('should evaluate an option for every member of the list', function() {
        var Another = new Factory()
            .option('random', Math.random)
            .attr('number', ['random'], function(random) {
              return random;
            });
        var list = Another.buildList(2, {}, {});
        expect(list[0].number).not.toEqual(list[1].number);
      });
    });
  });

  describe('extend', function() {
    var Thing = function(attrs) {
      for (var attr in attrs) {
        this[attr] = attrs[attr];
      }
    };
    var Thingy = function(attrs) {
      for (var attr in attrs) {
        this[attr] = attrs[attr];
      }
    };

    describe('with registered factories', function() {
      beforeEach(function() {
        Factory.define('thing', Thing).attr('name', 'Thing 1').after(function(obj) {
          obj.afterCalled = true;
        });
        Factory.define('anotherThing').extend('thing').attr('title', 'Title 1');
        Factory.define('differentThing', Thingy).extend('thing').attr('name', 'Different Thing');
      });

      it('should extend the constructor', function() {
        expect(Factory.build('anotherThing') instanceof Thing).toBe(true);
        expect(Factory.build('differentThing') instanceof Thingy).toBe(true);
      });

      it('should extend attributes', function() {
        expect(Factory.build('anotherThing')).toEqual(jasmine.objectContaining({name: 'Thing 1', title: 'Title 1', afterCalled: true}));
      });

      it('should extend callbacks', function() {
        expect(Factory.build('anotherThing').afterCalled).toBe(true);
      });

      it('should override attributes', function() {
        expect(Factory.build('differentThing').name).toBe('Different Thing');
      });
    });

    describe('with unregistered factories', function() {
      var ParentFactory;
      var ChildFactory;
      var SiblingFactory;

      beforeEach(function() {
        ParentFactory = new Factory(Thing).attr('name', 'Parent').after(function(obj) {
          obj.afterCalled = true;
        });
        ChildFactory = new Factory().extend(ParentFactory).attr('title', 'Child');
        SiblingFactory = new Factory(Thingy).extend(ParentFactory).attr('name', 'Sibling');
      });

      it('should extend the constructor', function() {
        expect(ChildFactory.build() instanceof Thing).toBe(true);
        expect(SiblingFactory.build() instanceof Thingy).toBe(true);
      });

      it('should extend attributes', function() {
        expect(ChildFactory.build()).toEqual(jasmine.objectContaining({name: 'Parent', title: 'Child', afterCalled: true}));
      });

      it('should extend callbacks', function() {
        expect(SiblingFactory.build().afterCalled).toBe(true);
      });

      it('should override attributes', function() {
        expect(SiblingFactory.build().name).toBe('Sibling');
      });
    });
  });

  describe('attributes', function() {
    beforeEach(function() {
      Factory.define('thing').attr('name', 'Thing 1');
    });

    it('should return object with attributes set', function() {
      expect(Factory.attributes('thing')).toEqual({name: 'Thing 1'});
    });

    it('should allow overriding attributes', function() {
      expect(Factory.attributes('thing', {name: 'changed'})).toEqual({name: 'changed'});
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

        expect(function(){ factory.build(); }).toThrowError(Error, 'detected a dependency cycle: fees -> total -> fees');
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
        expect(factory.attributes({bar: 3})).toEqual({foo: 1, bar: 3});
      });

      it('should allow overriding an attribute with a falsy value', function() {
        expect(factory.attributes({bar: false})).toEqual({foo: 1, bar: false});
      });

      it('should allow adding new attributes', function() {
        expect(factory.attributes({baz: 3})).toEqual({foo: 1, bar: 2, baz: 3});
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
        expect(function(){ factory.attributes(); }).toThrowError(Error, 'option `someOptionWithoutAValue` has no default value and none was provided');
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
