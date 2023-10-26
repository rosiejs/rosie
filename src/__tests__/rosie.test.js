const { Factory } = require('../rosie');

describe('Factory', () => {
  afterEach(() => {
    Factory.implode();
  });

  describe('build', () => {
    describe('with a normal constructor', () => {
      class Thing {
        constructor(attrs) {
          for (let attr in attrs) {
            this[attr] = attrs[attr];
          }
        }
      }

      beforeEach(() => {
        Factory.define('thing', Thing)
          .attr('name', 'Thing 1')
          .after((obj) => {
            obj.afterCalled = true;
          });
      });

      it('should return a new instance of that constructor', () => {
        expect(Factory.build('thing') instanceof Thing).toBe(true);
        expect(Factory.build('thing').constructor).toBe(Thing);
      });

      it('should set attributes', () => {
        expect(Factory.build('thing')).toEqual(
          expect.objectContaining({ name: 'Thing 1', afterCalled: true })
        );
      });

      describe('running callbacks', () => {
        describe('callbacks do not return value', () => {
          beforeEach(() => {
            Factory.define('thing', Thing)
              .option('isAwesome', true)
              .after((obj, options) => {
                obj.afterCalled = true;
                obj.isAwesomeOption = options.isAwesome;
              });
          });

          it('should run callbacks', () => {
            expect(Factory.build('thing').afterCalled).toBe(true);
          });

          it('should pass options to the after callback', () => {
            expect(Factory.build('thing').isAwesomeOption).toBe(true);
          });
        });

        describe('callbacks return new object', () => {
          beforeEach(() => {
            Factory.define('thing', Thing)
              .option('isAwesome', true)
              .attr('name', 'Thing 1')
              .after((obj) => ({
                wrapped: obj,
              }))
              .after((obj, options) => ({
                afterCalled: true,
                isAwesomeOption: options.isAwesome,
                wrapped: obj,
              }));
          });

          it('should run callbacks', () => {
            expect(Factory.build('thing').afterCalled).toBe(true);
          });

          it('should pass options to the after callback', () => {
            expect(Factory.build('thing').isAwesomeOption).toBe(true);
          });

          it('should return object from callback as the final result', () => {
            expect(Factory.build('thing')).toEqual({
              afterCalled: true,
              isAwesomeOption: true,
              wrapped: {
                wrapped: new Thing({
                  name: 'Thing 1',
                }),
              },
            });
          });
        });

        describe('when passed options', () => {
          it('passes all options', () => {
            Factory.define('thing')
              .option('option1', 'option1')
              .option('option2', 'option2')
              .after((_, options) => options);

            // Default
            expect(Factory.build('thing')).toEqual({
              option1: 'option1',
              option2: 'option2',
            });

            // Override
            expect(
              Factory.build(
                'thing',
                {},
                {
                  option1: 'foo',
                  option2: 'bar',
                }
              )
            ).toEqual({
              option1: 'foo',
              option2: 'bar',
            });

            // Extra (!)
            expect(
              Factory.build(
                'thing',
                {},
                {
                  option1: 'foo',
                  option2: 'bar',
                  option3: 'baz',
                }
              )
            ).toEqual({
              option1: 'foo',
              option2: 'bar',
              option3: 'baz',
            });
          });

          it('calls default option functions', () => {
            const fn = jest.fn().mockReturnValue('default value');
            Factory.define('thing')
              .option('option', fn)
              .attr('value', ['option'], (option) => option)
              .after((obj, options) => ({ ...obj, ...options }));

            expect(Factory.build('thing')).toEqual({
              option: 'default value',
              value: 'default value',
            });
            expect(fn).toHaveBeenCalled();
          });
        });
      });

      describe('using attrs convenience function', () => {
        beforeEach(() => {
          Factory.define('thing', Thing).attrs({
            name: 'Thing 1',
            attr1: 'value1',
            attr2: 'value2',
          });
        });

        it('should set attributes', () => {
          const thing = Factory.build('thing');
          expect(thing).toEqual(
            expect.objectContaining({
              name: 'Thing 1',
              attr1: 'value1',
              attr2: 'value2',
            })
          );
        });
      });
    });

    describe('without a constructor', () => {
      beforeEach(() => {
        Factory.define('thing').attr('name', 'Thing 1');
      });

      it('should return object with attributes set', () => {
        expect(Factory.build('thing')).toEqual({ name: 'Thing 1' });
      });

      it('should allow overriding attributes', () => {
        expect(Factory.build('thing', { name: 'changed' })).toEqual({
          name: 'changed',
        });
      });

      it('throws error if the factory is not defined', () => {
        expect(() => {
          Factory.build('nothing');
        }).toThrow(Error, 'The "nothing" factory is not defined.');
      });
    });
  });

  describe('buildList', () => {
    beforeEach(() => {
      Factory.define('thing').attr('name', 'Thing 1');
    });

    it('should return array of objects', () => {
      expect(Factory.buildList('thing', 10).length).toEqual(10);
    });

    it('should return array of objects with default attributes', () => {
      const things = Factory.buildList('thing', 10);
      for (let i = 0; i < 10; i++) {
        expect(things[i]).toEqual({ name: 'Thing 1' });
      }
    });

    it('should return array of objects with specified attributes', () => {
      const things = Factory.buildList('thing', 10, { name: 'changed' });
      for (let i = 0; i < 10; i++) {
        expect(things[i]).toEqual({ name: 'changed' });
      }
    });

    it('should return an array of objects with a sequence', () => {
      Factory.define('thing').sequence('id');
      const things = Factory.buildList('thing', 4);
      for (let i = 0; i < 4; i++) {
        expect(things[i]).toEqual({ id: i + 1 });
      }
    });

    it('should return an array of objects with a sequence and with specified attributes', () => {
      Factory.define('thing').sequence('id').attr('name', 'Thing 1');
      const things = Factory.buildList('thing', 4, { name: 'changed' });
      for (let i = 0; i < 4; i++) {
        expect(things[i]).toEqual({ id: i + 1, name: 'changed' });
      }
    });

    it('should evaluate a option for every member of the list', () => {
      Factory.define('thing')
        .option('random', () => {
          return Math.random();
        })
        .attr('number', ['random'], (random) => random);
      const things = Factory.buildList('thing', 2, {}, {});
      expect(things[0].number).not.toEqual(things[1].number);
    });

    describe('with an unregistered factory', () => {
      const Other = new Factory().attr('name', 'Other 1');

      it('should return array of objects', () => {
        expect(Other.buildList(10).length).toEqual(10);
      });

      it('should return array of objects with default attributes', () => {
        const list = Other.buildList(10);
        list.forEach((item) => {
          expect(item).toEqual({ name: 'Other 1' });
        });
      });

      it('should reutrn array of objects with specified attributes', () => {
        const list = Other.buildList(10, { name: 'changed' });
        list.forEach((item) => {
          expect(item).toEqual({ name: 'changed' });
        });
      });

      it('should return an array of objects with a sequence', () => {
        const Another = new Factory().sequence('id');
        const list = Another.buildList(4);
        list.forEach((item, idx) => {
          expect(item).toEqual({ id: idx + 1 });
        });
      });

      it('should return an array of objects with a sequence and with specified attributes', () => {
        const Another = new Factory().sequence('id').attr('name', 'Another 1');
        const list = Another.buildList(4, { name: 'changed' });
        list.forEach((item, idx) => {
          expect(item).toEqual({ id: idx + 1, name: 'changed' });
        });
      });

      it('should evaluate an option for every member of the list', () => {
        const Another = new Factory()
          .option('random', Math.random)
          .attr('number', ['random'], (random) => random);
        const list = Another.buildList(2, {}, {});
        expect(list[0].number).not.toEqual(list[1].number);
      });

      it('should be reset by resetAll', () => {
        const Counter = new Factory().sequence('count');
        expect(Counter.build()).toEqual({ count: 1 });
        Factory.resetAll();
        expect(Counter.build()).toEqual({ count: 1 });
      });
    });
  });

  describe('extend', () => {
    class Thing {
      constructor(attrs) {
        for (let attr in attrs) {
          this[attr] = attrs[attr];
        }
      }
    }
    class Thingy {
      constructor(attrs) {
        for (let attr in attrs) {
          this[attr] = attrs[attr];
        }
      }
    }

    describe('with registered factories', () => {
      beforeEach(() => {
        Factory.define('thing', Thing)
          .attr('name', 'Thing 1')
          .sequence('count')
          .after((obj) => {
            obj.afterCalled = true;
          });
        Factory.define('anotherThing').extend('thing').attr('title', 'Title 1');
        Factory.define('differentThing', Thingy)
          .extend('thing')
          .attr('name', 'Different Thing');
      });

      it('should extend the constructor', () => {
        expect(Factory.build('anotherThing') instanceof Thing).toBe(true);
        expect(Factory.build('differentThing') instanceof Thingy).toBe(true);
      });

      it('should extend attributes', () => {
        expect(Factory.build('anotherThing')).toEqual(
          expect.objectContaining({
            name: 'Thing 1',
            title: 'Title 1',
            afterCalled: true,
          })
        );
      });

      it('should extend callbacks', () => {
        expect(Factory.build('anotherThing').afterCalled).toBe(true);
      });

      it('should override attributes', () => {
        expect(Factory.build('differentThing').name).toBe('Different Thing');
      });

      it('should reset sequences', () => {
        expect(Factory.build('thing')).toEqual(
          expect.objectContaining({ count: 1 })
        );
        expect(Factory.build('thing')).toEqual(
          expect.objectContaining({ count: 2 })
        );
        Factory.reset('thing');
        expect(Factory.build('thing')).toEqual(
          expect.objectContaining({ count: 1 })
        );
      });

      it('should be reset by resetAll', () => {
        expect(Factory.build('thing')).toEqual(
          expect.objectContaining({ count: 1 })
        );
        expect(Factory.build('thing')).toEqual(
          expect.objectContaining({ count: 2 })
        );
        Factory.resetAll();
        expect(Factory.build('thing')).toEqual(
          expect.objectContaining({ count: 1 })
        );
      });
    });

    describe('with unregistered factories', () => {
      let ParentFactory;
      let ChildFactory;
      let SiblingFactory;

      beforeEach(() => {
        ParentFactory = new Factory(Thing)
          .attr('name', 'Parent')
          .after((obj) => {
            obj.afterCalled = true;
          });
        ChildFactory = new Factory()
          .extend(ParentFactory)
          .attr('title', 'Child');
        SiblingFactory = new Factory(Thingy)
          .extend(ParentFactory)
          .attr('name', 'Sibling');
      });

      it('should extend the constructor', () => {
        expect(ChildFactory.build() instanceof Thing).toBe(true);
        expect(SiblingFactory.build() instanceof Thingy).toBe(true);
      });

      it('should extend attributes', () => {
        expect(ChildFactory.build()).toEqual(
          expect.objectContaining({
            name: 'Parent',
            title: 'Child',
            afterCalled: true,
          })
        );
      });

      it('should extend callbacks', () => {
        expect(SiblingFactory.build().afterCalled).toBe(true);
      });

      it('should override attributes', () => {
        expect(SiblingFactory.build().name).toBe('Sibling');
      });
    });
  });

  describe('attributes', () => {
    beforeEach(() => {
      Factory.define('thing').attr('name', 'Thing 1');
    });

    it('should return object with attributes set', () => {
      expect(Factory.attributes('thing')).toEqual({ name: 'Thing 1' });
    });

    it('should allow overriding attributes', () => {
      expect(Factory.attributes('thing', { name: 'changed' })).toEqual({
        name: 'changed',
      });
    });
  });

  describe('prototype', () => {
    let factory;

    beforeEach(() => {
      factory = new Factory();
    });

    describe('attr', () => {
      it('should add given value to attributes', () => {
        factory.attr('foo', 'bar');
        expect(factory.attributes().foo).toEqual('bar');
      });

      it('should invoke function', () => {
        let calls = 0;
        factory.attr('dynamic', () => {
          return ++calls;
        });
        expect(factory.attributes().dynamic).toEqual(1);
        expect(factory.attributes().dynamic).toEqual(2);
      });

      it('should return the factory', () => {
        expect(factory.attr('foo', 1)).toBe(factory);
      });

      it('should allow depending on other attributes', () => {
        factory
          .attr(
            'fullName',
            ['firstName', 'lastName'],
            (first, last) => first + ' ' + last
          )
          .attr('firstName', 'Default')
          .attr('lastName', 'Name');

        expect(factory.attributes()).toEqual({
          firstName: 'Default',
          lastName: 'Name',
          fullName: 'Default Name',
        });

        expect(
          factory.attributes({ firstName: 'Michael', lastName: 'Bluth' })
        ).toEqual({
          fullName: 'Michael Bluth',
          firstName: 'Michael',
          lastName: 'Bluth',
        });

        expect(factory.attributes({ fullName: 'Buster Bluth' })).toEqual({
          fullName: 'Buster Bluth',
          firstName: 'Default',
          lastName: 'Name',
        });
      });

      it('throws when building when a dependency cycle is unbroken', () => {
        factory
          .option('rate', 0.0275)
          .attr('fees', ['total', 'rate'], (total, rate) => total * rate)
          .attr('total', ['fees', 'rate'], (fees, rate) => fees / rate);

        expect(() => {
          factory.build();
        }).toThrow(Error, 'detected a dependency cycle: fees -> total -> fees');
      });

      it('always calls dynamic attributes when they depend on themselves', () => {
        factory.attr('person', ['person'], (person) => {
          if (!person) {
            person = {};
          }
          if (!person.name) {
            person.name = 'Bob';
          }
          return person;
        });

        expect(factory.attributes({ person: { age: 55 } })).toEqual({
          person: { name: 'Bob', age: 55 },
        });
      });
    });

    describe('sequence', () => {
      it('should return the factory', () => {
        expect(factory.sequence('id')).toBe(factory);
      });

      it('should return an incremented value for each invocation', () => {
        factory.sequence('id');
        expect(factory.attributes().id).toEqual(1);
        expect(factory.attributes().id).toEqual(2);
        expect(factory.attributes().id).toEqual(3);
      });

      it('should increment different sequences independently', () => {
        factory.sequence('id');
        factory.sequence('count');

        expect(factory.attributes()).toEqual({ id: 1, count: 1 });
        expect(factory.attributes()).toEqual({ id: 2, count: 2 });
      });

      it('should share the sequence when extending a factory', () => {
        const User = Factory.define('User').sequence('id');
        const AdminUser = Factory.define('AdminUser').extend('User');

        const adminUser = AdminUser.build();
        const user = User.build();

        expect(adminUser.id).toEqual(1);
        expect(user.id).toEqual(2);
      });

      it('should use custom function', () => {
        factory.sequence('name', (i) => 'user' + i);
        expect(factory.attributes().name).toEqual('user1');
      });

      it('should be able to depend on one option', () => {
        const startTime = 5;

        factory
          .option('startTime', startTime)
          .sequence('time', ['startTime'], (i, startTime) => startTime + i);

        expect(factory.attributes()).toEqual({ time: startTime + 1 });
        expect(factory.attributes()).toEqual({ time: startTime + 2 });
        expect(factory.attributes()).toEqual({ time: startTime + 3 });
      });

      it('should be able to depend on one attribute', () => {
        const startTime = 5;

        factory
          .attr('startTime', startTime)
          .sequence('time', ['startTime'], (i, startTime) => startTime + i);

        expect(factory.attributes()).toEqual({
          startTime: startTime,
          time: startTime + 1,
        });
        expect(factory.attributes()).toEqual({
          startTime: startTime,
          time: startTime + 2,
        });
        expect(factory.attributes()).toEqual({
          startTime: startTime,
          time: startTime + 3,
        });
      });

      it('should be able to depend on several attributes and options', () => {
        const startTime = 5;
        const endTime = 7;

        factory
          .attr('startTime', startTime)
          .attr('endTime', endTime)
          .option('checkEndTime', true)
          .sequence(
            'time',
            ['startTime', 'endTime', 'checkEndTime'],
            (i, startTime, endTime, checkEndTime) =>
              checkEndTime ? Math.min(startTime + i, endTime) : startTime + i
          );

        expect(factory.attributes()).toEqual({
          startTime: startTime,
          endTime: endTime,
          time: startTime + 1,
        });
        expect(factory.attributes()).toEqual({
          startTime: startTime,
          endTime: endTime,
          time: startTime + 2,
        });
        expect(factory.attributes()).toEqual({
          startTime: startTime,
          endTime: endTime,
          time: startTime + 2,
        });
      });

      it('should be able to be reset', () => {
        factory.sequence('count');
        expect(factory.attributes()).toEqual({ count: 1 });
        factory.reset();
        expect(factory.attributes()).toEqual({ count: 1 });
      });
    });

    describe('attributes', () => {
      beforeEach(() => {
        factory.attr('foo', 1).attr('bar', 2);
      });

      it('should allow overriding an attribute', () => {
        expect(factory.attributes({ bar: 3 })).toEqual({ foo: 1, bar: 3 });
      });

      it('should allow overriding an attribute with a falsy value', () => {
        expect(factory.attributes({ bar: false })).toEqual({
          foo: 1,
          bar: false,
        });
      });

      it('should allow adding new attributes', () => {
        expect(factory.attributes({ baz: 3 })).toEqual({
          foo: 1,
          bar: 2,
          baz: 3,
        });
      });
    });

    describe('option', () => {
      beforeEach(() => {
        factory.option('useCapsLock', false);
      });

      it('should return the factory', () => {
        expect(factory.option('rate')).toBe(factory);
      });

      it('should not create attributes in the build result', () => {
        expect(factory.attributes().useCapsLock).toBeUndefined();
      });

      it('throws when no default or value is given', () => {
        factory.option('someOptionWithoutAValue');
        expect(() => {
          factory.attributes();
        }).toThrow(
          Error,
          'option `someOptionWithoutAValue` has no default value and none was provided'
        );
      });

      it('should be usable by attributes', () => {
        const useCapsLockValues = [];
        factory.attr('name', ['useCapsLock'], (useCapsLock) => {
          useCapsLockValues.push(useCapsLock);
          const name = 'Madeline';
          if (useCapsLock) {
            return name.toUpperCase();
          } else {
            return name;
          }
        });
        // use default values
        expect(factory.attributes().name).toEqual('Madeline');
        // override default values
        expect(factory.attributes({}, { useCapsLock: true }).name).toEqual(
          'MADELINE'
        );
        expect(useCapsLockValues).toEqual([false, true]);
      });

      it('can depend on other options', () => {
        factory
          .option('option1', 'foo')
          .option('option2', ['option1'], (option1) => option1 + 'bar')
          .attr('value', ['option2'], (option2) => option2);

        // Default values
        expect(factory.attributes()).toHaveProperty('value', 'foobar');
        // Override one
        expect(factory.attributes({}, { option1: 'bar' })).toHaveProperty(
          'value',
          'barbar'
        );
        // Override two
        expect(factory.attributes({}, { option2: 'specific' })).toHaveProperty(
          'value',
          'specific'
        );
      });

      it('cannot depend on itself', () => {
        const fn = jest.fn().mockReturnValue('default value');
        factory
          .option('option', ['option'], fn)
          .attr('value', ['option'], (option) => option);

        // Default values
        expect(() => factory.attributes()).toThrow(/Maximum call stack/);
        expect(fn).not.toHaveBeenCalled();
        // Option set
        expect(factory.attributes({}, { option: 'override' })).toHaveProperty(
          'value',
          'override'
        );
        expect(fn).not.toHaveBeenCalled();
      });

      it('cannot depend on an attribute', () => {
        factory
          .attr('baseAttr', 'base')
          .option('option', ['baseAttr'], (attr) => attr)
          .attr('value', ['option'], (option) => option);

        expect(() => factory.attributes()).toThrow(
          /Cannot read propert(y 'builder'|ies) of undefined/
        );
      });
    });
  });
});
